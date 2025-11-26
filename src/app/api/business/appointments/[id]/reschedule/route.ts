import { NextRequest, NextResponse } from 'next/server';
import { eq, and, lte, gte } from 'drizzle-orm';
import { db } from '@/db';
import { appointments, services, tenants } from '@/db/schema';
import jwt from 'jsonwebtoken';
import { sendRescheduleEmail } from '@/lib/email';
import { generateRescheduleMessage, generateWhatsAppLink } from '@/lib/whatsapp';
import type { Language } from '@/lib/i18n/notification-messages';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!process.env.JWT_SECRET) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET) as { role: string; tenantId?: number };
        const { newStartTime, reason, notifyVia } = await request.json();
        const appointmentId = parseInt(params.id);

        const appointment = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
        if (!appointment || appointment.length === 0) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 });
        }

        const appt = appointment[0];
        if (payload.role === 'BUSINESS_OWNER' && appt.tenantId !== payload.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const service = await db.query.services.findFirst({ where: eq(services.id, appt.serviceId) });
        if (!service) return NextResponse.json({ error: 'Service not found' }, { status: 404 });

        const newStart = new Date(newStartTime);
        const newEnd = new Date(newStart.getTime() + service.duration * 60000);

        const conflicts = await db.select().from(appointments).where(
            and(
                eq(appointments.tenantId, appt.tenantId),
                lte(appointments.startTime, newEnd.toISOString()),
                gte(appointments.endTime, newStart.toISOString())
            )
        );

        if (conflicts.length > 0 && conflicts[0].id !== appointmentId) {
            return NextResponse.json({ error: 'Time slot unavailable' }, { status: 409 });
        }

        const business = await db.query.tenants.findFirst({ where: eq(tenants.id, appt.tenantId) });

        await db.update(appointments).set({
            startTime: newStart.toISOString(),
            endTime: newEnd.toISOString(),
            updatedAt: new Date().toISOString()
        }).where(eq(appointments.id, appointmentId));

        const language = (appt.customerLanguage || 'en') as Language;
        const locale = language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';

        const oldDate = new Date(appt.startTime);
        const notificationData = {
            customerName: appt.guestName,
            businessName: business?.nameEn || 'Business',
            serviceName: service.nameEn || 'Service',
            oldDate: oldDate.toLocaleDateString(locale),
            oldTime: oldDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
            newDate: newStart.toLocaleDateString(locale),
            newTime: newStart.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' }),
            price: service.price || 0,
            duration: service.duration || 0,
            reason: reason || 'Schedule adjustment',
        };

        let whatsappLink = '';
        if (notifyVia === 'email' || notifyVia === 'both') {
            await sendRescheduleEmail(appt.guestEmail, notificationData, language);
        }
        if (notifyVia === 'whatsapp' || notifyVia === 'both') {
            whatsappLink = generateWhatsAppLink(appt.guestPhone, generateRescheduleMessage(notificationData, language));
        }

        return NextResponse.json({ success: true, message: 'Rescheduled', newEndTime: newEnd.toISOString(), whatsappLink: whatsappLink || undefined });
    } catch (error) {
        console.error('Reschedule error:', error);
        return NextResponse.json({ error: 'Failed to reschedule' }, { status: 500 });
    }
}
