import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createServiceClient } from '@/lib/supabase/service';
import { allTopics } from '@/lib/curriculum';

const anthropic   = new Anthropic();
const POOL_TARGET = 10; // problems to maintain per topic/lesson/phase
const MAX_PER_RUN = 20; // max Claude calls per cron invocation (cost guard)
const GRID_LIMIT  = 6;

// ── Helpers ───────────────────────────────────────────────────────────────────

function stripFences(text: string) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();
}

function validateCoords(config: unknown): boolean {
  if (!config || typeof config !== 'object') return true;
  const c = config as Record<string, { x: number; y: number } | undefined>;
  for (const key of ['pointA', 'pointB']) {
    const p = c[key];
    if (p && (Math.abs(p.x) > GRID_LIMIT || Math.abs(p.y) > GRID_LIMIT)) return false;
  }
  return true;
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

function randomIntBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function generateOne(
  topicTitle: string,
  lessonTitle: string,
  phase: string,
  isCanvas: boolean
) {
  const phaseLabel = { concrete: 'hands-on/concrete', visual: 'visual/pictorial', abstract: 'formula/abstract' }[phase] ?? phase;
  const canvasNote = isCanvas
    ? `All coordinates must be integers strictly within ±${GRID_LIMIT}. Include "canvas_config" with "pointA" and "pointB". Use coordinates that are different each time.`
    : `Set "canvas_config" to null.`;

  // Inject variation so each generation produces a distinct problem
  const context   = pickRandom(CONTEXTS);
  const seedA     = randomIntBetween(1, 9);
  const seedB     = randomIntBetween(1, 9);
  const variation = `${context}. Use numbers near ${seedA} and ${seedB} — adjust naturally so the answer is clean and the scenario feels realistic.`;

  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Generate ONE math practice problem for a grade 6–8 student.

Topic: ${topicTitle}
Lesson: ${lessonTitle}
Phase: ${phaseLabel} (Concrete–Pictorial–Abstract model)
${canvasNote}

Real-world context to use: ${variation}

Rules:
- Ground the problem firmly in the real-world context above — it should feel like something that actually happens.
- Simple, friendly language for age 11–14.
- Mathematically correct answer.
- Progressive hints: what to find → first step → near-complete.
- Clear step-by-step solution.
- Do NOT use the most obvious textbook example (e.g. 3-4-5 triangle, points at (0,0) and (3,4)).

Respond ONLY with valid JSON (no markdown fences):
{
  "prompt": "...",
  "answer": 5,
  "hints": ["...", "...", "..."],
  "solution": "Step 1: ...",
  "canvas_config": null
}`,
    }],
  });

  const raw  = response.content[0].type === 'text' ? response.content[0].text : '';
  const text = stripFences(raw);
  const parsed = JSON.parse(text);

  if (!validateCoords(parsed.canvas_config)) {
    throw new Error('Out-of-bounds coordinates in generated problem');
  }

  return parsed as {
    prompt: string;
    answer: number;
    hints: string[];
    solution: string;
    canvas_config: unknown;
  };
}

// ── Cron handler ──────────────────────────────────────────────────────────────

export async function GET(request: Request) {
  // Verify Vercel cron signature
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceClient();
  const results = { generated: 0, skipped: 0, failed: 0 };
  let remaining = MAX_PER_RUN;

  for (const topic of allTopics) {
    if (remaining <= 0) break;

    for (const lesson of topic.lessons) {
      if (remaining <= 0) break;

      for (const phase of lesson.phases) {
        if (remaining <= 0) break;

        // Check current pool size
        const { count } = await supabase
          .from('problems')
          .select('id', { count: 'exact', head: true })
          .eq('topic_id', topic.id)
          .eq('lesson_id', lesson.id)
          .eq('phase', phase.phase)
          .eq('validated', true);

        const needed = POOL_TARGET - (count ?? 0);
        if (needed <= 0) {
          results.skipped++;
          continue;
        }

        // Generate only as many as needed (up to remaining budget)
        const toGenerate = Math.min(needed, remaining);

        for (let i = 0; i < toGenerate; i++) {
          try {
            const isCanvas = phase.canvasComponent === 'CoordinateGeometryCanvas';
            const problem  = await generateOne(topic.title, lesson.title, phase.phase, isCanvas);

            const { error } = await supabase
              .from('problems')
              .upsert({
                topic_id:     topic.id,
                lesson_id:    lesson.id,
                phase:        phase.phase,
                prompt:       problem.prompt,
                answer:       problem.answer,
                choices:      null,
                hints:        problem.hints,
                solution:     problem.solution,
                canvas_config: problem.canvas_config ?? null,
                difficulty:   2,
                validated:    true,
              }, { onConflict: 'topic_id,lesson_id,phase,prompt', ignoreDuplicates: true });

            if (error) throw error;

            results.generated++;
            remaining--;
          } catch (e) {
            console.error(`Failed ${topic.id}/${lesson.id}/${phase.phase}:`, e);
            results.failed++;
            remaining--;
          }
        }
      }
    }
  }

  console.log('Cron refill-problems:', results);
  return NextResponse.json(results);
}
