'use client';

import { useState } from 'react';
import { FormativeCheck, ErrorPattern } from '@/types/curriculum';
import { withinTolerance } from '@/lib/utils/formatters';

interface CheckQuestionProps {
  check: FormativeCheck;
  onPass: () => void;
  onFail: () => void;      // called when student clicks "Got it" after solution reveal
  hint?: string;           // phase-level hint (primary check only)
  hints?: string[];        // phase-level 3-level hints (primary check only)
  problemLabel?: string;   // e.g. "Problem 1 of 2"
}

export function CheckQuestion({
  check,
  onPass,
  onFail,
  hint,
  hints,
  problemLabel,
}: CheckQuestionProps) {
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'revealed'>('idle');
  const [hintLevel, setHintLevel] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [diagnosedError, setDiagnosedError] = useState<ErrorPattern | null>(null);

  // Merge check-level hints (extraChecks) with phase-level hints (primary check)
  const allHints = check.hints ?? hints ?? (hint ? [hint] : []);
  const hintLabels = ['What am I looking for?', 'Show me the first step', 'Show me the full solution'];

  // Solution text: explicit field first, then fall back to the last hint
  const solutionText = check.solutionReveal ?? (allHints.length > 0 ? allHints[allHints.length - 1] : null);

  // Show reveal button when: numeric, wrong, all hints shown, solution text available
  const showRevealButton =
    check.type === 'numeric' &&
    status === 'wrong' &&
    hintLevel >= allHints.length &&
    !!solutionText;

  function diagnose(answer: number): ErrorPattern | null {
    return check.errorPatterns?.find((p) => p.match(answer)) ?? null;
  }

  function handleNumericSubmit() {
    if (status === 'correct' || status === 'revealed') return;
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const correct =
      check.correctAnswer !== undefined
        ? withinTolerance(num, check.correctAnswer, check.tolerance ?? 10)
        : true;
    if (correct) {
      setDiagnosedError(null);
      setStatus('correct');
      setTimeout(onPass, 800);
    } else {
      setDiagnosedError(diagnose(num));
      setWrongCount((c) => c + 1);
      setStatus('wrong');
    }
  }

  function handleChoiceSelect(idx: number) {
    if (status === 'correct' || status === 'revealed') return;
    setSelected(idx);
    const correct = check.choices![idx].correct;
    if (correct) {
      setStatus('correct');
      setTimeout(onPass, 900);
    } else {
      setWrongCount((c) => c + 1);
      setStatus('wrong');
    }
  }

  const borderColor =
    status === 'correct'  ? 'var(--accent)'     :
    status === 'wrong'    ? 'var(--secondary)'  :
    status === 'revealed' ? 'var(--primary)'    :
    'var(--border)';

  return (
    <div
      className="rounded-xl border p-4 mt-4 transition-all"
      style={{ borderColor, background: 'var(--surface)' }}
    >
      {/* Problem label */}
      {problemLabel && (
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
          {problemLabel}
        </p>
      )}

      <p className="font-medium text-sm mb-3" style={{ color: 'var(--text)' }}>
        {check.prompt}
      </p>

      {/* Numeric input */}
      {check.type === 'numeric' && status !== 'revealed' && (
        <div className="flex gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              setStatus('idle');
              setDiagnosedError(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleNumericSubmit()}
            disabled={status === 'correct'}
            placeholder="Your answer"
            className="flex-1 border rounded-lg px-3 py-2 text-sm font-[var(--font-mono)] transition-colors"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--surface-2)',
              color: 'var(--text)',
            }}
          />
          <button
            onClick={handleNumericSubmit}
            disabled={status === 'correct'}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-colors"
            style={{ background: status === 'correct' ? 'var(--accent)' : 'var(--primary)' }}
          >
            {status === 'correct' ? '✓' : 'Check'}
          </button>
        </div>
      )}

      {/* Multiple choice */}
      {check.type === 'multiple-choice' && (
        <div className="flex flex-col gap-2">
          {check.choices!.map((choice, i) => {
            const isSelected = selected === i;
            const bg =
              isSelected && status === 'correct' ? 'rgba(67,217,162,0.15)' :
              isSelected && status === 'wrong'   ? 'rgba(255,101,132,0.12)' :
              'var(--surface-2)';
            const border =
              isSelected && status === 'correct' ? 'var(--accent)'     :
              isSelected && status === 'wrong'   ? 'var(--secondary)'  :
              'var(--border)';
            return (
              <button
                key={i}
                onClick={() => handleChoiceSelect(i)}
                disabled={status === 'correct'}
                className="text-left border rounded-lg px-3 py-2 text-sm transition-all"
                style={{ borderColor: border, background: bg, color: 'var(--text)' }}
              >
                {choice.label}
              </button>
            );
          })}
        </div>
      )}

      {/* Solution reveal panel */}
      {status === 'revealed' && solutionText && (
        <div className="mt-3">
          <div
            className="rounded-lg px-3 py-3 border-l-2 mb-3"
            style={{ borderColor: 'var(--primary)', background: 'rgba(108,99,255,0.08)' }}
          >
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--primary)' }}>
              WORKED SOLUTION
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text)' }}>
              {solutionText}
            </p>
          </div>
          <button
            onClick={onFail}
            className="w-full py-2 rounded-lg text-sm font-semibold transition-all border"
            style={{
              background: 'var(--surface-2)',
              color: 'var(--text)',
              borderColor: 'var(--border)',
            }}
          >
            Got it — next problem →
          </button>
        </div>
      )}

      {/* Status row */}
      <div className="mt-3">
        {status === 'correct' && (
          <p className="text-xs font-semibold" style={{ color: 'var(--accent)' }}>
            Correct! Moving on...
          </p>
        )}
        {status === 'wrong' && (
          <p className="text-xs" style={{ color: 'var(--secondary)' }}>
            Not quite — try again.
          </p>
        )}
      </div>

      {/* Error diagnosis card — shown immediately when a named mistake is detected */}
      {status === 'wrong' && diagnosedError && (
        <div
          className="mt-2 rounded-lg px-3 py-2 border-l-2"
          style={{ borderColor: 'var(--statistics)', background: 'rgba(245,158,11,0.07)' }}
        >
          <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--statistics)' }}>
            Looks like: {diagnosedError.label}
          </p>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            {diagnosedError.explanation}
          </p>
        </div>
      )}

      {/* Progressive hints — only after a wrong attempt */}
      {status === 'wrong' && allHints.length > 0 && (
        <div className="mt-3 flex flex-col gap-2">
          {allHints.slice(0, hintLevel).map((h, i) => (
            <div
              key={i}
              className="rounded-lg px-3 py-2 border-l-2 text-sm"
              style={{
                borderColor: i === 2 ? 'var(--secondary)' : i === 1 ? 'var(--primary)' : 'var(--accent)',
                background:  i === 2 ? 'rgba(255,101,132,0.06)' : i === 1 ? 'rgba(108,99,255,0.06)' : 'rgba(67,217,162,0.06)',
                color: 'var(--text)',
              }}
            >
              <p
                className="text-xs font-bold mb-0.5"
                style={{ color: i === 2 ? 'var(--secondary)' : i === 1 ? 'var(--primary)' : 'var(--accent)' }}
              >
                {hintLabels[i]}
              </p>
              <p>{h}</p>
            </div>
          ))}
          {hintLevel < allHints.length && (
            <button
              onClick={() => setHintLevel((l) => l + 1)}
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all self-start"
              style={{
                borderColor: 'var(--primary)',
                color: 'var(--primary)',
                background: 'rgba(108,99,255,0.06)',
              }}
            >
              {hintLabels[hintLevel]} →
            </button>
          )}
        </div>
      )}

      {/* "Show me the solution" — appears once all hints shown and still wrong */}
      {showRevealButton && (
        <button
          onClick={() => setStatus('revealed')}
          className="mt-3 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all block"
          style={{
            borderColor: 'var(--secondary)',
            color: 'var(--secondary)',
            background: 'rgba(255,101,132,0.06)',
          }}
        >
          I&apos;m still stuck — show me the solution
        </button>
      )}

      {/* wrongCount counter (visible only when stuck with no hints available) */}
      {status === 'wrong' && wrongCount >= 2 && allHints.length === 0 && !showRevealButton && (
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          Try approaching it differently — re-read the instruction above the canvas.
        </p>
      )}
    </div>
  );
}
