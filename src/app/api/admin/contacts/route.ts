import { NextResponse } from 'next/server';
import { db } from '@/db';
import { contactRequests } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
    try {
        const requests = await db
            .select()
            .from(contactRequests)
            .orderBy(desc(contactRequests.createdAt));

        return NextResponse.json({ requests });
    } catch (error) {
        console.error('Error fetching contact requests:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
