import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments, services } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
    try {
        const appointmentId = parseInt(params.id);
        const body = await request.json();
        const { startTime, reason } = body;

        if (!startTime) {
            return NextResponse.json({ error: 'Start time is required' }, { status: 400 });
        }

        // Fetch the existing appointment to verify it exists and get service duration
        const existingAppointment = await db
            .select({
                appointment: appointments,
                serviceDuration: services.duration
            })
            .from(appointments)
            .leftJoin(services, eq(appointments.serviceId, services.id))
            .where(eq(appointments.id, appointmentId))
            .limit(1);

        if (!existingAppointment || existingAppointment.length === 0) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        const { appointment, serviceDuration } = existingAppointment[0];
        const duration = serviceDuration || 60; // Default to 60 if not found

        const startDateTime = new Date(startTime);
        const endDateTime = new Date(startDateTime.getTime() + duration * 60000);

        await db
            .update(appointments)
            .set({
                startTime: startDateTime.toISOString(),
                endTime: endDateTime.toISOString(),
                status: 'CONFIRMED', // Reset to confirmed after rescheduling
                notes: reason ? `${appointment.notes || ''}\nReschedule Reason: ${reason}` : appointment.notes,
                updatedAt: new Date().toISOString()
            })
            .where(eq(appointments.id, appointmentId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error rescheduling appointment:', error);
        return NextResponse.json({ error: 'Failed to reschedule' }, { status: 500 });
    }
}
