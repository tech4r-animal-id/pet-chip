import { db } from '@repo/db';
import { animals, chips, animalHealthRecords, ownershipHistory } from '@repo/db';
import type { animalSpeciesEnum, animalSexEnum, animalStatusEnum, healthStatusEnum } from '@repo/db';
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm';
import type { RegisterAnimalBody, CreateMedicalRecordBody, AnimalSearchParams } from '../types/api';
import { validateMicrochip } from '../services/microchipService';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sanitizeString, sanitizeMicrochipNumber, isValidUUID } from '../utils/sanitize';

/**
 * Animal Controller
 * Handles all animal-related operations with proper error handling and transactions
 */

// Type helpers for enum values
type AnimalSpecies = typeof animalSpeciesEnum.enumValues[number];
type AnimalSex = typeof animalSexEnum.enumValues[number];
type AnimalStatus = typeof animalStatusEnum.enumValues[number];
type HealthStatus = typeof healthStatusEnum.enumValues[number];

/**
 * Register a new animal in the system with proper transaction handling
 */
export async function registerAnimal(body: RegisterAnimalBody) {
    // Sanitize microchip number
    const sanitizedChipNumber = sanitizeMicrochipNumber(body.microchipNumber);

    // Validate microchip number
    const microchipValidation = await validateMicrochip(sanitizedChipNumber);

    if (!microchipValidation.isValid) {
        throw new ValidationError(`Invalid microchip: ${microchipValidation.error}`);
    }

    // Check if animal with official ID already exists
    const existingAnimal = await db.query.animals.findFirst({
        where: eq(animals.officialId, body.officialId),
    });

    if (existingAnimal) {
        throw new ConflictError(`Animal with official ID ${body.officialId} already exists`);
    }

    // Check if chip already registered
    const existingChip = await db.query.chips.findFirst({
        where: eq(chips.chipNumber, sanitizedChipNumber),
    });

    if (existingChip && existingChip.isActive) {
        throw new ConflictError(`Microchip ${sanitizedChipNumber} is already registered to another animal`);
    }

    // Use transaction to ensure data consistency
    const result = await db.transaction(async (tx) => {
        // Create animal record with validated data and proper type casting
        const animalData = {
            officialId: sanitizeString(body.officialId),
            species: body.species as AnimalSpecies,
            breed: body.breed ? sanitizeString(body.breed) : null,
            sex: body.sex as AnimalSex,
            dateOfBirth: body.dateOfBirth || null,
            currentHoldingId: body.currentHoldingId,
            birthHoldingId: body.birthHoldingId,
            status: (body.status as AnimalStatus) || 'Alive',
        };

        const newAnimals = await tx
            .insert(animals)
            .values(animalData)
            .returning();

        const newAnimal = newAnimals[0];
        if (!newAnimal) {
            throw new Error('Failed to create animal record');
        }

        // Create chip record
        const chipData = {
            chipNumber: sanitizedChipNumber,
            manufacturer: microchipValidation.manufacturer || null,
            animalId: newAnimal.animalId,
            implantationDate: microchipValidation.implantDate || null,
            holdingId: body.currentHoldingId,
            isActive: true,
        };

        const newChips = await tx
            .insert(chips)
            .values(chipData)
            .returning();

        const newChip = newChips[0];

        // Create ownership record if owner provided
        if (body.ownerId) {
            if (!isValidUUID(body.ownerId)) {
                throw new ValidationError('Invalid owner ID format');
            }

            await tx.insert(ownershipHistory).values({
                animalId: newAnimal.animalId,
                userId: body.ownerId,
                isCurrentOwner: true,
                startDate: new Date(),
            });
        }

        logger.info('Animal registered successfully', {
            animalId: newAnimal.animalId,
            chipNumber: sanitizedChipNumber
        });

        return {
            ...newAnimal,
            microchipNumber: sanitizedChipNumber,
            chip: newChip,
        };
    });

    return result;
}

/**
 * Search for an animal by microchip number or official ID
 */
export async function searchAnimal(params: AnimalSearchParams) {
    if (!params.search) {
        throw new ValidationError('Search parameter is required');
    }

    const searchTerm = sanitizeString(params.search);

    // First try to find by chip number (if it looks like a chip number)
    if (/^\d{15}$/.test(searchTerm)) {
        const chip = await db.query.chips.findFirst({
            where: eq(chips.chipNumber, searchTerm),
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
    }

    // Try searching by official ID
    const animal = await db.query.animals.findFirst({
        where: eq(animals.officialId, searchTerm),
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
        throw new NotFoundError(`No animal found with identifier: ${searchTerm}`);
    }

    return animal;
}

/**
 * Get animal by ID
 */
export async function getAnimalById(id: string) {
    if (!isValidUUID(id)) {
        throw new ValidationError('Invalid animal ID format');
    }

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
        throw new NotFoundError(`Animal with ID ${id} not found`);
    }

    return animal;
}

/**
 * Update animal information
 */
export async function updateAnimal(id: string, updates: Partial<RegisterAnimalBody>) {
    if (!isValidUUID(id)) {
        throw new ValidationError('Invalid animal ID format');
    }

    const existing = await db.query.animals.findFirst({
        where: eq(animals.animalId, id),
    });

    if (!existing) {
        throw new NotFoundError(`Animal with ID ${id} not found`);
    }

    // Build update object with only provided fields
    const updateData: any = {};
    if (updates.species) updateData.species = updates.species as AnimalSpecies;
    if (updates.breed) updateData.breed = sanitizeString(updates.breed);
    if (updates.sex) updateData.sex = updates.sex as AnimalSex;
    if (updates.dateOfBirth) updateData.dateOfBirth = updates.dateOfBirth;
    if (updates.currentHoldingId) updateData.currentHoldingId = updates.currentHoldingId;
    if (updates.status) updateData.status = updates.status as AnimalStatus;

    const updated = await db
        .update(animals)
        .set(updateData)
        .where(eq(animals.animalId, id))
        .returning();

    logger.info('Animal updated', { animalId: id });

    return updated[0];
}

/**
 * Add medical record (vaccination or health checkup)
 */
export async function addMedicalRecord(animalId: string, body: CreateMedicalRecordBody) {
    if (!isValidUUID(animalId)) {
        throw new ValidationError('Invalid animal ID format');
    }

    // Verify animal exists
    const animal = await db.query.animals.findFirst({
        where: eq(animals.animalId, animalId),
    });

    if (!animal) {
        throw new NotFoundError(`Animal with ID ${animalId} not found`);
    }

    // Create health record with proper health status type casting
    const recordData = {
        animalId,
        recordDate: body.procedureDate,
        healthStatus: body.healthStatus ? (body.healthStatus as HealthStatus) : null,
        diagnosis: body.diagnosis ? sanitizeString(body.diagnosis) : null,
        treatmentAdministered: body.treatmentAdministered ? sanitizeString(body.treatmentAdministered) : null,
        veterinarianName: body.veterinarianName ? sanitizeString(body.veterinarianName) : null,
        holdingId: body.holdingId,
    };

    const records = await db
        .insert(animalHealthRecords)
        .values(recordData)
        .returning();

    logger.info('Medical record added', { animalId, recordId: records[0]?.healthRecordId });

    return records[0] || null;
}
