import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from '@repo/db';
import { users } from '@repo/db';
import { eq } from 'drizzle-orm';
import type { JWTPayload, AuthUser, LoginRequest, RegisterRequest } from '../types/auth';
import { UnauthorizedError, ConflictError, NotFoundError, InternalServerError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sanitizeEmail, sanitizeString, sanitizePhone, isValidEmail } from '../utils/sanitize';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-change-in-production';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '7d';


export function generateAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}


export function generateRefreshToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
    return jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
}


export function verifyAccessToken(token: string): JWTPayload {
    try {
        const payload = jwt.verify(token, JWT_SECRET) as JWTPayload;
        return payload;
    } catch (error) {
        logger.error('JWT verification failed', error);
        throw new UnauthorizedError('Invalid or expired token');
    }
}


export function verifyRefreshToken(token: string): JWTPayload {
    try {
        const payload = jwt.verify(token, REFRESH_TOKEN_SECRET) as JWTPayload;
        return payload;
    } catch (error) {
        logger.error('Refresh token verification failed', error);
        throw new UnauthorizedError('Invalid or expired refresh token');
    }
}


export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
}


export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}


export async function loginUser(credentials: LoginRequest): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
    const { email, password } = credentials;

    
    const sanitizedEmail = sanitizeEmail(email);
    if (!isValidEmail(sanitizedEmail)) {
        throw new UnauthorizedError('Invalid email or password');
    }

    
    const user = await db.query.users.findFirst({
        where: eq(users.email, sanitizedEmail),
    });

    if (!user) {
        logger.warn('Login attempt for non-existent user', { email: sanitizedEmail });
        throw new UnauthorizedError('Invalid email or password');
    }

    
    if (user.status !== 'Active') {
        throw new UnauthorizedError('Account is inactive');
    }

    if (!user.passwordHash) {
        logger.warn('Login attempt for user without password hash', { userId: user.userId });
        throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
        logger.warn('Login attempt with invalid password', { userId: user.userId });
        throw new UnauthorizedError('Invalid email or password');
    }

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


export async function registerUser(data: RegisterRequest): Promise<{ accessToken: string; refreshToken: string; user: AuthUser }> {
    
    const sanitizedEmail = sanitizeEmail(data.email);
    const sanitizedUsername = sanitizeString(data.username);
    const sanitizedFullName = sanitizeString(data.fullName || '');
    const sanitizedPhone = sanitizePhone(data.phoneNumber || '');

    
    if (!isValidEmail(sanitizedEmail)) {
        throw new UnauthorizedError('Invalid email format');
    }

    
    const existingUser = await db.query.users.findFirst({
        where: eq(users.email, sanitizedEmail),
    });

    if (existingUser) {
        throw new ConflictError('User with this email already exists');
    }

    
    const existingUsername = await db.query.users.findFirst({
        where: eq(users.username, sanitizedUsername),
    });

    if (existingUsername) {
        throw new ConflictError('Username already taken');
    }

    
    const passwordHash = await hashPassword(data.password);

    
    
    const newUsers = await db
        .insert(users)
        .values({
            username: sanitizedUsername,
            email: sanitizedEmail,
            fullName: sanitizedFullName || null,
            phoneNumber: sanitizedPhone || null,
            passwordHash,
            userRole: 'Citizen',
            areaId: data.areaId || null,
            status: 'Active',
        })
        .returning();

    const newUser = newUsers[0];
    if (!newUser) {
        throw new InternalServerError('Failed to create user');
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


export async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string }> {
    const payload = verifyRefreshToken(refreshToken);

    
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
