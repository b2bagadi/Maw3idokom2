import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';

// GET - Public endpoint to list active categories
export async function GET(request: NextRequest) {
    try {
        const activeCategories = await db
            .select()
            .from(categories)
            .where(eq(categories.isActive, true))
            .orderBy(categories.nameEn);

        return NextResponse.json({
            success: true,
            categories: activeCategories
        });
    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + (error as Error).message },
            { status: 500 }
        );
    }
}
