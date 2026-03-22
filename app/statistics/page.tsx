import { AppShell } from '@/components/layout/AppShell';
import { TopicCard } from '@/components/layout/TopicCard';
import { ReviewSection } from '@/components/cpa/ReviewSection';
import { getTopicsBySubject } from '@/lib/curriculum';

export default function StatisticsHubPage() {
  const topics = getTopicsBySubject('statistics');

  return (
    <AppShell breadcrumbs={[{ label: 'Statistics' }]}>
      <div className="mb-8">
        <div className="text-4xl mb-3">▊</div>
        <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>Statistics</h1>
        <p className="text-base" style={{ color: 'var(--text-muted)' }}>
          Data, distributions, relationships, and probability — explored through real datasets.
        </p>
      </div>
      <ReviewSection subject="statistics" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {topics.map((topic) => (
          <TopicCard key={topic.id} topic={topic} lessonsCompleted={0} />
        ))}
      </div>
    </AppShell>
  );
}
