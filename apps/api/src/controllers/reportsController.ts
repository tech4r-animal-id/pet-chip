import { db } from '@repo/db';
import { animals, vaccinations, animalHealthRecords, holdings } from '@repo/db';
import { sql, eq, and, count } from 'drizzle-orm';
import type { VaccinationCoverageParams } from '../types/api';

/**
 * Reports Controller
 * Handles analytics and reporting endpoints
 */

/**
 * Get vaccination coverage report
 */
export async function getVaccinationCoverage(params: VaccinationCoverageParams) {
    const startDateObj = params.startDate ? new Date(params.startDate) : new Date(new Date().setMonth(new Date().getMonth() - 12));
    const endDateObj = params.endDate ? new Date(params.endDate) : new Date();

    // Convert to string format for date column comparison
    const startDate = startDateObj.toISOString().split('T')[0];
    const endDate = endDateObj.toISOString().split('T')[0];

    // Get total animals
    const totalAnimalsQuery = db
        .select({ count: count() })
        .from(animals)
        .where(eq(animals.status, 'Alive'));

    // Get vaccinated animals (with at least one vaccination in date range)
    const vaccinatedAnimalsQuery = db
        .select({ count: sql<number>`COUNT(DISTINCT ${animals.animalId})` })
        .from(animals)
        .innerJoin(animalHealthRecords, eq(animalHealthRecords.animalId, animals.animalId))
        .where(
            and(
                eq(animals.status, 'Alive'),
                sql`${animalHealthRecords.recordDate} >= ${startDate}`,
                sql`${animalHealthRecords.recordDate} <= ${endDate}`,
                sql`${animalHealthRecords.diagnosis} LIKE '%vaccin%' OR ${animalHealthRecords.treatmentAdministered} LIKE '%vaccin%'`
            )
        );

    const [totalResult, vaccinatedResult] = await Promise.all([
        totalAnimalsQuery,
        vaccinatedAnimalsQuery,
    ]);

    const totalAnimals = totalResult[0]?.count || 0;
    const vaccinatedAnimals = Number(vaccinatedResult[0]?.count) || 0;
    const coverageRate = totalAnimals > 0 ? vaccinatedAnimals / totalAnimals : 0;

    // Get details by holding if needed
    let details: any[] = [];

    if (params.mahalla) {
        // Filter by specific mahalla/holding area
        const holdingDetails = await db
            .select({
                holdingName: holdings.holdingName,
                holdingType: holdings.holdingType,
                total: count(animals.animalId),
                vaccinatedCount: sql<number>`COUNT(DISTINCT CASE WHEN ${animalHealthRecords.animalId} IS NOT NULL THEN ${animals.animalId} END)`,
            })
            .from(animals)
            .leftJoin(holdings, eq(animals.currentHoldingId, holdings.holdingId))
            .leftJoin(
                animalHealthRecords,
                and(
                    eq(animalHealthRecords.animalId, animals.animalId),
                    sql`${animalHealthRecords.recordDate} >= ${startDate}`,
                    sql`${animalHealthRecords.recordDate} <= ${endDate}`
                )
            )
            .where(
                and(
                    eq(animals.status, 'Alive'),
                    sql`${holdings.holdingName} LIKE ${`%${params.mahalla}%`}`
                )
            )
            .groupBy(holdings.holdingId, holdings.holdingName, holdings.holdingType);

        details = holdingDetails.map((h) => ({
            mahalla: h.holdingName,
            type: h.holdingType,
            total: h.total,
            vaccinated: Number(h.vaccinatedCount),
            coverageRate: h.total > 0 ? Number(h.vaccinatedCount) / h.total : 0,
        }));
    } else {
        // Get summary by all holdings
        const allHoldings = await db
            .select({
                holdingName: holdings.holdingName,
                holdingType: holdings.holdingType,
                total: count(animals.animalId),
                vaccinatedCount: sql<number>`COUNT(DISTINCT CASE WHEN ${animalHealthRecords.animalId} IS NOT NULL THEN ${animals.animalId} END)`,
            })
            .from(animals)
            .leftJoin(holdings, eq(animals.currentHoldingId, holdings.holdingId))
            .leftJoin(
                animalHealthRecords,
                and(
                    eq(animalHealthRecords.animalId, animals.animalId),
                    sql`${animalHealthRecords.recordDate} >= ${startDate}`,
                    sql`${animalHealthRecords.recordDate} <= ${endDate}`
                )
            )
            .where(eq(animals.status, 'Alive'))
            .groupBy(holdings.holdingId, holdings.holdingName, holdings.holdingType)
            .limit(20);

        details = allHoldings.map((h) => ({
            mahalla: h.holdingName,
            type: h.holdingType,
            total: h.total,
            vaccinated: Number(h.vaccinatedCount),
            coverageRate: h.total > 0 ? Number(h.vaccinatedCount) / h.total : 0,
        }));
    }

    return {
        summary: {
            totalAnimals,
            vaccinatedAnimals,
            coverageRate: Number(coverageRate.toFixed(3)),
            dateRange: {
                start: startDate,
                end: endDate,
            },
        },
        details,
    };
}

/**
 * Get animal statistics
 */
export async function getAnimalStatistics() {
    // Species distribution
    const speciesStats = await db
        .select({
            species: animals.species,
            count: count(),
        })
        .from(animals)
        .where(eq(animals.status, 'Alive'))
        .groupBy(animals.species);

    // Status distribution
    const statusStats = await db
        .select({
            status: animals.status,
            count: count(),
        })
        .from(animals)
        .groupBy(animals.status);

    // Sex distribution
    const sexStats = await db
        .select({
            sex: animals.sex,
            count: count(),
        })
        .from(animals)
        .where(eq(animals.status, 'Alive'))
        .groupBy(animals.sex);

    // Total registered animals
    const totalRegistered = await db
        .select({ count: count() })
        .from(animals);

    return {
        totalRegistered: totalRegistered[0]?.count || 0,
        bySpecies: speciesStats,
        byStatus: statusStats,
        bySex: sexStats,
    };
}

/**
 * Get recent registrations
 */
export async function getRecentRegistrations(limit: number = 10) {
    const recent = await db
        .select({
            animalId: animals.animalId,
            officialId: animals.officialId,
            species: animals.species,
            breed: animals.breed,
            registrationDate: animals.registrationDate,
            status: animals.status,
        })
        .from(animals)
        .orderBy(sql`${animals.registrationDate} DESC`)
        .limit(limit);

    return recent;
}
