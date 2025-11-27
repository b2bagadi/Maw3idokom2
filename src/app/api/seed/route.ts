
import { NextResponse } from 'next/server';
import { db } from '@/db';
import { tenants, services, staff } from '@/db/schema';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        // Check if demo tenant already exists
        const existingTenant = await db.query.tenants.findFirst({
            where: eq(tenants.slug, 'demo'),
        });

        if (existingTenant) {
            return NextResponse.json({ message: 'Demo tenant already exists' });
        }

        const passwordHash = await bcrypt.hash('password123', 10);

        // Create Demo Tenant
        const [newTenant] = await db.insert(tenants).values({
            name: 'Demo Business',
            slug: 'demo',
            nameEn: 'Demo Business',
            nameFr: 'Entreprise de Démonstration',
            nameAr: 'الأعمال التجريبية',
            aboutEn: 'Welcome to our demo booking system! This is a sample business to showcase our appointment booking features.',
            aboutFr: 'Bienvenue dans notre système de réservation de démonstration!',
            aboutAr: 'مرحبًا بك في نظام الحجز التجريبي الخاص بنا!',
            email: 'demo@maw3idokom.com',
            passwordHash: passwordHash,
            ownerName: 'Demo Owner',
            phone: '+1-555-DEMO',
            address: '123 Demo Street, Demo City',
            businessType: 'Demo Services',
            mapUrl: 'https://maps.google.com/?q=Demo+Business',
            whatsappUrl: 'https://wa.me/1555DEMO',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).returning();

        // Add Services
        await db.insert(services).values([
            {
                tenantId: newTenant.id,
                nameEn: 'General Consultation',
                nameFr: 'Consultation Générale',
                nameAr: 'استشارة عامة',
                descriptionEn: 'A general consultation to discuss your needs.',
                descriptionFr: 'Une consultation générale pour discuter de vos besoins.',
                descriptionAr: 'استشارة عامة لمناقشة احتياجاتك.',
                duration: 30,
                price: 50,
                isActive: true,
            },
            {
                tenantId: newTenant.id,
                nameEn: 'Premium Service',
                nameFr: 'Service Premium',
                nameAr: 'خدمة مميزة',
                descriptionEn: 'Full service package with premium attention.',
                descriptionFr: 'Forfait service complet avec une attention premium.',
                descriptionAr: 'باقة خدمة كاملة مع اهتمام متميز.',
                duration: 60,
                price: 100,
                isActive: true,
            }
        ]);

        // Add Staff
        await db.insert(staff).values([
            {
                tenantId: newTenant.id,
                nameEn: 'Dr. Smith',
                nameFr: 'Dr. Smith',
                nameAr: 'د. سميث',
                role: 'Specialist',
                bioEn: 'Experienced specialist.',
                bioFr: 'Spécialiste expérimenté.',
                bioAr: 'أخصائي ذو خبرة.',
                isActive: true,
            },
            {
                tenantId: newTenant.id,
                nameEn: 'Sarah Jones',
                nameFr: 'Sarah Jones',
                nameAr: 'سارة جونز',
                role: 'Assistant',
                bioEn: 'Friendly assistant.',
                bioFr: 'Assistante amicale.',
                bioAr: 'مساعدة ودودة.',
                isActive: true,
            }
        ]);

        return NextResponse.json({ message: 'Database seeded successfully with Demo Business' });
    } catch (error) {
        console.error('Seeding error:', error);
        return NextResponse.json({ error: 'Failed to seed database', details: String(error) }, { status: 500 });
    }
}
