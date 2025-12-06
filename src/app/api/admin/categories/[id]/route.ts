import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { categories } from '@/db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface JwtPayload {
    id: number;
    username: string;
    role: string;
}

async function verifySuperAdmin(request: NextRequest): Promise<JwtPayload | null> {
    try {
        const authHeader = request.headers.get('authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return null;
        }
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (decoded.role !== 'SUPER_ADMIN') {
            return null;
        }
        return decoded;
    } catch (error) {
        return null;
    }
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// PUT - Update category
export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await verifySuperAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const id = params.id;
        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { error: 'Valid ID is required', code: 'INVALID_ID' },
                { status: 400 }
            );
        }

        const categoryId = parseInt(id);
        const existing = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);

        if (existing.length === 0) {
            return NextResponse.json(
                { error: 'Category not found', code: 'CATEGORY_NOT_FOUND' },
                { status: 404 }
            );
        }

        const body = await request.json();
        const updateData: any = {
            updatedAt: new Date().toISOString()
        };

        if (body.nameEn !== undefined) {
            updateData.nameEn = body.nameEn.trim();
            updateData.slug = generateSlug(body.nameEn);
        }
        if (body.nameFr !== undefined) updateData.nameFr = body.nameFr.trim();
        if (body.nameAr !== undefined) updateData.nameAr = body.nameAr.trim();
        if (body.icon !== undefined) updateData.icon = body.icon.trim();
        if (body.isActive !== undefined) updateData.isActive = body.isActive;

        const updated = await db.update(categories)
            .set(updateData)
            .where(eq(categories.id, categoryId))
            .returning();

        return NextResponse.json({
            success: true,
            category: updated[0]
        });
    } catch (error) {
        console.error('PUT error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + (error as Error).message },
            { status: 500 }
        );
    }
}

// DELETE - Delete category
export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await verifySuperAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const id = params.id;
        if (!id || isNaN(parseInt(id))) {
            return NextResponse.json(
                { error: 'Valid ID is required', code: 'INVALID_ID' },
                { status: 400 }
            );
        }

        const categoryId = parseInt(id);
        const existing = await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1);

        if (existing.length === 0) {
            return NextResponse.json(
                { error: 'Category not found', code: 'CATEGORY_NOT_FOUND' },
                { status: 404 }
            );
        }

        await db.delete(categories).where(eq(categories.id, categoryId));

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('DELETE error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + (error as Error).message },
            { status: 500 }
        );
    }
}
