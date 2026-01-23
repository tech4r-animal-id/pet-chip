import Link from 'next/link';
import { Sidebar } from './components/Sidebar';

export default function Home() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 p-12">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Pet-Chip Documentation
            </h1>
            <p className="text-xl text-gray-600">
              Comprehensive guide to the Animal Identification and Management Platform for Uzbekistan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <Link
              href="/getting-started"
              className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-blue-600 mb-2">🚀 Getting Started</h2>
              <p className="text-gray-600">
                Learn how to set up your development environment and run the project locally.
              </p>
            </Link>

            <Link
              href="/api"
              className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-blue-600 mb-2">📚 API Reference</h2>
              <p className="text-gray-600">
                Complete API documentation with endpoints, request/response examples, and authentication.
              </p>
            </Link>

            <Link
              href="/architecture"
              className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-blue-600 mb-2">🏗️ Architecture</h2>
              <p className="text-gray-600">
                Understand the system architecture, tech stack, and how components work together.
              </p>
            </Link>

            <Link
              href="/database"
              className="p-6 bg-white border border-gray-200 rounded-lg hover:shadow-lg transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-blue-600 mb-2">💾 Database</h2>
              <p className="text-gray-600">
                Explore the database schema, relationships, and data management strategies.
              </p>
            </Link>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">About Pet-Chip</h3>
            <p className="text-blue-800 mb-3">
              Pet-Chip is a comprehensive animal identification and management platform designed for Uzbekistan.
              It enables tracking of livestock and pets through microchip registration, health records, vaccination
              monitoring, and movement tracking across administrative regions.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Turborepo</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Next.js 16</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">ElysiaJS</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">PostgreSQL</span>
              <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">Drizzle ORM</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
