import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';
import { checkLoginAttempt, recordFailedLogin, resetLoginAttempts, formatRemainingTime } from '@/lib/rateLimit';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Check rate limiting
        const { allowed, remainingTime, attemptsCount } = checkLoginAttempt(email.toLowerCase());
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

        // Find user by email and role
        const user = await db.select()
            .from(users)
            .where(eq(users.email, email.toLowerCase()))
            .limit(1);

        if (user.length === 0) {
            recordFailedLogin(email.toLowerCase());
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        const foundUser = user[0];

        // Check if user is a customer
        if (foundUser.role !== 'CUSTOMER') {
            recordFailedLogin(email.toLowerCase());
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Verify password
        const passwordMatch = await bcrypt.compare(password, foundUser.password);
        if (!passwordMatch) {
            recordFailedLogin(email.toLowerCase());
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Successful login - reset attempts
        resetLoginAttempts(email.toLowerCase());

        // Generate JWT token
        const token = jwt.sign(
            {
                userId: foundUser.id,
                email: foundUser.email,
                role: foundUser.role,
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return NextResponse.json({
            success: true,
            token,
            user: {
                id: foundUser.id,
                email: foundUser.email,
                firstName: foundUser.firstName,
                lastName: foundUser.lastName,
                phone: foundUser.phone,
            },
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Login failed. Please try again.' },
            { status: 500 }
        );
    }
}
