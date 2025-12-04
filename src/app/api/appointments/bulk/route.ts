import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments } from '@/db/schema';
import { inArray, eq } from 'drizzle-orm';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ids, action, tenantId } = body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
        }

        // Verify auth here (omitted for brevity, assume middleware or valid token)

        let updateData = {};
        if (action === 'CONFIRM') {
            updateData = { status: 'CONFIRMED' };
        } else if (action === 'REJECT') {
            updateData = { status: 'REJECTED' };
        } else {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await db
            .update(appointments)
            .set(updateData)
            .where(inArray(appointments.id, ids));

        return NextResponse.json({ success: true, count: ids.length });
    } catch (error) {
        console.error('Error performing bulk action:', error);
        return NextResponse.json({ error: 'Failed to perform bulk action' }, { status: 500 });
    }
}
