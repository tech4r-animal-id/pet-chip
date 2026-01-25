import { db } from '@repo/db';
import { alerts, animals } from '@repo/db';
import { eq } from 'drizzle-orm';
import { ValidationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { sanitizeString } from '../utils/sanitize';

/**
 * Create a lost/found animal alert
 * POST /api/v1/lostfound
 */
export async function createLostFoundCase(data: {
  animalId: string;
  reporterUserId?: string;
  message: string;
  lastSeenLat?: number;
  lastSeenLong?: number;
  lastSeenAddress?: string;
}) {
  // Validate required fields
  if (!data.animalId || !data.message) {
    throw new ValidationError('Missing required fields: animalId, message');
  }

  // Sanitize inputs
  const sanitizedMessage = sanitizeString(data.message);
  const sanitizedAddress = data.lastSeenAddress ? sanitizeString(data.lastSeenAddress) : null;

  if (sanitizedMessage.length < 10) {
    throw new ValidationError('Message must be at least 10 characters');
  }

  // Verify animal exists
  const animal = await db.query.animals.findFirst({
    where: eq(animals.animalId, data.animalId),
  });

  if (!animal) {
    throw new NotFoundError(`Animal with ID ${data.animalId} not found`);
  }

  // Validate coordinates if provided
  if (data.lastSeenLat !== undefined || data.lastSeenLong !== undefined) {
    if (data.lastSeenLat === undefined || data.lastSeenLong === undefined) {
      throw new ValidationError('Both latitude and longitude must be provided together');
    }

    if (data.lastSeenLat < -90 || data.lastSeenLat > 90) {
      throw new ValidationError('Latitude must be between -90 and 90');
    }

    if (data.lastSeenLong < -180 || data.lastSeenLong > 180) {
      throw new ValidationError('Longitude must be between -180 and 180');
    }
  }

  // Create alert
  const newAlert = await db
    .insert(alerts)
    .values({
      animalId: data.animalId,
      reporterUserId: data.reporterUserId || null,
      message: sanitizedMessage,
      lastSeenLat: data.lastSeenLat?.toString() || null,
      lastSeenLong: data.lastSeenLong?.toString() || null,
      lastSeenAddress: sanitizedAddress,
      status: 'Active',
    })
    .returning();

  logger.info('Lost/Found case created', {
    alertId: newAlert[0]!.alertId,
    animalId: data.animalId,
    hasLocation: !!(data.lastSeenLat && data.lastSeenLong),
  });

  return {
    message: 'Lost/Found case created successfully',
    alert: newAlert[0]!,
  };
}

/**
 * Get lost/found case by ID
 * GET /api/v1/lostfound/:id
 */
export async function getLostFoundCase(alertId: string) {
  const alert = await db.query.alerts.findFirst({
    where: eq(alerts.alertId, alertId),
  });

  if (!alert) {
    throw new NotFoundError(`Lost/Found case with ID ${alertId} not found`);
  }

  // Get associated animal information
  if (alert.animalId) {
    const animal = await db.query.animals.findFirst({
      where: eq(animals.animalId, alert.animalId),
    });

    return {
      ...alert,
      animal,
    };
  }

  return alert;
}

/**
 * List all active lost/found cases
 * GET /api/v1/lostfound
 */
export async function listLostFoundCases(filters?: {
  status?: 'Active' | 'Resolved' | 'False Alarm';
  animalId?: string;
}) {
  let query = db.select().from(alerts);

  // Apply filters
  if (filters?.status) {
    query = query.where(eq(alerts.status, filters.status)) as any;
  }

  if (filters?.animalId) {
    query = query.where(eq(alerts.animalId, filters.animalId)) as any;
  }

  const results = await query;

  return {
    total: results.length,
    cases: results,
  };
}

/**
 * Update lost/found case status
 * PATCH /api/v1/lostfound/:id
 */
export async function updateLostFoundCase(
  alertId: string,
  data: {
    status?: 'Active' | 'Resolved' | 'False Alarm';
    message?: string;
  }
) {
  const alert = await db.query.alerts.findFirst({
    where: eq(alerts.alertId, alertId),
  });

  if (!alert) {
    throw new NotFoundError(`Lost/Found case with ID ${alertId} not found`);
  }

  const updateData: Record<string, any> = {};

  if (data.status) {
    updateData.status = data.status;

    // Set resolvedAt timestamp when status changes to Resolved or False Alarm
    if (data.status === 'Resolved' || data.status === 'False Alarm') {
      updateData.resolvedAt = new Date();
    }
  }

  if (data.message) {
    const sanitized = sanitizeString(data.message);
    if (sanitized.length < 10) {
      throw new ValidationError('Message must be at least 10 characters');
    }
    updateData.message = sanitized;
  }

  const updated = await db
    .update(alerts)
    .set(updateData)
    .where(eq(alerts.alertId, alertId))
    .returning();

  logger.info('Lost/Found case updated', {
    alertId,
    updatedFields: Object.keys(updateData),
  });

  return {
    message: 'Lost/Found case updated successfully',
    alert: updated[0]!,
  };
}

/**
 * Delete lost/found case
 * DELETE /api/v1/lostfound/:id
 */
export async function deleteLostFoundCase(alertId: string) {
  const alert = await db.query.alerts.findFirst({
    where: eq(alerts.alertId, alertId),
  });

  if (!alert) {
    throw new NotFoundError(`Lost/Found case with ID ${alertId} not found`);
  }

  await db.delete(alerts).where(eq(alerts.alertId, alertId));

  logger.info('Lost/Found case deleted', { alertId });

  return {
    message: 'Lost/Found case deleted successfully',
  };
}
