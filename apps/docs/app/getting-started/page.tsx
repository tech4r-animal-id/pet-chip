import Sidebar from '../components/Sidebar';
import { CodeBlock } from '../components/CodeBlock';

export default function GettingStarted() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-12">
        <div className="max-w-4xl mx-auto prose prose-blue">
          <h1>Getting Started</h1>
          
          <p className="lead">
            Welcome to Pet-Chip! This guide will help you set up your local development environment
            and get the project running on your machine.
          </p>

          <h2>Prerequisites</h2>
          <p>Before you begin, ensure you have the following installed:</p>
          <ul>
            <li><strong>Node.js 18+</strong> - JavaScript runtime</li>
            <li><strong>pnpm</strong> - Package manager (or npm/yarn)</li>
            <li><strong>Docker Desktop</strong> - For PostgreSQL, TimescaleDB, and Redis</li>
            <li><strong>Git</strong> - Version control</li>
          </ul>

          <h2>Installation Steps</h2>

          <h3>1. Clone the Repository</h3>
          <CodeBlock
            code={`git clone <your-repository-url>
cd pet-chip`}
            language="bash"
          />

          <h3>2. Install Dependencies</h3>
          <CodeBlock
            code={`pnpm install`}
            language="bash"
          />
          <p>This will install all dependencies for the monorepo workspaces.</p>

          <h3>3. Set Up Environment Variables</h3>
          <p>The project includes a <code>.env</code> file with default values. Review and update if needed:</p>
          <CodeBlock
            code={`# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/petchip

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=1h

# Application Ports
PORT=3002
NODE_ENV=development`}
            language="bash"
          />

          <h3>4. Start Docker Services</h3>
          <p>Start PostgreSQL, TimescaleDB, and Redis containers:</p>
          <CodeBlock
            code={`pnpm run docker:up`}
            language="bash"
          />
          <p>Verify services are running:</p>
          <CodeBlock
            code={`pnpm run docker:ps`}
            language="bash"
          />

          <h3>5. Push Database Schema</h3>
          <p>Create all database tables and relations:</p>
          <CodeBlock
            code={`pnpm run --filter=@repo/db db:push`}
            language="bash"
          />

          <h3>6. Start Development Servers</h3>
          <p>Start all applications in development mode:</p>
          <CodeBlock
            code={`pnpm run dev`}
            language="bash"
          />

          <p>Or start individual applications:</p>
          <CodeBlock
            code={`# API Server (port 3002)
pnpm run --filter=api dev

# Admin Dashboard (port 3003)
pnpm run --filter=admin dev

# Documentation (port 3001)
pnpm run --filter=docs dev

# Public Web (port 3000)
pnpm run --filter=web dev`}
            language="bash"
          />

          <h2>Verify Installation</h2>
          <p>Once everything is running, you should be able to access:</p>
          <ul>
            <li><strong>API Server:</strong> <a href="http://localhost:3002">http://localhost:3002</a></li>
            <li><strong>API Documentation:</strong> <a href="http://localhost:3002/swagger">http://localhost:3002/swagger</a></li>
            <li><strong>Admin Dashboard:</strong> <a href="http://localhost:3003">http://localhost:3003</a></li>
            <li><strong>Documentation:</strong> <a href="http://localhost:3001">http://localhost:3001</a></li>
            <li><strong>Public Web:</strong> <a href="http://localhost:3000">http://localhost:3000</a></li>
          </ul>

          <h2>Common Issues</h2>
          
          <h3>Database Connection Error</h3>
          <p>If you see "relation does not exist" errors:</p>
          <CodeBlock
            code={`# Reset database and push schema again
pnpm run docker:reset
pnpm run --filter=@repo/db db:push`}
            language="bash"
          />

          <h3>Port Already in Use</h3>
          <p>If a port is already occupied, you can change it in the package.json scripts or kill the process:</p>
          <CodeBlock
            code={`# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 3002).OwningProcess | Stop-Process

# Linux/Mac
lsof -ti:3002 | xargs kill`}
            language="bash"
          />

          <h3>Docker Not Running</h3>
          <p>Ensure Docker Desktop is running before starting services:</p>
          <ul>
            <li>Windows: Check system tray for Docker icon</li>
            <li>Mac: Check menu bar for Docker icon</li>
            <li>Linux: Run <code>sudo systemctl status docker</code></li>
          </ul>

          <h2>Next Steps</h2>
          <ul>
            <li>Explore the <a href="/api">API Reference</a> to understand available endpoints</li>
            <li>Read about the <a href="/architecture">Architecture</a> to understand the system design</li>
            <li>Check the <a href="/database">Database Schema</a> to see data models</li>
            <li>Review <a href="/development/contributing">Contributing Guidelines</a> before making changes</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
