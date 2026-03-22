import Link from 'next/link';
import { CurriculumTopic } from '@/types/curriculum';

interface TopicCardProps {
  topic: CurriculumTopic;
  lessonsCompleted: number;
}

const subjectColors: Record<string, { bg: string; border: string; badge: string }> = {
  geometry: {
    bg: 'rgba(245,158,11,0.07)',
    border: 'rgba(245,158,11,0.25)',
    badge: 'rgba(245,158,11,0.15)',
  },
  statistics: {
    bg: 'rgba(59,130,246,0.07)',
    border: 'rgba(59,130,246,0.25)',
    badge: 'rgba(59,130,246,0.15)',
  },
};

export function TopicCard({ topic, lessonsCompleted }: TopicCardProps) {
  const colors = subjectColors[topic.subject];
  const totalLessons = topic.lessons.length;
  const pct = totalLessons > 0 ? Math.round((lessonsCompleted / totalLessons) * 100) : 0;

  return (
    <Link
      href={`/${topic.subject}/${topic.id}`}
      className="block rounded-2xl border p-5 transition-all hover:scale-[1.02] hover:shadow-lg"
      style={{
        background: colors.bg,
        borderColor: colors.border,
        textDecoration: 'none',
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{topic.icon}</span>
        <div className="flex flex-wrap gap-1">
          {topic.grades.map((g) => (
            <span
              key={g}
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: colors.badge, color: 'var(--text)' }}
            >
              Gr {g}
            </span>
          ))}
        </div>
      </div>
      <h3 className="font-bold text-base mb-1" style={{ color: 'var(--text)' }}>
        {topic.title}
      </h3>
      <p className="text-sm mb-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
        {topic.description}
      </p>
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--border)' }}>
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${pct}%`,
              background: topic.subject === 'geometry' ? 'var(--geometry)' : 'var(--statistics)',
            }}
          />
        </div>
        <span className="text-xs whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
          {lessonsCompleted}/{totalLessons} lessons
        </span>
      </div>
    </Link>
  );
}
