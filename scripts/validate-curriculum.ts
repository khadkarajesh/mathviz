/**
 * Curriculum coordinate bounds validator
 *
 * Rules enforced:
 * 1. CoordinateGeometryCanvas: pointA and pointB in canvasInitialState must be within ±GRID_LIMIT
 * 2. GuidedExample steps: coordinates in instruction text must be within ±GRID_LIMIT
 * 3. Formative check prompts (numeric, canvas-based): coordinates must be within ±GRID_LIMIT
 * 4. No coordinate pair used in a guidedExample step may reappear in the same phase's
 *    formativeCheck prompt — the practice problem must differ from the worked example.
 *
 * Exit code 1 if any violations found — causes `npm run build` to fail.
 */

import { allTopics } from '../lib/curriculum/index';
import { CurriculumTopic, CPAPhaseConfig } from '../types/curriculum';

const GRID_LIMIT = 6; // safe max absolute value for canvas coordinates

interface Violation {
  location: string;
  message: string;
}

const violations: Violation[] = [];

function fail(location: string, message: string) {
  violations.push({ location, message });
}

// ── Coordinate point validators ──────────────────────────────────────────────

function checkPoint(
  x: unknown,
  y: unknown,
  location: string
) {
  if (typeof x === 'number' && Math.abs(x) > GRID_LIMIT) {
    fail(location, `x = ${x} exceeds grid limit ±${GRID_LIMIT}`);
  }
  if (typeof y === 'number' && Math.abs(y) > GRID_LIMIT) {
    fail(location, `y = ${y} exceeds grid limit ±${GRID_LIMIT}`);
  }
}

function checkCanvasInitialState(
  state: Record<string, unknown>,
  canvas: string,
  location: string
) {
  // Only CoordinateGeometryCanvas uses draggable coordinate points
  if (canvas !== 'CoordinateGeometryCanvas') return;

  const pointA = state.pointA as Record<string, unknown> | undefined;
  const pointB = state.pointB as Record<string, unknown> | undefined;

  if (pointA) checkPoint(pointA.x, pointA.y, `${location} → canvasInitialState.pointA`);
  if (pointB) checkPoint(pointB.x, pointB.y, `${location} → canvasInitialState.pointB`);
}

// ── Guided example text validator ────────────────────────────────────────────
// Extracts coordinate pairs like "(3, 4)", "(−5, 2)", "(-3, 4)" from instruction text

const COORD_REGEX = /\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)/g;

function extractCoordPairs(text: string): Set<string> {
  const pairs = new Set<string>();
  for (const match of text.matchAll(COORD_REGEX)) {
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    pairs.add(`${x},${y}`);
  }
  return pairs;
}

function checkGuidedStepText(text: string, location: string) {
  for (const match of text.matchAll(COORD_REGEX)) {
    const x = parseInt(match[1], 10);
    const y = parseInt(match[2], 10);
    if (Math.abs(x) > GRID_LIMIT) {
      fail(location, `Coordinate (${x}, ${y}) in text: x = ${x} exceeds ±${GRID_LIMIT}`);
    }
    if (Math.abs(y) > GRID_LIMIT) {
      fail(location, `Coordinate (${x}, ${y}) in text: y = ${y} exceeds ±${GRID_LIMIT}`);
    }
  }
}

// ── Rule 4: guided example coords must not reappear in practice prompt ────────

function checkNoCoordReuse(phase: CPAPhaseConfig, location: string) {
  if (!phase.guidedExample || phase.canvasComponent !== 'CoordinateGeometryCanvas') return;
  if (phase.formativeCheck.type !== 'numeric') return;

  const guidedCoords = new Set<string>();
  for (const step of phase.guidedExample.steps) {
    for (const pair of extractCoordPairs(step.instruction)) {
      guidedCoords.add(pair);
    }
  }

  for (const pair of extractCoordPairs(phase.formativeCheck.prompt)) {
    if (guidedCoords.has(pair)) {
      const [x, y] = pair.split(',');
      fail(
        `${location} → formativeCheck.prompt`,
        `Coordinate (${x}, ${y}) was already used in the guided example — practice must use different coordinates.`
      );
    }
  }
}

// ── Phase validator ───────────────────────────────────────────────────────────

function validatePhase(phase: CPAPhaseConfig, location: string) {
  // 1. Canvas initial state points
  checkCanvasInitialState(phase.canvasInitialState, phase.canvasComponent, location);

  // 2. Guided example steps — only check instruction text for CoordinateGeometryCanvas
  //    (other canvases don't ask students to drag to specific coordinates)
  if (phase.guidedExample && phase.canvasComponent === 'CoordinateGeometryCanvas') {
    phase.guidedExample.steps.forEach((step, i) => {
      checkGuidedStepText(
        step.instruction,
        `${location} → guidedExample.steps[${i}].instruction`
      );
    });
  }

  // 3. Formative check prompt — flag coordinates in canvas-based problems
  //    (skip multiple-choice: those are word problems, no canvas dragging required)
  if (
    phase.formativeCheck.type === 'numeric' &&
    phase.canvasComponent === 'CoordinateGeometryCanvas'
  ) {
    checkGuidedStepText(
      phase.formativeCheck.prompt,
      `${location} → formativeCheck.prompt`
    );
  }

  // 4. Practice problem must not reuse guided example coordinates
  checkNoCoordReuse(phase, location);
}

// ── Topic validator ───────────────────────────────────────────────────────────

function validateTopic(topic: CurriculumTopic) {
  topic.lessons.forEach((lesson) => {
    lesson.phases.forEach((phase) => {
      const location = `${topic.subject}/${topic.id}/${lesson.id}/${phase.phase}`;
      validatePhase(phase, location);
    });
  });
}

// ── Run ───────────────────────────────────────────────────────────────────────

console.log(`\n🔍 Validating curriculum coordinates (grid limit: ±${GRID_LIMIT})...\n`);

allTopics.forEach(validateTopic);

if (violations.length === 0) {
  console.log(`✅ All ${allTopics.flatMap((t) => t.lessons).length} lessons passed — no out-of-bounds coordinates found.\n`);
  process.exit(0);
} else {
  console.error(`❌ Found ${violations.length} violation${violations.length > 1 ? 's' : ''}:\n`);
  violations.forEach(({ location, message }) => {
    console.error(`  • ${location}`);
    console.error(`    ${message}\n`);
  });
  console.error(`Fix these before deploying. Coordinates must stay within ±${GRID_LIMIT} so they are visible on the canvas.\n`);
  process.exit(1);
}
