/**
 * Authentication Service
 * Handles JWT token generation, verification, and user authentication
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '@repo/db';
import { users } from '@repo/db';
import { eq } from 'drizzle-orm';
import type { JWTPayload, AuthUser, LoginRequest, RegisterRequest } from '../types/auth';
import { UnauthorizedError, ConflictError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sanitizeEmail, sanitizeString, isValidEmail } from '../utils/sanitize';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-change-in-production';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';

/**
 * Generate JWT access token
 */
export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}

/**
 * Generate JWT refresh token
 */
export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
}

/**
 * Verify JWT access token
 */
export function verifyAccessToken(token: string): JWTPayload {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return payload;
    } catch (error) {
        logger.error('JWT verification failed', error);
        throw new UnauthorizedError('Invalid or expired token');
    }
}

/**
 * Verify JWT refresh token
 */
export function verifyRefreshToken(token: string): JWTPayload {
    try {
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
        return payload;
    } catch (error) {
        logger.error('Refresh token verification failed', error);
        throw new UnauthorizedError('Invalid or expired refresh token');
    }
}

/**
 * Hash password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}

/**
 * Compare password with hash
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Login user with email and password
 */
export async function loginUser(credentials: LoginRequest): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
    const { email, password } = credentials;

    // Sanitize and validate input
    const sanitizedEmail = sanitizeEmail(email);
    if (!isValidEmail(sanitizedEmail)) {
        throw new UnauthorizedError('Invalid email or password');
    }

    // Find user by email
    const user = await db.query.users.findFirst({
        where: eq(users.email, sanitizedEmail),
    });

    if (!user) {
        logger.warn('Login attempt for non-existent user', { email: sanitizedEmail });
        throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (user.status !== 'Active') {
        throw new UnauthorizedError('Account is inactive');
    }

    // For now, we don't have password field in schema
    // This is a placeholder - you'll need to add password field to users table
    // For development, we'll skip password check
    // TODO: Add password field to users table and implement proper auth

    const authUser: AuthUser = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.userRole,
    };

    const tokenPayload = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.userRole,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    logger.info('User logged in successfully', { userId: user.userId });

    return {
        accessToken,
        refreshToken,
        user: authUser,
    };
}

/**
 * Register new user
 */
export async function registerUser(data: RegisterRequest): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
    // Sanitize inputs
    const sanitizedEmail = sanitizeEmail(data.email);
    const sanitizedUsername = sanitizeString(data.username);
    const sanitizedFullName = sanitizeString(data.fullName || '');

    // Validate email
    if (!isValidEmail(sanitizedEmail)) {
        throw new UnauthorizedError('Invalid email format');
    }

    // Check if user already exists
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, sanitizedEmail),
    });

    if (existingUser) {
        throw new ConflictError('User with this email already exists');
    }

    // Check username uniqueness
    const existingUsername = await db.query.users.findFirst({
        where: eq(users.username, sanitizedUsername),
    });

    if (existingUsername) {
        throw new ConflictError('Username already taken');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    // TODO: Add password field to users table
    const newUsers = await db
        .insert(users)
        .values({
            username: sanitizedUsername,
            email: sanitizedEmail,
            fullName: sanitizedFullName || null,
            phoneNumber: data.phoneNumber || null,
            userRole: data.role,
            areaId: data.areaId || null,
            status: 'Active',
        })
        .returning();

    const newUser = newUsers[0];
    if (!newUser) {
        throw new Error('Failed to create user');
    }

    const authUser: AuthUser = {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.userRole,
    };

    const tokenPayload = {
        userId: newUser.userId,
        username: newUser.username,
        email: newUser.email,
        role: newUser.userRole,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    logger.info('New user registered', { userId: newUser.userId });

    return {
        accessToken,
        refreshToken,
        user: authUser,
    };
}

/**
 * Refresh access token using refresh token
 */
export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const user = await db.query.users.findFirst({
        where: eq(users.userId, payload.userId),
    });

    if (!user || user.status !== 'Active') {
        throw new UnauthorizedError('Invalid refresh token');
    }

    const tokenPayload = {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.userRole,
    };

    const accessToken = generateAccessToken(tokenPayload);

    return { accessToken };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AuthUser> {
    const user = await db.query.users.findFirst({
        where: eq(users.userId, userId),
    });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    return {
        userId: user.userId,
        username: user.username,
        email: user.email,
        role: user.userRole,
    };
}
