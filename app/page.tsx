import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';

const subjects = [
  {
    slug: 'geometry',
    title: 'Geometry',
    description: 'Shapes, area, angles, transformations, and the Pythagorean theorem — see them move.',
    icon: '△',
    topics: ['Area & Perimeter', 'Angles', 'Transformations', 'Pythagorean Theorem'],
    color: 'var(--geometry)',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
    grades: '6–8',
  },
  {
    slug: 'statistics',
    title: 'Statistics',
    description: 'Mean, median, distributions, scatter plots, and probability — explore real data.',
    icon: '▊',
    topics: ['Mean, Median & Mode', 'Distributions', 'Scatter Plots', 'Probability'],
    color: 'var(--statistics)',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.3)',
    grades: '6–8',
  },
];

export default function HomePage() {
  return (
    <AppShell>
      {/* Hero */}
      <div className="text-center mb-12 pt-4">
        <div className="text-6xl mb-4">∑</div>
        <h1 className="text-4xl font-bold mb-3" style={{ color: 'var(--text)' }}>
          Math through visualization
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: 'var(--text-muted)' }}>
          Don&apos;t just read about math — drag it, build it, and discover the patterns yourself.
          Built for grades 6–8.
        </p>
      </div>

      {/* CPA explainer */}
      <div className="flex gap-4 justify-center mb-12 flex-wrap">
        {[
          { label: '1. Build It', desc: 'Hands-on manipulation', color: 'var(--accent)' },
          { label: '2. See It', desc: 'Patterns emerge visually', color: 'var(--primary)' },
          { label: '3. Own It', desc: 'The formula makes sense', color: 'var(--secondary)' },
        ].map(({ label, desc, color }) => (
          <div key={label} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
            <div>
              <div className="text-sm font-semibold" style={{ color }}>{label}</div>
              <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Subject cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {subjects.map((s) => (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            className="block rounded-2xl border p-6 transition-all hover:scale-[1.02] hover:shadow-xl no-underline"
            style={{ background: s.bg, borderColor: s.border }}
          >
            <div className="text-5xl mb-4">{s.icon}</div>
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>{s.title}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: `${s.color}22`, color: s.color }}>
                Gr {s.grades}
              </span>
            </div>
            <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
              {s.description}
            </p>
            <div className="flex flex-col gap-1">
              {s.topics.map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <span style={{ color: s.color }}>›</span> {t}
                </div>
              ))}
            </div>
            <div className="mt-5 inline-flex items-center gap-1 text-sm font-semibold" style={{ color: s.color }}>
              Start exploring →
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
