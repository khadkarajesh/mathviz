'use client';

import { useCallback, useEffect, useState } from 'react';
import { CPAPhase } from '@/types/curriculum';
import { StudentProgress } from '@/types/progress';

const STORAGE_KEY = 'mathviz_progress_v1';

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
        // If all 3 phases done, mark lesson complete
        const lesson = next.lessons[lessonId];
        const allDone =
          lesson.phases.concrete?.completed &&
          lesson.phases.visual?.completed &&
          lesson.phases.abstract?.completed;
        if (allDone && !lesson.completedAt) {
          lesson.completedAt = new Date().toISOString();
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

  return {
    progress,
    markPhaseComplete,
    isPhaseComplete,
    isLessonComplete,
    getLessonsCompletedForTopic,
  };
}
