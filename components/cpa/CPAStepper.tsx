'use client';

import { useState } from 'react';
import { CPAPhase, CPAPhaseConfig, Lesson } from '@/types/curriculum';
import { useLocalProgress } from '@/lib/hooks/useLocalProgress';
import { CheckQuestion } from '@/components/controls/CheckQuestion';
import { NarrativeFrame } from './NarrativeFrame';
import { canvasRegistry } from '@/lib/curriculum/canvasRegistry';

const PHASES: CPAPhase[] = ['concrete', 'visual', 'abstract'];

const phaseLabels: Record<CPAPhase, string> = {
  concrete: 'Build It',
  visual: 'See It',
  abstract: 'Own It',
};

const phaseColors: Record<CPAPhase, string> = {
  concrete: 'var(--accent)',
  visual: 'var(--primary)',
  abstract: 'var(--secondary)',
};

const phaseDescriptions: Record<CPAPhase, string> = {
  concrete: 'Hands-on manipulation',
  visual: 'Patterns emerge',
  abstract: 'The formula',
};

interface CPAStepperProps {
  lesson: Lesson;
  subject: 'geometry' | 'statistics';
}

export function CPAStepper({ lesson, subject }: CPAStepperProps) {
  const { markPhaseComplete, isPhaseComplete } = useLocalProgress();
  const [activePhase, setActivePhase] = useState<CPAPhase>(() => {
    // start at first incomplete phase
    for (const p of PHASES) {
      if (!isPhaseComplete(lesson.id, p)) return p;
    }
    return 'abstract';
  });

  const phaseConfig = lesson.phases.find((p) => p.phase === activePhase)!;
  const activeIndex = PHASES.indexOf(activePhase);

  function canAccessPhase(phase: CPAPhase): boolean {
    const idx = PHASES.indexOf(phase);
    if (idx === 0) return true;
    return isPhaseComplete(lesson.id, PHASES[idx - 1]);
  }

  function handlePhasePass() {
    markPhaseComplete(lesson.id, lesson.topicId, activePhase);
    const next = PHASES[activeIndex + 1];
    if (next) setTimeout(() => setActivePhase(next), 400);
  }

  const CanvasComponent = canvasRegistry[phaseConfig.canvasComponent];

  return (
    <div>
      <NarrativeFrame narrative={lesson.narrative} subject={subject} />

      {/* Phase tab bar */}
      <div className="flex gap-2 mb-6">
        {PHASES.map((phase, i) => {
          const done = isPhaseComplete(lesson.id, phase);
          const active = phase === activePhase;
          const accessible = canAccessPhase(phase);
          const color = phaseColors[phase];

          return (
            <button
              key={phase}
              onClick={() => accessible && setActivePhase(phase)}
              disabled={!accessible}
              className="flex-1 rounded-xl border py-2 px-3 text-center transition-all"
              style={{
                borderColor: active ? color : done ? color : 'var(--border)',
                background: active
                  ? `${color}15`
                  : done
                  ? `${color}08`
                  : 'var(--surface)',
                opacity: accessible ? 1 : 0.4,
                cursor: accessible ? 'pointer' : 'not-allowed',
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

      {/* Two-column layout: instruction + canvas, check below */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: instructions + formative check */}
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

          <CheckQuestion
            check={phaseConfig.formativeCheck}
            hint={phaseConfig.hint}
            onPass={handlePhasePass}
          />

          {isPhaseComplete(lesson.id, activePhase) && activeIndex === PHASES.length - 1 && (
            <div
              className="mt-4 rounded-xl p-4 text-center border"
              style={{
                background: 'rgba(67,217,162,0.1)',
                borderColor: 'var(--accent)',
              }}
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

        {/* Right: interactive canvas */}
        <div
          className="rounded-xl border overflow-hidden"
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
    </div>
  );
}
