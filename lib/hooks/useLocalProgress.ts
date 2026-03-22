'use client';

import { useCallback, useEffect, useState } from 'react';
import { CPAPhase } from '@/types/curriculum';
import { StudentProgress, ReviewDueLesson } from '@/types/progress';

const STORAGE_KEY = 'mathviz_progress_v1';
const THREE_DAYS_MS  = 3  * 24 * 60 * 60 * 1000;
const TEN_DAYS_MS    = 10 * 24 * 60 * 60 * 1000;

function defaultProgress(): StudentProgress {
  return { version: 1, lessons: {}, topics: {} };
}

function load(): StudentProgress {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultProgress();
    return JSON.parse(raw) as StudentProgress;
  } catch {
    return defaultProgress();
  }
}

function save(progress: StudentProgress) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function useLocalProgress() {
  const [progress, setProgress] = useState<StudentProgress>(defaultProgress);

  useEffect(() => {
    setProgress(load());
  }, []);

  const markPhaseComplete = useCallback(
    (lessonId: string, topicId: string, phase: CPAPhase) => {
      setProgress((prev) => {
        const next = { ...prev };
        if (!next.lessons[lessonId]) {
          next.lessons[lessonId] = { lessonId, topicId, phases: {} };
        }
        next.lessons[lessonId].phases[phase] = {
          completed: true,
          completedAt: new Date().toISOString(),
        };
        // When all 3 phases done for the first time, schedule spaced reviews
        const lesson = next.lessons[lessonId];
        const allDone =
          lesson.phases.concrete?.completed &&
          lesson.phases.visual?.completed &&
          lesson.phases.abstract?.completed;
        if (allDone && !lesson.completedAt) {
          const now = new Date();
          lesson.completedAt = now.toISOString();
          lesson.reviewDueAt = new Date(now.getTime() + THREE_DAYS_MS).toISOString();
          lesson.secondReviewDueAt = new Date(now.getTime() + TEN_DAYS_MS).toISOString();
        }
        save(next);
        return next;
      });
    },
    []
  );

  const isPhaseComplete = useCallback(
    (lessonId: string, phase: CPAPhase): boolean => {
      return progress.lessons[lessonId]?.phases[phase]?.completed ?? false;
    },
    [progress]
  );

  const isLessonComplete = useCallback(
    (lessonId: string): boolean => {
      return !!progress.lessons[lessonId]?.completedAt;
    },
    [progress]
  );

  const getLessonsCompletedForTopic = useCallback(
    (topicId: string, lessonIds: string[]): number => {
      return lessonIds.filter((id) => isLessonComplete(id)).length;
    },
    [isLessonComplete]
  );

  /** Returns lessons whose first or second review window has passed */
  const getReviewDueLessons = useCallback((): ReviewDueLesson[] => {
    const now = new Date();
    const due: ReviewDueLesson[] = [];
    for (const [lessonId, lesson] of Object.entries(progress.lessons)) {
      if (!lesson.completedAt) continue;
      const r1 = lesson.reviewDueAt       ? new Date(lesson.reviewDueAt)       : null;
      const r2 = lesson.secondReviewDueAt ? new Date(lesson.secondReviewDueAt) : null;
      const dueDate = (r1 && r1 <= now) ? r1 : (r2 && r2 <= now) ? r2 : null;
      if (dueDate) {
        due.push({ lessonId, topicId: lesson.topicId, reviewDueAt: dueDate.toISOString() });
      }
    }
    return due.sort(
      (a, b) => new Date(a.reviewDueAt).getTime() - new Date(b.reviewDueAt).getTime()
    );
  }, [progress]);

  return {
    progress,
    markPhaseComplete,
    isPhaseComplete,
    isLessonComplete,
    getLessonsCompletedForTopic,
    getReviewDueLessons,
  };
}
