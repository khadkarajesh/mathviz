'use client';

import { useState } from 'react';
import { GuidedExample as GuidedExampleType } from '@/types/curriculum';

interface GuidedExampleProps {
  guided: GuidedExampleType;
  canvasSlot: React.ReactNode; // the live canvas shown alongside steps
  onComplete: () => void;      // called when student taps "Now I'll try it"
}

export function GuidedExample({ guided, canvasSlot, onComplete }: GuidedExampleProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [done, setDone] = useState(false);
  const total = guided.steps.length;
  const step = guided.steps[stepIdx];

  function handleNext() {
    if (stepIdx < total - 1) {
      setStepIdx((i) => i + 1);
    } else {
      setDone(true);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header banner */}
      <div
        className="rounded-xl border px-4 py-3 flex items-center gap-3"
        style={{ borderColor: 'var(--primary)', background: 'rgba(108,99,255,0.07)' }}
      >
        <span className="text-2xl">👩‍🏫</span>
        <div>
          <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--primary)' }}>
            GUIDED EXAMPLE
          </p>
          <p className="text-sm" style={{ color: 'var(--text)' }}>
            {guided.intro}
          </p>
        </div>
      </div>

      {/* Two-column: step card + canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step panel */}
        <div className="flex flex-col gap-4">
          {!done ? (
            <div
              className="rounded-xl border p-5 flex flex-col gap-3"
              style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
            >
              {/* Step progress dots */}
              <div className="flex items-center gap-1.5">
                {guided.steps.map((_, i) => (
                  <div
                    key={i}
                    className="rounded-full transition-all"
                    style={{
                      width: i === stepIdx ? 20 : 8,
                      height: 8,
                      background: i <= stepIdx ? 'var(--primary)' : 'var(--border)',
                    }}
                  />
                ))}
                <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>
                  Step {stepIdx + 1} of {total}
                </span>
              </div>

              {/* Instruction */}
              <div>
                <p className="text-xs font-semibold mb-1" style={{ color: 'var(--primary)' }}>
                  DO THIS ON THE CANVAS →
                </p>
                <p className="text-base font-medium leading-snug" style={{ color: 'var(--text)' }}>
                  {step.instruction}
                </p>
              </div>

              {/* Explanation */}
              <div
                className="rounded-lg px-3 py-2 border-l-2"
                style={{ borderColor: 'var(--accent)', background: 'rgba(67,217,162,0.06)' }}
              >
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--accent)' }}>
                  WHY THIS WORKS
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {step.explanation}
                </p>
              </div>

              <button
                onClick={handleNext}
                className="mt-1 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'var(--primary)' }}
              >
                {stepIdx < total - 1 ? 'Got it, next step →' : 'Done — show me the result'}
              </button>
            </div>
          ) : (
            /* Completion card */
            <div
              className="rounded-xl border p-5 flex flex-col gap-4 text-center"
              style={{ borderColor: 'var(--accent)', background: 'rgba(67,217,162,0.07)' }}
            >
              <div className="text-4xl">🎉</div>
              <p className="font-bold text-base" style={{ color: 'var(--accent)' }}>
                {guided.completionMessage}
              </p>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                You watched how it works. Now solve one yourself — the canvas is ready for you.
              </p>
              <button
                onClick={onComplete}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
                style={{ background: 'var(--accent)' }}
              >
                Now I&apos;ll try it myself →
              </button>
            </div>
          )}
        </div>

        {/* Canvas — live and interactive during the walkthrough */}
        <div
          className="rounded-xl border overflow-hidden"
          style={{ background: 'var(--surface)', borderColor: 'var(--border)', minHeight: 360 }}
        >
          {canvasSlot}
        </div>
      </div>
    </div>
  );
}
