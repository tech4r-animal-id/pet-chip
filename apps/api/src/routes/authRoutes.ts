/**
 * Authentication Routes
 * Handles user registration, login, and token refresh
 */

import { Elysia, t } from 'elysia';
import { loginUser, registerUser, refreshAccessToken } from '../services/authService';
import { logger } from '../utils/logger';

export const authRoutes = new Elysia({ prefix: '/api/v1/auth' })
    /**
     * POST /api/v1/auth/login
     * User login
     */
    .post(
        '/login',
        async ({ body, set }) => {
            try {
                const result = await loginUser(body);
                return {
                    message: 'Login successful',
                    ...result,
                };
            } catch (error: any) {
                logger.error('Login failed', error);
                set.status = error.statusCode || 500;
                return {
                    error: error.message || 'Login failed',
                };
            }
        },
        {
            body: t.Object({
                email: t.String({ format: 'email' }),
                password: t.String({ minLength: 6 }),
            }),
            detail: {
                tags: ['Authentication'],
                summary: 'User login',
                description: 'Authenticate user and receive JWT tokens',
            },
        }
    )

    /**
     * POST /api/v1/auth/register
     * User registration
     */
    .post(
        '/register',
        async ({ body, set }) => {
            try {
                const result = await registerUser(body);
                set.status = 201;
                return {
                    message: 'Registration successful',
                    ...result,
                };
            } catch (error: any) {
                logger.error('Registration failed', error);
                set.status = error.statusCode || 500;
                return {
                    error: error.message || 'Registration failed',
                };
            }
        },
        {
            body: t.Object({
                username: t.String({ minLength: 3, maxLength: 50 }),
                email: t.String({ format: 'email' }),
                password: t.String({ minLength: 6 }),
                fullName: t.Optional(t.String()),
                phoneNumber: t.Optional(t.String()),
                role: t.Union([
                    t.Literal('Veterinarian'),
                    t.Literal('Government Officer'),
                    t.Literal('Farmer'),
                    t.Literal('System Admin'),
                    t.Literal('Citizen'),
                ]),
                areaId: t.Optional(t.Number()),
            }),
            detail: {
                tags: ['Authentication'],
                summary: 'User registration',
                description: 'Register a new user account',
            },
        }
    )

    /**
     * POST /api/v1/auth/refresh
     * Refresh access token
     */
    .post(
        '/refresh',
        async ({ body, set }) => {
            try {
                const result = await refreshAccessToken(body.refreshToken);
                return {
                    message: 'Token refreshed successfully',
                    ...result,
                };
            } catch (error: any) {
                logger.error('Token refresh failed', error);
                set.status = error.statusCode || 500;
                return {
                    error: error.message || 'Token refresh failed',
                };
            }
        },
        {
            body: t.Object({
                refreshToken: t.String(),
            }),
            detail: {
                tags: ['Authentication'],
                summary: 'Refresh access token',
                description: 'Get a new access token using a refresh token',
            },
        }
    );
