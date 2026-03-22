import { notFound } from 'next/navigation';
import { AppShell } from '@/components/layout/AppShell';
import { CPAStepper } from '@/components/cpa/CPAStepper';
import { getLesson, getTopic } from '@/lib/curriculum';

interface Props {
  params: Promise<{ topicSlug: string; lessonSlug: string }>;
}

export default async function LessonPage({ params }: Props) {
  const { topicSlug, lessonSlug } = await params;
  const topic = getTopic(topicSlug);
  const lesson = getLesson(topicSlug, lessonSlug);
  if (!topic || !lesson || topic.subject !== 'geometry') notFound();

  return (
    <AppShell
      breadcrumbs={[
        { label: 'Geometry', href: '/geometry' },
        { label: topic.title, href: `/geometry/${topicSlug}` },
        { label: lesson.title },
      ]}
    >
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
          {lesson.title}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
          ~{lesson.estimatedMinutes} min · {topic.grades.join(', ')}th grade
        </p>
      </div>
      <CPAStepper lesson={lesson} subject="geometry" />
    </AppShell>
  );
}
