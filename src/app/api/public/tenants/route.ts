
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tenants, services, staff, reviews } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const slug = searchParams.get('slug');

        console.log('=== TENANTS API CALLED ===');
        console.log('Slug parameter:', slug);

        if (slug) {
            console.log('Fetching specific tenant with slug:', slug);

            // Fetch specific tenant by slug (only if active)
            const tenant = await db.query.tenants.findFirst({
                where: eq(tenants.slug, slug),
            });

            console.log('Tenant found:', tenant ? 'Yes' : 'No');

            if (!tenant) {
                console.log('Tenant not found for slug:', slug);
                return NextResponse.json(
                    { error: 'Tenant not found' },
                    { status: 404 }
                );
            }

            // Check if tenant is active
            if (!tenant.isActive) {
                console.log('Tenant is not active:', slug);
                return NextResponse.json(
                    { error: 'Business is currently unavailable' },
                    { status: 403 }
                );
            }

            console.log('Fetching services for tenant:', tenant.id);
            // Fetch related services
            const tenantServices = await db.query.services.findMany({
                where: eq(services.tenantId, tenant.id),
            });
            console.log('Services found:', tenantServices.length);

            console.log('Fetching staff for tenant:', tenant.id);
            // Fetch related staff
            const tenantStaff = await db.query.staff.findMany({
                where: eq(staff.tenantId, tenant.id),
            });
            console.log('Staff found:', tenantStaff.length);

            // Combine data
            const tenantWithDetails = {
                ...tenant,
                services: tenantServices,
                staff: tenantStaff,
            };

            console.log('Returning tenant with details');
            return NextResponse.json({ tenants: [tenantWithDetails] });
        }

        // If no slug provided, return all tenants
        console.log('Fetching all tenants...');
        const allTenants = await db.query.tenants.findMany({
            where: eq(tenants.isActive, true)
        });
        console.log('Total tenants found:', allTenants.length);

        if (allTenants.length > 0) {
            console.log('Sample tenant:', {
                id: allTenants[0].id,
                name: allTenants[0].nameEn,
                slug: allTenants[0].slug
            });
        }

        // For listing page, also fetch services count for each tenant
        const tenantsWithCounts = await Promise.all(
            allTenants.map(async (tenant) => {
                const tenantServices = await db.query.services.findMany({
                    where: eq(services.tenantId, tenant.id),
                });

                const tenantReviews = await db.query.reviews.findMany({
                    where: eq(reviews.tenantId, tenant.id),
                });

                const reviewCount = tenantReviews.length;
                const averageRating = reviewCount > 0
                    ? tenantReviews.reduce((acc, review) => acc + review.rating, 0) / reviewCount
                    : 0;

                return {
                    ...tenant,
                    serviceCount: tenantServices.length,
                    reviewCount,
                    averageRating
                };
            })
        );

        console.log('Returning tenants with service counts');
        return NextResponse.json({
            tenants: tenantsWithCounts,
            total: tenantsWithCounts.length
        });

    } catch (error) {
        console.error('=== ERROR IN TENANTS API ===');
        console.error('Error type:', error instanceof Error ? error.name : typeof error);
        console.error('Error message:', error instanceof Error ? error.message : String(error));
        console.error('Full error:', error);

        return NextResponse.json(
            {
                error: 'Internal Server Error',
                message: error instanceof Error ? error.message : 'Unknown error',
                details: process.env.NODE_ENV === 'development' ? String(error) : undefined
            },
            { status: 500 }
        );
    }
}
