import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { animalRoutes } from './routes/animalRoutes';

/**
 * Pet-Chip Animal Registry API
 * ElysiaJS REST API for livestock and pet tracking system
 */

const app = new Elysia()
    // ============================================================================
    // MIDDLEWARE & PLUGINS
    // ============================================================================
    .use(
        cors({
            origin: true, // Allow all origins in development
            credentials: true,
        })
    )
    .use(
        swagger({
            documentation: {
                info: {
                    title: 'Pet-Chip Animal Registry API',
                    version: '1.0.0',
                    description: 'REST API for Animal Identification and Management Platform in Uzbekistan',
                },
                tags: [
                    { name: 'Animals', description: 'Animal registration and management' },
                    { name: 'Medical Records', description: 'Vaccination and health records' },
                    { name: 'Reports', description: 'Analytics and reporting' },
                    { name: 'Integrations', description: 'External service integrations' },
                ],
                servers: [
                    {
                        url: 'http://localhost:3002',
                        description: 'Development server',
                    },
                    {
                        url: 'https://api.animalid.uz',
                        description: 'Production server',
                    },
                ],
            },
        })
    )

    // ============================================================================
    // GLOBAL ERROR HANDLER
    // ============================================================================
    .onError(({ code, error, set }) => {
        console.error(`[API Error] ${code}:`, error);

        if (code === 'VALIDATION') {
            set.status = 400;
            return {
                error: 'Validation failed',
                details: error.message,
            };
        }

        if (code === 'NOT_FOUND') {
            set.status = 404;
            return {
                error: 'Resource not found',
            };
        }

        set.status = 500;
        return {
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        };
    })

    // ============================================================================
    // ROUTES
    // ============================================================================
    .get('/', () => ({
        message: 'Pet-Chip Animal Registry API',
        version: '1.0.0',
        documentation: '/swagger',
    }))

    .get('/health', () => ({
        status: 'healthy',
        timestamp: new Date().toISOString(),
    }))

    // Mount animal routes
    .use(animalRoutes)

    // ============================================================================
    // START SERVER
    // ============================================================================
    .listen(process.env.PORT || 3002);

console.log(`
┌─────────────────────────────────────────────────┐
│  🦊 Pet-Chip API Server                        │
│                                                 │
│  Running at: http://${app.server?.hostname}:${app.server?.port}      │
│  Documentation: http://${app.server?.hostname}:${app.server?.port}/swagger │
│  Environment: ${process.env.NODE_ENV || 'development'}                   │
└─────────────────────────────────────────────────┘
`);

export type App = typeof app;