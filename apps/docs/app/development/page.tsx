import Sidebar from '../components/Sidebar';
import { CodeBlock } from '../components/CodeBlock';

export default function Development() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-12">
        <div className="max-w-4xl mx-auto prose prose-blue">
          <h1>Development Guide</h1>
          
          <p className="lead">
            Guidelines and best practices for contributing to the Pet-Chip project.
          </p>

          <h2>Getting Started</h2>
          <p>Before contributing, make sure you've completed the <a href="/getting-started">Getting Started</a> guide.</p>

          <h2>Project Structure</h2>
          <CodeBlock
            code={`pet-chip/
├── apps/                    # Applications
│   ├── api/                # Backend API
│   ├── admin/              # Admin dashboard
│   ├── web/                # Public website
│   ├── docs/               # Documentation (this site)
│   └── queue/              # Background workers
│
├── packages/               # Shared packages
│   ├── db/                 # Database schemas
│   ├── ui/                 # UI components
│   ├── eslint-config/      # Linting rules
│   └── typescript-config/  # TypeScript settings
│
└── docker/                 # Docker configs`}
            language="text"
          />

          <h2>Coding Standards</h2>

          <h3>TypeScript</h3>
          <ul>
            <li>Use TypeScript for all new code</li>
            <li>Enable strict mode</li>
            <li>Define interfaces for all data structures</li>
            <li>Use type inference where appropriate</li>
            <li>Avoid <code>any</code> type - use <code>unknown</code> if needed</li>
          </ul>

          <h3>Code Style</h3>
          <CodeBlock
            code={`// ✅ Good: Descriptive names, proper types
interface AnimalRegistration {
  officialId: string;
  microchipNumber: string;
  species: AnimalSpecies;
  dateOfBirth: Date | null;
}

async function registerAnimal(data: AnimalRegistration): Promise<Animal> {
  // Implementation
}

// ❌ Bad: Vague names, missing types
function reg(d) {
  // Implementation
}`}
            language="typescript"
          />

          <h3>Naming Conventions</h3>
          <ul>
            <li><strong>Variables/Functions:</strong> camelCase (<code>userName</code>, <code>fetchData</code>)</li>
            <li><strong>Types/Interfaces:</strong> PascalCase (<code>AnimalData</code>, <code>UserProfile</code>)</li>
            <li><strong>Constants:</strong> UPPER_SNAKE_CASE (<code>MAX_RETRIES</code>, <code>API_BASE_URL</code>)</li>
            <li><strong>Files:</strong> kebab-case (<code>animal-controller.ts</code>, <code>auth-service.ts</code>)</li>
            <li><strong>Components:</strong> PascalCase (<code>AnimalCard.tsx</code>, <code>UserProfile.tsx</code>)</li>
          </ul>

          <h2>Git Workflow</h2>

          <h3>Branch Naming</h3>
          <CodeBlock
            code={`# Feature branches
feature/animal-search
feature/vaccination-records

# Bug fixes
fix/microchip-validation
fix/date-formatting

# Documentation
docs/api-reference
docs/deployment-guide

# Refactoring
refactor/auth-service
refactor/database-queries`}
            language="text"
          />

          <h3>Commit Messages</h3>
          <p>Use <a href="https://www.conventionalcommits.org/" target="_blank">Conventional Commits</a> format:</p>
          <CodeBlock
            code={`# Format
<type>(<scope>): <subject>

# Examples
feat(api): add animal search endpoint
fix(auth): resolve JWT expiration bug
docs(readme): update installation steps
refactor(db): optimize animal queries
test(api): add integration tests for animals
chore(deps): update drizzle-orm to v0.45.1

# Types:
# feat     - New feature
# fix      - Bug fix
# docs     - Documentation
# style    - Code style (formatting, semicolons, etc.)
# refactor - Code refactoring
# test     - Adding tests
# chore    - Maintenance tasks`}
            language="text"
          />

          <h3>Pull Request Process</h3>
          <ol>
            <li><strong>Create a branch</strong> from <code>main</code></li>
            <li><strong>Make your changes</strong> following coding standards</li>
            <li><strong>Write tests</strong> for new functionality</li>
            <li><strong>Run linters</strong>: <code>pnpm run lint</code></li>
            <li><strong>Commit changes</strong> with conventional commits</li>
            <li><strong>Push to your branch</strong></li>
            <li><strong>Create Pull Request</strong> with description</li>
            <li><strong>Wait for review</strong> and address feedback</li>
            <li><strong>Merge</strong> after approval</li>
          </ol>

          <h2>Testing</h2>

          <h3>Unit Tests</h3>
          <CodeBlock
            code={`// Example unit test
import { describe, test, expect } from 'bun:test';
import { validateMicrochip } from './microchip-service';

describe('Microchip Validation', () => {
  test('should validate correct ISO microchip number', async () => {
    const result = await validateMicrochip('981000000123456');
    expect(result.isValid).toBe(true);
    expect(result.manufacturer).toBeDefined();
  });

  test('should reject invalid microchip number', async () => {
    const result = await validateMicrochip('invalid');
    expect(result.isValid).toBe(false);
    expect(result.error).toBeDefined();
  });
});`}
            language="typescript"
          />

          <h3>Running Tests</h3>
          <CodeBlock
            code={`# Run all tests
pnpm test

# Run tests for specific package
pnpm run --filter=api test

# Watch mode
pnpm test --watch

# Coverage report
pnpm test --coverage`}
            language="bash"
          />

          <h2>Database Changes</h2>

          <h3>Schema Changes</h3>
          <ol>
            <li>Update schema in <code>packages/db/src/schema.ts</code></li>
            <li>Generate migration: <code>pnpm run --filter=@repo/db db:generate</code></li>
            <li>Review generated SQL in <code>packages/db/drizzle/</code></li>
            <li>Test migration in development</li>
            <li>Commit both schema and migration files</li>
          </ol>

          <h3>Example Schema Addition</h3>
          <CodeBlock
            code={`// packages/db/src/schema.ts
export const animalPhotos = pgTable('animal_photos', {
  photoId: uuid('photo_id').primaryKey().defaultRandom(),
  animalId: uuid('animal_id').references(() => animals.animalId).notNull(),
  photoUrl: text('photo_url').notNull(),
  caption: text('caption'),
  uploadedBy: uuid('uploaded_by').references(() => users.userId),
  uploadedAt: timestamp('uploaded_at').defaultNow(),
});

// Define relations
export const animalPhotosRelations = relations(animalPhotos, ({ one }) => ({
  animal: one(animals, {
    fields: [animalPhotos.animalId],
    references: [animals.animalId],
  }),
  uploader: one(users, {
    fields: [animalPhotos.uploadedBy],
    references: [users.userId],
  }),
}));`}
            language="typescript"
          />

          <h2>API Development</h2>

          <h3>Adding New Endpoints</h3>
          <ol>
            <li>Create controller in <code>apps/api/src/controllers/</code></li>
            <li>Add service logic in <code>apps/api/src/services/</code></li>
            <li>Define routes in <code>apps/api/src/routes/</code></li>
            <li>Add TypeScript types in <code>apps/api/src/types/</code></li>
            <li>Document in Swagger/OpenAPI</li>
          </ol>

          <h3>Example API Endpoint</h3>
          <CodeBlock
            code={`// apps/api/src/controllers/photoController.ts
export async function uploadPhoto(animalId: string, file: File) {
  // Validate animal exists
  const animal = await db.query.animals.findFirst({
    where: eq(animals.animalId, animalId),
  });
  
  if (!animal) {
    throw new NotFoundError('Animal not found');
  }
  
  // Upload file (implement storage service)
  const photoUrl = await uploadToStorage(file);
  
  // Save to database
  const photo = await db.insert(animalPhotos).values({
    animalId,
    photoUrl,
    uploadedBy: req.user.userId,
  }).returning();
  
  return photo[0];
}`}
            language="typescript"
          />

          <h2>Common Tasks</h2>

          <h3>Adding a New Package</h3>
          <CodeBlock
            code={`# Create package directory
mkdir -p packages/my-package

# Initialize package.json
cd packages/my-package
pnpm init

# Add to workspace (already configured in pnpm-workspace.yaml)

# Install in other packages
cd apps/api
pnpm add @repo/my-package`}
            language="bash"
          />

          <h3>Debugging</h3>
          <CodeBlock
            code={`// Use logger instead of console.log
import { logger } from '../utils/logger';

logger.info('Processing animal registration', { animalId });
logger.warn('Microchip already registered', { chipNumber });
logger.error('Database connection failed', error);

// Debug mode
LOG_LEVEL=debug pnpm run dev`}
            language="typescript"
          />

          <h2>Performance Guidelines</h2>
          <ul>
            <li>Use database indexes for frequently queried columns</li>
            <li>Implement pagination for list endpoints</li>
            <li>Cache frequently accessed data in Redis</li>
            <li>Use database transactions for multi-step operations</li>
            <li>Optimize images before uploading</li>
            <li>Lazy load components in frontend</li>
          </ul>

          <h2>Security Best Practices</h2>
          <ul>
            <li>Always validate and sanitize user input</li>
            <li>Use parameterized queries (Drizzle ORM does this)</li>
            <li>Never log sensitive data (passwords, tokens)</li>
            <li>Implement rate limiting on public endpoints</li>
            <li>Use HTTPS in production</li>
            <li>Keep dependencies updated</li>
            <li>Follow principle of least privilege</li>
          </ul>

          <h2>Getting Help</h2>
          <ul>
            <li>Check existing <a href="https://github.com/your-repo/issues">GitHub Issues</a></li>
            <li>Review <a href="/api">API Documentation</a></li>
            <li>Read <a href="/architecture">Architecture Guide</a></li>
            <li>Ask in team Slack/Discord channel</li>
            <li>Create new issue if needed</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
