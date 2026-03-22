import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { getDashboardData } from '@/app/actions/progress';

const subjects = [
  {
    slug: 'geometry',
    title: 'Geometry',
    description: 'Shapes, area, angles, transformations, and the Pythagorean theorem — see them move.',
    icon: '△',
    color: 'var(--geometry)',
    bg: 'rgba(245,158,11,0.08)',
    border: 'rgba(245,158,11,0.3)',
  },
  {
    slug: 'statistics',
    title: 'Statistics',
    description: 'Mean, median, distributions, scatter plots, and probability — explore real data.',
    icon: '▊',
    color: 'var(--statistics)',
    bg: 'rgba(59,130,246,0.08)',
    border: 'rgba(59,130,246,0.3)',
  },
];

const phaseColors: Record<string, string> = {
  concrete: 'var(--accent)',
  visual:   'var(--primary)',
  abstract: 'var(--secondary)',
};

export default async function HomePage() {
  const data = await getDashboardData();
  const isFirstVisit = !data || (!data.continueLesson && data.reviewDue.length === 0);

  return (
    <AppShell>
      {data ? (
        <>
          {/* ── Greeting + streak ──────────────────────────────────────────── */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                Hey, {data.displayName}!
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {isFirstVisit ? 'Ready to explore some math?' : 'Welcome back — keep the momentum going.'}
              </p>
            </div>
            {data.streak > 0 && (
              <div
                className="flex items-center gap-2 rounded-xl px-4 py-2 border"
                style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' }}
              >
                <span className="text-2xl">🔥</span>
                <div className="text-right">
                  <div className="text-lg font-black" style={{ color: 'var(--geometry)' }}>
                    {data.streak}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--text-muted)' }}>day streak</div>
                </div>
              </div>
            )}
          </div>

          {/* ── Review due ─────────────────────────────────────────────────── */}
          {data.reviewDue.length > 0 && (
            <section className="mb-6">
              <div
                className="rounded-xl border p-4"
                style={{ borderColor: 'var(--primary)', background: 'rgba(108,99,255,0.05)' }}
              >
                <p className="text-xs font-bold mb-3" style={{ color: 'var(--primary)' }}>
                  READY TO REVIEW — {data.reviewDue.length} lesson{data.reviewDue.length > 1 ? 's' : ''}
                </p>
                <div className="flex flex-col gap-2">
                  {data.reviewDue.map((item) => (
                    <Link
                      key={`${item.lessonId}-${item.phase}`}
                      href={`/${item.subject}/${item.topicId}/${item.lessonId}`}
                      className="flex items-center justify-between rounded-lg px-3 py-2 border transition-all hover:opacity-80"
                      style={{ background: 'var(--surface)', borderColor: 'var(--border)', textDecoration: 'none' }}
                    >
                      <div>
                        <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                          {item.lessonTitle}
                        </span>
                        <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                          {item.topicTitle}
                        </span>
                      </div>
                      <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                        {item.dueLabel} →
                      </span>
                    </Link>
                  ))}
                </div>
                <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
                  Spaced review cements long-term memory. Each takes just a few minutes.
                </p>
              </div>
            </section>
          )}

          {/* ── Continue learning ──────────────────────────────────────────── */}
          {data.continueLesson && (
            <section className="mb-6">
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                CONTINUE WHERE YOU LEFT OFF
              </p>
              <Link
                href={`/${data.continueLesson.subject}/${data.continueLesson.topicId}/${data.continueLesson.lessonId}`}
                className="flex items-center justify-between rounded-xl border px-4 py-3 transition-all hover:opacity-80"
                style={{ background: 'var(--surface)', borderColor: 'var(--border)', textDecoration: 'none' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-2 h-8 rounded-full"
                    style={{ background: phaseColors[data.continueLesson.phase] ?? 'var(--primary)' }}
                  />
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                      {data.continueLesson.lessonTitle}
                    </p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {data.continueLesson.topicTitle} · {data.continueLesson.phaseLabel}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>→</span>
              </Link>
            </section>
          )}

          {/* ── Weak spots ─────────────────────────────────────────────────── */}
          {data.weakSpots.length > 0 && (
            <section className="mb-8">
              <p className="text-xs font-bold mb-2" style={{ color: 'var(--text-muted)' }}>
                WORTH PRACTISING AGAIN
              </p>
              <div className="flex flex-wrap gap-2">
                {data.weakSpots.map(({ label, count }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs"
                    style={{ borderColor: 'rgba(255,101,132,0.3)', background: 'rgba(255,101,132,0.06)' }}
                  >
                    <span style={{ color: 'var(--secondary)' }}>
                      {label.replace(/_/g, ' ')}
                    </span>
                    <span
                      className="rounded-full px-1.5 py-0.5 text-xs font-bold"
                      style={{ background: 'rgba(255,101,132,0.15)', color: 'var(--secondary)' }}
                    >
                      {count}×
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── Subject cards ──────────────────────────────────────────────── */}
          <p className="text-xs font-bold mb-3" style={{ color: 'var(--text-muted)' }}>
            {isFirstVisit ? 'CHOOSE WHERE TO START' : 'ALL SUBJECTS'}
          </p>
        </>
      ) : (
        /* Not signed in — show hero for new visitors */
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
      )}

      {/* Subject cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {subjects.map((s) => (
          <Link
            key={s.slug}
            href={`/${s.slug}`}
            className="block rounded-2xl border p-6 transition-all hover:scale-[1.02] hover:shadow-xl no-underline"
            style={{ background: s.bg, borderColor: s.border }}
          >
            <div className="text-4xl mb-3">{s.icon}</div>
            <h2 className="text-lg font-bold mb-1" style={{ color: 'var(--text)' }}>{s.title}</h2>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-muted)' }}>
              {s.description}
            </p>
            <span className="text-sm font-semibold" style={{ color: s.color }}>
              Explore →
            </span>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
