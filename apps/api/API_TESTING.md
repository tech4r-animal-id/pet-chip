# API Testing Guide

Complete guide for testing the Pet-Chip API endpoints.

## Quick Start

1. Ensure Docker services are running:
   ```bash
   cd d:\UNV\pet-chip
   bun run docker:up
   ```

2. Push database schema:
   ```bash
   bun run --filter=@repo/db db:push
   ```

3. Start API server:
   ```bash
   cd apps/api
   bun run dev
   ```

4. Access Swagger documentation:
   ```
   http://localhost:3002/swagger
   ```

## Test Endpoints

### 1. Register a New Animal

**POST** `http://localhost:3002/api/v1/animals`

**Headers:**
```json
{
  "Content-Type": "application/json"
}
```

**Body:**
```json
{
  "microchipNumber": "981200012345678",
  "officialId": "UZB-2024-001",
  "species": "Cat",
  "breed": "Domestic Shorthair",
  "sex": "Female",
  "dateOfBirth": "2023-05-15",
  "status": "Alive",
  "currentHoldingId": 1,
  "birthHoldingId": 1
}
```

**Expected Response (201):**
```json
{
  "message": "Animal registered successfully",
  "data": {
    "animalId": "uuid-here",
    "officialId": "UZB-2024-001",
    "species": "Cat",
    ...
  }
}
```

### 2. Search Animal by Microchip

**GET** `http://localhost:3002/api/v1/animals?search=981200012345678`

**Expected Response (200):**
```json
{
  "data": {
    "animal": { ... },
    "owner": null,
    "medicalRecords": []
  }
}
```

### 3. Validate Microchip

**GET** `http://localhost:3002/api/v1/integrations/microchip/981200012345678`

**Expected Response (200):**
```json
{
  "microchipNumber": "981200012345678",
  "isValid": true,
  "manufacturer": "HomeAgain",
  "implantDate": "2024-01-10",
  "implanterClinicId": "CLINIC-12345"
}
```

### 4. Add Medical Record

**POST** `http://localhost:3002/api/v1/animals/{animalId}/medical-records`

**Body:**
```json
{
  "procedureType": "VACCINATION_RABIES",
  "procedureDate": "2024-05-20",
  "nextDueDate": "2025-05-20",
  "veterinarianName": "Dr. Alimov",
  "notes": "Animal healthy and responsive",
  "holdingId": 1,
  "healthStatus": "Healthy",
  "diagnosis": "Rabies vaccination administered",
  "treatmentAdministered": "Rabivac vaccine"
}
```

### 5. Vaccination Coverage Report

**GET** `http://localhost:3002/api/v1/reports/vaccination-coverage`

**Query Parameters:**
- `startDate` (optional): YYYY-MM-DD
- `endDate` (optional): YYYY-MM-DD
- `mahalla` (optional): holding name filter

**Expected Response:**
```json
{
  "data": {
    "summary": {
      "totalAnimals": 150,
      "vaccinatedAnimals": 120,
      "coverageRate": 0.8,
      "dateRange": {
        "start": "2023-05-20",
        "end": "2024-05-20"
      }
    },
    "details": [
      {
        "mahalla": "Farm A",
        "type": "Farm",
        "total": 50,
        "vaccinated": 45,
        "coverageRate": 0.9
      }
    ]
  }
}
```

### 6. Animal Statistics

**GET** `http://localhost:3002/api/v1/reports/animal-statistics`

**Expected Response:**
```json
{
  "data": {
    "totalRegistered": 150,
    "bySpecies": [
      { "species": "Cattle", "count": 80 },
      { "species": "Sheep", "count": 50 }
    ],
    "byStatus": [
      { "status": "Alive", "count": 140 },
      { "status": "Sold", "count": 10 }
    ],
    "bySex": [
      { "sex": "Male", "count": 75 },
      { "sex": "Female", "count": 75 }
    ]
  }
}
```

## Setup Test Data

Before testing, you need to create a holding:

```sql
-- Connect to database and run:
INSERT INTO holdings (holding_name, holding_type, owner_name, area_id, registration_date)
VALUES ('Test Farm', 'Farm', 'Test Owner', 1, CURRENT_DATE);

-- Create administrative area first if needed:
INSERT INTO administrative_areas (area_name, area_type, code)
VALUES ('Tashkent', 'Region', 'TAS-01');
```

Or use Drizzle Studio:
```bash
bun run --filter=@repo/db db:studio
```

## Thunder Client Collection

Import this collection into Thunder Client:

```json
{
  "client": "Thunder Client",
  "collectionName": "Pet-Chip API",
  "collectionId": "pet-chip-api",
  "requests": [
    {
      "name": "Register Animal",
      "method": "POST",
      "url": "http://localhost:3002/api/v1/animals",
      "body": {
        "type": "json",
        "raw": "{\n  \"microchipNumber\": \"981200012345678\",\n  \"officialId\": \"UZB-2024-001\",\n  \"species\": \"Cat\",\n  \"breed\": \"Domestic Shorthair\",\n  \"sex\": \"Female\",\n  \"dateOfBirth\": \"2023-05-15\",\n  \"currentHoldingId\": 1,\n  \"birthHoldingId\": 1\n}"
      }
    }
  ]
} ```

## Common Issues

### Error: "Animal with official ID already exists"
- Use a different `officialId`
- Check existing records in database

### Error: "Failed to create animal record"
- Verify `currentHoldingId` and `birthHoldingId` exist in holdings table
- Create holdings first using Drizzle Studio

### Error: "Invalid microchip format"
- Microchip must be exactly 15 digits
- Use format: 981200012345678

## Next Steps

1. Test all endpoints manually
2. Create automated test suite
3. Generate Postman collection
4. Document error responses
