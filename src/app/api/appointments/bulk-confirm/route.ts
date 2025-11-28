import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments } from '@/db/schema';
import { inArray } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function PATCH(request: NextRequest) {
    try {
        const token = request.headers.get('authorization')?.split(' ')[1];
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!process.env.JWT_SECRET) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { role: string };
        if (decoded.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { ids, status } = await request.json();

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'Invalid IDs' }, { status: 400 });
        }

        if (!['CONFIRMED', 'REJECTED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await db.update(appointments)
            .set({
                status,
                updatedAt: new Date().toISOString()
            })
            .where(inArray(appointments.id, ids));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Bulk update error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
