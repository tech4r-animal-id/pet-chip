# Pet-Chip Development Environment Setup Guide

This guide will help all 21 team members set up a standardized local development environment for the pet-chip project.

## Prerequisites

Before starting, ensure you have the following installed:

- **Git**: [Download Git](https://git-scm.com/downloads)
- **Bun**: [Download Bun](https://bun.sh) - JavaScript runtime and package manager
- **Docker**: [Download Docker Desktop](https://www.docker.com/products/docker-desktop/)
  - For Windows: Ensure WSL 2 is enabled
  - For Mac: Docker Desktop includes everything needed
  - For Linux: Install Docker Engine and Docker Compose

## Initial Setup

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd pet-chip
```

### 2. Install Dependencies

```bash
# Install all workspace dependencies using Bun
bun install
```

### 3. Environment Configuration

Copy the example environment file and configure your local settings:

```bash
# On Linux/Mac
cp .env.example .env

# On Windows (PowerShell)
Copy-Item .env.example .env
```

**Important**: Open `.env` and review/update the credentials if needed. The defaults are suitable for local development.

### 4. Start Docker Services

Start all required services (PostgreSQL, TimescaleDB, Redis):

```bash
# Using npm/bun scripts
bun run docker:up

# Or using Docker Compose directly
docker-compose up -d
```

Verify all services are running:

```bash
bun run docker:ps
```

You should see three containers:
- `pet-chip-postgres` (PostgreSQL on port 5432)
- `pet-chip-timescaledb` (TimescaleDB on port 5433)
- `pet-chip-redis` (Redis on port 6379)

### 5. Database Setup

The database will be automatically initialized with the required extensions. To push your schema:

```bash
# Push the schema to the database
bun run --filter=@repo/db db:push
```

### 6. Verify Installation

Check the logs to ensure everything is working:

```bash
# View logs from all services
bun run docker:logs

# Or check individual services
docker-compose logs postgres
docker-compose logs timescaledb
docker-compose logs redis
```

## Development Workflow

### Running the Application

```bash
# Start all apps in development mode
bun run dev

# Or start a specific app
bun run dev --filter=web
```

### Database Management

```bash
# Open Drizzle Studio (visual database editor)
bun run --filter=@repo/db db:studio

# Generate migrations from schema changes
bun run --filter=@repo/db db:generate

# Apply migrations
bun run --filter=@repo/db db:migrate

# Push schema directly (development only)
bun run --filter=@repo/db db:push
```

### Docker Commands

```bash
# Start services
bun run docker:up

# Stop services
bun run docker:down

# View logs (follow mode)
bun run docker:logs

# Reset services (delete all data and restart)
bun run docker:reset

# Check service status
bun run docker:ps
```

## Project Structure

```
pet-chip/
├── apps/
│   ├── admin/        # Admin dashboard
│   ├── api/          # Backend API
│   ├── docs/         # Documentation
│   ├── queue/        # Background job processor
│   └── web/          # Customer-facing web app
├── packages/
│   ├── db/           # Database schema and client
│   ├── ui/           # Shared UI components
│   └── ...
├── docker/
│   ├── postgres/     # PostgreSQL init scripts
│   └── timescaledb/  # TimescaleDB init scripts
├── docker-compose.yml
├── .env.example
└── .env (local, not in git)
```

## Database Services

### PostgreSQL (Primary Database)
- **Port**: 5432
- **Database**: petchip
- **User**: postgres
- **Password**: postgres (default, change in `.env`)
- **Connection**: `postgresql://postgres:postgres@localhost:5432/petchip`

### TimescaleDB (Time-Series Data)
- **Port**: 5433
- **Database**: petchip_timeseries
- **User**: timescale
- **Password**: timescale (default, change in `.env`)
- **Connection**: `postgresql://timescale:timescale@localhost:5433/petchip_timeseries`
- **Use Case**: Pet tracking events, analytics, metrics

### Redis (Cache & Sessions)
- **Port**: 6379
- **Password**: redis123 (default, change in `.env`)
- **Connection**: `redis://:redis123@localhost:6379`

## Troubleshooting

### Services Won't Start

**Check if ports are already in use:**
```bash
# Windows
netstat -ano | findstr "5432"
netstat -ano | findstr "5433"
netstat -ano | findstr "6379"

# Linux/Mac
lsof -i :5432
lsof -i :5433
lsof -i :6379
```

**Solution**: Stop conflicting services or change ports in `.env`

### Database Connection Errors

1. Ensure Docker containers are running:
   ```bash
   bun run docker:ps
   ```

2. Check service health:
   ```bash
   docker-compose ps
   ```

3. View logs for errors:
   ```bash
   bun run docker:logs
   ```

### Reset Everything

If you encounter persistent issues, reset all services:

```bash
# This will delete all data and restart fresh
bun run docker:reset
```

### Permission Issues (Linux/Mac)

If you get permission errors with Docker:

```bash
# Add your user to the docker group
sudo usermod -aG docker $USER

# Log out and log back in, or run:
newgrp docker
```

## Database Tools

### Recommended GUI Clients

- **pgAdmin**: [Download](https://www.pgadmin.org/) - Full-featured PostgreSQL client
- **DBeaver**: [Download](https://dbeaver.io/) - Universal database tool
- **Drizzle Studio**: Built-in (run `bun run --filter=@repo/db db:studio`)

### Connecting with GUI Tools

**PostgreSQL:**
- Host: localhost
- Port: 5432
- Database: petchip
- Username: postgres
- Password: postgres

**TimescaleDB:**
- Host: localhost
- Port: 5433
- Database: petchip_timeseries
- Username: timescale
- Password: timescale

## Team Collaboration

### Git Workflow

1. Always pull latest changes before starting work
2. Create feature branches from `main`
3. Keep `.env` local (it's gitignored)
4. Share `.env.example` updates via git

### Environment Variables

- **Never commit** `.env` files
- **Always update** `.env.example` when adding new variables
- **Document** new variables in this guide

## Building for Production

```bash
# Build all apps
bun run build

# Build specific app
bun run build --filter=web
```

## Additional Resources

- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [Bun Documentation](https://bun.sh/docs)
- [Docker Documentation](https://docs.docker.com/)

## Getting Help

If you encounter issues:

1. Check this troubleshooting guide
2. Review Docker logs: `bun run docker:logs`
3. Ask in the team development channel
4. Create an issue in the repository

---

**Happy coding! 🚀**
