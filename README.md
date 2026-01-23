# Pet-Chip 🐾

**Animal Identification and Management Platform for Uzbekistan**

A comprehensive system for tracking livestock and pets through microchip registration, health records, vaccination monitoring, and movement tracking across administrative regions.

## 🚀 Features

- **Animal Registry** - Complete animal identification with microchip validation (ISO 11784/11785)
- **Health Records** - Vaccination tracking, medical history, and health status monitoring
- **Movement Tracking** - Animal transfers between holdings with approval workflow
- **Administrative Hierarchy** - Region → District → Municipality management
- **Holdings Management** - Farms, households, and commercial enterprises
- **Analytics & Reports** - Vaccination coverage, statistics, and compliance reports
- **Role-Based Access** - System Admin, Government Officer, Veterinarian, Farmer, Citizen
- **API-First Design** - RESTful API with comprehensive Swagger documentation

## 📦 What's Inside?

This Turborepo monorepo includes the following applications and packages:

### Applications

- **`api`** - ElysiaJS REST API with Bun runtime (Port 3002)
- **`admin`** - Next.js admin dashboard for system management (Port 3003)
- **`web`** - Next.js public-facing website (Port 3000)
- **`docs`** - Next.js documentation site (Port 3001)
- **`queue`** - Background job processor for notifications and reports

### Shared Packages

- **`@repo/db`** - Database schemas, Drizzle ORM, and migrations
- **`@repo/ui`** - Shared React component library
- **`@repo/eslint-config`** - ESLint configurations
- **`@repo/typescript-config`** - TypeScript configurations

All applications and packages are written in [TypeScript](https://www.typescriptlang.org/).

## 🛠️ Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS v4** - Utility-first styling
- **TypeScript 5** - Type safety

### Backend
- **Bun** - Fast JavaScript runtime
- **ElysiaJS** - Type-safe web framework
- **Drizzle ORM** - Type-safe SQL ORM
- **PostgreSQL 16** - Primary database
- **TimescaleDB** - Time-series data
- **Redis 7** - Caching and sessions

### Development Tools
- **Turborepo** - Build system and monorepo management
- **pnpm** - Fast, disk-efficient package manager
- **Docker** - Containerization
- **ESLint & Prettier** - Code quality

## 📋 Prerequisites

Before you begin, ensure you have installed:

- **Node.js 18+** - JavaScript runtime
- **pnpm** - Package manager (`npm install -g pnpm`)
- **Docker Desktop** - For PostgreSQL, TimescaleDB, and Redis
- **Git** - Version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd pet-chip
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Docker Services

Start PostgreSQL, TimescaleDB, and Redis:

```bash
pnpm run docker:up
```

Verify services are running:

```bash
pnpm run docker:ps
```

### 4. Set Up Database

Push the database schema:

```bash
pnpm run --filter=@repo/db db:push
```

### 5. Start Development Servers

Start all applications:

```bash
pnpm run dev
```

Or start individual applications:

```bash
# API Server
pnpm run --filter=api dev

# Admin Dashboard
pnpm run --filter=admin dev

# Documentation
pnpm run --filter=docs dev

# Public Web
pnpm run --filter=web dev
```

### 6. Access Applications

- **API Server:** http://localhost:3002
- **API Documentation:** http://localhost:3002/swagger
- **Admin Dashboard:** http://localhost:3003
- **Documentation:** http://localhost:3001
- **Public Web:** http://localhost:3000

## 📖 Documentation

For detailed documentation, visit http://localhost:3001 after starting the docs app, or see:

- [Getting Started Guide](./SETUP.md)
- [Database Setup](./DATABASE_SETUP.md)
- API Documentation: http://localhost:3002/swagger

## 🏗️ Project Structure

```
pet-chip/
├── apps/
│   ├── api/                 # ElysiaJS REST API
│   ├── admin/               # Next.js admin dashboard
│   ├── web/                 # Next.js public website
│   ├── docs/                # Next.js documentation
│   └── queue/               # Background job processor
├── packages/
│   ├── db/                  # Database schemas & Drizzle ORM
│   ├── ui/                  # Shared React components
│   ├── eslint-config/       # ESLint configurations
│   └── typescript-config/   # TypeScript configurations
├── docker/                  # Docker initialization scripts
├── docker-compose.yml       # Service orchestration
└── .env                     # Environment variables
```

## 🔨 Available Scripts

### Development

```bash
pnpm run dev              # Start all apps in development mode
pnpm run build            # Build all apps
pnpm run lint             # Lint all apps
pnpm run format           # Format code with Prettier
pnpm run check-types      # Type check all packages
```

### Docker Commands

```bash
pnpm run docker:up        # Start Docker services
pnpm run docker:down      # Stop Docker services
pnpm run docker:ps        # Check service status
pnpm run docker:logs      # View service logs
pnpm run docker:reset     # Reset all services and data
```

### Database Commands

```bash
# Run in packages/db or use --filter
pnpm run --filter=@repo/db db:push      # Push schema to database
pnpm run --filter=@repo/db db:generate  # Generate migrations
pnpm run --filter=@repo/db db:migrate   # Run migrations
pnpm run --filter=@repo/db db:studio    # Open Drizzle Studio
```

## 🎯 Build

Build all applications for production:

```bash
pnpm run build
```

Build specific application:

```bash
pnpm run build --filter=api
pnpm run build --filter=admin
```

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run tests for specific package
pnpm run --filter=api test

# Watch mode
pnpm test --watch
```

## 🐛 Common Issues

### Database Connection Error

If you see "relation does not exist" errors:

```bash
# Reset database and push schema again
pnpm run docker:reset
pnpm run --filter=@repo/db db:push
```

### Port Already in Use

Change port in package.json or kill the process:

```powershell
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 3002).OwningProcess | Stop-Process
```

### Docker Not Running

Ensure Docker Desktop is running before starting services.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [CONTRIBUTING.md](./CONTRIBUTING.md) for detailed guidelines.

## 📝 Environment Variables

Key environment variables (see `.env` for complete list):

```bash
# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/petchip

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1h

# Application
NODE_ENV=development
PORT=3002
```

## 🔐 Security

- JWT token authentication
- Role-based access control (RBAC)
- Input sanitization and validation
- SQL injection prevention via Drizzle ORM
- Password hashing with bcrypt
- CORS configuration

## 📊 Database Schema

The system includes 10 core tables:

- **users** - System users with role-based access
- **administrative_areas** - Hierarchical geographic regions
- **holdings** - Farms, households, and enterprises
- **animals** - Central animal registry
- **chips** - Microchip tracking
- **vaccinations** - Vaccination records
- **animal_health_records** - Medical history
- **animal_movements** - Transfer tracking
- **ownership_history** - Ownership audit trail
- **alerts** - Lost/found notifications

## 🌐 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions including:

- Docker production setup
- Environment configuration
- SSL/TLS setup
- Database backups
- CI/CD pipelines

## 📚 Additional Resources

- [Turborepo Documentation](https://turborepo.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [ElysiaJS Documentation](https://elysiajs.com)
- [Drizzle ORM Documentation](https://orm.drizzle.team)

## 📄 License

[Add your license here]

## 👥 Team

Developed by a team of 21 developers for the Uzbekistan Animal Identification Platform.

---

**Built with ❤️ using Turborepo, Next.js, ElysiaJS, and Bun**
