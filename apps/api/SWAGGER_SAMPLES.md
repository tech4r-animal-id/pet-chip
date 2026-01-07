# Swagger API Testing - Sample Data

## Quick Setup

### 1. Load Sample Data into Database

```bash
# Connect to PostgreSQL and run the sample data script
psql -h localhost -U postgres -d petchip -f apps/api/sample-data.sql

# Or using Bun with the database URL
cat apps/api/sample-data.sql | psql $DATABASE_URL
```

### 2. Open Swagger UI

Navigate to: **http://localhost:3002/swagger**

---

## Sample Requests for Each Endpoint

### 1. Register Animal (POST /api/v1/animals)

Click **"Try it out"** on the POST /api/v1/animals endpoint, then paste this JSON:

#### Example 1: Register a Cat
```json
{
  "microchipNumber": "981200012345678",
  "officialId": "UZB-2024-CAT-001",
  "species": "Cat",
  "breed": "Domestic Shorthair",
  "sex": "Female",
  "dateOfBirth": "2023-05-15",
  "currentHoldingId": 3,
  "birthHoldingId": 3
}
```

#### Example 2: Register Cattle
```json
{
  "microchipNumber": "981200012345679",
  "officialId": "UZB-2024-CATTLE-001",
  "species": "Cattle",
  "breed": "Holstein",
  "sex": "Male",
  "dateOfBirth": "2022-03-10",
  "currentHoldingId": 1,
  "birthHoldingId": 1
}
```

#### Example 3: Register a Dog
```json
{
  "microchipNumber": "981200012345680",
  "officialId": "UZB-2024-DOG-001",
  "species": "Dog",
  "breed": "German Shepherd",
  "sex": "Male",
  "dateOfBirth": "2023-01-20",
  "currentHoldingId": 3,
  "birthHoldingId": 3
}
```

#### Example 4: Register Sheep
```json
{
  "microchipNumber": "981200012345681",
  "officialId": "UZB-2024-SHEEP-001",
  "species": "Sheep",
  "breed": "Karakul",
  "sex": "Female",
  "dateOfBirth": "2023-08-05",
  "currentHoldingId": 4,
  "birthHoldingId": 4
}
```

---

### 2. Search Animal (GET /api/v1/animals)

In the **search** parameter field, enter one of:
- `981200012345678` (microchip number)
- `UZB-2024-CAT-001` (official ID)

Expected: Full animal record with holdings, chips, medical records, owner info

---

### 3. Validate Microchip (GET /api/v1/integrations/microchip/{microchipNumber})

In the **microchipNumber** field, enter:
- `981200012345678` ✅ Valid (HomeAgain)
- `981200012345679` ✅ Valid (PetLink)
- `123456789012345` ✅ Valid format (Unknown manufacturer)
- `12345` ❌ Invalid (not 15 digits)

---

### 4. Add Medical Record (POST /api/v1/animals/{id}/medical-records)

**Steps:**
1. First, register an animal or search for one to get the animal ID (UUID)
2. Copy the `animalId` from the response
3. Use it in the URL path
4. Paste this JSON in the body:

```json
{
  "procedureType": "VACCINATION_RABIES",
  "procedureDate": "2024-05-20",
  "nextDueDate": "2025-05-20",
  "veterinarianName": "Dr. Jamshid Alimov",
  "notes": "Animal was healthy and responsive. No adverse reactions.",
  "holdingId": 3,
  "healthStatus": "Healthy",
  "diagnosis": "Routine rabies vaccination administered",
  "treatmentAdministered": "Rabivac vaccine - 1ml subcutaneous injection"
}
```

#### More Medical Record Examples:

**Sterilization:**
```json
{
  "procedureType": "STERILIZATION",
  "procedureDate": "2024-04-15",
  "veterinarianName": "Dr. Nargiza Yusupova",
  "notes": "Routine spay procedure completed successfully",
  "holdingId": 5,
  "healthStatus": "Under Treatment",
  "diagnosis": "Ovariohysterectomy performed",
  "treatmentAdministered": "Surgical sterilization. Post-op antibiotics prescribed."
}
```

