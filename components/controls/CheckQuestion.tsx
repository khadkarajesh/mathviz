'use client';

import { useState, useRef } from 'react';
import { FormativeCheck, ErrorPattern } from '@/types/curriculum';
import { withinTolerance } from '@/lib/utils/formatters';
import { diagnoseError } from '@/app/actions/generateProblem';
import type { Problem } from '@/types/database';

export interface AttemptData {
  correct: boolean;
  answerGiven?: number;
  hintsUsed: number;
  timeSeconds: number;
  solutionRevealed: boolean;
  aiErrorLabel?: string;
}

interface CheckQuestionProps {
  check: FormativeCheck;
  onPass: () => void;
  onFail: () => void;
  hint?: string;
  hints?: string[];
  problemLabel?: string;
  // AI overrides — when provided, AI problem data replaces curriculum check data
  aiProblem?: Problem | null;
  onAttempt?: (data: AttemptData) => void;
}

export function CheckQuestion({
  check,
  onPass,
  onFail,
  hint,
  hints,
  problemLabel,
  aiProblem,
  onAttempt,
}: CheckQuestionProps) {
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong' | 'revealed'>('idle');
  const [hintLevel, setHintLevel] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [diagnosedError, setDiagnosedError] = useState<ErrorPattern | null>(null);
  const [aiDiagnosis, setAIDiagnosis] = useState<{ label: string; explanation: string } | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const startTimeRef = useRef(Date.now());

  // Resolve display data — AI problem takes priority over curriculum check
  const prompt         = aiProblem?.prompt ?? check.prompt;
  const correctAnswer  = aiProblem != null ? (aiProblem.answer ?? undefined) : check.correctAnswer;
  const allHints       = aiProblem?.hints ?? check.hints ?? hints ?? (hint ? [hint] : []);
  const solutionText   = aiProblem?.solution ?? check.solutionReveal
                         ?? (allHints.length > 0 ? allHints[allHints.length - 1] : null);

  const hintLabels = ['What am I looking for?', 'Show me the first step', 'Show me the full solution'];

  const showRevealButton =
    check.type === 'numeric' &&
    status === 'wrong' &&
    hintLevel >= allHints.length &&
    !!solutionText;

  function elapsedSeconds() {
    return Math.floor((Date.now() - startTimeRef.current) / 1000);
  }

  function diagnoseFromCurriculum(answer: number): ErrorPattern | null {
    return check.errorPatterns?.find((p) => p.match(answer)) ?? null;
  }

  function handleNumericSubmit() {
    if (status === 'correct' || status === 'revealed') return;
    const num = parseFloat(value);
    if (isNaN(num)) return;

    const correct =
      correctAnswer !== undefined
        ? withinTolerance(num, correctAnswer, check.tolerance ?? 10)
        : true;

    if (correct) {
      setStatus('correct');
      const data: AttemptData = {
        correct: true,
        answerGiven: num,
        hintsUsed: hintLevel,
        timeSeconds: elapsedSeconds(),
        solutionRevealed: false,
        aiErrorLabel: undefined,
      };
      onAttempt?.(data);
      setTimeout(onPass, 800);
    } else {
      setWrongCount((c) => c + 1);
      setStatus('wrong');

      if (aiProblem && aiProblem.answer != null) {
        // AI diagnosis — async, non-blocking
        setDiagnosing(true);
        diagnoseError(aiProblem.prompt, aiProblem.answer, num)
          .then((result) => {
            setAIDiagnosis(result);
          })
          .catch(() => {})
          .finally(() => setDiagnosing(false));
      } else {
        setDiagnosedError(diagnoseFromCurriculum(num));
      }
    }
  }

  function handleChoiceSelect(idx: number) {
    if (status === 'correct' || status === 'revealed') return;
    setSelected(idx);
    const correct = check.choices![idx].correct;
    if (correct) {
      setStatus('correct');
      onAttempt?.({
        correct: true,
        hintsUsed: hintLevel,
        timeSeconds: elapsedSeconds(),
        solutionRevealed: false,
      });
      setTimeout(onPass, 900);
    } else {
      setWrongCount((c) => c + 1);
      setStatus('wrong');
    }
  }

  function handleReveal() {
    setStatus('revealed');
  }

  function handleGotIt() {
    onAttempt?.({
      correct: false,
      answerGiven: value ? parseFloat(value) : undefined,
      hintsUsed: hintLevel,
      timeSeconds: elapsedSeconds(),
      solutionRevealed: true,
      aiErrorLabel: aiDiagnosis?.label,
    });
    onFail();
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
      {problemLabel && (
        <p className="text-xs font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>
          {problemLabel}
        </p>
      )}

      <p className="font-medium text-sm mb-3" style={{ color: 'var(--text)' }}>
        {prompt}
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
              setAIDiagnosis(null);
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
              isSelected && status === 'correct' ? 'var(--accent)'    :
              isSelected && status === 'wrong'   ? 'var(--secondary)' :
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
            onClick={handleGotIt}
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

      {/* AI error diagnosis */}
      {status === 'wrong' && aiProblem && (
        <div
          className="mt-2 rounded-lg px-3 py-2 border-l-2"
          style={{ borderColor: 'var(--statistics)', background: 'rgba(245,158,11,0.07)' }}
        >
          {diagnosing ? (
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Figuring out what went wrong...</p>
          ) : aiDiagnosis ? (
            <>
              <p className="text-xs font-bold mb-0.5" style={{ color: 'var(--statistics)' }}>
                Looks like: {aiDiagnosis.label.replace(/_/g, ' ')}
              </p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {aiDiagnosis.explanation}
              </p>
            </>
          ) : null}
        </div>
      )}

      {/* Curriculum error diagnosis (non-AI fallback) */}
      {status === 'wrong' && !aiProblem && diagnosedError && (
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

      {/* Progressive hints */}
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

      {/* Show solution button */}
      {showRevealButton && (
        <button
          onClick={handleReveal}
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

      {status === 'wrong' && wrongCount >= 2 && allHints.length === 0 && !showRevealButton && (
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          Try approaching it differently — re-read the instruction above the canvas.
        </p>
      )}
    </div>
  );
}
