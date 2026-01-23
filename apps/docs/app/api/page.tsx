import Sidebar from '../components/Sidebar';
import { CodeBlock } from '../components/CodeBlock';

export default function APIReference() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-12">
        <div className="max-w-4xl mx-auto prose prose-blue">
          <h1>API Reference</h1>
          
          <p className="lead">
            The Pet-Chip API is a RESTful API built with ElysiaJS. All endpoints return JSON responses
            and use standard HTTP status codes.
          </p>

          <h2>Base URL</h2>
          <CodeBlock
            code={`Development: http://localhost:3002
Production:  https://api.animalid.uz`}
            language="text"
          />

          <h2>Authentication</h2>
          <p>Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:</p>
          <CodeBlock
            code={`Authorization: Bearer <your-jwt-token>`}
            language="http"
          />

          <h3>Login</h3>
          <p><strong>POST</strong> <code>/api/v1/auth/login</code></p>
          <CodeBlock
            code={`// Request
{
  "email": "user@example.com",
  "password": "your-password"
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "johndoe",
    "userRole": "Farmer",
    "fullName": "John Doe"
  }
}`}
            language="json"
          />

          <h3>Register</h3>
          <p><strong>POST</strong> <code>/api/v1/auth/register</code></p>
          <CodeBlock
            code={`// Request
{
  "username": "johndoe",
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phoneNumber": "+998901234567",
  "userRole": "Farmer",
  "areaId": 1
}

// Response
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "username": "johndoe",
    "userRole": "Farmer"
  }
}`}
            language="json"
          />

          <h2>Animals</h2>

          <h3>Register Animal</h3>
          <p><strong>POST</strong> <code>/api/v1/animals</code></p>
          <p>Register a new animal in the system with microchip validation.</p>
          <CodeBlock
            code={`// Request
{
  "officialId": "UZ-2024-001234",
  "microchipNumber": "981000000123456",
  "species": "Cattle",
  "breed": "Holstein",
  "sex": "Female",
  "dateOfBirth": "2023-05-15",
  "currentHoldingId": 1,
  "birthHoldingId": 1,
  "ownerId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "Alive"
}

// Response
{
  "animalId": "660e8400-e29b-41d4-a716-446655440001",
  "officialId": "UZ-2024-001234",
  "species": "Cattle",
  "breed": "Holstein",
  "microchip": {
    "chipId": "770e8400-e29b-41d4-a716-446655440002",
    "chipNumber": "981000000123456",
    "manufacturer": "ISO-compliant",
    "isActive": true
  },
  "createdAt": "2026-01-23T11:00:00.000Z"
}`}
            language="json"
          />

          <h3>Search Animals</h3>
          <p><strong>GET</strong> <code>/api/v1/animals?search=&#123;query&#125;</code></p>
          <p>Search for animals by microchip number or official ID.</p>
          <CodeBlock
            code={`// Request
GET /api/v1/animals?search=981000000123456

// Response
{
  "results": [
    {
      "animalId": "660e8400-e29b-41d4-a716-446655440001",
      "officialId": "UZ-2024-001234",
      "species": "Cattle",
      "breed": "Holstein",
      "sex": "Female",
      "status": "Alive",
      "microchips": [
        {
          "chipNumber": "981000000123456",
          "isActive": true
        }
      ],
      "currentHolding": {
        "holdingId": 1,
        "holdingName": "Green Valley Farm"
      }
    }
  ],
  "count": 1
}`}
            language="json"
          />

          <h3>Get Animal by ID</h3>
          <p><strong>GET</strong> <code>/api/v1/animals/&#123;id&#125;</code></p>
          <CodeBlock
            code={`// Request
GET /api/v1/animals/660e8400-e29b-41d4-a716-446655440001

// Response
{
  "animalId": "660e8400-e29b-41d4-a716-446655440001",
  "officialId": "UZ-2024-001234",
  "species": "Cattle",
  "breed": "Holstein",
  "sex": "Female",
  "dateOfBirth": "2023-05-15",
  "status": "Alive",
  "microchips": [...],
  "vaccinations": [...],
  "healthRecords": [...],
  "ownershipHistory": [...]
}`}
            language="json"
          />

          <h3>Update Animal</h3>
          <p><strong>PUT</strong> <code>/api/v1/animals/&#123;id&#125;</code></p>
          <CodeBlock
            code={`// Request
{
  "status": "Sold",
  "currentHoldingId": 2
}

// Response
{
  "animalId": "660e8400-e29b-41d4-a716-446655440001",
  "status": "Sold",
  "currentHoldingId": 2,
  "updatedAt": "2026-01-23T12:00:00.000Z"
}`}
            language="json"
          />

          <h2>Medical Records</h2>

          <h3>Add Medical Record</h3>
          <p><strong>POST</strong> <code>/api/v1/animals/&#123;id&#125;/medical-records</code></p>
          <CodeBlock
            code={`// Request
{
  "recordType": "Vaccination",
  "diagnosis": "Rabies vaccination",
  "treatment": "Rabies vaccine administered",
  "vetId": "550e8400-e29b-41d4-a716-446655440003",
  "healthStatus": "Healthy",
  "notes": "Annual vaccination, no adverse reactions"
}

// Response
{
  "recordId": "880e8400-e29b-41d4-a716-446655440004",
  "animalId": "660e8400-e29b-41d4-a716-446655440001",
  "recordType": "Vaccination",
  "diagnosis": "Rabies vaccination",
  "recordDate": "2026-01-23T11:00:00.000Z"
}`}
            language="json"
          />

          <h2>Reports</h2>

          <h3>Vaccination Coverage</h3>
          <p><strong>GET</strong> <code>/api/v1/reports/vaccination-coverage</code></p>
          <CodeBlock
            code={`// Response
{
  "totalAnimals": 1250,
  "vaccinatedAnimals": 1180,
  "coveragePercentage": 94.4,
  "bySpecies": {
    "Cattle": { "total": 800, "vaccinated": 760 },
    "Sheep": { "total": 300, "vaccinated": 285 },
    "Goat": { "total": 150, "vaccinated": 135 }
  }
}`}
            language="json"
          />

          <h3>Animal Statistics</h3>
          <p><strong>GET</strong> <code>/api/v1/reports/animal-statistics</code></p>
          <CodeBlock
            code={`// Response
{
  "totalAnimals": 1250,
  "bySpecies": {
    "Cattle": 800,
    "Sheep": 300,
    "Goat": 150
  },
  "byStatus": {
    "Alive": 1180,
    "Deceased": 50,
    "Sold": 20
  },
  "recentRegistrations": 45
}`}
            language="json"
          />

          <h2>Error Responses</h2>
          <p>The API uses standard HTTP status codes and returns errors in the following format:</p>
          <CodeBlock
            code={`{
  "error": "Resource not found",
  "statusCode": 404
}

// Common Status Codes:
// 200 - Success
// 201 - Created
// 400 - Bad Request (validation error)
// 401 - Unauthorized (missing/invalid token)
// 403 - Forbidden (insufficient permissions)
// 404 - Not Found
// 409 - Conflict (duplicate resource)
// 500 - Internal Server Error`}
            language="json"
          />

          <h2>Rate Limiting</h2>
          <p>API requests are rate-limited to prevent abuse:</p>
          <ul>
            <li><strong>Authenticated requests:</strong> 1000 requests per hour</li>
            <li><strong>Unauthenticated requests:</strong> 100 requests per hour</li>
          </ul>

          <h2>Interactive Documentation</h2>
          <p>
            For a complete interactive API documentation with the ability to test endpoints,
            visit <a href="http://localhost:3002/swagger" target="_blank">Swagger UI</a> when running the development server.
          </p>
        </div>
      </main>
    </div>
  );
}
