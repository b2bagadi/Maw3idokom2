import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Helper to verify business owner
async function verifyBusinessOwner(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { error: 'No token provided', status: 401 };
        }
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            return { error: 'Server configuration error', status: 500 };
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number; role: string; tenantId?: number };
        if (decoded.role !== 'OWNER' && decoded.role !== 'BUSINESS_OWNER' && decoded.role !== 'SUPER_ADMIN') {
            return { error: 'Access denied', status: 403 };
        }
        return { success: true, tenantId: decoded.tenantId, role: decoded.role };
    } catch (error) {
        return { error: 'Invalid token', status: 401 };
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifyBusinessOwner(request);
        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id: idString } = await params;
        const id = parseInt(idString);
        const body = await request.json();
        const { businessReply } = body;

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid Review ID' }, { status: 400 });
        }

        if (!businessReply || businessReply.trim() === '') {
            return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
        }

        // Get review to verify ownership
        const existingReview = await db
            .select()
            .from(reviews)
            .where(eq(reviews.id, id))
            .limit(1);

        if (existingReview.length === 0) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        // Verify business owns this review (unless super admin)
        if (authResult.role !== 'SUPER_ADMIN' && existingReview[0].tenantId !== authResult.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Update review with business reply
        await db
            .update(reviews)
            .set({
                businessReply: businessReply.trim(),
                businessRepliedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            })
            .where(eq(reviews.id, id));

        return NextResponse.json({
            success: true,
            message: 'Reply added successfully'
        });

    } catch (error) {
        console.error('Error adding reply:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
