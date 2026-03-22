import { CPAPhase } from './curriculum';

export interface PhaseProgress {
  completed: boolean;
  completedAt?: string; // ISO date string
}

export interface LessonProgress {
  lessonId: string;
  topicId: string;
  phases: Partial<Record<CPAPhase, PhaseProgress>>;
  completedAt?: string;
  reviewDueAt?: string;        // 3 days after first completion
  secondReviewDueAt?: string;  // 10 days after first completion
}

export interface TopicProgress {
  topicId: string;
  lessonsCompleted: number;
  totalLessons: number;
  startedAt?: string;
  completedAt?: string;
}

export interface StudentProgress {
  version: 1;
  lessons: Record<string, LessonProgress>;
  topics: Record<string, TopicProgress>;
}

export interface ReviewDueLesson {
  lessonId: string;
  topicId: string;
  reviewDueAt: string; // ISO — the due date
}
