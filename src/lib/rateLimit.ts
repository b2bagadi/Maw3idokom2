interface LoginAttempt {
    email: string;
    failedAttempts: number;
    lockedUntil: Date | null;
    lastAttemptTime: Date;
}

// In-memory storage for login attempts
const loginAttempts = new Map<string, LoginAttempt>();

/**
 * Check if a login attempt is allowed for the given email
 * @param email - User's email address
 * @returns Object indicating if login is allowed and remaining lockout time
 */
export function checkLoginAttempt(email: string): {
    allowed: boolean;
    remainingTime?: number; // in seconds
    attemptsCount: number;
} {
    const attempt = loginAttempts.get(email.toLowerCase());
    const now = new Date();

    // No previous attempts
    if (!attempt) {
        return { allowed: true, attemptsCount: 0 };
    }

    // Currently locked
    if (attempt.lockedUntil && attempt.lockedUntil > now) {
        const remainingMs = attempt.lockedUntil.getTime() - now.getTime();
        return {
            allowed: false,
            remainingTime: Math.ceil(remainingMs / 1000),
            attemptsCount: attempt.failedAttempts,
        };
    }

    // Lockout expired or no lockout
    return { allowed: true, attemptsCount: attempt.failedAttempts };
}

/**
 * Record a failed login attempt and apply progressive lockout
 * @param email - User's email address
 */
export function recordFailedLogin(email: string): void {
    const normalizedEmail = email.toLowerCase();
    const attempt = loginAttempts.get(normalizedEmail);
    const now = new Date();

    if (!attempt) {
        // First failed attempt - 1 minute lockout
        loginAttempts.set(normalizedEmail, {
            email: normalizedEmail,
            failedAttempts: 1,
            lockedUntil: new Date(now.getTime() + 60 * 1000), // 1 minute
            lastAttemptTime: now,
        });
    } else {
        const newAttempts = attempt.failedAttempts + 1;
        let lockoutDuration: number;

        // Progressive lockout times
        switch (newAttempts) {
            case 1:
                lockoutDuration = 60 * 1000; // 1 minute
                break;
            case 2:
                lockoutDuration = 15 * 60 * 1000; // 15 minutes
                break;
            case 3:
                lockoutDuration = 30 * 60 * 1000; // 30 minutes
                break;
            default:
                lockoutDuration = 60 * 60 * 1000; // 1 hour for 4+ attempts
        }

        loginAttempts.set(normalizedEmail, {
            email: normalizedEmail,
            failedAttempts: newAttempts,
            lockedUntil: new Date(now.getTime() + lockoutDuration),
            lastAttemptTime: now,
        });
    }
}

/**
 * Reset login attempts for a user (call on successful login)
 * @param email - User's email address
 */
export function resetLoginAttempts(email: string): void {
    loginAttempts.delete(email.toLowerCase());
}

/**
 * Cleanup old attempts (older than 24 hours)
 * Should be called periodically to prevent memory leaks
 */
export function cleanupOldAttempts(): void {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    for (const [email, attempt] of loginAttempts.entries()) {
        if (attempt.lastAttemptTime < oneDayAgo) {
            loginAttempts.delete(email);
        }
    }
}

/**
 * Format remaining time in a human-readable format
 * @param seconds - Remaining seconds
 * @returns Formatted string like "5 minutes" or "1 hour 30 minutes"
 */
export function formatRemainingTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
        if (remainingMinutes > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes > 1 ? 's' : ''}`;
        }
        return `${hours} hour${hours > 1 ? 's' : ''}`;
    }

    if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''}`;
    }

    return `${seconds} second${seconds > 1 ? 's' : ''}`;
}

// Auto-cleanup every hour
setInterval(cleanupOldAttempts, 60 * 60 * 1000);
