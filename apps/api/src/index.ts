import { Elysia } from 'elysia';
import { swagger } from '@elysiajs/swagger';

const app = new Elysia()
    .use(swagger()) // Auto-generate OpenAPI documentation
    .get('/', () => 'Animal Registry API')
    .post('/v1/animals', ({ body }) => {
        // Implement animal registration logic here
        return { status: 'success' };
    })
    .listen(3002);

console.log(`🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`);