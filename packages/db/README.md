# Database Package (@repo/db)

Drizzle ORM schema and database client for the pet-chip livestock/pet tracking system.

## Overview

This package contains the complete database schema for managing livestock and pet registration, tracking, health records, and ownership in Uzbekistan.

## Schema Structure

### Tables

1. **administrative_areas** - Hierarchical administrative regions (Region → District → Municipality)
2. **users** - System users with OneID integration
3. **holdings** - Farms, households, and commercial enterprises
4. **animals** - Core registry for livestock and pets
5. **chips** - ISO 11784/11785 microchip tracking
6. **vaccinations** - Vaccination records with batch tracking
7. **animal_movements** - Movement tracking between holdings
8. **animal_health_records** - Health status (TimescaleDB hypertable)
9. **ownership_history** - Ownership transfer audit trail
10. **alerts** - Lost/found animal alerts with geospatial data

### Entity Relationship Diagram

```mermaid
erDiagram
    administrative_areas ||--o{ holdings : "located_in"
    administrative_areas ||--o{ users : "assigned_to"
    administrative_areas ||--o{ administrative_areas : "parent_of"
    
    holdings ||--o{ animals : "current_location"
    holdings ||--o{ animals : "birth_location"
    holdings ||--o{ vaccinations : "administered_at"
    holdings ||--o{ animal_health_records : "recorded_at"
    holdings ||--o{ chips : "implanted_at"
    
    animals ||--o{ chips : "has"
    animals ||--o{ vaccinations : "received"
    animals ||--o{ animal_movements : "moved"
    animals ||--o{ animal_health_records : "has"
    animals ||--o{ ownership_history : "owned_by"
    animals ||--o{ alerts : "reported_for"
    
    users ||--o{ ownership_history : "owns"
    users ||--o{ alerts : "reported_by"
    
    holdings ||--o{ animal_movements : "from"
    holdings ||--o{ animal_movements : "to"
```

## Key Features

### ISO 11784/11785 Microchip Support
- 15-digit chip number format
- Manufacturer tracking
- Multiple chips per animal support
- Implantation history

### TimescaleDB Integration
The `animal_health_records` table is converted to a TimescaleDB hypertable for:
- High-performance time-series queries
- Automatic data partitioning by date
- Efficient vaccination coverage analytics

### Geospatial Support
The `alerts` table includes latitude/longitude for lost animal tracking with PostGIS support.

### OneID Integration
The `users` table includes `oneid_user_id` for Uzbekistan government authentication system integration.

## Usage

### Generate Migrations

```bash
bun run --filter=@repo/db db:generate
```

### Push Schema to Database

```bash
bun run --filter=@repo/db db:push
```

### Run Migrations

```bash
bun run --filter=@repo/db db:migrate
```

### Open Drizzle Studio

```bash
bun run --filter=@repo/db db:studio
```

### Convert Health Records to Hypertable

After running migrations, execute this SQL in TimescaleDB:

```sql
SELECT convert_health_records_to_hypertable();
```

## Database Clients

### Import the database client

```typescript
import { db, pool } from '@repo/db';

// Query with Drizzle
const allAnimals = await db.select().from(animals);

// Use raw pool connection
const result = await pool.query('SELECT version()');
```

### Import schema

```typescript
import { animals, users, chips } from '@repo/db';
```

## Environment Variables

Required in `.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/petchip
```

## Indexes

Performance-optimized indexes:

- `idx_animals_official_id` - Fast government ID lookups
- `idx_chips_id_hash` - Chip number lookups (≤300ms SLA)
- `idx_alerts_geo` - Geospatial queries for lost animals
- `idx_ownership_animal` - Ownership history by animal
- `idx_ownership_user` - Ownership history by user
- `idx_movements_date` - Movement history queries
- `idx_health_records_time_animal` - TimescaleDB time-series (animal)
- `idx_health_records_time_holding` - TimescaleDB time-series (holding)

## Data Compliance

- **Uzbekistan Data Protection**: PII encryption ready (Phase 4)
- **Row Level Security**: RLS policies (Phase 4)
- **Audit Logging**: Timestamp tracking on all tables

## Technology Stack

- **ORM**: Drizzle ORM
- **Database**: PostgreSQL 16
- **Time-Series**: TimescaleDB
- **Geospatial**: PostGIS
- **Runtime**: Bun

## Development

### Schema Updates

1. Modify `src/schema.ts`
2. Generate migration: `bun run db:generate`
3. Review generated SQL in `drizzle/` directory
4. Apply migration: `bun run db:migrate`

### Testing Locally

```bash
# Start Docker services
bun run docker:up

# Push schema
bun run --filter=@repo/db db:push

# Open Drizzle Studio
bun run --filter=@repo/db db:studio
```

## Support

For schema questions or modifications, refer to:
- Phase 2 implementation plan
- Database design specifications document
- Drizzle ORM documentation: https://orm.drizzle.team
