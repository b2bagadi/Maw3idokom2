import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { tenants } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { checkLoginAttempt, recordFailedLogin, resetLoginAttempts, formatRemainingTime } from '@/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        {
          error: 'Email and password are required',
          code: 'MISSING_REQUIRED_FIELDS'
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          error: 'Invalid email format',
          code: 'INVALID_EMAIL_FORMAT'
        },
        { status: 400 }
      );
    }

    // Check rate limiting
    const { allowed, remainingTime, attemptsCount } = checkLoginAttempt(email.toLowerCase().trim());
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Too many failed login attempts. Please try again in ${formatRemainingTime(remainingTime!)}.`,
          code: 'RATE_LIMITED',
          remainingTime,
          attemptsCount
        },
        { status: 429 }
      );
    }

    // Query tenant by email
    const tenant = await db.select()
      .from(tenants)
      .where(eq(tenants.email, email.toLowerCase().trim()))
      .limit(1);

    if (tenant.length === 0) {
      recordFailedLogin(email.toLowerCase().trim());
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    const foundTenant = tenant[0];

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, foundTenant.passwordHash);

    if (!isPasswordValid) {
      recordFailedLogin(email.toLowerCase().trim());
      return NextResponse.json(
        {
          error: 'Invalid credentials',
          code: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Successful login - reset attempts
    resetLoginAttempts(email.toLowerCase().trim());

    // Generate JWT token
    const tokenPayload = {
      id: foundTenant.id,
      email: foundTenant.email,
      role: 'BUSINESS_OWNER',
      tenantId: foundTenant.id
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: '30d'
    });

    // Prepare tenant object without passwordHash
    const { passwordHash, ...tenantWithoutPassword } = foundTenant;

    return NextResponse.json(
      {
        success: true,
        token,
        tenant: tenantWithoutPassword
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}