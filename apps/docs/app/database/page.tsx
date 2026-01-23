import Sidebar from '../components/Sidebar';
import { CodeBlock } from '../components/CodeBlock';

export default function Database() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-12">
        <div className="max-w-4xl mx-auto prose prose-blue">
          <h1>Database Schema</h1>
          
          <p className="lead">
            Pet-Chip uses PostgreSQL with Drizzle ORM for type-safe database operations.
            The schema is designed to support comprehensive animal tracking, health records,
            and administrative hierarchies.
          </p>

          <h2>Schema Overview</h2>
          <p>The database consists of 10 core tables with well-defined relationships:</p>

          <div className="bg-gray-50 p-6 rounded-lg my-6 not-prose">
            <pre className="text-sm overflow-x-auto">
{`┌──────────────────────┐
│  administrative_areas │  ← Regions, Districts, Municipalities
└──────────┬───────────┘
           │
     ┌─────┴─────┐
     │           │
┌────▼────┐  ┌──▼──────┐
│  users  │  │ holdings │  ← Farms, Households
└─────────┘  └──┬───────┘
                │
           ┌────▼─────┐
           │  animals │  ← Central registry
           └──┬───┬───┘
              │   │
    ┌─────────┴┐  └──────────────┐
    │          │                 │
┌───▼────┐ ┌──▼────────────┐ ┌──▼──────────────────┐
│ chips  │ │ vaccinations  │ │ animal_health_records│
└────────┘ └───────────────┘ └─────────────────────┘
              │
         ┌────┴────┬──────────────────┐
    ┌────▼────┐ ┌──▼────────────┐ ┌──▼─────────────┐
    │ alerts  │ │ animal_movements│ │ ownership_history│
    └─────────┘ └────────────────┘ └─────────────────┘`}
            </pre>
          </div>

          <h2>Core Tables</h2>

          <h3>1. Administrative Areas</h3>
          <p>Hierarchical structure for geographic organization (Region → District → Municipality).</p>
          <CodeBlock
            code={`CREATE TABLE administrative_areas (
  area_id          SERIAL PRIMARY KEY,
  area_name        VARCHAR(100) NOT NULL,
  area_type        area_type_enum NOT NULL,  -- Region | District | Municipality
  parent_area_id   INTEGER REFERENCES administrative_areas(area_id),
  code             VARCHAR(20) UNIQUE NOT NULL,
  created_at       TIMESTAMP DEFAULT NOW()
);

-- Example data:
-- Tashkent Region (parent_area_id = NULL)
--   └── Chirchiq District (parent_area_id = Tashkent ID)
--       └── Gazalkent Municipality (parent_area_id = Chirchiq ID)`}
            language="sql"
          />

          <h3>2. Users</h3>
          <p>System users with role-based access control.</p>
          <CodeBlock
            code={`CREATE TABLE users (
  user_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  oneid_user_id    VARCHAR(100) UNIQUE,  -- OneID integration
  username         VARCHAR(50) UNIQUE NOT NULL,
  email            VARCHAR(100) UNIQUE NOT NULL,
  phone_number     VARCHAR(20),
  full_name        VARCHAR(150),
  user_role        user_role_enum NOT NULL,  -- Veterinarian | Government Officer | Farmer | System Admin | Citizen
  area_id          INTEGER REFERENCES administrative_areas(area_id),
  status           user_status_enum DEFAULT 'Active',  -- Active | Inactive
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);

-- Roles:
-- System Admin: Full access
-- Government Officer: Regional management
-- Veterinarian: Medical records
-- Farmer: Own holdings/animals
-- Citizen: Pet registration`}
            language="sql"
          />

          <h3>3. Holdings</h3>
          <p>Farms, households, and commercial enterprises where animals are kept.</p>
          <CodeBlock
            code={`CREATE TABLE holdings (
  holding_id         SERIAL PRIMARY KEY,
  holding_name       VARCHAR(200) NOT NULL,
  holding_type       holding_type_enum NOT NULL,  -- Farm | Household | Commercial Enterprise | Pastoral
  owner_name         VARCHAR(150) NOT NULL,
  contact_phone      VARCHAR(20),
  address            TEXT,
  status             holding_status_enum DEFAULT 'Active',  -- Active | Inactive | Suspended
  area_id            INTEGER NOT NULL REFERENCES administrative_areas(area_id),
  registration_date  DATE DEFAULT NOW(),
  created_at         TIMESTAMP DEFAULT NOW(),
  updated_at         TIMESTAMP DEFAULT NOW()
);`}
            language="sql"
          />

          <h3>4. Animals</h3>
          <p>Central registry for all animals (livestock and pets).</p>
          <CodeBlock
            code={`CREATE TABLE animals (
  animal_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  official_id        VARCHAR(50) UNIQUE NOT NULL,  -- National ID: UZ-2024-001234
  species            animal_species_enum NOT NULL,  -- Cattle | Sheep | Goat | Horse | Dog | Cat | Other
  breed              VARCHAR(100),
  sex                animal_sex_enum NOT NULL,  -- Male | Female
  date_of_birth      DATE,
  color_markings     TEXT,
  photos             TEXT[],  -- Array of photo URLs
  current_holding_id INTEGER REFERENCES holdings(holding_id),
  birth_holding_id   INTEGER REFERENCES holdings(holding_id),
  status             animal_status_enum DEFAULT 'Alive',  -- Alive | Deceased | Sold | Slaughtered
  registration_date  DATE DEFAULT NOW(),
  death_date         DATE,
  created_at         TIMESTAMP DEFAULT NOW(),
  updated_at         TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_animals_official_id ON animals(official_id);
CREATE INDEX idx_animals_species ON animals(species);
CREATE INDEX idx_animals_status ON animals(status);`}
            language="sql"
          />

          <h3>5. Chips (Microchips)</h3>
          <p>Microchip tracking with ISO 11784/11785 validation.</p>
          <CodeBlock
            code={`CREATE TABLE chips (
  chip_id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chip_number        VARCHAR(50) UNIQUE NOT NULL,  -- 15-digit ISO standard
  manufacturer       VARCHAR(100),
  country_code       VARCHAR(3),  -- ISO country code from chip
  implantation_date  DATE,
  animal_id          UUID REFERENCES animals(animal_id) ON DELETE CASCADE,
  implanter_id       UUID REFERENCES users(user_id),
  holding_id         INTEGER REFERENCES holdings(holding_id),
  is_active          BOOLEAN DEFAULT TRUE,
  deactivation_date  DATE,
  deactivation_reason TEXT,
  created_at         TIMESTAMP DEFAULT NOW()
);

-- Microchip format: 981 + Country (3) + Manufacturer (2) + ID (10)
-- Example: 981000000123456`}
            language="sql"
          />

          <h3>6. Vaccinations</h3>
          <p>Vaccination records for disease control and compliance.</p>
          <CodeBlock
            code={`CREATE TABLE vaccinations (
  vaccination_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id          UUID NOT NULL REFERENCES animals(animal_id) ON DELETE CASCADE,
  vaccine_name       VARCHAR(100) NOT NULL,
  vaccine_type       VARCHAR(100),  -- Rabies, FMD, Anthrax, etc.
  vaccination_date   DATE NOT NULL,
  next_due_date      DATE,
  batch_number       VARCHAR(50),
  veterinarian_id    UUID REFERENCES users(user_id),
  notes              TEXT,
  created_at         TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vaccinations_animal ON vaccinations(animal_id);
CREATE INDEX idx_vaccinations_date ON vaccinations(vaccination_date);`}
            language="sql"
          />

          <h3>7. Animal Health Records</h3>
          <p>Comprehensive medical history and health status tracking.</p>
          <CodeBlock
            code={`CREATE TABLE animal_health_records (
  record_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id          UUID NOT NULL REFERENCES animals(animal_id) ON DELETE CASCADE,
  record_date        DATE NOT NULL,
  record_type        VARCHAR(50),  -- Checkup | Treatment | Emergency | Surgery
  diagnosis          TEXT,
  treatment          TEXT,
  medications        TEXT,
  vet_id             UUID REFERENCES users(user_id),
  holding_id         INTEGER REFERENCES holdings(holding_id),
  health_status      health_status_enum,  -- Healthy | Sick | Under Treatment | Quarantined
  follow_up_date     DATE,
  cost               NUMERIC(10, 2),
  notes              TEXT,
  created_at         TIMESTAMP DEFAULT NOW()
);`}
            language="sql"
          />

          <h3>8. Animal Movements</h3>
          <p>Track animal transfers between holdings with approval workflow.</p>
          <CodeBlock
            code={`CREATE TABLE animal_movements (
  movement_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id          UUID NOT NULL REFERENCES animals(animal_id) ON DELETE CASCADE,
  from_holding_id    INTEGER REFERENCES holdings(holding_id),
  to_holding_id      INTEGER REFERENCES holdings(holding_id),
  movement_type      movement_type_enum NOT NULL,  -- Sale | Transfer | Loan | Exhibition | Slaughter
  movement_date      DATE NOT NULL,
  departure_date     DATE,
  arrival_date       DATE,
  transport_details  TEXT,
  reason             TEXT,
  approved_by        UUID REFERENCES users(user_id),
  documentation      TEXT,  -- Permit/certificate numbers
  created_at         TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_movements_animal ON animal_movements(animal_id);
CREATE INDEX idx_movements_date ON animal_movements(movement_date);`}
            language="sql"
          />

          <h3>9. Ownership History</h3>
          <p>Audit trail of animal ownership changes.</p>
          <CodeBlock
            code={`CREATE TABLE ownership_history (
  history_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id          UUID NOT NULL REFERENCES animals(animal_id) ON DELETE CASCADE,
  owner_id           UUID NOT NULL REFERENCES users(user_id),
  holding_id         INTEGER REFERENCES holdings(holding_id),
  ownership_start    DATE NOT NULL,
  ownership_end      DATE,
  transfer_reason    TEXT,
  purchase_price     NUMERIC(10, 2),
  sale_price         NUMERIC(10, 2),
  created_at         TIMESTAMP DEFAULT NOW()
);`}
            language="sql"
          />

          <h3>10. Alerts</h3>
          <p>Lost/found animal notifications and emergency alerts.</p>
          <CodeBlock
            code={`CREATE TABLE alerts (
  alert_id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  animal_id          UUID REFERENCES animals(animal_id) ON DELETE CASCADE,
  alert_type         VARCHAR(50) NOT NULL,  -- Lost | Found | Stolen | Outbreak
  description        TEXT NOT NULL,
  location           TEXT,
  coordinates        POINT,  -- PostGIS for geolocation
  reported_by        UUID REFERENCES users(user_id),
  alert_date         TIMESTAMP DEFAULT NOW(),
  status             alert_status_enum DEFAULT 'Active',  -- Active | Resolved | False Alarm
  resolved_date      TIMESTAMP,
  resolution_notes   TEXT
);

CREATE INDEX idx_alerts_status ON alerts(status);
CREATE INDEX idx_alerts_date ON alerts(alert_date);`}
            language="sql"
          />

          <h2>Enums</h2>
          <p>Type-safe enumerations for data validation:</p>
          <CodeBlock
            code={`-- Area Types
CREATE TYPE area_type AS ENUM ('Region', 'District', 'Municipality');

-- Holding Types
CREATE TYPE holding_type AS ENUM ('Farm', 'Household', 'Commercial Enterprise', 'Pastoral');
CREATE TYPE holding_status AS ENUM ('Active', 'Inactive', 'Suspended');

-- Animal Types
CREATE TYPE animal_species AS ENUM ('Cattle', 'Sheep', 'Goat', 'Horse', 'Poultry', 'Dog', 'Cat', 'Other');
CREATE TYPE animal_sex AS ENUM ('Male', 'Female');
CREATE TYPE animal_status AS ENUM ('Alive', 'Deceased', 'Sold', 'Slaughtered');

-- Movement Types
CREATE TYPE movement_type AS ENUM ('Sale', 'Transfer', 'Loan', 'Exhibition', 'Slaughter');

-- Health Status
CREATE TYPE health_status AS ENUM ('Healthy', 'Sick', 'Under Treatment', 'Quarantined');

-- Alert Status
CREATE TYPE alert_status AS ENUM ('Active', 'Resolved', 'False Alarm');

-- User Types
CREATE TYPE user_role AS ENUM ('Veterinarian', 'Government Officer', 'Farmer', 'System Admin', 'Citizen');
CREATE TYPE user_status AS ENUM ('Active', 'Inactive');`}
            language="sql"
          />

          <h2>Database Management</h2>

          <h3>Migrations</h3>
          <p>Drizzle Kit manages schema changes:</p>
          <CodeBlock
            code={`# Generate migration from schema changes
pnpm run --filter=@repo/db db:generate

# Apply migrations
pnpm run --filter=@repo/db db:migrate

# Push schema directly (development)
pnpm run --filter=@repo/db db:push

# Open Drizzle Studio for visual management
pnpm run --filter=@repo/db db:studio`}
            language="bash"
          />

          <h3>Type-Safe Queries with Drizzle</h3>
          <CodeBlock
            code={`import { db, animals, chips, vaccinations } from '@repo/db';
import { eq } from 'drizzle-orm';

// Find animal with all relations
const animal = await db.query.animals.findFirst({
  where: eq(animals.officialId, 'UZ-2024-001234'),
  with: {
    microchips: true,
    vaccinations: true,
    healthRecords: true,
    currentHolding: true,
  },
});

// Complex join query
const results = await db
  .select()
  .from(animals)
  .leftJoin(chips, eq(animals.animalId, chips.animalId))
  .where(eq(chips.chipNumber, '981000000123456'));`}
            language="typescript"
          />

          <h2>Performance Considerations</h2>
          <ul>
            <li><strong>Indexes</strong> on frequently queried columns (official_id, chip_number, email)</li>
            <li><strong>Foreign keys</strong> for referential integrity</li>
            <li><strong>Connection pooling</strong> for efficient database connections</li>
            <li><strong>TimescaleDB</strong> for time-series analytics</li>
            <li><strong>Cascading deletes</strong> for data consistency</li>
          </ul>

          <h2>Data Integrity</h2>
          <ul>
            <li>UUID primary keys for distributed systems</li>
            <li>Unique constraints on identifiers (email, username, chip_number)</li>
            <li>NOT NULL constraints on essential fields</li>
            <li>Enum types for validated categorical data</li>
            <li>Timestamps for auditing (created_at, updated_at)</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
