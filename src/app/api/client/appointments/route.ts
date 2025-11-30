import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, tenants, services } from '@/db/schema';
import jwt from 'jsonwebtoken';
import { eq, and, or } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
    try {
        // Get token from Authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);

        // Verify token
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid or expired token' },
                { status: 401 }
            );
        }

        const userId = decoded.userId;

        // Get query parameters
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

        // Build query
        let query = db.select({
            id: appointments.id,
            tenantId: appointments.tenantId,
            serviceId: appointments.serviceId,
            startTime: appointments.startTime,
            endTime: appointments.endTime,
            status: appointments.status,
            notes: appointments.notes,
            guestName: appointments.guestName,
            guestEmail: appointments.guestEmail,
            guestPhone: appointments.guestPhone,
            createdAt: appointments.createdAt,
            businessName: tenants.nameEn,
            businessNameFr: tenants.nameFr,
            businessNameAr: tenants.nameAr,
            businessSlug: tenants.slug,
            businessPhone: tenants.phone,
            businessEmail: tenants.email,
            businessWhatsapp: tenants.whatsappUrl,
            serviceName: services.nameEn,
            serviceNameFr: services.nameFr,
            serviceNameAr: services.nameAr,
            servicePrice: services.price,
            serviceDuration: services.duration,
        })
            .from(appointments)
            .leftJoin(tenants, eq(appointments.tenantId, tenants.id))
            .leftJoin(services, eq(appointments.serviceId, services.id))
            .where(eq(appointments.customerId, userId));

        // Add status filter if provided
        if (status) {
            query = query.where(
                and(
                    eq(appointments.customerId, userId),
                    eq(appointments.status, status)
                )
            );
        }

        const results = await query;

        // Calculate stats
        const stats = {
            total: results.length,
            pending: results.filter(a => a.status === 'PENDING').length,
            confirmed: results.filter(a => a.status === 'CONFIRMED').length,
            completed: results.filter(a => a.status === 'COMPLETED').length,
            cancelled: results.filter(a => a.status === 'CANCELLED').length,
        };

        return NextResponse.json({
            success: true,
            appointments: results,
            stats,
        });

    } catch (error) {
        console.error('Get appointments error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch appointments' },
            { status: 500 }
        );
    }
}
