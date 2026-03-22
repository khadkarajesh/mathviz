/**
 * Pre-populates the problem pool in Supabase.
 *
 * Generates PROBLEMS_PER_PHASE problems for every topic/lesson/phase
 * in the curriculum and stores them validated=true.
 *
 * Run once (or when curriculum changes):
 *   npx tsx scripts/seed-problems.ts
 *
 * Uses SUPABASE_SERVICE_ROLE_KEY (bypasses RLS) and ANTHROPIC_API_KEY.
 * Both must be set in .env.local.
 */

import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { allTopics } from '../lib/curriculum/index';

const PROBLEMS_PER_PHASE = 5;
const GRID_LIMIT = 6;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // service role bypasses RLS
);

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Helpers ───────────────────────────────────────────────────────────────────

function validateCoords(config: unknown): boolean {
  if (!config || typeof config !== 'object') return true;
  const c = config as Record<string, { x: number; y: number } | undefined>;
  for (const key of ['pointA', 'pointB']) {
    const p = c[key];
    if (p && (Math.abs(p.x) > GRID_LIMIT || Math.abs(p.y) > GRID_LIMIT)) return false;
  }
  return true;
}

function stripFences(text: string): string {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ── Generation ────────────────────────────────────────────────────────────────

async function generateOne(
  topicTitle: string,
  lessonTitle: string,
  topicId: string,
  lessonId: string,
  phase: string,
  isCanvas: boolean
): Promise<{
  prompt: string; answer: number | null; choices: null;
  hints: string[]; solution: string;
  canvas_config: { pointA?: { x: number; y: number }; pointB?: { x: number; y: number } } | null;
} | null> {
  const phaseLabel = { concrete: 'hands-on/concrete', pictorial: 'visual/pictorial', abstract: 'formula/abstract' }[phase] ?? phase;
  const canvasNote = isCanvas
    ? `All coordinates must be integers strictly within ±${GRID_LIMIT}. Include "canvas_config" with "pointA" and "pointB".`
    : `Set "canvas_config" to null.`;

  const content = `Generate ONE math practice problem for a grade 6–8 student.

Topic: ${topicTitle}
Lesson: ${lessonTitle}
Phase: ${phaseLabel} (Concrete–Pictorial–Abstract model)
${canvasNote}

Rules:
- Simple, friendly language for age 11–14
- Real-world context where natural
- Mathematically correct answer
- Progressive hints: what to find → first step → near-complete
- Clear step-by-step solution

Respond ONLY with valid JSON (no markdown fences):
{
  "prompt": "...",
  "answer": 5,
  "choices": null,
  "hints": ["...", "...", "..."],
  "solution": "Step 1: ...",
  "canvas_config": null
}`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await anthropic.messages.create({
        model: 'claude-opus-4-6',
        max_tokens: 1024,
        messages: [{ role: 'user', content }],
      });
      const text = res.content[0].type === 'text' ? stripFences(res.content[0].text) : '';
      const parsed = JSON.parse(text);
      if (!validateCoords(parsed.canvas_config)) {
        console.warn(`    ⚠ Out-of-bounds coords, retrying...`);
        continue;
      }
      return parsed;
    } catch (e) {
      console.warn(`    ⚠ Attempt ${attempt + 1} failed: ${e}`);
      await sleep(1000);
    }
  }
  return null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🌱 Seeding problem pool (${PROBLEMS_PER_PHASE} problems per phase)...\n`);

  let total = 0;
  let failed = 0;

  for (const topic of allTopics) {
    for (const lesson of topic.lessons) {
      for (const phase of lesson.phases) {
        const label = `${topic.subject}/${topic.id}/${lesson.id}/${phase.phase}`;

        // Check how many already exist
        const { count } = await supabase
          .from('problems')
          .select('id', { count: 'exact', head: true })
          .eq('topic_id', topic.id)
          .eq('lesson_id', lesson.id)
          .eq('phase', phase.phase)
          .eq('validated', true);

        const existing = count ?? 0;
        const needed = PROBLEMS_PER_PHASE - existing;

        if (needed <= 0) {
          console.log(`  ✓ ${label} — already has ${existing}`);
          continue;
        }

        console.log(`  → ${label} — generating ${needed} (has ${existing})...`);
        const isCanvas = phase.canvasComponent === 'CoordinateGeometryCanvas';

        for (let i = 0; i < needed; i++) {
          const problem = await generateOne(topic.title, lesson.title, topic.id, lesson.id, phase.phase, isCanvas);
          if (!problem) {
            console.error(`    ✗ Failed to generate`);
            failed++;
            continue;
          }

          const { error } = await supabase.from('problems').upsert({
            topic_id:     topic.id,
            lesson_id:    lesson.id,
            phase:        phase.phase,
            prompt:       problem.prompt,
            answer:       problem.answer,
            choices:      null,
            hints:        problem.hints,
            solution:     problem.solution,
            canvas_config: problem.canvas_config,
            difficulty:   2,
            validated:    true,
          }, { onConflict: 'topic_id,lesson_id,phase,prompt', ignoreDuplicates: true });

          if (error) {
            console.error(`    ✗ DB insert failed: ${error.message}`);
            failed++;
          } else {
            console.log(`    ✓ ${i + 1}/${needed}`);
            total++;
          }

          // Rate-limit: avoid hitting Anthropic too fast
          await sleep(500);
        }
      }
    }
  }

  console.log(`\n✅ Done — ${total} problems added, ${failed} failed.\n`);
}

main().catch((e) => { console.error(e); process.exit(1); });
