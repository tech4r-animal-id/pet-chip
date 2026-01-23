/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request context
 */

import type { Context } from 'elysia';
import { verifyAccessToken } from '../services/authService';
import type { JWTPayload } from '../types/auth';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface AuthContext {
    user: JWTPayload;
}

/**
 * Extract Bearer token from Authorization header
 */
function extractBearerToken(authHeader: string | undefined): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return null;
    }

    return parts[1];
}

/**
 * Authentication middleware
 * Can be used with Elysia's derive or as a guard
 */
export async function authenticate(context: any): Promise<JWTPayload> {
    const authHeader = context.headers?.authorization || context.request?.headers?.get('authorization');

    const token = extractBearerToken(authHeader);

    if (!token) {
        logger.warn('Authentication failed: No token provided');
        throw new UnauthorizedError('Authentication required');
    }

    try {
        const payload = verifyAccessToken(token);
        return payload;
    } catch (error) {
        logger.warn('Authentication failed: Invalid token');
        throw new UnauthorizedError('Invalid or expired token');
    }
}

/**
 * Role-based authorization middleware
 */
export function requireRole(...allowedRoles: string[]) {
    return async (context: any) => {
        const user = await authenticate(context);

        if (!allowedRoles.includes(user.role)) {
            logger.warn('Authorization failed: Insufficient permissions', {
                userId: user.userId,
                role: user.role,
                required: allowedRoles,
            });
            throw new UnauthorizedError('Insufficient permissions');
        }

        return user;
    };
}
