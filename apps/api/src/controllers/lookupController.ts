import { db } from '@repo/db';
import { chips, animals, holdings } from '@repo/db';
import { eq } from 'drizzle-orm';
import { NotFoundError, ForbiddenError } from '../utils/errors';
import { sanitizeMicrochipNumber } from '../utils/sanitize';

/**
 * Lookup animal by microchip number
 * Returns comprehensive animal information including current holding
 */
export async function lookupAnimalByChip(chipNumber: string) {
  // Sanitize and validate chip number
  const sanitizedChipNumber = sanitizeMicrochipNumber(chipNumber);

  // Find the chip with its associated animal
  const chipRecord = await db
    .select()
    .from(chips)
    .where(eq(chips.chipNumber, sanitizedChipNumber))
    .limit(1);

  if (!chipRecord.length) {
    throw new NotFoundError('Chip number not found in the system');
  }

  const chip = chipRecord[0]!;

  // Check if chip is active
  if (!chip.isActive) {
    throw new ForbiddenError('This chip is inactive. Please contact support.');
  }

  if (!chip.animalId) {
    throw new NotFoundError('No animal associated with this chip');
  }

  // Get animal details
  const animalRecord = await db
    .select()
    .from(animals)
    .where(eq(animals.animalId, chip.animalId))
    .limit(1);

  if (!animalRecord.length) {
    throw new NotFoundError('Animal not found');
  }

  const animal = animalRecord[0]!;

  // Get current holding information
  const holdingRecord = await db
    .select()
    .from(holdings)
    .where(eq(holdings.holdingId, animal.currentHoldingId))
    .limit(1);

  // Build comprehensive response
  const response = {
    chip: {
      chipNumber: chip.chipNumber,
      manufacturer: chip.manufacturer,
      implantationDate: chip.implantationDate,
      implantedBy: chip.implantedBy,
      isActive: chip.isActive,
      registeredAt: chip.createdAt,
    },
    animal: {
      animalId: animal.animalId,
      officialId: animal.officialId,
      species: animal.species,
      breed: animal.breed,
      sex: animal.sex,
      dateOfBirth: animal.dateOfBirth,
      status: animal.status,
      registrationDate: animal.registrationDate,
    },
    currentHolding: holdingRecord.length
      ? {
          holdingId: holdingRecord[0]!.holdingId,
          holdingName: holdingRecord[0]!.holdingName,
          holdingType: holdingRecord[0]!.holdingType,
          ownerName: holdingRecord[0]!.ownerName,
          contactPhone: holdingRecord[0]!.contactPhone,
          address: holdingRecord[0]!.address,
          status: holdingRecord[0]!.status,
        }
      : null,
  };

  return response;
}

/**
 * Quick chip validation check
 * Returns only basic chip status without animal details
 */
export async function validateChipNumber(chipNumber: string) {
  let sanitizedChipNumber: string;
  try {
    sanitizedChipNumber = sanitizeMicrochipNumber(chipNumber);
  } catch (error: any) {
    return {
      valid: false,
      message: error?.message || 'Invalid chip number format',
    };
  }

  const chipRecord = await db
    .select({
      chipNumber: chips.chipNumber,
      isActive: chips.isActive,
      createdAt: chips.createdAt,
    })
    .from(chips)
    .where(eq(chips.chipNumber, sanitizedChipNumber))
    .limit(1);

  if (!chipRecord.length) {
    return {
      valid: false,
      message: 'Chip number not found in the system',
    };
  }

  const status = chipRecord[0]!.isActive ? 'active' : 'inactive';

  return {
    valid: true,
    status,
    registeredAt: chipRecord[0]!.createdAt,
    message: `Chip is ${status}`,
  };
}
