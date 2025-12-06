import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workingHours, appointments, tenants } from '@/db/schema';
import { eq, and, gte, lte, or, isNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const businessSlug = searchParams.get('slug');
        const staffIdParam = searchParams.get('staffId');
        const dateParam = searchParams.get('date');
        const durationParam = searchParams.get('duration');

        if (!businessSlug || !dateParam || !durationParam) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const duration = parseInt(durationParam);
        const selectedDate = new Date(dateParam);
        const staffId = staffIdParam && staffIdParam !== '0' ? parseInt(staffIdParam) : null;

        // Get tenant ID
        const tenant = await db.select({ id: tenants.id })
            .from(tenants)
            .where(eq(tenants.slug, businessSlug))
            .limit(1);

        if (tenant.length === 0) {
            return NextResponse.json({ error: 'Business not found' }, { status: 404 });
        }

        const tenantId = tenant[0].id;
        const dayOfWeek = selectedDate.getDay(); // 0-6

        // 1. Get Working Hours
        let hours: typeof workingHours.$inferSelect[] = [];

        if (staffId) {
            hours = await db.select()
                .from(workingHours)
                .where(and(
                    eq(workingHours.tenantId, tenantId),
                    eq(workingHours.staffId, staffId),
                    eq(workingHours.dayOfWeek, dayOfWeek),
                    eq(workingHours.isEnabled, true)
                ));
        }

        // If no staff hours found (or no staff selected), try default business hours
        if (hours.length === 0) {
            // First try finding generic business hours (staffId is null)
            hours = await db.select()
                .from(workingHours)
                .where(and(
                    eq(workingHours.tenantId, tenantId),
                    isNull(workingHours.staffId),
                    eq(workingHours.dayOfWeek, dayOfWeek),
                    eq(workingHours.isEnabled, true)
                ));

            // If strictly needing fallback for a specific staff that has no schedule, we use business hours.
            // But if business hours are also not set, then Closed.
        }

        if (hours.length === 0) {
            return NextResponse.json({ slots: [] }); // Closed today
        }

        const workStart = hours[0].startTime; // "09:00"
        const workEnd = hours[0].endTime;     // "17:00"

        // 2. Get Existing Appointments (Conflicting times) for the day
        const dayStart = new Date(selectedDate);
        dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(selectedDate);
        dayEnd.setHours(23, 59, 59, 999);

        let conflictingAppointments = [];

        if (staffId) {
            conflictingAppointments = await db.select()
                .from(appointments)
                .where(and(
                    eq(appointments.tenantId, tenantId),
                    eq(appointments.staffId, staffId),
                    gte(appointments.startTime, dayStart.toISOString()),
                    lte(appointments.startTime, dayEnd.toISOString()),
                    or(
                        eq(appointments.status, 'CONFIRMED'),
                        eq(appointments.status, 'PENDING'),
                        eq(appointments.status, 'BLOCKED')
                    )
                ));
        } else {
            // If no staff selected, we only block times that block EVERYONE (e.g. holiday? or just business wide block?)
            // Business wide block has staffId = null
            conflictingAppointments = await db.select()
                .from(appointments)
                .where(and(
                    eq(appointments.tenantId, tenantId),
                    isNull(appointments.staffId),
                    gte(appointments.startTime, dayStart.toISOString()),
                    lte(appointments.startTime, dayEnd.toISOString()),
                    or(
                        eq(appointments.status, 'CONFIRMED'),
                        eq(appointments.status, 'PENDING'),
                        eq(appointments.status, 'BLOCKED')
                    )
                ));
        }

        // 3. Generate Slots
        const [startH, startM] = workStart.split(':').map(Number);
        const [endH, endM] = workEnd.split(':').map(Number);

        const fullSlots = [];
        const currentIter = new Date(selectedDate);
        currentIter.setHours(startH, startM, 0, 0);

        const endTimeDate = new Date(selectedDate);
        endTimeDate.setHours(endH, endM, 0, 0);

        const interval = 30; // Minutes

        while (currentIter < endTimeDate) {
            const slotEnd = new Date(currentIter.getTime() + duration * 60000);

            if (slotEnd <= endTimeDate) {
                // Check collision
                const isBlocked = conflictingAppointments.some(appt => {
                    const apptStart = new Date(appt.startTime);
                    const apptEnd = new Date(appt.endTime);
                    return (currentIter < apptEnd && slotEnd > apptStart);
                });

                if (!isBlocked) {
                    const now = new Date();
                    // If today, filter past times
                    if (!isSameDay(now, selectedDate) || currentIter > now) {
                        fullSlots.push(formatTime(currentIter));
                    }
                }
            }

            currentIter.setMinutes(currentIter.getMinutes() + interval);
        }

        return NextResponse.json({ slots: fullSlots });

    } catch (error) {
        console.error('Slot calculation error:', error);
        return NextResponse.json({ error: 'Failed to calculate slots' }, { status: 500 });
    }
}

function formatTime(date: Date): string {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

function isSameDay(d1: Date, d2: Date) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}
