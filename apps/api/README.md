# Pet-Chip API

ElysiaJS REST API for the Animal Identification and Management Platform.

## Features

- ✅ Animal registration and management
- ✅ Microchip validation (ISO 11784/11785)
- ✅ Medical records and vaccinations
- ✅ Vaccination coverage reports
- ✅ Animal statistics and analytics
- ✅ Swagger/OpenAPI documentation
- ✅ Type-safe with Drizzle ORM

## API Endpoints

### Animals

- `POST /api/v1/animals` - Register new animal
- `GET /api/v1/animals?search={id}` - Search by microchip/official ID
- `GET /api/v1/animals/{id}` - Get animal by UUID
- `PUT /api/v1/animals/{id}` - Update animal

### Medical Records

- `POST /api/v1/animals/{id}/medical-records` - Add medical record

### Reports

- `GET /api/v1/reports/vaccination-coverage` - Vaccination coverage
- `GET /api/v1/reports/animal-statistics` - General statistics
- `GET /api/v1/reports/recent-registrations` - Recent animals

### Integrations

- `GET /api/v1/integrations/microchip/{number}` - Validate microchip

## Development

```bash
# Start dev server with hot reload
bun run dev

# Build for production
bun run build
```

## Environment Variables

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/petchip
PORT=3002
NODE_ENV=development
```

## Documentation

API documentation available at: `http://localhost:3002/swagger`

## Technology Stack

- **Runtime**: Bun
- **Framework**: ElysiaJS
- **Database**: PostgreSQL with Drizzle ORM
- **Validation**: ElysiaJS Type System
- **Documentation**: Swagger/OpenAPI
