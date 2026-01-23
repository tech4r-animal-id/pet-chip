import Sidebar from '../components/Sidebar';
import { CodeBlock } from '../components/CodeBlock';

export default function Architecture() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-12">
        <div className="max-w-4xl mx-auto prose prose-blue">
          <h1>Architecture Overview</h1>
          
          <p className="lead">
            Pet-Chip is built as a modern monorepo using Turborepo, enabling efficient development
            and deployment of multiple interconnected applications.
          </p>

          <h2>System Architecture</h2>
          <div className="bg-gray-50 p-6 rounded-lg my-6 not-prose">
            <pre className="text-sm">
{`┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├───────────────┬───────────────┬──────────────┬──────────────────┤
│  Web App      │  Admin App    │  Docs App    │  Mobile (Future) │
│  (Next.js)    │  (Next.js)    │  (Next.js)   │                  │
│  Port 3000    │  Port 3003    │  Port 3001   │                  │
└───────────────┴───────────────┴──────────────┴──────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│                  ElysiaJS REST API (Bun)                        │
│                       Port 3002                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Controllers │ Services │ Middleware │ Routes           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      QUEUE LAYER                                │
├─────────────────────────────────────────────────────────────────┤
│              Background Jobs & Workers                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Email Notifications │ Report Generation │ Data Sync     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├──────────────────┬──────────────────┬─────────────────────────┤
│  PostgreSQL      │  TimescaleDB     │  Redis                  │
│  (Primary DB)    │  (Time-Series)   │  (Cache/Sessions)       │
│  Port 5432       │  Port 5433       │  Port 6379              │
└──────────────────┴──────────────────┴─────────────────────────┘`}
            </pre>
          </div>

          <h2>Monorepo Structure</h2>
          <CodeBlock
            code={`pet-chip/
├── apps/                    # Applications
│   ├── api/                # ElysiaJS REST API (Bun runtime)
│   ├── admin/              # Admin dashboard (Next.js)
│   ├── web/                # Public website (Next.js)
│   ├── docs/               # Documentation site (Next.js)
│   └── queue/              # Background job processor (Bun)
│
├── packages/               # Shared packages
│   ├── db/                 # Database schema & Drizzle ORM
│   ├── ui/                 # Shared React components
│   ├── eslint-config/      # ESLint configurations
│   └── typescript-config/  # TypeScript configurations
│
├── docker/                 # Docker configuration
│   ├── postgres/           # PostgreSQL init scripts
│   └── timescaledb/        # TimescaleDB init scripts
│
└── docker-compose.yml      # Service orchestration`}
            language="text"
          />

          <h2>Technology Stack</h2>

          <h3>Frontend</h3>
          <ul>
            <li><strong>Next.js 16</strong> - React framework with App Router</li>
            <li><strong>React 19</strong> - UI library</li>
            <li><strong>Tailwind CSS v4</strong> - Utility-first CSS framework</li>
            <li><strong>TypeScript 5</strong> - Type safety</li>
          </ul>

          <h3>Backend</h3>
          <ul>
            <li><strong>Bun</strong> - Fast JavaScript runtime</li>
            <li><strong>ElysiaJS</strong> - Type-safe web framework</li>
            <li><strong>Drizzle ORM</strong> - Type-safe SQL ORM</li>
            <li><strong>JWT</strong> - Authentication tokens</li>
            <li><strong>bcrypt</strong> - Password hashing</li>
          </ul>

          <h3>Database & Infrastructure</h3>
          <ul>
            <li><strong>PostgreSQL 16</strong> - Primary relational database</li>
            <li><strong>TimescaleDB</strong> - Time-series data (tracking, analytics)</li>
            <li><strong>Redis 7</strong> - Caching and session management</li>
            <li><strong>Docker</strong> - Containerization</li>
          </ul>

          <h3>Development Tools</h3>
          <ul>
            <li><strong>Turborepo</strong> - Build system and monorepo management</li>
            <li><strong>pnpm</strong> - Fast, disk-efficient package manager</li>
            <li><strong>ESLint</strong> - Code linting</li>
            <li><strong>Prettier</strong> - Code formatting</li>
          </ul>

          <h2>Design Patterns</h2>

          <h3>API Layer (MVC Pattern)</h3>
          <CodeBlock
            code={`apps/api/src/
├── controllers/        # Handle HTTP requests
│   └── animalController.ts
├── services/          # Business logic
│   └── microchipService.ts
├── middleware/        # Request processing
│   └── auth.ts
├── routes/            # API endpoints
│   └── animalRoutes.ts
├── types/             # TypeScript definitions
│   └── api.ts
└── utils/             # Helper functions
    ├── errors.ts
    ├── logger.ts
    └── sanitize.ts`}
            language="text"
          />

          <h3>Shared Database Package</h3>
          <p>The <code>@repo/db</code> package is used across all applications for type-safe database access:</p>
          <CodeBlock
            code={`import { db, animals, chips } from '@repo/db';

// Type-safe queries
const animal = await db.query.animals.findFirst({
  where: eq(animals.animalId, id),
  with: {
    microchips: true,
    vaccinations: true,
  },
});`}
            language="typescript"
          />

          <h2>Data Flow</h2>

          <h3>Animal Registration Example</h3>
          <ol>
            <li><strong>Client</strong> sends POST request to <code>/api/v1/animals</code></li>
            <li><strong>Auth Middleware</strong> validates JWT token</li>
            <li><strong>Router</strong> forwards to <code>animalController.registerAnimal()</code></li>
            <li><strong>Controller</strong> validates input and calls services</li>
            <li><strong>Microchip Service</strong> validates ISO 11784/11785 compliance</li>
            <li><strong>Database Transaction</strong> creates animal + chip records atomically</li>
            <li><strong>Queue</strong> triggers background job for notifications</li>
            <li><strong>Response</strong> returns created animal with 201 status</li>
          </ol>

          <h2>Security Architecture</h2>

          <h3>Authentication Flow</h3>
          <CodeBlock
            code={`1. User submits credentials → /api/v1/auth/login
2. Password verified with bcrypt
3. JWT access token (1h) + refresh token (7d) generated
4. Tokens returned to client
5. Client includes access token in Authorization header
6. API validates token on each request
7. On expiry, client uses refresh token to get new access token`}
            language="text"
          />

          <h3>Authorization</h3>
          <p>Role-based access control with 5 user roles:</p>
          <ul>
            <li><strong>System Admin</strong> - Full system access</li>
            <li><strong>Government Officer</strong> - Regional management, reports</li>
            <li><strong>Veterinarian</strong> - Medical records, vaccinations</li>
            <li><strong>Farmer</strong> - Own animals and holdings</li>
            <li><strong>Citizen</strong> - Pet registration and tracking</li>
          </ul>

          <h2>Scalability Considerations</h2>

          <h3>Horizontal Scaling</h3>
          <ul>
            <li>Stateless API servers (JWT-based auth)</li>
            <li>Redis for shared session storage</li>
            <li>Database connection pooling</li>
            <li>Load balancer ready (NGINX/Caddy)</li>
          </ul>

          <h3>Performance Optimizations</h3>
          <ul>
            <li>TimescaleDB for efficient time-series queries</li>
            <li>Redis caching for frequently accessed data</li>
            <li>Database indexes on foreign keys and search columns</li>
            <li>Turbo caching for builds</li>
            <li>Bun runtime for fast JavaScript execution</li>
          </ul>

          <h2>Future Enhancements</h2>
          <ul>
            <li>GraphQL API layer for flexible querying</li>
            <li>Mobile applications (React Native)</li>
            <li>Real-time notifications with WebSockets</li>
            <li>Microservices architecture for scale</li>
            <li>Machine learning for health predictions</li>
            <li>GIS integration with PostGIS for location tracking</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
