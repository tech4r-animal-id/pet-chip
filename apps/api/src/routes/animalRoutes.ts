import { Elysia, t } from 'elysia';
import {
    registerAnimal,
    searchAnimal,
    getAnimalById,
    updateAnimal,
    addMedicalRecord,
} from '../controllers/animalController';
import {
    getVaccinationCoverage,
    getAnimalStatistics,
    getRecentRegistrations,
} from '../controllers/reportsController';
import { validateMicrochip } from '../services/microchipService';
import { authenticate } from '../middleware/auth';


export const animalRoutes = new Elysia({ prefix: '/api/v1' })
    
    
    


    
    .post(
        '/animals',
        async (context) => {
            await authenticate(context);
            const { body, set } = context;
            const animal = await registerAnimal(body);
            set.status = 201;
            return {
                message: 'Animal registered successfully',
                data: animal,
            };
        },
        {
            body: t.Object({
                microchipNumber: t.String({ minLength: 15, maxLength: 15 }),
                officialId: t.String({ minLength: 1 }),
                species: t.String(),
                breed: t.Optional(t.String()),
                sex: t.String(),
                dateOfBirth: t.Optional(t.String()),
                color: t.Optional(t.String()),
                status: t.Optional(t.String()),
                ownerId: t.Optional(t.String()),
                currentHoldingId: t.Number(),
                birthHoldingId: t.Number(),
            }),
            detail: {
                tags: ['Animals'],
                summary: 'Register a new animal',
                description: 'Registers a new animal in the system with microchip validation',
            },
        }
    )

    
    .get(
        '/animals',
        async (context) => {
            await authenticate(context);
            const { query } = context;
            const animal = await searchAnimal(query);
            return {
                data: {
                    animal,
                    owner: animal.ownershipHistory?.[0]?.user || null,
                    medicalRecords: animal.healthRecords || [],
                },
            };
        },
        {
            query: t.Object({
                search: t.String({ minLength: 1 }),
            }),
            detail: {
                tags: ['Animals'],
                summary: 'Search for an animal',
                description: 'Search by microchip number or official ID',
            },
        }
    )

    
    .get(
        '/animals/:id',
        async (context) => {
            await authenticate(context);
            const { params } = context;
            const animal = await getAnimalById(params.id);
            return {
                data: animal,
            };
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            detail: {
                tags: ['Animals'],
                summary: 'Get animal by ID',
                description: 'Retrieve complete animal information by UUID',
            },
        }
    )

    
    .put(
        '/animals/:id',
        async (context) => {
            await authenticate(context);
            const { params, body } = context;
            const updated = await updateAnimal(params.id, body);
            return {
                message: 'Animal updated successfully',
                data: updated,
            };
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Partial(
                t.Object({
                    species: t.String(),
                    breed: t.String(),
                    sex: t.String(),
                    dateOfBirth: t.String(),
                    currentHoldingId: t.Number(),
                    status: t.String(),
                })
            ),
            detail: {
                tags: ['Animals'],
                summary: 'Update animal',
                description: 'Update animal information',
            },
        }
    )

    
    
    


    
    .post(
        '/animals/:id/medical-records',
        async (context) => {
            await authenticate(context);
            const { params, body, set } = context;
            const record = await addMedicalRecord(params.id, body);
            set.status = 201;
            return {
                message: 'Medical record added successfully',
                data: record,
            };
        },
        {
            params: t.Object({
                id: t.String(),
            }),
            body: t.Object({
                procedureType: t.String(),
                procedureDate: t.String(),
                nextDueDate: t.Optional(t.String()),
                veterinarianName: t.Optional(t.String()),
                notes: t.Optional(t.String()),
                holdingId: t.Number(),
                diagnosis: t.Optional(t.String()),
                treatmentAdministered: t.Optional(t.String()),
                healthStatus: t.Optional(t.String()),
            }),
            detail: {
                tags: ['Medical Records'],
                summary: 'Add medical record',
                description: 'Add a vaccination or health record to an animal',
            },
        }
    )

    
    
    


    
    .get(
        '/reports/vaccination-coverage',
        async (context) => {
            await authenticate(context);
            const { query } = context;
            const report = await getVaccinationCoverage(query);
            return {
                data: report,
            };
        },
        {
            query: t.Object({
                mahalla: t.Optional(t.String()),
                startDate: t.Optional(t.String()),
                endDate: t.Optional(t.String()),
            }),
            detail: {
                tags: ['Reports'],
                summary: 'Vaccination coverage report',
                description: 'Get vaccination coverage statistics by region and date range',
            },
        }
    )

    
    .get(
        '/reports/animal-statistics',
        async (context) => {
            await authenticate(context);
            const stats = await getAnimalStatistics();
            return {
                data: stats,
            };
        },
        {
            detail: {
                tags: ['Reports'],
                summary: 'Animal statistics',
                description: 'Get comprehensive animal statistics and distributions',
            },
        }
    )

    
    .get(
        '/reports/recent-registrations',
        async (context) => {
            await authenticate(context);
            const { query } = context;
            const limit = query.limit || 10;
            const recent = await getRecentRegistrations(limit);
            return {
                data: recent,
            };
        },
        {
            query: t.Object({
                limit: t.Optional(t.Number({ minimum: 1, maximum: 100 })),
            }),
            detail: {
                tags: ['Reports'],
                summary: 'Recent registrations',
                description: 'Get recently registered animals',
            },
        }
    )

    
    
    


    
    .get(
        '/integrations/microchip/:microchipNumber',
        async (context) => {
            await authenticate(context);
            const { params, set } = context;
            const validation = await validateMicrochip(params.microchipNumber);
            if (!validation.isValid) {
                set.status = 400;
            }
            return validation;
        },
        {
            params: t.Object({
                microchipNumber: t.String({ minLength: 15, maxLength: 15 }),
            }),
            detail: {
                tags: ['Integrations'],
                summary: 'Validate microchip',
                description: 'Validate microchip number according to ISO 11784/11785',
            },
        }
    );
