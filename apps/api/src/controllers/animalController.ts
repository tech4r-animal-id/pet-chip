import { db } from '@repo/db';
import { animals, chips, animalHealthRecords, ownershipHistory } from '@repo/db';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import type { RegisterAnimalBody, CreateMedicalRecordBody, AnimalSearchParams } from '../types/api';
import { validateMicrochip } from '../services/microchipService';

/**
 * Animal Controller
 * Handles all animal-related operations
 */

/**
 * Register a new animal in the system
 */
export async function registerAnimal(body: RegisterAnimalBody) {
    // Validate microchip number
    const microchipValidation = await validateMicrochip(body.microchipNumber);

    if (!microchipValidation.isValid) {
        throw new Error(`Invalid microchip: ${microchipValidation.error}`);
    }

    // Check if microchip already exists
    const existingAnimal = await db.query.animals.findFirst({
        where: eq(animals.officialId, body.officialId),
    });

    if (existingAnimal) {
        throw new Error(`Animal with official ID ${body.officialId} already exists`);
    }

    // Check if chip already registered
    const existingChip = await db.query.chips.findFirst({
        where: eq(chips.chipNumber, body.microchipNumber),
    });

    if (existingChip && existingChip.isActive) {
        throw new Error(`Microchip ${body.microchipNumber} is already registered to another animal`);
    }

    // Create animal record
    const newAnimals = await db
        .insert(animals)
        .values({
            officialId: body.officialId,
            species: body.species as any,
            breed: body.breed,
            sex: body.sex as any,
            dateOfBirth: body.dateOfBirth || undefined,
            currentHoldingId: body.currentHoldingId,
            birthHoldingId: body.birthHoldingId,
            status: (body.status as any) || 'Alive',
        })
        .returning();

    const newAnimal = newAnimals[0];
    if (!newAnimal) {
        throw new Error('Failed to create animal record');
    }

    // Create chip record
    const newChips = await db
        .insert(chips)
        .values({
            chipNumber: body.microchipNumber,
            manufacturer: microchipValidation.manufacturer,
            animalId: newAnimal.animalId,
            implantationDate: microchipValidation.implantDate || undefined,
            holdingId: body.currentHoldingId,
            isActive: true,
        })
        .returning();

    const newChip = newChips[0];

    // Create ownership record if owner provided
    if (body.ownerId) {
        await db.insert(ownershipHistory).values({
            animalId: newAnimal.animalId,
            userId: body.ownerId,
            isCurrentOwner: true,
            startDate: new Date(),
        });
    }

    return {
        ...newAnimal,
        microchipNumber: body.microchipNumber,
        chip: newChip,
    };
}

/**
 * Search for an animal by microchip number or official ID
 */
export async function searchAnimal(params: AnimalSearchParams) {
    if (!params.search) {
        throw new Error('Search parameter is required');
    }

    // First try to find by chip number
    const chip = await db.query.chips.findFirst({
        where: eq(chips.chipNumber, params.search),
        with: {
            animal: {
                with: {
                    currentHolding: true,
                    birthHolding: true,
                    chips: true,
                    vaccinations: {
                        orderBy: (vaccinations, { desc }) => [desc(vaccinations.administrationDate)],
                    },
                    healthRecords: {
                        orderBy: (healthRecords, { desc }) => [desc(healthRecords.recordDate)],
                    },
                    ownershipHistory: {
                        where: (ownershipHistory, { eq }) => eq(ownershipHistory.isCurrentOwner, true),
                        with: {
                            user: true,
                        },
                    },
                    alerts: {
                        orderBy: (alerts, { desc }) => [desc(alerts.createdAt)],
                    },
                },
            },
        },
    });

    if (chip?.animal) {
        return chip.animal;
    }

    // Try searching by official ID
    const animal = await db.query.animals.findFirst({
        where: eq(animals.officialId, params.search),
        with: {
            currentHolding: true,
            birthHolding: true,
            chips: true,
            vaccinations: {
                orderBy: (vaccinations, { desc }) => [desc(vaccinations.administrationDate)],
            },
            healthRecords: {
                orderBy: (healthRecords, { desc }) => [desc(healthRecords.recordDate)],
            },
            ownershipHistory: {
                where: (ownershipHistory, { eq }) => eq(ownershipHistory.isCurrentOwner, true),
                with: {
                    user: true,
                },
            },
            alerts: {
                orderBy: (alerts, { desc }) => [desc(alerts.createdAt)],
            },
        },
    });

    if (!animal) {
        throw new Error(`No animal found with identifier: ${params.search}`);
    }

    return animal;
}

/**
 * Get animal by ID
 */
export async function getAnimalById(id: string) {
    const animal = await db.query.animals.findFirst({
        where: eq(animals.animalId, id),
        with: {
            currentHolding: true,
            birthHolding: true,
            chips: true,
            vaccinations: {
                orderBy: (vaccinations, { desc }) => [desc(vaccinations.administrationDate)],
            },
            healthRecords: {
                orderBy: (healthRecords, { desc }) => [desc(healthRecords.recordDate)],
            },
            ownershipHistory: {
                where: (ownershipHistory, { eq }) => eq(ownershipHistory.isCurrentOwner, true),
                with: {
                    user: true,
                },
            },
            movements: {
                orderBy: (movements, { desc }) => [desc(movements.movementDate)],
            },
            alerts: {
                orderBy: (alerts, { desc }) => [desc(alerts.createdAt)],
            },
        },
    });

    if (!animal) {
        throw new Error(`Animal with ID ${id} not found`);
    }

    return animal;
}

/**
 * Update animal information
 */
export async function updateAnimal(id: string, updates: Partial<RegisterAnimalBody>) {
    const existing = await db.query.animals.findFirst({
        where: eq(animals.animalId, id),
    });

    if (!existing) {
        throw new Error(`Animal with ID ${id} not found`);
    }

    const updated = await db
        .update(animals)
        .set({
            species: updates.species as any,
            breed: updates.breed,
            sex: updates.sex as any,
            dateOfBirth: updates.dateOfBirth || undefined,
            currentHoldingId: updates.currentHoldingId,
            status: updates.status as any,
        })
        .where(eq(animals.animalId, id))
        .returning();

    return updated;
}

/**
 * Add medical record (vaccination or health checkup)
 */
export async function addMedicalRecord(animalId: string, body: CreateMedicalRecordBody) {
    // Verify animal exists
    const animal = await db.query.animals.findFirst({
        where: eq(animals.animalId, animalId),
    });

    if (!animal) {
        throw new Error(`Animal with ID ${animalId} not found`);
    }

    // Create health record
    const records = await db
        .insert(animalHealthRecords)
        .values({
            animalId,
            recordDate: body.procedureDate,
            healthStatus: body.healthStatus as any,
            diagnosis: body.diagnosis,
            treatmentAdministered: body.treatmentAdministered,
            veterinarianName: body.veterinarianName,
            holdingId: body.holdingId,
        })
        .returning();

    return records[0] || null;
}
