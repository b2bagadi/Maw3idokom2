import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { workingHours, tenants } from '@/db/schema';
import jwt from 'jsonwebtoken';
import { eq, and } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const tenantId = decoded.tenantId;

        // Get working hours for this tenant
        const hours = await db.select()
            .from(workingHours)
            .where(eq(workingHours.tenantId, tenantId));

        return NextResponse.json({
            success: true,
            workingHours: hours,
        });

    } catch (error) {
        console.error('Get availability error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch availability' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const token = authHeader.substring(7);
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
        }

        const tenantId = decoded.tenantId;
        const body = await request.json();
        const { workingHours: newHours } = body;

        if (!newHours || !Array.isArray(newHours)) {
            return NextResponse.json(
                { error: 'Invalid working hours data' },
                { status: 400 }
            );
        }

        // Delete existing working hours for this tenant
        await db.delete(workingHours).where(eq(workingHours.tenantId, tenantId));

        // Insert new working hours (only enabled days)
        const now = new Date().toISOString();
        const enabledHours = newHours.filter(h => h.isEnabled);

        if (enabledHours.length > 0) {
            await db.insert(workingHours).values(
                enabledHours.map(h => ({
                    tenantId,
                    staffId: null, // Default business hours (not staff-specific)
                    dayOfWeek: h.dayOfWeek,
                    startTime: h.startTime,
                    endTime: h.endTime,
                    isEnabled: true,
                    createdAt: now,
                    updatedAt: now,
                }))
            );
        }

        return NextResponse.json({
            success: true,
            message: 'Availability updated successfully',
        });

    } catch (error) {
        console.error('Update availability error:', error);
        return NextResponse.json(
            { error: 'Failed to update availability' },
            { status: 500 }
        );
    }
}
