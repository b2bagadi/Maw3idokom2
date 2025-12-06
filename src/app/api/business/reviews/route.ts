
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, tenants, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        // Verify tenant ownership
        const tenant = await db.query.tenants.findFirst({
            where: eq(tenants.id, decoded.tenantId)
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
            customerName: users.firstName,
            customerLastName: users.lastName
        })
            .from(reviews)
            .leftJoin(users, eq(reviews.customerId, users.id))
            .where(eq(reviews.tenantId, tenant.id))
            .orderBy(desc(reviews.createdAt));

        // Format the response
        const formattedReviews = businessReviews.map(review => ({
            ...review,
            customerName: review.customerName ? `${review.customerName} ${review.customerLastName || ''}`.trim() : 'Anonymous'
        }));

        return NextResponse.json({ reviews: formattedReviews });

    } catch (error) {
        console.error('Error fetching business reviews:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
