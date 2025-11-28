import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, services, staff, users } from '@/db/schema';
import { eq, and, gte, lte, like, or, desc } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const tenantId = parseInt(params.id);
        const { searchParams } = new URL(request.url);
        const from = searchParams.get('from');
        const to = searchParams.get('to');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const conditions = [eq(appointments.tenantId, tenantId)];

        if (from) conditions.push(gte(appointments.startTime, from));
        if (to) conditions.push(lte(appointments.startTime, to));
        if (status && status !== 'ALL') conditions.push(eq(appointments.status, status));

        if (search) {
            conditions.push(
                or(
                    like(appointments.guestName, `%${search}%`),
                    like(appointments.guestEmail, `%${search}%`),
                    like(appointments.guestPhone, `%${search}%`)
                )
            );
        }

        const data = await db
            .select({
                id: appointments.id,
                startTime: appointments.startTime,
                endTime: appointments.endTime,
                status: appointments.status,
                guestName: appointments.guestName,
                guestEmail: appointments.guestEmail,
                guestPhone: appointments.guestPhone,
                notes: appointments.notes,
                service: {
                    nameEn: services.nameEn,
                    nameFr: services.nameFr,
                    nameAr: services.nameAr,
                    price: services.price,
                    duration: services.duration,
                },
                staff: {
                    nameEn: staff.nameEn,
                    nameFr: staff.nameFr,
                    nameAr: staff.nameAr,
                }
            })
            .from(appointments)
            .leftJoin(services, eq(appointments.serviceId, services.id))
            .leftJoin(staff, eq(appointments.staffId, staff.id))
            .where(and(...conditions))
            .orderBy(desc(appointments.startTime));

        return NextResponse.json({ appointments: data });
    } catch (error) {
        console.error('Error fetching appointments:', error);
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }
}
