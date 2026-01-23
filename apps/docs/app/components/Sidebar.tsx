'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  title: string;
  href: string;
  items?: NavItem[];
}

const navigation: NavItem[] = [
  {
    title: 'Getting Started',
    href: '/getting-started',
    items: [
      { title: 'Introduction', href: '/getting-started' },
      { title: 'Installation', href: '/getting-started/installation' },
      { title: 'Quick Start', href: '/getting-started/quick-start' },
    ],
  },
  {
    title: 'Architecture',
    href: '/architecture',
    items: [
      { title: 'Overview', href: '/architecture' },
      { title: 'Tech Stack', href: '/architecture/tech-stack' },
      { title: 'Project Structure', href: '/architecture/structure' },
    ],
  },
  {
    title: 'API Reference',
    href: '/api',
    items: [
      { title: 'Introduction', href: '/api' },
      { title: 'Authentication', href: '/api/authentication' },
      { title: 'Animals', href: '/api/animals' },
      { title: 'Medical Records', href: '/api/medical' },
      { title: 'Reports', href: '/api/reports' },
    ],
  },
  {
    title: 'Database',
    href: '/database',
    items: [
      { title: 'Schema Overview', href: '/database' },
      { title: 'Migrations', href: '/database/migrations' },
      { title: 'Relations', href: '/database/relations' },
    ],
  },
  {
    title: 'Deployment',
    href: '/deployment',
    items: [
      { title: 'Docker Setup', href: '/deployment' },
      { title: 'Environment Variables', href: '/deployment/environment' },
      { title: 'Production Guide', href: '/deployment/production' },
    ],
  },
  {
    title: 'Development',
    href: '/development',
    items: [
      { title: 'Contributing', href: '/development/contributing' },
      { title: 'Testing', href: '/development/testing' },
      { title: 'Code Style', href: '/development/code-style' },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav className="w-64 min-h-screen bg-gray-50 border-r border-gray-200 p-6">
      <div className="mb-8">
        <Link href="/" className="text-2xl font-bold text-blue-600">
          Pet-Chip
        </Link>
        <p className="text-sm text-gray-600 mt-1">Documentation</p>
      </div>

      <div className="space-y-6">
        {navigation.map((section) => (
          <div key={section.href}>
            <h3 className="font-semibold text-gray-900 mb-2">{section.title}</h3>
            {section.items && (
              <ul className="space-y-1">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block px-3 py-1.5 text-sm rounded-md transition-colors ${
                        pathname === item.href
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}
