import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contactRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { status, internalNotes } = body;

        const updateData: any = {
            updatedAt: new Date().toISOString(),
        };

        if (status) updateData.status = status;
        if (internalNotes !== undefined) updateData.internalNotes = internalNotes;

        const updatedRequest = await db
            .update(contactRequests)
            .set(updateData)
            .where(eq(contactRequests.id, parseInt(id)))
            .returning();

        if (updatedRequest.length === 0) {
            return NextResponse.json(
                { error: 'Contact request not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, data: updatedRequest[0] });
    } catch (error) {
        console.error('Error updating contact request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
