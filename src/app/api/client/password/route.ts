import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { eq } from 'drizzle-orm';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export async function PUT(request: NextRequest) {
    try {
        // Verify JWT token
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7);
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 401 }
            );
        }

        const userId = decoded.userId;

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        // Validate inputs
        if (!currentPassword || !newPassword) {
            return NextResponse.json(
                { error: 'Current password and new password are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'New password must be at least 6 characters long' },
                { status: 400 }
            );
        }

        // Get user from database
        const user = await db.select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        if (user.length === 0) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Verify current password
        const isPasswordValid = await bcrypt.compare(currentPassword, user[0].password);
        if (!isPasswordValid) {
            return NextResponse.json(
                { error: 'Current password is incorrect' },
                { status: 401 }
            );
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await db.update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, userId));

        return NextResponse.json({
            success: true,
            message: 'Password changed successfully',
        });

    } catch (error) {
        console.error('Password change error:', error);
        return NextResponse.json(
            { error: 'Failed to change password' },
            { status: 500 }
        );
    }
}
