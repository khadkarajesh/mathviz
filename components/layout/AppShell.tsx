'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface AppShellProps {
  children: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export function AppShell({ children, breadcrumbs }: AppShellProps) {
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg)' }}>
      <nav
        className="sticky top-0 z-50 border-b px-4 sm:px-6"
        style={{
          background: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between h-14">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-lg"
            style={{ color: 'var(--primary)' }}
          >
            <span className="text-2xl">∑</span>
            <span>MathViz</span>
          </Link>
          <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
            <span className="hidden sm:inline">Grades 6-8</span>
          </div>
        </div>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <div className="max-w-6xl mx-auto pb-2">
            <nav className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              <Link href="/" className="hover:underline" style={{ color: 'var(--primary)' }}>
                Home
              </Link>
              {breadcrumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1">
                  <span>/</span>
                  {crumb.href ? (
                    <Link href={crumb.href} className="hover:underline" style={{ color: 'var(--primary)' }}>
                      {crumb.label}
                    </Link>
                  ) : (
                    <span style={{ color: 'var(--text)' }}>{crumb.label}</span>
                  )}
                </span>
              ))}
            </nav>
          </div>
        )}
      </nav>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <footer className="border-t py-6 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
        MathViz · Free math visualization for grades 6-8
      </footer>
    </div>
  );
}
