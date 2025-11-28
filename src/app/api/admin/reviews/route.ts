import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { reviews, tenants, users } from '@/db/schema';
import { desc, eq, sql } from 'drizzle-orm';
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

        // Fetch all reviews with business and customer information
        const allReviews = await db
            .select({
                id: reviews.id,
                rating: reviews.rating,
                comment: reviews.comment,
                businessReply: reviews.businessReply,
                businessRepliedAt: reviews.businessRepliedAt,
                isApproved: reviews.isApproved,
                createdAt: reviews.createdAt,
                tenantId: reviews.tenantId,
                businessName: tenants.nameEn,
                customerName: sql<string>`COALESCE(${reviews.guestName}, ${users.firstName} || ' ' || ${users.lastName})`,
            })
            .from(reviews)
            .leftJoin(tenants, eq(reviews.tenantId, tenants.id))
            .leftJoin(users, eq(reviews.customerId, users.id))
            .orderBy(desc(reviews.createdAt));

        return NextResponse.json({ reviews: allReviews });
    } catch (error) {
        console.error('Error fetching admin reviews:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
