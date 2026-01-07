import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/petchip',
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Export pool for direct access if needed
export { pool };

// Graceful shutdown handler
export async function closeDatabase() {
    await pool.end();
}
