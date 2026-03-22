'use server';

import { createClient } from '@/lib/supabase/server';
import { getTopic, getLesson } from '@/lib/curriculum';
import type { SkillState } from '@/types/database';

// ─── SM-2 Algorithm ───────────────────────────────────────────────────────────

function calculateSM2(
  current: Pick<SkillState, 'repetitions' | 'ease_factor' | 'interval_days'>,
  quality: number // 0–5: 5=perfect, 3=correct w/ effort, <3=incorrect
) {
  let { repetitions, ease_factor, interval_days } = current;

  if (quality >= 3) {
    if (repetitions === 0) interval_days = 1;
    else if (repetitions === 1) interval_days = 6;
    else interval_days = Math.round(interval_days * ease_factor);
    repetitions += 1;
  } else {
    // Failed — reset to beginning
    repetitions = 0;
    interval_days = 1;
  }

  ease_factor = Math.max(
    1.3,
    ease_factor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
  );

  const next_review_at = new Date();
  next_review_at.setDate(next_review_at.getDate() + interval_days);

  return {
    repetitions,
    ease_factor,
    interval_days,
    next_review_at: next_review_at.toISOString(),
    mastered: interval_days > 21,
  };
}

// Map attempt result → SM-2 quality score
function qualityFromAttempt(correct: boolean, hintsUsed: number, solutionRevealed: boolean): number {
  if (!correct && solutionRevealed) return 2;
  if (!correct) return 1;
  if (hintsUsed >= 2) return 3;
  if (hintsUsed === 1) return 4;
  return 5;
}

// ─── Record attempt + update SM-2 ────────────────────────────────────────────

export async function recordAttempt(data: {
  problemId: string;
  topicId: string;
  lessonId: string;
  phase: string;
  correct: boolean;
  answerGiven?: number;
  hintsUsed: number;
  timeSeconds?: number;
  aiErrorLabel?: string;
  solutionRevealed?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // 1. Log the attempt
  const { error: attemptError } = await supabase.from('attempts').insert({
    user_id: user.id,
    problem_id: data.problemId,
    topic_id: data.topicId,
    lesson_id: data.lessonId,
    phase: data.phase,
    correct: data.correct,
    answer_given: data.answerGiven ?? null,
    hints_used: data.hintsUsed,
    time_seconds: data.timeSeconds ?? null,
    ai_error_label: data.aiErrorLabel ?? null,
  });
  if (attemptError) throw attemptError;

  // 2. Update SM-2 skill state
  const quality = qualityFromAttempt(data.correct, data.hintsUsed, data.solutionRevealed ?? false);

  const { data: existing } = await supabase
    .from('skill_states')
    .select('*')
    .eq('user_id', user.id)
    .eq('topic_id', data.topicId)
    .eq('lesson_id', data.lessonId)
    .eq('phase', data.phase)
    .single();

  const current = existing ?? { repetitions: 0, ease_factor: 2.5, interval_days: 1 };
  const updated = calculateSM2(current, quality);

  await supabase.from('skill_states').upsert({
    user_id: user.id,
    topic_id: data.topicId,
    lesson_id: data.lessonId,
    phase: data.phase,
    ...updated,
    last_reviewed_at: new Date().toISOString(),
  }, { onConflict: 'user_id,topic_id,lesson_id,phase' });

  // 3. Bump daily activity
  const today = new Date().toISOString().slice(0, 10);
  await supabase.from('daily_activity').upsert({
    user_id: user.id,
    date: today,
    problems_attempted: 1,
    problems_correct: data.correct ? 1 : 0,
  }, { onConflict: 'user_id,date' });
}

// ─── Get review queue ─────────────────────────────────────────────────────────

export async function getReviewDue() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('skill_states')
    .select('topic_id, lesson_id, phase, next_review_at, interval_days')
    .eq('user_id', user.id)
    .lte('next_review_at', new Date().toISOString())
    .order('next_review_at', { ascending: true });

  return data ?? [];
}

// ─── Get weak spots (error patterns worth practicing) ─────────────────────────

export async function getWeakSpots(topicId: string, lessonId: string, phase: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from('attempts')
    .select('ai_error_label')
    .eq('user_id', user.id)
    .eq('topic_id', topicId)
    .eq('lesson_id', lessonId)
    .eq('phase', phase)
    .eq('correct', false)
    .not('ai_error_label', 'is', null)
    .order('created_at', { ascending: false })
    .limit(20);

  if (!data) return [];

  // Count occurrences of each error label
  const counts = data.reduce<Record<string, number>>((acc, row) => {
    const label = row.ai_error_label!;
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});

  // Return labels with 2+ occurrences, sorted by frequency
  return Object.entries(counts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([label]) => label);
}

