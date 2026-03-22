'use client';

import { useEffect, useRef, useState } from 'react';
import { CanvasProps } from '@/types/canvas';
import { formatNumber } from '@/lib/utils/formatters';

interface ProbabilityState {
  mode: 'coin' | 'simulator' | 'dice';
  flips?: number[];
  target?: number;
  autoFlips?: number;
  showBars?: boolean;
  showFormula?: boolean;
}

export function ProbabilityCanvas({ initialState, phase }: CanvasProps<ProbabilityState>) {
  const mode = (initialState.mode as string) ?? 'coin';
  const [flips, setFlips] = useState<boolean[]>([]); // true = heads
  const [running, setRunning] = useState(false);
  const [simCount, setSimCount] = useState(0);
  const animRef = useRef<number | null>(null);
  const showFormula = (initialState.showFormula as boolean) || phase === 'abstract';

  const heads = flips.filter(Boolean).length;
  const tails = flips.length - heads;
  const headsRatio = flips.length === 0 ? 0 : heads / flips.length;
  const theoretical = 0.5;

  function doFlip() {
    setFlips((prev) => [...prev, Math.random() < 0.5]);
  }

  async function runSimulation(count: number) {
    setRunning(true);
    setFlips([]);
    const batchSize = Math.ceil(count / 50);
    let done = 0;
    function step() {
      const batch = Math.min(batchSize, count - done);
      if (batch <= 0) { setRunning(false); return; }
      setFlips((prev) => {
        const next = [...prev];
        for (let i = 0; i < batch; i++) next.push(Math.random() < 0.5);
        return next;
      });
      done += batch;
      animRef.current = requestAnimationFrame(step);
    }
    animRef.current = requestAnimationFrame(step);
  }

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  // Bar chart dimensions
  const BAR_MAX_H = 80;
  const headsH = Math.max(4, headsRatio * BAR_MAX_H * 2);
  const tailsH = Math.max(4, (1 - headsRatio) * BAR_MAX_H * 2);

  return (
    <div className="flex flex-col h-full p-4 gap-4 items-center">
      {/* Coin */}
      <div
        onClick={running ? undefined : doFlip}
        className="rounded-full border-4 flex items-center justify-center font-bold text-3xl select-none transition-transform active:scale-95"
        style={{
          width: 100, height: 100,
          borderColor: 'var(--geometry)',
          background: 'var(--surface-2)',
          color: 'var(--geometry)',
          cursor: running ? 'default' : 'pointer',
        }}
      >
        {flips.length === 0 ? '?' : flips[flips.length - 1] ? 'H' : 'T'}
      </div>

      {/* Bar chart */}
      {flips.length > 0 && (
        <div className="flex items-end gap-8 justify-center">
          {[
            { label: 'Heads', count: heads, h: headsH, color: 'var(--statistics)' },
            { label: 'Tails', count: tails, h: tailsH, color: 'var(--secondary)' },
          ].map(({ label, count, h, color }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="text-xs font-mono font-bold" style={{ color }}>
                {flips.length > 0 ? formatNumber(count / flips.length, 2) : '—'}
              </span>
              <div
                className="w-12 rounded-t-lg transition-all"
                style={{ height: h, background: color, opacity: 0.8 }}
              />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{label}</span>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>{count}</span>
            </div>
          ))}
          <div className="flex flex-col items-center gap-1 opacity-50">
            <span className="text-xs font-mono font-bold" style={{ color: 'var(--accent)' }}>0.50</span>
            <div className="w-12 rounded-t-lg" style={{ height: BAR_MAX_H, background: 'var(--accent)' }} />
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Theory</span>
          </div>
        </div>
      )}

      {/* Total flips */}
      <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
        Total flips: <strong>{flips.length}</strong>
      </div>

      {/* Action buttons */}
      {phase !== 'concrete' && (
        <div className="flex gap-2 flex-wrap justify-center">
          {[10, 100, 1000].map((n) => (
            <button
              key={n}
              onClick={() => runSimulation(n)}
              disabled={running}
              className="px-4 py-1.5 rounded-full text-sm font-semibold text-white disabled:opacity-50"
              style={{ background: 'var(--statistics)' }}
            >
              Run ×{n}
            </button>
          ))}
          <button
            onClick={() => { setFlips([]); setRunning(false); if (animRef.current) cancelAnimationFrame(animRef.current); }}
            className="px-4 py-1.5 rounded-full text-sm font-semibold border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}
          >
            Reset
          </button>
        </div>
      )}

      {phase === 'concrete' && (
        <button
          onClick={doFlip}
          className="px-6 py-2 rounded-full text-sm font-semibold text-white"
          style={{ background: 'var(--statistics)' }}
        >
          Flip coin
        </button>
      )}

      {showFormula && (
        <div className="rounded-lg p-3 border text-center w-full" style={{ borderColor: 'var(--border)', background: 'var(--surface-2)' }}>
          <p className="font-mono font-bold" style={{ color: 'var(--primary)' }}>
            P(heads) = 1 ÷ 2 = 0.5
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
            Experimental: {flips.length > 0 ? formatNumber(headsRatio, 3) : '—'} · approaches 0.5 with more trials
          </p>
        </div>
      )}
    </div>
  );
}
