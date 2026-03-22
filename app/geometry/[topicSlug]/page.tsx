import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { getTopic } from '@/lib/curriculum';

interface Props {
  params: Promise<{ topicSlug: string }>;
}

export default async function TopicPage({ params }: Props) {
  const { topicSlug } = await params;
  const topic = getTopic(topicSlug);
  if (!topic || topic.subject !== 'geometry') notFound();

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Geometry', href: '/geometry' },
        { label: topic.title },
      ]}
    >
      <div className="mb-8">
        <div className="text-4xl mb-3">{topic.icon}</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          {topic.title}
        </h1>
        <p className="text-base max-w-xl" style={{ color: 'var(--text-muted)' }}>
          {topic.description}
        </p>
      </div>

      <div className="flex flex-col gap-4 max-w-2xl">
        {topic.lessons.map((lesson, i) => (
          <Link
            key={lesson.id}
            href={`/geometry/${topicSlug}/${lesson.id}`}
            className="flex items-center gap-4 rounded-xl border p-4 transition-all hover:scale-[1.01] hover:shadow-md"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              textDecoration: 'none',
            }}
          >
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
              style={{ background: 'var(--geometry)' }}
            >
              {i + 1}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-base" style={{ color: 'var(--text)' }}>
                {lesson.title}
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {lesson.narrative.problemStatement}
              </p>
            </div>
            <div className="text-xs shrink-0" style={{ color: 'var(--text-muted)' }}>
              ~{lesson.estimatedMinutes} min
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
