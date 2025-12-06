import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews } from '@/db/schema';
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
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifySuperAdmin(request);
        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id: idString } = await params;
        const id = parseInt(idString);
        const body = await request.json();
        const { rating, comment } = body;

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid Review ID' }, { status: 400 });
        }

        if (rating !== undefined && (rating < 1 || rating > 5)) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        // Get existing review
        const existingReview = await db
            .select()
            .from(reviews)
            .where(eq(reviews.id, id))
            .limit(1);

        if (existingReview.length === 0) {
            return NextResponse.json({ error: 'Review not found' }, { status: 404 });
        }

        // Update review
        const updateData: any = {
            updatedAt: new Date().toISOString()
        };

        if (rating !== undefined) updateData.rating = rating;
        if (comment !== undefined) updateData.comment = comment;

        await db
            .update(reviews)
            .set(updateData)
            .where(eq(reviews.id, id));

        return NextResponse.json({
            success: true,
            message: 'Review updated successfully'
        });

    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authResult = await verifySuperAdmin(request);
        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const { id: idString } = await params;
        const id = parseInt(idString);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid Review ID' }, { status: 400 });
        }

        await db.delete(reviews).where(eq(reviews.id, id));

        return NextResponse.json({
            success: true,
            message: 'Review deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
