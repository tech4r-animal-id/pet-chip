import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Load environment variables if not already loaded
if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not set in environment. Using default connection string.');
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/petchip';

console.log('🔌 Connecting to database:', connectionString.replace(/:[^:@]+@/, ':****@'));

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err.message);
});

// Initialize Drizzle with schema
export const db = drizzle(pool, { schema });

// Export pool for direct access if needed
export { pool };

// Graceful shutdown handler
export async function closeDatabase() {
    await pool.end();
}
