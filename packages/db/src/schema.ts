import { pgTable, uuid, varchar, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const speciesEnum = pgEnum('species', ['dog', 'cat', 'other']);

export const animals = pgTable('animals', {
    id: uuid('id').primaryKey().defaultRandom(),
    species: speciesEnum('species').notNull(),
    microchipNumber: varchar('microchip_number', { length: 15 }).unique().notNull(),
    createdAt: timestamp('created_at').defaultNow(),
});