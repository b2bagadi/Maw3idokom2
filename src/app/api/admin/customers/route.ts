import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq, like, or, and, sql } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// JWT verification middleware
async function verifySuperAdmin(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided', status: 401 };
    }

    const token = authHeader.substring(7);

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is not configured');
      return { error: 'Server configuration error', status: 500 };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { role: string };

    if (decoded.role !== 'SUPER_ADMIN') {
      return { error: 'Access denied. Super admin privileges required', status: 403 };
    }

    return { success: true };
  } catch (error) {
    console.error('Token verification error:', error);
    return { error: 'Invalid or expired token', status: 401 };
  }
}

// GET Handler - List customers
export async function GET(request: NextRequest) {
  try {
    const authResult = await verifySuperAdmin(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'));
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = (page - 1) * limit;

    let whereConditions = [eq(users.role, 'CUSTOMER')];

    if (search) {
      const searchTerm = `%${search}%`;
      whereConditions.push(
        or(
          like(users.firstName, searchTerm),
          like(users.lastName, searchTerm),
          like(users.email, searchTerm),
          like(users.phone, searchTerm)
        )
      );
    }

    const whereClause = and(...whereConditions);

    const results = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        phone: users.phone,
        isActive: users.isActive,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset);

    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);

    const total = countResult[0]?.count ?? 0;

    return NextResponse.json({
      customers: results,
      total,
      page,
      limit
    });

  } catch (error) {
    console.error('GET customers error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}