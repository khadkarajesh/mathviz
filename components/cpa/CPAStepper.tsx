'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { CPAPhase, Lesson, FormativeCheck } from '@/types/curriculum';
import { useLocalProgress } from '@/lib/hooks/useLocalProgress';
import { CheckQuestion, AttemptData } from '@/components/controls/CheckQuestion';
import { NarrativeFrame } from './NarrativeFrame';
import { GuidedExample } from './GuidedExample';
import { PhaseBridge, PhaseBridgeTransition } from './PhaseBridge';
import { canvasRegistry } from '@/lib/curriculum/canvasRegistry';
import { getOrGenerateProblem } from '@/app/actions/generateProblem';
import { recordAttempt, getWeakSpots } from '@/app/actions/progress';
import type { Problem } from '@/types/database';

const PHASES: CPAPhase[] = ['concrete', 'visual', 'abstract'];

const phaseLabels: Record<CPAPhase, string> = {
  concrete: 'Build It',
  visual:   'See It',
  abstract: 'Own It',
};

const phaseColors: Record<CPAPhase, string> = {
  concrete: 'var(--accent)',
  visual:   'var(--primary)',
  abstract: 'var(--secondary)',
};

const phaseDescriptions: Record<CPAPhase, string> = {
  concrete: 'Hands-on manipulation',
  visual:   'Patterns emerge',
  abstract: 'The formula',
};

interface CPAStepperProps {
  lesson: Lesson;
  subject: 'geometry' | 'statistics';
}

