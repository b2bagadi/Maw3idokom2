import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { appointments, services } from '@/db/schema';
import jwt from 'jsonwebtoken';
import { sendConfirmationEmail } from '@/lib/email';
import { generateConfirmationMessage, generateWhatsAppLink } from '@/lib/whatsapp';
import type { Language } from '@/lib/i18n/notification-messages';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (!process.env.JWT_SECRET) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET) as { role: string; tenantId?: number };
        const { notifyVia } = await request.json();
        const appointmentId = parseInt(params.id);

        const appointment = await db.select().from(appointments).where(eq(appointments.id, appointmentId)).limit(1);
        if (!appointment || appointment.length === 0) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        const appt = appointment[0];
        if (payload.role === 'OWNER' && appt.tenantId !== payload.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (appt.status === 'CONFIRMED') {
            return NextResponse.json({ error: 'Appointment already confirmed' }, { status: 400 });
        }

        const service = await db.query.services.findFirst({ where: eq(services.id, appt.serviceId) });
        const business = await db.query.tenants.findFirst({ where: eq(services.tenantId, appt.tenantId) });

        await db.update(appointments).set({ status: 'CONFIRMED', updatedAt: new Date().toISOString() }).where(eq(appointments.id, appointmentId));

        const language = (appt.customerLanguage || 'en') as Language;
        const appointmentDate = new Date(appt.startTime);
        const dateStr = appointmentDate.toLocaleDateString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US');
        const timeStr = appointmentDate.toLocaleTimeString(language === 'ar' ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });

        const notificationData = {
            customerName: appt.guestName,
            businessName: business?.nameEn || 'Business',
            serviceName: service?.nameEn || 'Service',
            date: dateStr,
            time: timeStr,
            price: service?.price || 0,
            duration: service?.duration || 0,
        };

        let whatsappLink = '';
        if (notifyVia === 'email' || notifyVia === 'both') {
            await sendConfirmationEmail(appt.guestEmail, notificationData, language);
        }
        if (notifyVia === 'whatsapp' || notifyVia === 'both') {
            whatsappLink = generateWhatsAppLink(appt.guestPhone, generateConfirmationMessage(notificationData, language));
        }

        return NextResponse.json({ success: true, message: 'Appointment confirmed', whatsappLink: whatsappLink || undefined });
    } catch (error) {
        console.error('Confirm error:', error);
        return NextResponse.json({ error: 'Failed to confirm' }, { status: 500 });
    }
}
