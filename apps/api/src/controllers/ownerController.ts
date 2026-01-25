import { db } from '@repo/db';
import { holdings } from '@repo/db';
import { eq } from 'drizzle-orm';
import { ValidationError, ConflictError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sanitizeString, sanitizePhone } from '../utils/sanitize';

/**
 * Register a new owner (holding)
 * POST /api/v1/owners
 */
export async function registerOwner(data: {
  holdingName: string;
  holdingType: 'Farm' | 'Household' | 'Commercial Enterprise' | 'Pastoral';
  ownerName: string;
  contactPhone?: string;
  address?: string;
  areaId: number;
}) {
  // Validate required fields
  if (!data.holdingName || !data.holdingType || !data.ownerName || !data.areaId) {
    throw new ValidationError('Missing required fields: holdingName, holdingType, ownerName, areaId');
  }

  // Sanitize inputs
  const sanitizedHoldingName = sanitizeString(data.holdingName);
  const sanitizedOwnerName = sanitizeString(data.ownerName);
  const sanitizedAddress = data.address ? sanitizeString(data.address) : null;
  const sanitizedPhone = data.contactPhone ? sanitizePhone(data.contactPhone) : null;

  if (!sanitizedHoldingName || sanitizedHoldingName.length < 2) {
    throw new ValidationError('Holding name must be at least 2 characters');
  }

  if (!sanitizedOwnerName || sanitizedOwnerName.length < 2) {
    throw new ValidationError('Owner name must be at least 2 characters');
  }

  // Check if holding name already exists in the same area
  const existingHolding = await db.query.holdings.findFirst({
    where: eq(holdings.holdingName, sanitizedHoldingName),
  });

  if (existingHolding && existingHolding.areaId === data.areaId) {
    throw new ConflictError(`A holding with name "${sanitizedHoldingName}" already exists in this area`);
  }

  // Create new holding
  const newHolding = await db
    .insert(holdings)
    .values({
      holdingName: sanitizedHoldingName,
      holdingType: data.holdingType,
      ownerName: sanitizedOwnerName,
      contactPhone: sanitizedPhone,
      address: sanitizedAddress,
      areaId: data.areaId,
      status: 'Active',
    })
    .returning();

  logger.info('New holding registered', {
    holdingId: newHolding[0]!.holdingId,
    holdingName: sanitizedHoldingName,
    ownerName: sanitizedOwnerName,
  });

  return {
    message: 'Owner registered successfully',
    owner: newHolding[0]!,
  };
}

/**
 * Get owner by ID
 * GET /api/v1/owners/:id
 */
export async function getOwnerById(holdingId: number) {
  const holding = await db.query.holdings.findFirst({
    where: eq(holdings.holdingId, holdingId),
  });

  if (!holding) {
    throw new NotFoundError(`Owner with ID ${holdingId} not found`);
  }

  return holding;
}

/**
 * Update owner information
 * PUT /api/v1/owners/:id
 */
export async function updateOwner(
  holdingId: number,
  data: {
    holdingName?: string;
    ownerName?: string;
    contactPhone?: string;
    address?: string;
    status?: 'Active' | 'Inactive' | 'Suspended';
  }
) {
  // Check if holding exists
  const holding = await db.query.holdings.findFirst({
    where: eq(holdings.holdingId, holdingId),
  });

  if (!holding) {
    throw new NotFoundError(`Owner with ID ${holdingId} not found`);
  }

  // Build update object with only provided fields
  const updateData: Record<string, any> = {
    updatedAt: new Date(),
  };

  if (data.holdingName) {
    const sanitized = sanitizeString(data.holdingName);
    if (sanitized.length < 2) {
      throw new ValidationError('Holding name must be at least 2 characters');
    }
    updateData.holdingName = sanitized;
  }

  if (data.ownerName) {
    const sanitized = sanitizeString(data.ownerName);
    if (sanitized.length < 2) {
      throw new ValidationError('Owner name must be at least 2 characters');
    }
    updateData.ownerName = sanitized;
  }

  if (data.contactPhone !== undefined) {
    updateData.contactPhone = data.contactPhone ? sanitizePhone(data.contactPhone) : null;
  }

  if (data.address !== undefined) {
    updateData.address = data.address ? sanitizeString(data.address) : null;
  }

  if (data.status) {
    updateData.status = data.status;
  }

  // Update holding
  const updated = await db
    .update(holdings)
    .set(updateData)
    .where(eq(holdings.holdingId, holdingId))
    .returning();

  logger.info('Holding updated', {
    holdingId,
    updatedFields: Object.keys(updateData),
  });

  return {
    message: 'Owner updated successfully',
    owner: updated[0],
  };
}

/**
 * List all owners with optional filtering
 * GET /api/v1/owners
 */
export async function listOwners(filters?: {
  holdingType?: 'Farm' | 'Household' | 'Commercial Enterprise' | 'Pastoral';
  status?: 'Active' | 'Inactive' | 'Suspended';
  areaId?: number;
}) {
  let query = db.select().from(holdings);

  // Apply filters if provided
  if (filters?.holdingType) {
    query = query.where(eq(holdings.holdingType, filters.holdingType)) as any;
  }

  if (filters?.status) {
    query = query.where(eq(holdings.status, filters.status)) as any;
  }

  if (filters?.areaId) {
    query = query.where(eq(holdings.areaId, filters.areaId)) as any;
  }

  const results = await query;

  return {
    total: results.length,
    owners: results,
  };
}

/**
 * Delete owner (soft delete by setting status to Inactive)
 * DELETE /api/v1/owners/:id
 */
export async function deleteOwner(holdingId: number) {
  const holding = await db.query.holdings.findFirst({
    where: eq(holdings.holdingId, holdingId),
  });

  if (!holding) {
    throw new NotFoundError(`Owner with ID ${holdingId} not found`);
  }

  // Soft delete by setting status to Inactive
  await db
    .update(holdings)
    .set({
      status: 'Inactive',
      updatedAt: new Date(),
    })
    .where(eq(holdings.holdingId, holdingId));

  logger.info('Holding deactivated', { holdingId });

  return {
    message: 'Owner deactivated successfully',
  };
}