**Deworming:**
```json
{
  "procedureType": "DEWORMING",
  "procedureDate": "2024-06-01",
  "veterinarianName": "Dr. Jamshid Alimov",
  "holdingId": 1,
  "healthStatus": "Healthy",
  "diagnosis": "Routine parasite control",
  "treatmentAdministered": "Ivermectin 200mcg/kg oral dose"
}
```

---

### 5. Vaccination Coverage Report (GET /api/v1/reports/vaccination-coverage)

**Query Parameters** (all optional):
- `startDate`: 2023-01-01
- `endDate`: 2024-12-31
- `mahalla`: Green Valley Farm

**Try these combinations:**
1. No parameters (all data, last 12 months)
2. With date range: `startDate=2024-01-01&endDate=2024-12-31`
3. With mahalla filter: `mahalla=Green`

---

### 6. Animal Statistics (GET /api/v1/reports/animal-statistics)

Just click **"Execute"** - no parameters needed!

Expected response:
```json
{
  "data": {
    "totalRegistered": 4,
    "bySpecies": [
      { "species": "Cat", "count": 1 },
      { "species": "Cattle", "count": 1 },
      { "species": "Dog", "count": 1 },
      { "species": "Sheep", "count": 1 }
    ],
    "byStatus": [
      { "status": "Alive", "count": 4 }
    ],
    "bySex": [
      { "sex": "Male", "count": 2 },
      { "sex": "Female", "count": 2 }
    ]
  }
}
```

---

### 7. Recent Registrations (GET /api/v1/reports/recent-registrations)

**Query Parameters:**
- `limit`: 5 (optional, default 10)

Shows the most recently registered animals.

---

## Testing Workflow

### Complete Test Sequence:

1. **Load sample data** (run SQL script first)
2. **Validate a microchip** (GET /integrations/microchip/981200012345678)
3. **Register first animal** (POST /animals) - Cat
4. **Search for the cat** (GET /animals?search=981200012345678)
5. **Add vaccination record** (POST /animals/{id}/medical-records)
6. **Register more animals** (Cattle, Dog, Sheep)
7. **Check statistics** (GET /reports/animal-statistics)
8. **View vaccination coverage** (GET /reports/vaccination-coverage)
9. **See recent registrations** (GET /reports/recent-registrations)

---

## Available Test Data

### Holdings (use these IDs)
- **1** - Green Valley Farm (Farm, Tashkent)
- **2** - Sunrise Dairy (Commercial, Tashkent)
- **3** - Family Household - Alimov (Household, Tashkent)
- **4** - Mountain View Ranch (Pastoral, Samarkand)
- **5** - City Veterinary Clinic (Commercial, Tashkent)

### Microchip Numbers (pre-validated)
- 981200012345678 (HomeAgain)
- 981200012345679 (PetLink)
- 981200012345680 (AKC Reunite)
- Any 15-digit number starting with 981 (Uzbekistan)

### Species Options
- Cattle
- Sheep
- Goat
- Horse
- Poultry
- Dog
- Cat
- Other

### Sex Options
- Male
- Female

### Status Options (optional, defaults to "Alive")
- Alive
- Deceased
- Sold
- Slaughtered

---

## Troubleshooting

### Error: "Animal with official ID already exists"
- Use a different officialId (increment the number: UZB-2024-CAT-002, etc.)

### Error: "Microchip already registered"
- Use a different 15-digit microchip number

### Error: "Failed to create animal record"
- Check that holding_id exists (should be 1-5 with sample data)
- Verify database connection

### Error: "Invalid microchip format"
- Chip number must be exactly 15 digits
- Use format: 981200012345678

---

## Quick Copy-Paste for Swagger

**Register Animal:**
```
{
  "microchipNumber": "981200012345678",
  "officialId": "UZB-2024-CAT-001",
  "species": "Cat",
  "breed": "Domestic Shorthair",
  "sex": "Female",
  "dateOfBirth": "2023-05-15",
  "currentHoldingId": 3,
  "birthHoldingId": 3
}
```

**Add Medical Record:**
```
{
  "procedureType": "VACCINATION_RABIES",
  "procedureDate": "2024-05-20",
  "veterinarianName": "Dr. Alimov",
  "holdingId": 3,
  "healthStatus": "Healthy",
  "diagnosis": "Rabies vaccination",
  "treatmentAdministered": "Rabivac vaccine"
}
```

Happy testing! 🧪🦊