export function CPAStepper({ lesson, subject }: CPAStepperProps) {
  const { markPhaseComplete, isPhaseComplete } = useLocalProgress();

  const [activePhase, setActivePhaseRaw] = useState<CPAPhase>(() => {
    for (const p of PHASES) {
      if (!isPhaseComplete(lesson.id, p)) return p;
    }
    return 'abstract';
  });

  const [guidedDismissed, setGuidedDismissed] = useState<Partial<Record<CPAPhase, boolean>>>({});
  const [checkIdx,    setCheckIdx]    = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [phaseBridgeActive,  setPhaseBridgeActive]  = useState(false);
  const [lessonBridgeActive, setLessonBridgeActive] = useState(false);

  // AI problem state
  const [aiProblem,      setAIProblem]      = useState<Problem | null>(null);
  const [loadingProblem, setLoadingProblem] = useState(false);
  const weaknessesRef = useRef<string[]>([]); // ref avoids re-triggering fetch effect

  const phaseConfig = lesson.phases.find((p) => p.phase === activePhase)!;
  const activeIndex = PHASES.indexOf(activePhase);

  const allChecks: FormativeCheck[] = [
    phaseConfig.formativeCheck,
    ...(phaseConfig.extraChecks ?? []),
  ];
  const currentCheck = allChecks[checkIdx];
  const problemLabel = allChecks.length > 1
    ? `Problem ${checkIdx + 1} of ${allChecks.length}`
    : undefined;

  const checkHints = currentCheck.hints ?? (checkIdx === 0 ? phaseConfig.hints : undefined);
  const checkHint  = checkIdx === 0 ? phaseConfig.hint : undefined;

  const showGuided =
    !!phaseConfig.guidedExample &&
    !guidedDismissed[activePhase] &&
    !isPhaseComplete(lesson.id, activePhase);

  const nextPhase = PHASES[activeIndex + 1] as CPAPhase | undefined;

  // ── Fetch weak spots once on mount (stored in ref — no re-render side-effects)
  useEffect(() => {
    getWeakSpots(lesson.topicId, lesson.id, activePhase)
      .then((w) => { weaknessesRef.current = w; })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch AI problem when phase or check index changes ────────────────────
  const fetchAIProblem = useCallback(() => {
    let cancelled = false;
    setAIProblem(null);
    setLoadingProblem(true);

    getOrGenerateProblem(lesson.topicId, lesson.id, activePhase, weaknessesRef.current)
      .then((p) => { if (!cancelled) setAIProblem(p); })
      .catch(() => { /* fall back to curriculum check silently */ })
      .finally(() => { if (!cancelled) setLoadingProblem(false); });

    return () => { cancelled = true; };
  }, [activePhase, lesson.topicId, lesson.id]); // weaknessesRef is stable — no dependency needed

  useEffect(() => {
    const cancel = fetchAIProblem();
    return cancel;
  }, [fetchAIProblem]);

  // ── Phase navigation ──────────────────────────────────────────────────────
  function setActivePhase(phase: CPAPhase) {
    setCheckIdx(0);
    setPassedCount(0);
    setPhaseBridgeActive(false);
    setActivePhaseRaw(phase);
  }

  function canAccessPhase(phase: CPAPhase): boolean {
    const idx = PHASES.indexOf(phase);
    if (idx === 0) return true;
    return isPhaseComplete(lesson.id, PHASES[idx - 1]);
  }

  // ── Attempt recording ─────────────────────────────────────────────────────
  function handleAttempt(data: AttemptData) {
    if (!aiProblem) return;
    recordAttempt({
      problemId: aiProblem.id,
      topicId: lesson.topicId,
      lessonId: lesson.id,
      phase: activePhase,
      correct: data.correct,
      answerGiven: data.answerGiven,
      hintsUsed: data.hintsUsed,
      timeSeconds: data.timeSeconds,
      aiErrorLabel: data.aiErrorLabel,
      solutionRevealed: data.solutionRevealed,
    }).catch(console.error);
  }

  // ── Problem flow ──────────────────────────────────────────────────────────
  function handleCheckPass() {
    const newPassed = passedCount + 1;
    if (checkIdx < allChecks.length - 1) {
      setPassedCount(newPassed);
      setCheckIdx((i) => i + 1);
      // fetchAIProblem will re-run via useEffect on checkIdx change
    } else {
      finishPhase(newPassed);
    }
  }

  function handleCheckFail() {
    if (checkIdx < allChecks.length - 1) {
      setCheckIdx((i) => i + 1);
    } else {
      finishPhase(passedCount);
    }
  }

  function finishPhase(finalPassed: number) {
    void finalPassed;
    markPhaseComplete(lesson.id, lesson.topicId, activePhase);
    if (nextPhase) {
      setPhaseBridgeActive(true);
    } else if (lesson.phaseBridge) {
      setLessonBridgeActive(true);
    }
  }

  function handleGuidedComplete() {
    setGuidedDismissed((prev) => ({ ...prev, [activePhase]: true }));
  }

  const CanvasComponent = canvasRegistry[phaseConfig.canvasComponent];

  return (
    <div>
      <NarrativeFrame narrative={lesson.narrative} subject={subject} />

      {/* Phase tab bar */}
      <div className="flex gap-2 mb-6">
        {PHASES.map((phase, i) => {
          const done       = isPhaseComplete(lesson.id, phase);
          const active     = phase === activePhase;
          const accessible = canAccessPhase(phase);
          const color      = phaseColors[phase];

          return (
            <button
              key={phase}
              onClick={() => accessible && setActivePhase(phase)}
              disabled={!accessible}
              className="flex-1 rounded-xl border py-2 px-3 text-center transition-all"
              style={{
                borderColor: active ? color : done ? color : 'var(--border)',
                background:  active ? `${color}15` : done ? `${color}08` : 'var(--surface)',
                opacity:     accessible ? 1 : 0.4,
                cursor:      accessible ? 'pointer' : 'not-allowed',
              }}
            >
              <div
                className="text-xs font-bold mb-0.5 flex items-center justify-center gap-1"
                style={{ color: active || done ? color : 'var(--text-muted)' }}
              >
                {done ? '✓' : `${i + 1}.`} {phaseLabels[phase]}
              </div>
              <div className="text-xs hidden sm:block" style={{ color: 'var(--text-muted)' }}>
                {phaseDescriptions[phase]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Guided example */}
      {showGuided && (
        <GuidedExample
          guided={phaseConfig.guidedExample!}
          canvasSlot={
            CanvasComponent ? (
              <CanvasComponent
                initialState={phaseConfig.canvasInitialState as never}
                phase={activePhase}
                readOnly={false}
              />
            ) : null
          }
          onComplete={handleGuidedComplete}
        />
      )}

      {/* Between-phase bridge */}
      {!showGuided && phaseBridgeActive && nextPhase && (
        <PhaseBridgeTransition
          completedPhase={activePhase}
          nextPhase={nextPhase}
          onContinue={() => setTimeout(() => setActivePhase(nextPhase), 100)}
        />
      )}

      {/* Lesson-complete bridge */}
      {!showGuided && lessonBridgeActive && lesson.phaseBridge && (
        <PhaseBridge summary={lesson.phaseBridge} />
      )}

      {/* Normal two-column layout */}
      {!showGuided && !phaseBridgeActive && !lessonBridgeActive && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <div
              className="rounded-xl border p-4 mb-4"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              <div
                className="text-xs font-bold mb-2"
                style={{ color: phaseColors[activePhase] }}
              >
                {phaseLabels[activePhase].toUpperCase()}
              </div>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
                {phaseConfig.instructionText}
              </p>
            </div>

            {/* Problem loading state */}
            {loadingProblem && !aiProblem && (
              <div
                className="rounded-xl border p-4 mt-4 animate-pulse"
                style={{ borderColor: 'var(--border)', background: 'var(--surface)' }}
              >
                <div className="h-3 rounded mb-3" style={{ background: 'var(--surface-2)', width: '60%' }} />
                <div className="h-3 rounded mb-2" style={{ background: 'var(--surface-2)', width: '90%' }} />
                <div className="h-3 rounded" style={{ background: 'var(--surface-2)', width: '75%' }} />
              </div>
            )}

            {/* Check question — shown once we have an AI problem or if AI is unavailable */}
            {(!loadingProblem || aiProblem) && (
              <CheckQuestion
                key={`${activePhase}-${checkIdx}-${aiProblem?.id ?? 'curriculum'}`}
                check={currentCheck}
                onPass={handleCheckPass}
                onFail={handleCheckFail}
                hint={checkHint}
                hints={checkHints}
                problemLabel={problemLabel}
                aiProblem={aiProblem}
                onAttempt={handleAttempt}
              />
            )}

            {/* Lesson complete fallback */}
            {isPhaseComplete(lesson.id, activePhase) &&
              activeIndex === PHASES.length - 1 &&
              !lesson.phaseBridge && (
                <div
                  className="mt-4 rounded-xl p-4 text-center border"
                  style={{ background: 'rgba(67,217,162,0.1)', borderColor: 'var(--accent)' }}
                >
                  <p className="font-bold text-sm" style={{ color: 'var(--accent)' }}>
                    Lesson complete!
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                    You moved through all three phases.
                  </p>
                </div>
              )}
          </div>

          {/* Right: canvas */}
          <div
            className="rounded-xl border"
            style={{
              background: 'var(--surface)',
              borderColor: 'var(--border)',
              minHeight: 360,
            }}
          >
            {CanvasComponent ? (
              <CanvasComponent
                initialState={phaseConfig.canvasInitialState as never}
                phase={activePhase}
                readOnly={false}
              />
            ) : (
              <div
                className="flex items-center justify-center h-full text-sm"
                style={{ color: 'var(--text-muted)', minHeight: 360 }}
              >
                <div className="text-center p-8">
                  <div className="text-4xl mb-3">🔧</div>
                  <p className="font-medium">Canvas coming soon</p>
                  <p className="text-xs mt-1">{phaseConfig.canvasComponent}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
