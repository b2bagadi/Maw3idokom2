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
        console.error('JWT verification error:', error);
        return null;
    }
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
}

// GET - List all categories
export async function GET(request: NextRequest) {
    try {
        const admin = await verifySuperAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const allCategories = await db.select().from(categories).orderBy(categories.nameEn);

        return NextResponse.json({
            success: true,
            categories: allCategories
        });
    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + (error as Error).message },
            { status: 500 }
        );
    }
}

// POST - Create new category
export async function POST(request: NextRequest) {
    try {
        const admin = await verifySuperAdmin(request);
        if (!admin) {
            return NextResponse.json(
                { error: 'Unauthorized', code: 'UNAUTHORIZED' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { nameEn, nameFr, nameAr, icon } = body;

        if (!nameEn || !nameFr || !nameAr || !icon) {
            return NextResponse.json(
                { error: 'Missing required fields', code: 'MISSING_FIELDS' },
                { status: 400 }
            );
        }

        const slug = generateSlug(nameEn);

        // Check if slug already exists
        const existing = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
        if (existing.length > 0) {
            return NextResponse.json(
                { error: 'Category with this name already exists', code: 'DUPLICATE_SLUG' },
                { status: 409 }
            );
        }

        const newCategory = await db.insert(categories).values({
            nameEn: nameEn.trim(),
            nameFr: nameFr.trim(),
            nameAr: nameAr.trim(),
            slug,
            icon: icon.trim(),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }).returning();

        return NextResponse.json({
            success: true,
            category: newCategory[0]
        }, { status: 201 });
    } catch (error) {
        console.error('POST error:', error);
        return NextResponse.json(
            { error: 'Internal server error: ' + (error as Error).message },
            { status: 500 }
        );
    }
}
