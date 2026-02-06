import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';
import { cors } from '@elysiajs/cors';
import { animalRoutes } from './routes/animalRoutes';
import { authRoutes } from './routes/authRoutes';
import { chipRoutes } from './routes/chipRoutes';
import { lookupRoutes, lookupRoutesLegacy } from './routes/lookupRoutes';
import { ownerRoutes, ownerRoutesLegacy } from './routes/ownerRoutes';
import { lostFoundRoutes, lostFoundRoutesLegacy } from './routes/lostFoundRoutes';
import { AppError } from './utils/errors';
import { logger } from './utils/logger';



export const app = new Elysia()
    
    
    
    .use(
        cors({
            
            origin: process.env.NODE_ENV === 'production'
                ? (process.env.ALLOWED_ORIGINS?.split(',') || ['https://animalid.uz'])
                : true,
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
                    { name: 'Authentication', description: 'User authentication and authorization' },
                    { name: 'Animals', description: 'Animal registration and management' },
                    { name: 'Chips', description: 'Microchip assignment and management' },
                    { name: 'Owners', description: 'Owner and holding registration' },
                    { name: 'Lost & Found', description: 'Lost and found animal alerts' },
                    { name: 'Lookup', description: 'Public lookup services for lost/found animals' },
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

    
    
    
    .onError(({ code, error, set }) => {
        
        if (error instanceof AppError) {
            logger.warn(`Application error: ${error.message}`, {
                statusCode: error.statusCode,
                operational: error.isOperational,
            });

            set.status = error.statusCode;
            return {
                error: error.message,
                statusCode: error.statusCode,
            };
        }

        
        if (code === 'VALIDATION') {
            logger.warn('Validation error', { details: error.message });
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

        
        logger.error('Unexpected error occurred', error, {
            code,
            env: process.env.NODE_ENV,
        });

        
        set.status = 500;
        return {
            error: 'Internal server error',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined,
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
        };
    })

    
    
    
    .get('/', () => ({
        message: 'Pet-Chip Animal Registry API',
        version: '1.0.0',
        documentation: '/swagger',
        status: 'online',
    }))

    .get('/health', () => ({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    }))

    
    .use(authRoutes)

    
    .use(animalRoutes)

    
    .use(chipRoutes)

    
    .use(lookupRoutes)

    .use(lookupRoutesLegacy)

    
    .use(ownerRoutes)

    .use(ownerRoutesLegacy)

    
    .use(lostFoundRoutes)

    .use(lostFoundRoutesLegacy)

    
    
    
const shouldListen = process.env.NODE_ENV !== 'test';

if (shouldListen) {
    app.listen(process.env.PORT || 3002);

    const serverUrl = `http://${app.server?.hostname}:${app.server?.port}`;

    logger.info(`
+--------------------------------------------------------------+
| Pet-Chip API Server                                          |
|                                                              |
| Running at: ${serverUrl}                                     |
| Documentation: ${serverUrl}/swagger                          |
| Environment: ${process.env.NODE_ENV || 'development'}        |
|                                                              |
| Authentication enabled                                       |
| Error logging active                                         |
| Input sanitization enabled                                   |
| Database transactions enabled                                |
+--------------------------------------------------------------+
`);
}

export type App = typeof app;
