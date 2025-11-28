import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { appointments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// Helper to verify admin/business authentication
async function verifyAuth(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return { error: 'No token provided', status: 401 };
        }
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            return { error: 'Server configuration error', status: 500 };
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as { userId?: number; role: string };

        // Allow both admin and business owners
        if (decoded.role !== 'SUPER_ADMIN' && decoded.role !== 'OWNER') {
            return { error: 'Access denied', status: 403 };
        }

        return { success: true, userId: decoded.userId, role: decoded.role };
    } catch (error) {
        return { error: 'Invalid token', status: 401 };
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // 1. Verify Authentication
        const authResult = await verifyAuth(request);
        if ('error' in authResult) {
            return NextResponse.json({ error: authResult.error }, { status: authResult.status });
        }

        // 2. Parse and Validate Input
        const { id: idString } = await params;
        const id = parseInt(idString);

        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid Appointment ID' }, { status: 400 });
        }

        // 3. Get appointment
        const existingAppointment = await db
            .select()
            .from(appointments)
            .where(eq(appointments.id, id))
            .limit(1);

        if (existingAppointment.length === 0) {
            return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        }

        const appointment = existingAppointment[0];

        // 4. Check if appointment is in the past
        const appointmentTime = new Date(appointment.startTime);
        const now = new Date();

        if (appointmentTime > now) {
            return NextResponse.json({
                error: 'Cannot mark future appointments as completed'
            }, { status: 400 });
        }

        // 5. Check if appointment is confirmed
        if (appointment.status !== 'CONFIRMED') {
            return NextResponse.json({
                error: 'Only confirmed appointments can be marked as completed'
            }, { status: 400 });
        }

        // 6. Update status to COMPLETED
        await db
            .update(appointments)
            .set({
                status: 'COMPLETED',
                updatedAt: new Date().toISOString()
            })
            .where(eq(appointments.id, id));

        console.log(`Appointment ${id} marked as completed`);

        return NextResponse.json({
            success: true,
            message: 'Appointment marked as completed successfully'
        });

    } catch (error) {
        console.error('Error marking appointment as completed:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Internal Server Error'
        }, { status: 500 });
    }
}
