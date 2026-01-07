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

/**
 * Animal Routes
 * All endpoints for animal management
 */
export const animalRoutes = new Elysia({ prefix: '/api/v1' })
    // ============================================================================
    // ANIMAL ENDPOINTS
    // ============================================================================

    /**
     * POST /api/v1/animals
     * Register a new animal
     */
    .post(
        '/animals',
        async ({ body, set }) => {
            try {
                const animal = await registerAnimal(body);
                set.status = 201;
                return {
                    message: 'Animal registered successfully',
                    data: animal,
                };
            } catch (error: any) {
                set.status = 400;
                return {
                    error: error.message || 'Failed to register animal',
                };
            }
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

    /**
     * GET /api/v1/animals?search={microchipNumber}
     * Search for an animal by microchip or official ID
     */
    .get(
        '/animals',
        async ({ query, set }) => {
            try {
                const animal = await searchAnimal(query);
                return {
                    data: {
                        animal,
                        owner: animal.ownershipHistory?.[0]?.user || null,
                        medicalRecords: animal.healthRecords || [],
                    },
                };
            } catch (error: any) {
                set.status = error.message.includes('not found') ? 404 : 400;
                return {
                    error: error.message || 'Search failed',
                };
            }
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

    /**
     * GET /api/v1/animals/{id}
     * Get animal by ID
     */
    .get(
        '/animals/:id',
        async ({ params, set }) => {
            try {
                const animal = await getAnimalById(params.id);
                return {
                    data: animal,
                };
            } catch (error: any) {
                set.status = 404;
                return {
                    error: error.message || 'Animal not found',
                };
            }
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

    /**
     * PUT /api/v1/animals/{id}
     * Update animal information
     */
    .put(
        '/animals/:id',
        async ({ params, body, set }) => {
            try {
                const updated = await updateAnimal(params.id, body);
                return {
                    message: 'Animal updated successfully',
                    data: updated,
                };
            } catch (error: any) {
                set.status = error.message.includes('not found') ? 404 : 400;
                return {
                    error: error.message || 'Update failed',
                };
            }
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

    // ============================================================================
    // MEDICAL RECORDS ENDPOINTS
    // ============================================================================

    /**
     * POST /api/v1/animals/{id}/medical-records
     * Add a medical record to an animal
     */
    .post(
        '/animals/:id/medical-records',
        async ({ params, body, set }) => {
            try {
                const record = await addMedicalRecord(params.id, body);
                set.status = 201;
                return {
                    message: 'Medical record added successfully',
                    data: record,
                };
            } catch (error: any) {
                set.status = error.message.includes('not found') ? 404 : 400;
                return {
                    error: error.message || 'Failed to add medical record',
                };
            }
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

    // ============================================================================
    // REPORTING ENDPOINTS
    // ============================================================================

    /**
     * GET /api/v1/reports/vaccination-coverage
     * Get vaccination coverage report
     */
    .get(
        '/reports/vaccination-coverage',
        async ({ query }) => {
            try {
                const report = await getVaccinationCoverage(query);
                return {
                    data: report,
                };
            } catch (error: any) {
                return {
                    error: error.message || 'Failed to generate report',
                };
            }
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

    /**
     * GET /api/v1/reports/animal-statistics
     * Get general animal statistics
     */
    .get(
        '/reports/animal-statistics',
        async () => {
            try {
                const stats = await getAnimalStatistics();
                return {
                    data: stats,
                };
            } catch (error: any) {
                return {
                    error: error.message || 'Failed to get statistics',
                };
            }
        },
        {
            detail: {
                tags: ['Reports'],
                summary: 'Animal statistics',
                description: 'Get comprehensive animal statistics and distributions',
            },
        }
    )

    /**
     * GET /api/v1/reports/recent-registrations
     * Get recent animal registrations
     */
    .get(
        '/reports/recent-registrations',
        async ({ query }) => {
            try {
                const limit = query.limit || 10;
                const recent = await getRecentRegistrations(limit);
                return {
                    data: recent,
                };
            } catch (error: any) {
                return {
                    error: error.message || 'Failed to get recent registrations',
                };
            }
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

    // ============================================================================
    // MICROCHIP VALIDATION ENDPOINT
    // ============================================================================

    /**
     * GET /api/v1/integrations/microchip/{microchipNumber}
     * Validate microchip number
     */
    .get(
        '/integrations/microchip/:microchipNumber',
        async ({ params, set }) => {
            try {
                const validation = await validateMicrochip(params.microchipNumber);
                if (!validation.isValid) {
                    set.status = 400;
                }
                return validation;
            } catch (error: any) {
                set.status = 500;
                return {
                    error: error.message || 'Validation failed',
                };
            }
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
