import Sidebar from '../components/Sidebar';
import { CodeBlock } from '../components/CodeBlock';

export default function Deployment() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-12">
        <div className="max-w-4xl mx-auto prose prose-blue">
          <h1>Deployment Guide</h1>
          
          <p className="lead">
            Comprehensive guide for deploying Pet-Chip to development, staging, and production environments.
          </p>

          <h2>Docker Setup</h2>
          <p>
            The project uses Docker Compose for local development and can be adapted for production deployment.
          </p>

          <h3>Development Deployment</h3>
          <CodeBlock
            code={`# Start all services
docker compose up -d

# Check service status
docker compose ps

# View logs
docker compose logs -f

# Stop services
docker compose down

# Reset everything (including data)
docker compose down -v`}
            language="bash"
          />

          <h3>Production Docker Compose</h3>
          <p>Create a <code>docker-compose.prod.yml</code> for production:</p>
          <CodeBlock
            code={`version: '3.9'

services:
  postgres:
    image: postgres:16-alpine
    restart: always
    environment:
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      POSTGRES_DB: \${POSTGRES_DB}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    networks:
      - pet-chip-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER}"]
      interval: 30s
      timeout: 10s
      retries: 5

  timescaledb:
    image: timescale/timescaledb:latest-pg16
    restart: always
    environment:
      POSTGRES_USER: \${TIMESCALE_USER}
      POSTGRES_PASSWORD: \${TIMESCALE_PASSWORD}
      POSTGRES_DB: \${TIMESCALE_DB}
    ports:
      - "5433:5432"
    volumes:
      - timescale_data:/var/lib/postgresql/data
    networks:
      - pet-chip-network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass \${REDIS_PASSWORD} --appendonly yes
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - pet-chip-network

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: always
    environment:
      DATABASE_URL: \${DATABASE_URL}
      JWT_SECRET: \${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "3002:3002"
    depends_on:
      - postgres
      - redis
    networks:
      - pet-chip-network

  admin:
    build:
      context: .
      dockerfile: apps/admin/Dockerfile
    restart: always
    environment:
      NEXT_PUBLIC_API_URL: \${API_URL}
    ports:
      - "3003:3003"
    networks:
      - pet-chip-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - api
      - admin
    networks:
      - pet-chip-network

volumes:
  postgres_data:
  timescale_data:
  redis_data:

networks:
  pet-chip-network:
    driver: bridge`}
            language="yaml"
          />

          <h2>Environment Variables</h2>

          <h3>Development (.env)</h3>
          <CodeBlock
            code={`# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/petchip
TIMESCALE_URL=postgresql://timescale:timescale@localhost:5433/petchip_timeseries
REDIS_URL=redis://:redis123@localhost:6379

# Authentication
JWT_SECRET=dev-secret-change-in-production
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_SECRET=dev-refresh-secret
REFRESH_TOKEN_EXPIRES_IN=7d

# Application
NODE_ENV=development
PORT=3002
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3003

# Logging
LOG_LEVEL=debug`}
            language="bash"
          />

          <h3>Production (.env.production)</h3>
          <CodeBlock
            code={`# Database (use managed services in production)
DATABASE_URL=postgresql://user:password@db.example.com:5432/petchip
TIMESCALE_URL=postgresql://user:password@timescale.example.com:5432/petchip_timeseries
REDIS_URL=redis://user:password@redis.example.com:6379

# Authentication (use strong secrets!)
JWT_SECRET=<generate-with-openssl-rand-base64-32>
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=<generate-with-openssl-rand-base64-32>
REFRESH_TOKEN_EXPIRES_IN=7d

# Application
NODE_ENV=production
PORT=3002
ALLOWED_ORIGINS=https://animalid.uz,https://admin.animalid.uz

# Logging
LOG_LEVEL=info
SENTRY_DSN=<your-sentry-dsn>

# OneID Integration
ONEID_CLIENT_ID=<your-client-id>
ONEID_CLIENT_SECRET=<your-client-secret>
ONEID_CALLBACK_URL=https://animalid.uz/auth/callback`}
            language="bash"
          />

          <h3>Generate Secure Secrets</h3>
          <CodeBlock
            code={`# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Using Bun
bun -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`}
            language="bash"
          />

          <h2>Building for Production</h2>

          <h3>API Service</h3>
          <CodeBlock
            code={`# Create Dockerfile for API
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
COPY apps/api/package.json ./apps/api/
COPY packages/db/package.json ./packages/db/
RUN bun install --frozen-lockfile --production

# Copy source
COPY apps/api ./apps/api
COPY packages/db ./packages/db

# Build
WORKDIR /app/apps/api
RUN bun run build

# Run
EXPOSE 3002
CMD ["bun", "run", "dist/index.js"]`}
            language="dockerfile"
          />

          <h3>Next.js Applications</h3>
          <CodeBlock
            code={`# Dockerfile for admin/web/docs
FROM node:18-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm install -g pnpm
RUN pnpm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3003
CMD ["node", "server.js"]`}
            language="dockerfile"
          />

          <h2>Reverse Proxy (Nginx)</h2>
          <CodeBlock
            code={`# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream api {
        server api:3002;
    }

    upstream admin {
        server admin:3003;
    }

    server {
        listen 80;
        server_name api.animalid.uz;
        
        location / {
            proxy_pass http://api;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    server {
        listen 80;
        server_name admin.animalid.uz;
        
        location / {
            proxy_pass http://admin;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }
    }
}`}
            language="nginx"
          />

          <h2>Database Migrations</h2>
          <CodeBlock
            code={`# Production migration workflow
# 1. Generate migration from schema changes
pnpm run --filter=@repo/db db:generate

# 2. Review migration in packages/db/drizzle/
# 3. Test in staging environment
# 4. Apply to production
pnpm run --filter=@repo/db db:migrate

# Rollback if needed
pnpm run --filter=@repo/db db:drop`}
            language="bash"
          />

          <h2>Monitoring & Logging</h2>

          <h3>Application Monitoring</h3>
          <ul>
            <li><strong>Sentry</strong> - Error tracking and performance monitoring</li>
            <li><strong>Prometheus</strong> - Metrics collection</li>
            <li><strong>Grafana</strong> - Visualization dashboards</li>
          </ul>

          <h3>Database Monitoring</h3>
          <CodeBlock
            code={`# Monitor PostgreSQL performance
SELECT * FROM pg_stat_activity;

# Check table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

# Active connections
SELECT count(*) FROM pg_stat_activity;`}
            language="sql"
          />

          <h2>Backup Strategy</h2>

          <h3>Database Backups</h3>
          <CodeBlock
            code={`# Daily backup script (backup.sh)
#!/bin/bash
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Backup PostgreSQL
docker exec pet-chip-postgres pg_dump -U postgres petchip | gzip > \\
  $BACKUP_DIR/petchip_$TIMESTAMP.sql.gz

# Backup TimescaleDB
docker exec pet-chip-timescaledb pg_dump -U timescale petchip_timeseries | gzip > \\
  $BACKUP_DIR/timescale_$TIMESTAMP.sql.gz

# Keep only last 30 days
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $TIMESTAMP"`}
            language="bash"
          />

          <h3>Restore from Backup</h3>
          <CodeBlock
            code={`# Restore PostgreSQL
gunzip < backup.sql.gz | docker exec -i pet-chip-postgres psql -U postgres petchip

# Restore TimescaleDB
gunzip < backup.sql.gz | docker exec -i pet-chip-timescaledb psql -U timescale petchip_timeseries`}
            language="bash"
          />

          <h2>SSL/TLS Configuration</h2>
          <CodeBlock
            code={`# Generate Let's Encrypt certificates
certbot certonly --standalone -d animalid.uz -d api.animalid.uz -d admin.animalid.uz

# Update nginx.conf
server {
    listen 443 ssl http2;
    server_name api.animalid.uz;
    
    ssl_certificate /etc/letsencrypt/live/api.animalid.uz/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.animalid.uz/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # ... rest of config
}`}
            language="nginx"
          />

          <h2>CI/CD Pipeline</h2>

          <h3>GitHub Actions Example</h3>
          <CodeBlock
            code={`# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Bun
        uses: oven-sh/setup-bun@v1
        
      - name: Install dependencies
        run: bun install
        
      - name: Run tests
        run: bun test
        
      - name: Build
        run: bun run build
        
      - name: Deploy to server
        run: |
          ssh \$\{\{ secrets.SSH_USER \}\}@\$\{\{ secrets.SSH_HOST \}\} \\
          "cd /app && git pull && docker compose up -d --build"`}
            language="yaml"
          />

          <h2>Health Checks</h2>
          <CodeBlock
            code={`# API health endpoint
GET /health

Response:
{
  "status": "healthy",
  "database": "connected",
  "redis": "connected",
  "uptime": 123456,
  "version": "1.0.0"
}`}
            language="json"
          />

          <h2>Scaling Considerations</h2>
          <ul>
            <li><strong>Horizontal scaling</strong> - Deploy multiple API instances behind load balancer</li>
            <li><strong>Database replicas</strong> - Read replicas for analytics queries</li>
            <li><strong>Redis cluster</strong> - For high-availability caching</li>
            <li><strong>CDN</strong> - Static assets and frontend applications</li>
            <li><strong>Queue workers</strong> - Scale background job processing independently</li>
          </ul>

          <h2>Security Checklist</h2>
          <ul className="list-none">
            <li>☐ Strong JWT secrets (32+ characters, random)</li>
            <li>☐ Database passwords changed from defaults</li>
            <li>☐ HTTPS enabled with valid certificates</li>
            <li>☐ CORS properly configured</li>
            <li>☐ Rate limiting enabled</li>
            <li>☐ SQL injection prevented (parameterized queries)</li>
            <li>☐ XSS protection enabled</li>
            <li>☐ Firewall rules configured</li>
            <li>☐ Regular security updates</li>
            <li>☐ Audit logging enabled</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
