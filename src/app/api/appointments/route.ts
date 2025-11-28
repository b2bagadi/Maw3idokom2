import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, services, staff } from '@/db/schema';
import { eq, like, and, or, desc, sql, gte, lte } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

interface JWTPayload {
    tenantId: number;
    role: string;
    email: string;
}

export async function GET(request: NextRequest) {
    try {
        // Authentication - Verify JWT token
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({
                error: 'Authentication required',
                code: 'MISSING_TOKEN'
            }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decoded: JWTPayload;

        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JWTPayload;
        } catch (error) {
            return NextResponse.json({
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            }, { status: 401 });
        }

        // Authorization - Check role is BUSINESS_OWNER
        if (decoded.role !== 'BUSINESS_OWNER') {
            return NextResponse.json({
                error: 'Access denied. Business owner role required',
                code: 'INSUFFICIENT_PERMISSIONS'
            }, { status: 403 });
        }

        // Extract tenantId from token
        const { tenantId } = decoded;

        if (!tenantId) {
            return NextResponse.json({
                error: 'Tenant ID not found in token',
                code: 'MISSING_TENANT_ID'
            }, { status: 400 });
        }

        // Extract query parameters
        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const from = searchParams.get('from');
        const to = searchParams.get('to');

        // Build WHERE conditions
        const whereConditions = [eq(appointments.tenantId, tenantId)];

        // Add status filter if provided
        if (status && status !== 'ALL') {
            const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'REJECTED'];
            if (!validStatuses.includes(status.toUpperCase())) {
                return NextResponse.json({
                    error: 'Invalid status',
                    code: 'INVALID_STATUS'
                }, { status: 400 });
            }
            whereConditions.push(eq(appointments.status, status.toUpperCase()));
        }

        // Add date range filter
        if (from) {
            whereConditions.push(gte(appointments.startTime, from));
        }
        if (to) {
            whereConditions.push(lte(appointments.startTime, to));
        }

        // Add search filter if provided
        if (search) {
            const searchCondition = or(
                like(appointments.guestName, `%${search}%`),
                like(appointments.guestEmail, `%${search}%`),
                like(appointments.guestPhone, `%${search}%`)
            );
            whereConditions.push(searchCondition!);
        }

        const whereClause = whereConditions.length > 1
            ? and(...whereConditions)
            : whereConditions[0];

        // Fetch appointments with joins
        const results = await db
            .select({
                id: appointments.id,
                tenantId: appointments.tenantId,
                serviceId: appointments.serviceId,
                staffId: appointments.staffId,
                customerId: appointments.customerId,
                guestName: appointments.guestName,
                guestEmail: appointments.guestEmail,
                guestPhone: appointments.guestPhone,
                startTime: appointments.startTime,
                endTime: appointments.endTime,
                status: appointments.status,
                rejectionReason: appointments.rejectionReason,
                customerLanguage: appointments.customerLanguage,
                notes: appointments.notes,
                createdAt: appointments.createdAt,
                updatedAt: appointments.updatedAt,
                serviceName: services.nameEn, // Simplified for table
                price: services.price,
                staffName: staff.nameEn, // Simplified for table
                // We can fetch full objects if needed, but table mostly needs these
            })
            .from(appointments)
            .leftJoin(services, eq(appointments.serviceId, services.id))
            .leftJoin(staff, eq(appointments.staffId, staff.id))
            .where(whereClause)
            .orderBy(desc(appointments.startTime));

        return NextResponse.json({ appointments: results }, { status: 200 });

    } catch (error) {
        console.error('GET appointments error:', error);
        return NextResponse.json({
            error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
            code: 'INTERNAL_ERROR'
        }, { status: 500 });
    }
}
