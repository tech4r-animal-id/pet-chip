import { beforeAll, afterAll, describe, expect, it } from 'bun:test';
import { db, administrativeAreas, closeDatabase } from '@repo/db';
import { sql } from 'drizzle-orm';

type Json = Record<string, any>;

function randomDigits(count: number) {
    let value = '';
    for (let i = 0; i < count; i += 1) {
        value += Math.floor(Math.random() * 10).toString();
    }
    return value;
}

async function request(baseUrl: string, path: string, init?: RequestInit) {
    const res = await fetch(`${baseUrl}${path}`, init);
    let body: Json | undefined;
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        body = await res.json();
    }
    return { res, body };
}

describe('API smoke tests', () => {
    let baseUrl = '';
    let app: any;

    beforeAll(async () => {
        process.env.NODE_ENV = 'test';
        process.env.DATABASE_URL =
            process.env.DATABASE_URL || 'postgresql://petchip:petchip123@localhost:5432/petchip';

        await db.execute(sql`select 1`);

        const mod = await import('../src/index.ts');
        app = mod.app;
        app.listen(0);
        baseUrl = `http://${app.server?.hostname}:${app.server?.port}`;
    });

    afterAll(async () => {
        if (app?.stop) {
            await app.stop();
        }
        await closeDatabase();
    });

    it('runs core authenticated and public flows', async () => {
        const areaCode = `TEST-${randomDigits(6)}`;
        const [area] = await db
            .insert(administrativeAreas)
            .values({
                areaName: `Test Area ${areaCode}`,
                areaType: 'Region',
                parentAreaId: null,
                code: areaCode,
            })
            .returning();

        expect(area?.areaId).toBeTruthy();

        const id = randomDigits(8);
        const username = `testuser_${id}`;
        const email = `test+${id}@example.com`;
        const password = `Test${id}!`;

        const register = await request(baseUrl, '/api/v1/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username,
                email,
                password,
                fullName: 'Test User',
            }),
        });

        expect(register.res.status).toBe(201);
        expect(register.body?.accessToken).toBeTruthy();
        expect(register.body?.refreshToken).toBeTruthy();

        const login = await request(baseUrl, '/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        expect(login.res.status).toBe(200);
        const accessToken = login.body?.accessToken as string;
        expect(accessToken).toBeTruthy();

        const refresh = await request(baseUrl, '/api/v1/auth/refresh', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: register.body?.refreshToken }),
        });

        expect(refresh.res.status).toBe(200);
        expect(refresh.body?.accessToken).toBeTruthy();

        const authHeaders = { Authorization: `Bearer ${accessToken}` };

        const holding = await request(baseUrl, '/api/v1/owners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({
                holdingName: `Test Holding ${id}`,
                holdingType: 'Farm',
                ownerName: 'Test Owner',
                contactPhone: '+998900000000',
                address: 'Test Address',
                areaId: area.areaId,
            }),
        });

        expect(holding.res.status).toBe(200);
        const holdingId = holding.body?.owner?.holdingId;
        expect(holdingId).toBeTruthy();

        const microchipNumber = `981${randomDigits(12)}`;
        const animal = await request(baseUrl, '/api/v1/animals', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({
                microchipNumber,
                officialId: `UZB-TEST-${id}`,
                species: 'Cat',
                breed: 'Domestic Shorthair',
                sex: 'Female',
                dateOfBirth: '2023-05-15',
                status: 'Alive',
                currentHoldingId: holdingId,
                birthHoldingId: holdingId,
            }),
        });

        expect(animal.res.status).toBe(201);
        const animalId = animal.body?.data?.animalId;
        expect(animalId).toBeTruthy();

        const search = await request(baseUrl, `/api/v1/animals?search=${microchipNumber}`, {
            headers: authHeaders,
        });
        expect(search.res.status).toBe(200);

        const getById = await request(baseUrl, `/api/v1/animals/${animalId}`, {
            headers: authHeaders,
        });
        expect(getById.res.status).toBe(200);

        const medical = await request(baseUrl, `/api/v1/animals/${animalId}/medical-records`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeaders },
            body: JSON.stringify({
                procedureType: 'VACCINATION_RABIES',
                procedureDate: '2024-05-20',
                nextDueDate: '2025-05-20',
                veterinarianName: 'Dr. Alimov',
                notes: 'Animal healthy and responsive',
                holdingId,
                healthStatus: 'Healthy',
                diagnosis: 'Rabies vaccination administered',
                treatmentAdministered: 'Rabivac vaccine',
            }),
        });
        expect(medical.res.status).toBe(201);

        const stats = await request(baseUrl, '/api/v1/reports/animal-statistics', {
            headers: authHeaders,
        });
        expect(stats.res.status).toBe(200);

        const recent = await request(baseUrl, '/api/v1/reports/recent-registrations?limit=5', {
            headers: authHeaders,
        });
        expect(recent.res.status).toBe(200);

        const coverage = await request(baseUrl, '/api/v1/reports/vaccination-coverage', {
            headers: authHeaders,
        });
        expect(coverage.res.status).toBe(200);

        const lookup = await request(baseUrl, `/api/v1/lookup/chip/${microchipNumber}`);
        expect(lookup.res.status).toBe(200);

        const lookupValidate = await request(
            baseUrl,
            `/api/v1/lookup/chip/${microchipNumber}/validate`
        );
        expect(lookupValidate.res.status).toBe(200);

        const integration = await request(
            baseUrl,
            `/api/v1/integrations/microchip/${microchipNumber}`,
            { headers: authHeaders }
        );
        expect(integration.res.status).toBe(200);

        const chip = await request(baseUrl, `/api/v1/chips/${microchipNumber}`, {
            headers: authHeaders,
        });
        expect(chip.res.status).toBe(200);
    });
});
