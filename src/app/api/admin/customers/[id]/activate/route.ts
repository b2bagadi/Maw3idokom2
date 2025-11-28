import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Helper to verify super admin
async function verifySuperAdmin(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { error: 'No token provided', status: 401 };
        }
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            return { error: 'Server configuration error', status: 500 };
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { role: string };
        if (decoded.role !== 'SUPER_ADMIN') {
            return { error: 'Access denied', status: 403 };
        }
        return { success: true };
    } catch (error) {
        return { error: 'Invalid token', status: 401 };
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authResult = await verifySuperAdmin(request);
        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const { isActive } = body;
        const id = parseInt(params.id);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
        }

        if (typeof isActive !== 'boolean') {
            return NextResponse.json({ error: 'Invalid isActive value. Must be boolean.' }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await db.select().from(users).where(eq(users.id, id)).limit(1);
        if (existingUser.length === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await db.update(users)
            .set({
                isActive,
                updatedAt: new Date().toISOString()
            })
            .where(eq(users.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating user status:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
