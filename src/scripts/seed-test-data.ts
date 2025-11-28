
import { db } from '@/db';
import { tenants, users, services, staff, appointments, workingHours } from '@/db/schema';
import { hash } from 'bcryptjs';

async function seed() {
    console.log('🌱 Seeding test data...');

    // 1. Create a Test Business (Tenant)
    const passwordHash = await hash('password123', 10);

    const [tenant] = await db.insert(tenants).values({
        name: 'Test Salon & Spa',
        slug: 'test-salon',
        nameEn: 'Test Salon & Spa',
        nameFr: 'Salon de Test & Spa',
        nameAr: 'صالون و سبا تجريبي',
        email: 'business@test.com',
        passwordHash,
        ownerName: 'Business Owner',
        phone: '+212600000000',
        businessType: 'Salon',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }).returning();

    console.log('✅ Created Tenant:', tenant.name);

    // 2. Create a Business User (Owner)
    await db.insert(users).values({
        email: 'business@test.com',
        password: passwordHash,
        firstName: 'Business',
        lastName: 'Owner',
        role: 'OWNER',
        tenantId: tenant.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    });

    console.log('✅ Created Business User: business@test.com / password123');

    // 3. Create Services
    const [haircut] = await db.insert(services).values({
        tenantId: tenant.id,
        nameEn: 'Premium Haircut',
        nameFr: 'Coupe Premium',
        nameAr: 'قصة شعر مميزة',
        duration: 60,
        price: 150,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }).returning();

    const [massage] = await db.insert(services).values({
        tenantId: tenant.id,
        nameEn: 'Relaxing Massage',
        nameFr: 'Massage Relaxant',
        nameAr: 'تدليك مريح',
        duration: 90,
        price: 300,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }).returning();

    console.log('✅ Created Services');

    // 4. Create Staff
    const [sarah] = await db.insert(staff).values({
        tenantId: tenant.id,
        nameEn: 'Sarah Jones',
        nameFr: 'Sarah Jones',
        nameAr: 'سارة جونز',
        role: 'Stylist',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }).returning();

    const [mike] = await db.insert(staff).values({
        tenantId: tenant.id,
        nameEn: 'Mike Smith',
        nameFr: 'Mike Smith',
        nameAr: 'مايك سميث',
        role: 'Therapist',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }).returning();

    console.log('✅ Created Staff');

    // 5. Create Appointments
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);

    await db.insert(appointments).values([
        {
            tenantId: tenant.id,
            serviceId: haircut.id,
            staffId: sarah.id,
            guestName: 'John Doe',
            guestEmail: 'john@example.com',
            guestPhone: '+212611111111',
            startTime: tomorrow.toISOString(),
            endTime: new Date(tomorrow.getTime() + 60 * 60000).toISOString(),
            status: 'PENDING',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        },
        {
            tenantId: tenant.id,
            serviceId: massage.id,
            staffId: mike.id,
            guestName: 'Jane Smith',
            guestEmail: 'jane@example.com',
            guestPhone: '+212622222222',
            startTime: nextWeek.toISOString(),
            endTime: new Date(nextWeek.getTime() + 90 * 60000).toISOString(),
            status: 'CONFIRMED',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }
    ]);

    console.log('✅ Created Test Appointments');
    console.log('🎉 Seed complete!');
}

seed().catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
});
