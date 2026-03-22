'use server';

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/lib/supabase/server';
import { getTopic, getLesson } from '@/lib/curriculum';
import type { Problem } from '@/types/database';

const anthropic = new Anthropic();

const GRID_LIMIT = 6;
const POOL_MIN    = 3;  // Trigger background refill when unseen pool drops below this
const POOL_TARGET = 10; // Total problems to maintain per topic/lesson/phase

// ─── Validation ───────────────────────────────────────────────────────────────

function validateCoords(config: Problem['canvas_config']): boolean {
  if (!config) return true;
  const points = [config.pointA, config.pointB].filter(Boolean);
  return points.every(
    (p) => p && Math.abs(p.x) <= GRID_LIMIT && Math.abs(p.y) <= GRID_LIMIT
  );
}

const CONTEXTS = [
  'a football match', 'a road trip', 'a school garden', 'a swimming race',
  'a pizza delivery', 'a hiking trail', 'a city map', 'a basketball court',
  'a treasure hunt', 'a shopping trip', 'a music festival', 'a science fair',
  'a skate park', 'a cooking competition', 'a boat race', 'a theme park',
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

function buildPrompt(
  topicId: string,
  lessonId: string,
  phase: string,
  weaknesses: string[]
): string {
  const topic = getTopic(topicId);
  const lesson = getLesson(topicId, lessonId);
  const phaseConfig = lesson?.phases.find((p) => p.phase === phase);

  const phaseLabel = { concrete: 'hands-on/concrete', pictorial: 'visual/pictorial', abstract: 'formula/abstract' }[phase] ?? phase;
  const isCanvas = phaseConfig?.canvasComponent === 'CoordinateGeometryCanvas';

  const weaknessNote = weaknesses.length > 0
    ? `\nThis student has repeatedly made these mistakes: ${weaknesses.join(', ')}. Design the problem to help them practise overcoming these specifically.`
    : '';

  const canvasNote = isCanvas
    ? `\nCanvas constraints: all coordinates must be integers strictly within ±${GRID_LIMIT}. Include "canvas_config" with "pointA" and "pointB" as {x, y} pairs. Use coordinates that are different each time.`
    : `\nNo canvas — set "canvas_config" to null.`;

  // Random variation so each generation produces a distinct problem
  const context = pickRandom(CONTEXTS);
  const seedA   = Math.floor(Math.random() * 9) + 1;
  const seedB   = Math.floor(Math.random() * 9) + 1;

  return `You are creating a single math practice problem for a grade 6–8 student (age 11–14).

Topic: ${topic?.title ?? topicId}
Lesson: ${lesson?.title ?? lessonId}
Phase: ${phaseLabel} — this is the ${phase} stage of the Concrete–Pictorial–Abstract learning model.${weaknessNote}${canvasNote}

Real-world context to use: ${context}
Seed numbers to vary around: ${seedA} and ${seedB} (adjust naturally so the answer is clean and the scenario feels realistic)

Rules:
- Ground the problem firmly in the real-world context above — it should feel like something that actually happens.
- Language must be simple and friendly for age 11–14.
- The answer must be mathematically correct.
- Hints must be progressive: hint 1 = what to find, hint 2 = first step, hint 3 = near-complete.
- The solution must show clear step-by-step working.
- Do NOT use the most obvious textbook example (e.g. 3-4-5 triangle, points at (0,0) and (3,4)).
- DO NOT reuse coordinates, numbers, or examples from the guided example in the lesson.

Respond ONLY with valid JSON — no markdown, no commentary:
{
  "prompt": "problem text shown to the student",
  "answer": 5,
  "choices": null,
  "hints": ["what to find", "first step", "near-complete hint"],
  "solution": "Step-by-step solution explanation",
  "canvas_config": { "pointA": {"x": 0, "y": 0}, "pointB": {"x": 3, "y": 4} }
}`;
}

// ─── Generate a single problem via Claude ────────────────────────────────────

async function generateAndStore(
  topicId: string,
  lessonId: string,
  phase: string,
  weaknesses: string[]
): Promise<Problem> {
  const supabase = await createClient();

  // ── Guard: check total pool size before calling Claude ───────────────────
  // Prevents duplicate generation from concurrent requests or repeated calls.
  const { count } = await supabase
    .from('problems')
    .select('id', { count: 'exact', head: true })
    .eq('topic_id', topicId)
    .eq('lesson_id', lessonId)
    .eq('phase', phase)
    .eq('validated', true);

  if ((count ?? 0) >= POOL_TARGET) {
    // Pool is already full — serve a random existing problem instead
    const { data: existing } = await supabase
      .from('problems')
      .select('*')
      .eq('topic_id', topicId)
      .eq('lesson_id', lessonId)
      .eq('phase', phase)
      .eq('validated', true)
      .limit(1)
      .single();
    if (existing) return existing as Problem;
  }

  // ── Pool needs filling — call Claude ──────────────────────────────────────
  const prompt = buildPrompt(topicId, lessonId, phase, weaknesses);

  const response = await anthropic.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  const raw  = response.content[0].type === 'text' ? response.content[0].text : '';
  // Strip markdown code fences if model wraps response in ```json ... ```
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  const generated = JSON.parse(text) as {
    prompt: string;
    answer: number | null;
    choices: string[] | null;
    hints: string[];
    solution: string;
    canvas_config: Problem['canvas_config'];
  };

  // Validate canvas coords before storing
  if (!validateCoords(generated.canvas_config)) {
    throw new Error(`Generated problem has out-of-bounds coordinates: ${JSON.stringify(generated.canvas_config)}`);
  }

  const { data, error } = await supabase
    .from('problems')
    .upsert({
      topic_id: topicId,
      lesson_id: lessonId,
      phase,
      prompt: generated.prompt,
      answer: generated.answer,
      choices: generated.choices,
      hints: generated.hints,
      solution: generated.solution,
      canvas_config: generated.canvas_config,
      difficulty: 2,
      validated: true,
    }, { onConflict: 'topic_id,lesson_id,phase,prompt', ignoreDuplicates: true })
    .select()
    .single();

  if (error) throw error;
  return data as Problem;
}

// ─── Get problem from pool or generate ───────────────────────────────────────

export async function getOrGenerateProblem(
  topicId: string,
  lessonId: string,
  phase: string,
  weaknesses: string[] = []
): Promise<Problem> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Find problems not yet attempted by this user in this phase
  const { data: available } = await supabase
    .from('problems')
    .select('id, topic_id, lesson_id, phase, prompt, answer, choices, hints, solution, canvas_config, difficulty, validated, created_at')
    .eq('topic_id', topicId)
    .eq('lesson_id', lessonId)
    .eq('phase', phase)
    .eq('validated', true)
    .not(
      'id',
      'in',
      `(SELECT problem_id FROM attempts WHERE user_id = '${user.id}' AND topic_id = '${topicId}' AND lesson_id = '${lessonId}' AND phase = '${phase}')`
    )
    .limit(POOL_MIN);

  // Serve from pool if ANY problem is available — no API call needed
  if (available && available.length > 0) {
    // Silently refill pool in background when running low (fire-and-forget)
    if (available.length < POOL_MIN) {
      generateAndStore(topicId, lessonId, phase, weaknesses).catch(() => {});
    }
    return available[Math.floor(Math.random() * available.length)] as Problem;
  }

  // Pool empty — must generate synchronously (first-time only)
  return generateAndStore(topicId, lessonId, phase, weaknesses);
}

// ─── Diagnose error with AI ───────────────────────────────────────────────────

export async function diagnoseError(
  problemPrompt: string,
  correctAnswer: number,
  studentAnswer: number
): Promise<{ label: string; explanation: string }> {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001', // fast + cheap for real-time feedback
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `A grade 7 student answered a math problem incorrectly.

Problem: ${problemPrompt}
Correct answer: ${correctAnswer}
Student answered: ${studentAnswer}

In 1–2 sentences, explain the likely mistake in encouraging language (not critical).
Also give a short error_label (3–5 words, snake_case).

Respond ONLY with valid JSON: { "label": "forgot_square_root", "explanation": "..." }`,
    }],
  });

  const raw  = response.content[0].type === 'text' ? response.content[0].text : '{}';
  const text = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
  try {
    return JSON.parse(text) as { label: string; explanation: string };
  } catch {
    return { label: 'unknown_error', explanation: 'Check your working and try again.' };
  }
}
