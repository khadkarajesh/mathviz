'use client';

import { useState } from 'react';
import { FormativeCheck } from '@/types/curriculum';
import { withinTolerance } from '@/lib/utils/formatters';

interface CheckQuestionProps {
  check: FormativeCheck;
  onPass: () => void;
  hint?: string;
}

export function CheckQuestion({ check, onPass, hint }: CheckQuestionProps) {
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [showHint, setShowHint] = useState(false);

  function handleNumericSubmit() {
    const num = parseFloat(value);
    if (isNaN(num)) return;
    const correct =
      check.correctAnswer !== undefined
        ? withinTolerance(num, check.correctAnswer, check.tolerance ?? 10)
        : true; // no correct answer = any numeric input passes (used for exploration phases)
    setStatus(correct ? 'correct' : 'wrong');
    if (correct) setTimeout(onPass, 800);
  }

  function handleChoiceSelect(idx: number) {
    if (status === 'correct') return;
    setSelected(idx);
    const correct = check.choices![idx].correct;
    setStatus(correct ? 'correct' : 'wrong');
    if (correct) setTimeout(onPass, 900);
  }

  const borderColor =
    status === 'correct' ? 'var(--accent)' : status === 'wrong' ? 'var(--secondary)' : 'var(--border)';

  return (
    <div
      className="rounded-xl border p-4 mt-4 transition-all"
      style={{ borderColor, background: 'var(--surface)' }}
    >
      <p className="font-medium text-sm mb-3" style={{ color: 'var(--text)' }}>
        {check.prompt}
      </p>

      {check.type === 'numeric' && (
        <div className="flex gap-2">
          <input
            type="number"
            value={value}
            onChange={(e) => { setValue(e.target.value); setStatus('idle'); }}
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

      {check.type === 'multiple-choice' && (
        <div className="flex flex-col gap-2">
          {check.choices!.map((choice, i) => {
            const isSelected = selected === i;
            const bg =
              isSelected && status === 'correct'
                ? 'rgba(67,217,162,0.15)'
                : isSelected && status === 'wrong'
                ? 'rgba(255,101,132,0.12)'
                : 'var(--surface-2)';
            const border =
              isSelected && status === 'correct'
                ? 'var(--accent)'
                : isSelected && status === 'wrong'
                ? 'var(--secondary)'
                : 'var(--border)';
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

      <div className="flex items-center justify-between mt-3">
        {status === 'wrong' && hint && !showHint && (
          <button
            onClick={() => setShowHint(true)}
            className="text-xs underline"
            style={{ color: 'var(--primary)' }}
          >
            Show hint
          </button>
        )}
        {showHint && <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
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
    </div>
  );
}
