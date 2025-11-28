import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, appointments, tenants } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Helper to verify authentication
async function verifyAuth(request: NextRequest): Promise<{ userId?: number; role?: string; error?: string; status?: number }> {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { error: 'No token provided', status: 401 };
        }
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            return { error: 'Server configuration error', status: 500 };
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId: number; role: string };
        return { userId: decoded.userId, role: decoded.role };
    } catch (error) {
        return { error: 'Invalid token', status: 401 };
    }
}

// POST - Create a new review
export async function POST(request: NextRequest) {
    try {
        const authResult = await verifyAuth(request);
        if (authResult.error) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        const body = await request.json();
        const { appointmentId, rating, comment } = body;

        // Validate required fields
        if (!appointmentId || !rating) {
            return NextResponse.json({ error: 'Appointment ID and rating are required' }, { status: 400 });
        }

        if (rating < 1 || rating > 5) {
            return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
        }

        // Get appointment details
        const appointment = await db
            .select()
            .from(appointments)
            .where(eq(appointments.id, parseInt(appointmentId)))
            .limit(1);

        if (appointment.length === 0) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        const apt = appointment[0];

        // Check if appointment is completed
        if (apt.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Can only review completed appointments' }, { status: 400 });
        }

        // Check if user is the customer or it's a guest booking
        if (apt.customerId && apt.customerId !== authResult.userId) {
            return NextResponse.json({ error: 'You can only review your own appointments' }, { status: 403 });
        }

        // Check if review already exists for this appointment
        const existingReview = await db
            .select()
            .from(reviews)
            .where(eq(reviews.appointmentId, parseInt(appointmentId)))
            .limit(1);

        if (existingReview.length > 0) {
            return NextResponse.json({ error: 'You have already reviewed this appointment' }, { status: 400 });
        }

        // Create review
        const now = new Date().toISOString();
        const newReview = await db.insert(reviews).values({
            appointmentId: parseInt(appointmentId),
            tenantId: apt.tenantId,
            customerId: apt.customerId,
            guestName: apt.guestName,
            guestEmail: apt.guestEmail,
            rating: parseInt(rating),
            comment: comment || null,
            isApproved: true, // Auto-approve
            createdAt: now,
            updatedAt: now,
        }).returning();

        return NextResponse.json({ success: true, review: newReview[0] }, { status: 201 });
    } catch (error) {
        console.error('Error creating review:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET - Get reviews for a business
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const tenantId = searchParams.get('tenantId');
        const onlyApproved = searchParams.get('onlyApproved') !== 'false';

        if (!tenantId) {
            return NextResponse.json({ error: 'Business ID is required' }, { status: 400 });
        }

        let query = db
            .select({
                id: reviews.id,
                rating: reviews.rating,
                comment: reviews.comment,
                businessReply: reviews.businessReply,
                businessRepliedAt: reviews.businessRepliedAt,
                createdAt: reviews.createdAt,
                customerName: reviews.guestName,
                customerId: reviews.customerId,
            })
            .from(reviews)
            .where(
                onlyApproved
                    ? and(eq(reviews.tenantId, parseInt(tenantId)), eq(reviews.isApproved, true))
                    : eq(reviews.tenantId, parseInt(tenantId))
            )
            .orderBy(desc(reviews.createdAt));

        const reviewsList = await query;

        // Calculate average rating
        const allRatings = await db
            .select({ rating: reviews.rating })
            .from(reviews)
            .where(
                onlyApproved
                    ? and(eq(reviews.tenantId, parseInt(tenantId)), eq(reviews.isApproved, true))
                    : eq(reviews.tenantId, parseInt(tenantId))
            );

        const averageRating = allRatings.length > 0
            ? allRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / allRatings.length
            : 0;

        return NextResponse.json({
            reviews: reviewsList,
            averageRating: Math.round(averageRating * 10) / 10,
            totalReviews: reviewsList.length,
        });
    } catch (error) {
        console.error('Error fetching reviews:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
