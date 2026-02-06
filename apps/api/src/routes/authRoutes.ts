import { Elysia, t } from 'elysia';
import { loginUser, registerUser, refreshAccessToken } from '../services/authService';

export const authRoutes = new Elysia({ prefix: '/api/v1/auth' })
    
    .post(
        '/login',
        async ({ body }) => {
            const result = await loginUser(body);
            return {
                message: 'Login successful',
                ...result,
            };
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

    
    .post(
        '/register',
        async ({ body, set }) => {
            const result = await registerUser(body);
            set.status = 201;
            return {
                message: 'Registration successful',
                ...result,
            };
        },
        {
            body: t.Object({
                username: t.String({ minLength: 3, maxLength: 50 }),
                email: t.String({ format: 'email' }),
                password: t.String({ minLength: 6 }),
                fullName: t.Optional(t.String()),
                phoneNumber: t.Optional(t.String()),
                areaId: t.Optional(t.Number()),
            }),
            detail: {
                tags: ['Authentication'],
                summary: 'User registration',
                description: 'Register a new user account (role defaults to Citizen)',
            },
        }
    )

    
    .post(
        '/refresh',
        async ({ body }) => {
            const result = await refreshAccessToken(body.refreshToken);
            return {
                message: 'Token refreshed successfully',
                ...result,
            };
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
