import { NextResponse } from 'next/server';
import { db } from '@/db';
import { globalSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
    try {
        const settings = await db.select().from(globalSettings).limit(1);

        if (settings.length === 0) {
            return NextResponse.json({});
        }

        return NextResponse.json(settings[0]);
    } catch (error) {
        console.error('Error fetching settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const {
            adminWhatsapp,
            adminEmail,
            autoReplyTemplateEn,
            autoReplyTemplateFr,
            autoReplyTemplateAr
        } = body;

        // Check if settings exist
        const existingSettings = await db.select().from(globalSettings).limit(1);

        let result;
        if (existingSettings.length === 0) {
            // Create new settings
            result = await db.insert(globalSettings).values({
                adminWhatsapp,
                adminEmail,
                autoReplyTemplateEn,
                autoReplyTemplateFr,
                autoReplyTemplateAr,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }).returning();
        } else {
            // Update existing settings
            result = await db
                .update(globalSettings)
                .set({
                    adminWhatsapp,
                    adminEmail,
                    autoReplyTemplateEn,
                    autoReplyTemplateFr,
                    autoReplyTemplateAr,
                    updatedAt: new Date().toISOString(),
                })
                .where(eq(globalSettings.id, existingSettings[0].id))
                .returning();
        }

        return NextResponse.json(result[0]);

    } catch (error) {
        console.error('Error updating settings:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
