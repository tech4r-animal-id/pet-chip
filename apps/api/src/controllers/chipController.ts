import { db } from '@repo/db';
import { chips, animals } from '@repo/db';
import { eq, and } from 'drizzle-orm';
import { validateMicrochip } from '../services/microchipService';
import { NotFoundError, ConflictError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sanitizeMicrochipNumber, isValidUUID } from '../utils/sanitize';

/**
 * Chip Controller
 * Handles microchip-related operations
 */

interface AssignChipBody {
    chipNumber: string;
    animalId: string;
    implantationDate?: string;
    implanterId?: string;
    holdingId?: number;
}

/**
 * Assign an existing chip to an animal
 * POST /api/v1/chips/assign
 */
export async function assignChipToAnimal(body: AssignChipBody) {
    const { chipNumber, animalId, implantationDate, implanterId, holdingId } = body;

    // Validate inputs
    if (!isValidUUID(animalId)) {
        throw new ValidationError('Invalid animal ID format');
    }

    // Sanitize chip number
    const sanitizedChipNumber = sanitizeMicrochipNumber(chipNumber);

    // Validate microchip format
    const microchipValidation = await validateMicrochip(sanitizedChipNumber);
    if (!microchipValidation.isValid) {
        throw new ValidationError(`Invalid microchip: ${microchipValidation.error}`);
    }

    // Check if animal exists
    const animal = await db.query.animals.findFirst({
        where: eq(animals.animalId, animalId),
    });

    if (!animal) {
        throw new NotFoundError(`Animal with ID ${animalId} not found`);
    }

    // Check if chip exists
    const existingChip = await db.query.chips.findFirst({
        where: eq(chips.chipNumber, sanitizedChipNumber),
    });

    // If chip exists and is active on another animal, prevent assignment
    if (existingChip) {
        if (existingChip.isActive && existingChip.animalId !== animalId) {
            throw new ConflictError(
                `Chip ${sanitizedChipNumber} is already assigned to another animal`
            );
        }

        // If chip exists but inactive, reactivate it
        if (!existingChip.isActive || existingChip.animalId !== animalId) {
            const updated = await db
                .update(chips)
                .set({
                    animalId,
                    isActive: true,
                    implantationDate: implantationDate || existingChip.implantationDate,
                    implantedBy: implanterId || existingChip.implantedBy,
                    holdingId: holdingId || existingChip.holdingId,
                    updatedAt: new Date(),
                })
                .where(eq(chips.chipId, existingChip.chipId))
                .returning();

            logger.info('Chip reassigned to animal', {
                chipNumber: sanitizedChipNumber,
                animalId,
            });

            return {
                message: 'Chip successfully assigned to animal',
                chip: updated[0],
            };
        }

        // Chip already assigned to this animal
        throw new ConflictError(`Chip ${sanitizedChipNumber} is already assigned to this animal`);
    }

    // Create new chip record
    const newChip = await db
        .insert(chips)
        .values({
            chipNumber: sanitizedChipNumber,
            manufacturer: microchipValidation.manufacturer || null,
            animalId,
            implantationDate: implantationDate || null,
            implantedBy: implanterId || null,
            holdingId: holdingId || null,
            isActive: true,
        })
        .returning();

    logger.info('New chip assigned to animal', {
        chipNumber: sanitizedChipNumber,
        animalId,
    });

    return {
        message: 'Chip successfully assigned to animal',
        chip: newChip[0],
    };
}

/**
 * Get chip details by chip number
 * GET /api/v1/chips/:chipNumber
 */
export async function getChipByNumber(chipNumber: string) {
    const sanitizedChipNumber = sanitizeMicrochipNumber(chipNumber);

    const chip = await db.query.chips.findFirst({
        where: eq(chips.chipNumber, sanitizedChipNumber),
        with: {
            animal: true,
        },
    });

    if (!chip) {
        throw new NotFoundError(`Chip ${sanitizedChipNumber} not found`);
    }

    return chip;
}

/**
 * Deactivate a chip
 * POST /api/v1/chips/:chipNumber/deactivate
 */
export async function deactivateChip(chipNumber: string, reason?: string) {
    const sanitizedChipNumber = sanitizeMicrochipNumber(chipNumber);

    const chip = await db.query.chips.findFirst({
        where: eq(chips.chipNumber, sanitizedChipNumber),
    });

    if (!chip) {
        throw new NotFoundError(`Chip ${sanitizedChipNumber} not found`);
    }

    if (!chip.isActive) {
        throw new ValidationError('Chip is already deactivated');
    }

    const updated = await db
        .update(chips)
        .set({
            isActive: false,
            updatedAt: new Date(),
        })
        .where(eq(chips.chipId, chip.chipId))
        .returning();

    logger.info('Chip deactivated', {
        chipNumber: sanitizedChipNumber,
        reason,
    });

    return {
        message: 'Chip successfully deactivated',
        chip: updated[0],
    };
}
