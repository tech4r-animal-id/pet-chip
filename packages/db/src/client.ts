import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';


if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not set in environment. Using default connection string.');
}

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/petchip';

console.log('🔌 Connecting to database:', connectionString.replace(/:[^:@]+@/, ':****@'));


const pool = new Pool({
    connectionString,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});


pool.on('connect', () => {
    console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
    console.error('❌ Database connection error:', err.message);
});


export const db = drizzle(pool, { schema });


export { pool };


export async function closeDatabase() {
    await pool.end();
}