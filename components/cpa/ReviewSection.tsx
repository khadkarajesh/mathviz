'use client';

import Link from 'next/link';
import { useLocalProgress } from '@/lib/hooks/useLocalProgress';
import { getTopic, getLesson } from '@/lib/curriculum';

interface ReviewSectionProps {
  subject: 'geometry' | 'statistics';
}

export function ReviewSection({ subject }: ReviewSectionProps) {
  const { getReviewDueLessons } = useLocalProgress();
  const due = getReviewDueLessons();

  // Enrich and filter to this subject
  const items = due
    .map((d) => {
      const topic  = getTopic(d.topicId);
      const lesson = getLesson(d.topicId, d.lessonId);
      if (!topic || !lesson || topic.subject !== subject) return null;
      return { ...d, topicTitle: topic.title, lessonTitle: lesson.title };
    })
    .filter(Boolean) as {
      lessonId: string;
      topicId: string;
      reviewDueAt: string;
      topicTitle: string;
      lessonTitle: string;
    }[];

  if (items.length === 0) return null;

  return (
    <div
      className="mb-8 rounded-xl border p-4"
      style={{ borderColor: 'var(--primary)', background: 'rgba(108,99,255,0.05)' }}
    >
      <p className="text-xs font-bold mb-3" style={{ color: 'var(--primary)' }}>
        READY TO REVIEW
      </p>
      <div className="flex flex-col gap-2">
        {items.map((item) => {
          const dueDate = new Date(item.reviewDueAt);
          const daysAgo = Math.floor((Date.now() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
          const label   = daysAgo === 0 ? 'due today' : `${daysAgo}d overdue`;

          return (
            <Link
              key={item.lessonId}
              href={`/${subject}/${item.topicId}/${item.lessonId}`}
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
                {label} →
              </span>
            </Link>
          );
        })}
      </div>
      <p className="text-xs mt-3" style={{ color: 'var(--text-muted)' }}>
        Revisiting completed lessons cements long-term memory. Each takes just a few minutes.
      </p>
    </div>
  );
}
