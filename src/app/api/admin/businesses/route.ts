import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { like, or } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const search = searchParams.get('search');

        let query = db.select().from(tenants);

        if (search) {
            query = query.where(
                or(
                    like(tenants.name, `%${search}%`),
                    like(tenants.nameEn, `%${search}%`),
                    like(tenants.nameFr, `%${search}%`),
                    like(tenants.nameAr, `%${search}%`)
                )
            ) as any;
        }

        const businesses = await query;

        return NextResponse.json({ businesses });
    } catch (error) {
        console.error('Error fetching businesses:', error);
        return NextResponse.json({ error: 'Failed to fetch businesses' }, { status: 500 });
    }
}
