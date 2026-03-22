'use client';

import { CPAPhase } from '@/types/curriculum';
import { PhaseBridgeSummary } from '@/types/curriculum';

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

// ── Between-phase transition card ────────────────────────────────────────────

interface PhaseBridgeTransitionProps {
  completedPhase: CPAPhase;
  nextPhase: CPAPhase;
  onContinue: () => void;
}

export function PhaseBridgeTransition({
  completedPhase,
  nextPhase,
  onContinue,
}: PhaseBridgeTransitionProps) {
  const doneColor = phaseColors[completedPhase];
  const nextColor = phaseColors[nextPhase];

  return (
    <div
      className="rounded-xl border p-6 text-center flex flex-col gap-4"
      style={{ background: 'var(--surface)', borderColor: doneColor }}
    >
      <div>
        <span
          className="text-2xl font-bold"
          style={{ color: doneColor }}
        >
          ✓ {phaseLabels[completedPhase]} complete
        </span>
      </div>
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
        You&apos;re ready to move deeper into the concept.
      </p>
      <button
        onClick={onContinue}
        className="mx-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-95"
        style={{ background: nextColor }}
      >
        Continue to {phaseLabels[nextPhase]} →
      </button>
    </div>
  );
}

// ── Final lesson bridge — all 3 representations side by side ──────────────────

interface PhaseBridgeProps {
  summary: PhaseBridgeSummary;
}

export function PhaseBridge({ summary }: PhaseBridgeProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div
        className="rounded-xl border px-5 py-4"
        style={{ background: 'var(--surface)', borderColor: 'var(--accent)' }}
      >
        <p className="text-xs font-bold mb-1" style={{ color: 'var(--accent)' }}>
          PUTTING IT ALL TOGETHER
        </p>
        <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
          {summary.keyInsight}
        </p>
      </div>

      {/* Three phase cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {(
          [
            { phase: 'concrete' as CPAPhase, caption: summary.buildItCaption },
            { phase: 'visual'   as CPAPhase, caption: summary.seeItCaption  },
            { phase: 'abstract' as CPAPhase, caption: summary.ownItCaption  },
          ] as const
        ).map(({ phase, caption }) => (
          <div
            key={phase}
            className="rounded-xl border p-4 flex flex-col gap-2"
            style={{
              background: 'var(--surface)',
              borderColor: phaseColors[phase],
            }}
          >
            <p
              className="text-xs font-bold"
              style={{ color: phaseColors[phase] }}
            >
              {phaseLabels[phase].toUpperCase()}
            </p>
            <p className="text-sm leading-snug" style={{ color: 'var(--text)' }}>
              {caption}
            </p>
          </div>
        ))}
      </div>

      {/* Lesson complete badge */}
      <div
        className="rounded-xl p-4 text-center border"
        style={{ background: 'rgba(67,217,162,0.1)', borderColor: 'var(--accent)' }}
      >
        <p className="font-bold text-sm" style={{ color: 'var(--accent)' }}>
          Lesson complete!
        </p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
          You worked through all three phases. Come back in a few days to review.
        </p>
      </div>
    </div>
  );
}
