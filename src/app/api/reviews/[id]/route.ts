import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Helper to verify business owner or admin
async function verifyBusinessOrAdmin(request: NextRequest, reviewId: number): Promise<{ allowed: boolean; error?: string; status?: number; role?: string }> {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { allowed: false, error: 'No token provided', status: 401 };
        }
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            return { allowed: false, error: 'Server configuration error', status: 500 };
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number; role: string; tenantId?: number };

        // Super admin can do anything
        if (decoded.role === 'SUPER_ADMIN') {
            return { allowed: true, role: 'SUPER_ADMIN' };
        }

        // Business owner can only manage their own reviews
        if (decoded.role === 'BUSINESS_OWNER') {
            const review = await db.select().from(reviews).where(eq(reviews.id, reviewId)).limit(1);
            if (review.length === 0) {
                return { allowed: false, error: 'Review not found', status: 404 };
            }
            if (review[0].tenantId !== decoded.tenantId) {
                return { allowed: false, error: 'Access denied', status: 403 };
            }
            return { allowed: true, role: 'BUSINESS_OWNER' };
        }

        return { allowed: false, error: 'Access denied', status: 403 };
    } catch (error) {
        return { allowed: false, error: 'Invalid token', status: 401 };
    }
}

// POST - Business reply to review
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reviewId = parseInt(params.id);
        const authResult = await verifyBusinessOrAdmin(request, reviewId);

        if (!authResult.allowed) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const { reply } = body;

        if (!reply || !reply.trim()) {
            return NextResponse.json({ error: 'Reply text is required' }, { status: 400 });
        }

        const now = new Date().toISOString();
        await db
            .update(reviews)
            .set({
                businessReply: reply.trim(),
                businessRepliedAt: now,
                updatedAt: now,
            })
            .where(eq(reviews.id, reviewId));

        return NextResponse.json({ success: true, message: 'Reply posted successfully' });
    } catch (error) {
        console.error('Error posting reply:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete review (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reviewId = parseInt(params.id);
        const authResult = await verifyBusinessOrAdmin(request, reviewId);

        if (!authResult.allowed) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        // Only admin can delete
        if (authResult.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Only administrators can delete reviews' }, { status: 403 });
        }

        await db.delete(reviews).where(eq(reviews.id, reviewId));

        return NextResponse.json({ success: true, message: 'Review deleted successfully' });
    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Update review approval status (admin only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const reviewId = parseInt(params.id);
        const authResult = await verifyBusinessOrAdmin(request, reviewId);

        if (!authResult.allowed) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        // Only admin can change approval status
        if (authResult.role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Only administrators can change approval status' }, { status: 403 });
        }

        const body = await request.json();
        const { isApproved } = body;

        if (typeof isApproved !== 'boolean') {
            return NextResponse.json({ error: 'Invalid isApproved value' }, { status: 400 });
        }

        await db
            .update(reviews)
            .set({
                isApproved,
                updatedAt: new Date().toISOString(),
            })
            .where(eq(reviews.id, reviewId));

        return NextResponse.json({ success: true, message: 'Review approval status updated' });
    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
