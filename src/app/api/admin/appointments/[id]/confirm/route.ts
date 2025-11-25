import { NextRequest, NextResponse } from 'next/server';
import { eq, and } from 'drizzle-orm';
import { db } from '@/db';
import { appointments, services } from '@/db/schema';
import { verifyJWT } from '@/lib/jwt';
import { sendConfirmationEmail } from '@/lib/email';
import { generateConfirmationMessage, generateWhatsAppLink } from '@/lib/whatsapp';
import type { Language } from '@/lib/i18n/notification-messages';

export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const token = request.headers.get('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const payload = await verifyJWT(token);
        if (!payload) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const { notifyVia } = await request.json();
        const appointmentId = parseInt(params.id);

        // Get appointment with service details
        const appointment = await db
            .select({
                id: appointments.id,
                tenantId: appointments.tenantId,
                serviceId: appointments.serviceId,
                status: appointments.status,
                guestName: appointments.guestName,
                guestEmail: appointments.guestEmail,
                guestPhone: appointments.guestPhone,
                startTime: appointments.startTime,
                endTime: appointments.endTime,
                customerLanguage: appointments.customerLanguage,
            })
            .from(appointments)
            .where(eq(appointments.id, appointmentId))
            .limit(1);

        if (!appointment || appointment.length === 0) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        const appt = appointment[0];

        // Verify appointment belongs to admin's tenant (if not super admin)
        if (payload.role === 'OWNER' && appt.tenantId !== payload.tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        // Check if already confirmed
        if (appt.status === 'CONFIRMED') {
            return NextResponse.json({ error: 'Appointment already confirmed' }, { status: 400 });
        }

        // Get service details
        const service = await db.query.services.findFirst({
            where: eq(services.id, appt.serviceId),
        });

        // Get business details
        const business = await db.query.tenants.findFirst({
            where: eq(services.tenantId, appt.tenantId),
        });

        // Update status to CONFIRMED
        await db
            .update(appointments)
            .set({ status: 'CONFIRMED', updatedAt: new Date().toISOString() })
            .where(eq(appointments.id, appointmentId));

        // Prepare notification data
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

        // Send notifications based on preference
        if (notifyVia === 'email' || notifyVia === 'both') {
            await sendConfirmationEmail(appt.guestEmail, notificationData, language);
        }

        if (notifyVia === 'whatsapp' || notifyVia === 'both') {
            const message = generateConfirmationMessage(notificationData, language);
            whatsappLink = generateWhatsAppLink(appt.guestPhone, message);
        }

        return NextResponse.json({
            success: true,
            message: 'Appointment confirmed',
            whatsappLink: whatsappLink || undefined,
        });

    } catch (error) {
        console.error('Confirm appointment error:', error);
        return NextResponse.json(
            { error: 'Failed to confirm appointment' },
            { status: 500 }
        );
    }
}
