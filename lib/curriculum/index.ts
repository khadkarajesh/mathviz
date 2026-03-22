import { CurriculumTopic, Subject } from '@/types/curriculum';
import { geometryTopics } from './geometry';
import { statisticsTopics } from './statistics';

export const allTopics: CurriculumTopic[] = [...geometryTopics, ...statisticsTopics];

export function getTopicsBySubject(subject: Subject): CurriculumTopic[] {
  return allTopics.filter((t) => t.subject === subject);
}

export function getTopic(id: string): CurriculumTopic | undefined {
  return allTopics.find((t) => t.id === id);
}

export function getLesson(topicId: string, lessonId: string) {
  const topic = getTopic(topicId);
  return topic?.lessons.find((l) => l.id === lessonId);
}