// ─── Get skill state ──────────────────────────────────────────────────────────

export async function getSkillState(topicId: string, lessonId: string, phase: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('skill_states')
    .select('*')
    .eq('user_id', user.id)
    .eq('topic_id', topicId)
    .eq('lesson_id', lessonId)
    .eq('phase', phase)
    .single();

  return data ?? null;
}

// ─── Dashboard data (single round-trip) ───────────────────────────────────────

export async function getDashboardData() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const now = new Date().toISOString();
  const today = now.slice(0, 10);

  const [profileRes, streakRes, reviewRes, continueRes, weakRes] = await Promise.all([
    // Profile
    supabase.from('profiles').select('display_name, avatar_url').eq('id', user.id).single(),

    // Streak — most recent daily_activity row
    supabase.from('daily_activity')
      .select('date, streak_day')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(1)
      .single(),

    // Review due
    supabase.from('skill_states')
      .select('topic_id, lesson_id, phase, next_review_at')
      .eq('user_id', user.id)
      .lte('next_review_at', now)
      .order('next_review_at', { ascending: true })
      .limit(5),

    // Continue learning — most recently worked on, not yet mastered
    supabase.from('skill_states')
      .select('topic_id, lesson_id, phase, last_reviewed_at')
      .eq('user_id', user.id)
      .eq('mastered', false)
      .not('last_reviewed_at', 'is', null)
      .order('last_reviewed_at', { ascending: false })
      .limit(1)
      .single(),

    // Weak spots — top error labels across all attempts
    supabase.from('attempts')
      .select('ai_error_label')
      .eq('user_id', user.id)
      .eq('correct', false)
      .not('ai_error_label', 'is', null)
      .order('created_at', { ascending: false })
      .limit(50),
  ]);

  // Enrich review due with curriculum titles
  const reviewDue = (reviewRes.data ?? []).map((row) => {
    const topic  = getTopic(row.topic_id);
    const lesson = getLesson(row.topic_id, row.lesson_id);
    if (!topic || !lesson) return null;
    const dueDate  = new Date(row.next_review_at);
    const daysAgo  = Math.floor((Date.now() - dueDate.getTime()) / 86_400_000);
    const dueLabel = daysAgo === 0 ? 'due today' : `${daysAgo}d overdue`;
    return {
      topicId:    row.topic_id,
      lessonId:   row.lesson_id,
      phase:      row.phase,
      subject:    topic.subject,
      topicTitle: topic.title,
      lessonTitle: lesson.title,
      dueLabel,
    };
  }).filter(Boolean) as {
    topicId: string; lessonId: string; phase: string;
    subject: string; topicTitle: string; lessonTitle: string; dueLabel: string;
  }[];

  // Enrich continue learning
  const continueLesson = (() => {
    const row = continueRes.data;
    if (!row) return null;
    const topic  = getTopic(row.topic_id);
    const lesson = getLesson(row.topic_id, row.lesson_id);
    if (!topic || !lesson) return null;
    const phaseLabel: Record<string, string> = { concrete: 'Build It', visual: 'See It', abstract: 'Own It' };
    return {
      topicId:    row.topic_id,
      lessonId:   row.lesson_id,
      phase:      row.phase,
      subject:    topic.subject,
      topicTitle: topic.title,
      lessonTitle: lesson.title,
      phaseLabel: phaseLabel[row.phase] ?? row.phase,
    };
  })();

  // Aggregate weak spots
  const labelCounts = (weakRes.data ?? []).reduce<Record<string, number>>((acc, row) => {
    const label = row.ai_error_label!;
    acc[label] = (acc[label] ?? 0) + 1;
    return acc;
  }, {});
  const weakSpots = Object.entries(labelCounts)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([label, count]) => ({ label, count }));

  // Streak — active if last activity was today or yesterday
  const streak = (() => {
    const row = streakRes.data;
    if (!row) return 0;
    const dayDiff = Math.floor((new Date(today).getTime() - new Date(row.date).getTime()) / 86_400_000);
    return dayDiff <= 1 ? row.streak_day : 0;
  })();

  return {
    displayName: profileRes.data?.display_name ?? user.email?.split('@')[0] ?? 'there',
    streak,
    reviewDue,
    continueLesson,
    weakSpots,
  };
}
