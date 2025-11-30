import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contactRequests } from '@/db/schema';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, phone, email, businessName, message, preferredContact } = body;

        // Validate required fields
        if (!name || !phone || !email || !message || !preferredContact) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Store in database
        const newContactRequest = await db.insert(contactRequests).values({
            name,
            phone,
            email,
            businessName,
            message,
            preferredContact,
            status: 'NEW',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).returning();

        // TODO: Send auto-reply email/WhatsApp
        // For now, we just store the request.

        return NextResponse.json({ success: true, data: newContactRequest[0] });
    } catch (error) {
        console.error('Error processing contact request:', error);
        console.error('Error details:', {
            name: error instanceof Error ? error.name : 'Unknown',
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined
        });
        return NextResponse.json(
            {
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}
