import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contactRequests } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
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

export async function GET(request: NextRequest) {
    try {
        const authResult = await verifySuperAdmin(request);
        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const requests = await db
            .select()
            .from(contactRequests)
            .orderBy(desc(contactRequests.createdAt));

        return NextResponse.json({ requests });
    } catch (error) {
        console.error('Error fetching contact requests:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authResult = await verifySuperAdmin(request);
        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Contact request ID is required' }, { status: 400 });
        }

        const contactId = parseInt(id);
        if (isNaN(contactId)) {
            return NextResponse.json({ error: 'Invalid contact request ID' }, { status: 400 });
        }

        // Check if contact request exists
        const existing = await db.select().from(contactRequests).where(eq(contactRequests.id, contactId)).limit(1);
        if (existing.length === 0) {
            return NextResponse.json({ error: 'Contact request not found' }, { status: 404 });
        }

        await db.delete(contactRequests).where(eq(contactRequests.id, contactId));

        return NextResponse.json({ success: true, message: 'Contact request deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
