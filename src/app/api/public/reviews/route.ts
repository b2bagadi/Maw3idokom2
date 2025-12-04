
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, tenants, users as customers } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        if (!slug) {
            return NextResponse.json({ error: 'Business slug is required' }, { status: 400 });
        }

        // First find the tenant by slug
        const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.slug, slug),
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        // Fetch reviews for this tenant
        const businessReviews = await db.select({
            id: reviews.id,
            rating: reviews.rating,
            comment: reviews.comment,
            createdAt: reviews.createdAt,
            businessReply: reviews.businessReply,
            businessRepliedAt: reviews.businessRepliedAt,
            customerName: customers.firstName, // We might want to combine first and last name
            customerLastName: customers.lastName
        })
            .from(reviews)
            .leftJoin(customers, eq(reviews.customerId, customers.id))
            .where(eq(reviews.tenantId, tenant.id))
            .orderBy(desc(reviews.createdAt));

        // Format the response
        const formattedReviews = businessReviews.map(review => ({
            ...review,
            customerName: review.customerName ? `${review.customerName} ${review.customerLastName || ''}`.trim() : 'Anonymous'
        }));

        return NextResponse.json({ reviews: formattedReviews });

    } catch (error) {
        console.error('Error fetching public reviews:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
