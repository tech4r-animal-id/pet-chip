import {
    pgTable,
    uuid,
    varchar,
    timestamp,
    boolean,
    pgEnum,
    text,
    date,
    integer,
    serial,
    numeric,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ============================================================================
// ENUMS
// ============================================================================

export const areaTypeEnum = pgEnum("area_type", [
    "Region",
    "District",
    "Municipality",
]);

export const holdingTypeEnum = pgEnum("holding_type", [
    "Farm",
    "Household",
    "Commercial Enterprise",
    "Pastoral",
]);

export const holdingStatusEnum = pgEnum("holding_status", [
    "Active",
    "Inactive",
    "Suspended",
]);

export const animalSpeciesEnum = pgEnum("animal_species", [
    "Cattle",
    "Sheep",
    "Goat",
    "Horse",
    "Poultry",
    "Dog",
    "Cat",
    "Other",
]);

export const animalSexEnum = pgEnum("animal_sex", ["Male", "Female"]);

export const animalStatusEnum = pgEnum("animal_status", [
    "Alive",
    "Deceased",
    "Sold",
    "Slaughtered",
]);

export const movementTypeEnum = pgEnum("movement_type", [
    "Sale",
    "Transfer",
    "Loan",
    "Exhibition",
    "Slaughter",
]);

export const alertStatusEnum = pgEnum("alert_status", [
    "Active",
    "Resolved",
    "False Alarm",
]);

export const healthStatusEnum = pgEnum("health_status", [
    "Healthy",
    "Sick",
    "Under Treatment",
    "Quarantined",
]);

export const userRoleEnum = pgEnum("user_role", [
    "Veterinarian",
    "Government Officer",
    "Farmer",
    "System Admin",
    "Citizen",
]);

export const userStatusEnum = pgEnum("user_status", ["Active", "Inactive"]);

// ============================================================================
// TABLES
// ============================================================================

/**
 * Table 1: Administrative Areas
 * Hierarchical structure for regions, districts, and municipalities
 */
export const administrativeAreas = pgTable("administrative_areas", {
    areaId: serial("area_id").primaryKey(),
    areaName: varchar("area_name", { length: 100 }).notNull(),
    areaType: areaTypeEnum("area_type").notNull(),
    parentAreaId: integer("parent_area_id"),
    code: varchar("code", { length: 20 }).unique().notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Table 2: Users
 * System users including citizens, veterinarians, and government officers
 */
export const users = pgTable("users", {
    userId: uuid("user_id").primaryKey().defaultRandom(),
    oneidUserId: varchar("oneid_user_id", { length: 100 }).unique(),
    username: varchar("username", { length: 50 }).unique().notNull(),
    email: varchar("email", { length: 100 }).unique().notNull(),
    phoneNumber: varchar("phone_number", { length: 20 }),
    fullName: varchar("full_name", { length: 150 }),
    userRole: userRoleEnum("user_role").notNull(),
    areaId: integer("area_id"),
    status: userStatusEnum("status").default("Active"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Table 3: Holdings
 * Farms, households, and commercial enterprises
 */
export const holdings = pgTable("holdings", {
    holdingId: serial("holding_id").primaryKey(),
    holdingName: varchar("holding_name", { length: 200 }).notNull(),
    holdingType: holdingTypeEnum("holding_type").notNull(),
    ownerName: varchar("owner_name", { length: 150 }).notNull(),
    contactPhone: varchar("contact_phone", { length: 20 }),
    address: text("address"),
    status: holdingStatusEnum("status").default("Active"),
    areaId: integer("area_id").notNull(),
    registrationDate: date("registration_date").defaultNow(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * Table 4: Animals
 * Core registry for all animals (livestock and pets)
 */
export const animals = pgTable(
    "animals",
    {
        animalId: uuid("animal_id").primaryKey().defaultRandom(),
        officialId: varchar("official_id", { length: 50 }).unique().notNull(),
        species: animalSpeciesEnum("species").notNull(),
        breed: varchar("breed", { length: 100 }),
        sex: animalSexEnum("sex").notNull(),
        dateOfBirth: date("date_of_birth"),
        currentHoldingId: integer("current_holding_id").notNull(),
        birthHoldingId: integer("birth_holding_id").notNull(),
        status: animalStatusEnum("status").default("Alive"),
        registrationDate: timestamp("registration_date").defaultNow(),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
    },
    (table) => ({
        officialIdIdx: index("idx_animals_official_id").on(table.officialId),
    })
);

/**
 * Table 5: Chips
 * ISO 11784/11785 microchip registry
 */
export const chips = pgTable(
    "chips",
    {
        chipId: uuid("chip_id").primaryKey().defaultRandom(),
        chipNumber: varchar("chip_number", { length: 15 }).unique().notNull(),
        manufacturer: varchar("manufacturer", { length: 100 }),
        animalId: uuid("animal_id"),
        implantationDate: date("implantation_date"),
        implantedBy: varchar("implanted_by", { length: 150 }),
        holdingId: integer("holding_id"),
        isActive: boolean("is_active").default(true),
        createdAt: timestamp("created_at").defaultNow(),
        updatedAt: timestamp("updated_at").defaultNow(),
    },
    (table) => ({
        chipNumberHashIdx: index("idx_chips_id_hash").on(table.chipNumber),
    })
);

/**
 * Table 6: Vaccinations
 * Vaccination records with batch tracking
 */
export const vaccinations = pgTable("vaccinations", {
    vaccinationId: serial("vaccination_id").primaryKey(),
    animalId: uuid("animal_id").notNull(),
    vaccineType: varchar("vaccine_type", { length: 100 }).notNull(),
    vaccineBatch: varchar("vaccine_batch", { length: 50 }),
    administrationDate: date("administration_date").notNull(),
    nextDueDate: date("next_due_date"),
    administeringVeterinarian: varchar("administering_veterinarian", {
        length: 150,
    }),
    holdingId: integer("holding_id").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Table 7: Animal Movements
 * Track animal movement between holdings
 */
export const animalMovements = pgTable(
    "animal_movements",
    {
        movementId: serial("movement_id").primaryKey(),
        animalId: uuid("animal_id").notNull(),
        fromHoldingId: integer("from_holding_id").notNull(),
        toHoldingId: integer("to_holding_id").notNull(),
        movementDate: date("movement_date").notNull(),
        movementType: movementTypeEnum("movement_type").notNull(),
        movementReason: varchar("movement_reason", { length: 200 }),
        officialPermitNumber: varchar("official_permit_number", { length: 100 }),
        recordedBy: varchar("recorded_by", { length: 150 }),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (table) => ({
        movementDateIdx: index("idx_movements_date").on(table.movementDate),
    })
);

/**
 * Table 8: Animal Health Records
 * Health status and treatment records (TimescaleDB hypertable)
 */
export const animalHealthRecords = pgTable("animal_health_records", {
    healthRecordId: serial("health_record_id").primaryKey(),
    animalId: uuid("animal_id").notNull(),
    recordDate: date("record_date").notNull(),
    healthStatus: healthStatusEnum("health_status"),
    diagnosis: text("diagnosis"),
    treatmentAdministered: text("treatment_administered"),
    veterinarianName: varchar("veterinarian_name", { length: 150 }),
    holdingId: integer("holding_id").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
});

/**
 * Table 9: Ownership History
 * Track ownership transfers over time
 */
export const ownershipHistory = pgTable(
    "ownership_history",
    {
        historyId: serial("history_id").primaryKey(),
        animalId: uuid("animal_id"),
        userId: uuid("user_id"),
        isCurrentOwner: boolean("is_current_owner").default(true),
        startDate: timestamp("start_date").defaultNow(),
        endDate: timestamp("end_date"),
        transferNotes: text("transfer_notes"),
        createdAt: timestamp("created_at").defaultNow(),
    },
    (table) => ({
        ownershipAnimalIdx: index("idx_ownership_animal").on(table.animalId),
        ownershipUserIdx: index("idx_ownership_user").on(table.userId),
    })
);

/**
 * Table 10: Alerts
 * Lost/found animal alerts with geospatial data
 */
export const alerts = pgTable(
    "alerts",
    {
        alertId: uuid("alert_id").primaryKey().defaultRandom(),
        animalId: uuid("animal_id"),
        reporterUserId: uuid("reporter_user_id"),
        status: alertStatusEnum("status").default("Active"),
        message: text("message"),
        lastSeenLat: numeric("last_seen_lat", { precision: 9, scale: 6 }),
        lastSeenLong: numeric("last_seen_long", { precision: 9, scale: 6 }),
        lastSeenAddress: text("last_seen_address"),
        createdAt: timestamp("created_at").defaultNow(),
        resolvedAt: timestamp("resolved_at"),
    },
    (table) => ({
        alertsGeoIdx: index("idx_alerts_geo").on(
            table.lastSeenLat,
            table.lastSeenLong
        ),
    })
);

// ============================================================================
// RELATIONS
// ============================================================================

export const administrativeAreasRelations = relations(
    administrativeAreas,
    ({ one, many }) => ({
        parentArea: one(administrativeAreas, {
            fields: [administrativeAreas.parentAreaId],
            references: [administrativeAreas.areaId],
        }),
        childAreas: many(administrativeAreas),
        holdings: many(holdings),
        users: many(users),
    })
);

export const usersRelations = relations(users, ({ one, many }) => ({
    area: one(administrativeAreas, {
        fields: [users.areaId],
        references: [administrativeAreas.areaId],
    }),
    ownershipHistory: many(ownershipHistory),
    reportedAlerts: many(alerts),
}));

export const holdingsRelations = relations(holdings, ({ one, many }) => ({
    area: one(administrativeAreas, {
        fields: [holdings.areaId],
        references: [administrativeAreas.areaId],
    }),
    currentAnimals: many(animals, { relationName: "currentHolding" }),
    bornAnimals: many(animals, { relationName: "birthHolding" }),
    vaccinations: many(vaccinations),
    healthRecords: many(animalHealthRecords),
    movementsFrom: many(animalMovements, { relationName: "fromHolding" }),
    movementsTo: many(animalMovements, { relationName: "toHolding" }),
    chips: many(chips),
}));

export const animalsRelations = relations(animals, ({ one, many }) => ({
    currentHolding: one(holdings, {
        fields: [animals.currentHoldingId],
        references: [holdings.holdingId],
        relationName: "currentHolding",
    }),
    birthHolding: one(holdings, {
        fields: [animals.birthHoldingId],
        references: [holdings.holdingId],
        relationName: "birthHolding",
    }),
    chips: many(chips),
    vaccinations: many(vaccinations),
    movements: many(animalMovements),
    healthRecords: many(animalHealthRecords),
    ownershipHistory: many(ownershipHistory),
    alerts: many(alerts),
}));

export const chipsRelations = relations(chips, ({ one }) => ({
    animal: one(animals, {
        fields: [chips.animalId],
        references: [animals.animalId],
    }),
    holding: one(holdings, {
        fields: [chips.holdingId],
        references: [holdings.holdingId],
    }),
}));

export const vaccinationsRelations = relations(vaccinations, ({ one }) => ({
    animal: one(animals, {
        fields: [vaccinations.animalId],
        references: [animals.animalId],
    }),
    holding: one(holdings, {
        fields: [vaccinations.holdingId],
        references: [holdings.holdingId],
    }),
}));

export const animalMovementsRelations = relations(
    animalMovements,
    ({ one }) => ({
        animal: one(animals, {
            fields: [animalMovements.animalId],
            references: [animals.animalId],
        }),
        fromHolding: one(holdings, {
            fields: [animalMovements.fromHoldingId],
            references: [holdings.holdingId],
            relationName: "fromHolding",
        }),
        toHolding: one(holdings, {
            fields: [animalMovements.toHoldingId],
            references: [holdings.holdingId],
            relationName: "toHolding",
        }),
    })
);

export const animalHealthRecordsRelations = relations(
    animalHealthRecords,
    ({ one }) => ({
        animal: one(animals, {
            fields: [animalHealthRecords.animalId],
            references: [animals.animalId],
        }),
        holding: one(holdings, {
            fields: [animalHealthRecords.holdingId],
            references: [holdings.holdingId],
        }),
    })
);

export const ownershipHistoryRelations = relations(
    ownershipHistory,
    ({ one }) => ({
        animal: one(animals, {
            fields: [ownershipHistory.animalId],
            references: [animals.animalId],
        }),
        user: one(users, {
            fields: [ownershipHistory.userId],
            references: [users.userId],
        }),
    })
);

export const alertsRelations = relations(alerts, ({ one }) => ({
    animal: one(animals, {
        fields: [alerts.animalId],
        references: [animals.animalId],
    }),
    reporter: one(users, {
        fields: [alerts.reporterUserId],
        references: [users.userId],
    }),
}));