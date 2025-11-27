import { NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request, { params }: { params: { id: string } }) {
    try {
        const appointmentId = parseInt(params.id);
        const body = await request.json();
        const { newStartTime, reason } = body;

        if (!newStartTime) {
            return NextResponse.json({ error: 'New start time is required' }, { status: 400 });
        }

        // Fetch the existing appointment to verify it exists
        const existingAppointment = await db
            .select()
            .from(appointments)
            .where(eq(appointments.id, appointmentId))
            .limit(1);

        if (!existingAppointment || existingAppointment.length === 0) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        const appointment = existingAppointment[0];

        // Update the appointment with new start time
        // Note: endTime calculation would require fetching service duration
        // For now, we'll just update startTime and let the frontend handle duration
        await db
            .update(appointments)
            .set({
                startTime: newStartTime,
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
