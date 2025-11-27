import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments } from '@/db/schema';
import jwt from 'jsonwebtoken';
import { eq, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
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
        const appointmentId = parseInt(params.id);

        if (isNaN(appointmentId)) {
            return NextResponse.json(
                { error: 'Invalid appointment ID' },
                { status: 400 }
            );
        }

        // Find appointment
        const appointment = await db
            .select()
            .from(appointments)
            .where(and(
                eq(appointments.id, appointmentId),
                eq(appointments.customerId, userId)
            ))
            .limit(1);

        if (appointment.length === 0) {
            return NextResponse.json(
                { error: 'Appointment not found' },
                { status: 404 }
            );
        }

        const appt = appointment[0];

        // Check if already cancelled
        if (appt.status === 'CANCELLED') {
            return NextResponse.json(
                { error: 'Appointment is already cancelled' },
                { status: 400 }
            );
        }

        // Check 24h rule (optional, but good practice)
        // const now = new Date();
        // const startTime = new Date(appt.startTime);
        // const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        // if (diffHours < 24) {
        //     return NextResponse.json(
        //         { error: 'Cannot cancel within 24 hours' },
        //         { status: 400 }
        //     );
        // }

        // Update status
        await db
            .update(appointments)
            .set({
                status: 'CANCELLED',
                updatedAt: new Date().toISOString()
            })
            .where(eq(appointments.id, appointmentId));

        return NextResponse.json({
            success: true,
            message: 'Appointment cancelled successfully'
        });

    } catch (error) {
        console.error('Cancel appointment error:', error);
        return NextResponse.json(
            { error: 'Failed to cancel appointment' },
            { status: 500 }
        );
    }
}
