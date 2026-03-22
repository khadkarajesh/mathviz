/** Mean of a dataset */
export function mean(data: number[]): number {
  if (data.length === 0) return 0;
  return data.reduce((a, b) => a + b, 0) / data.length;
}

/** Median of a dataset */
export function median(data: number[]): number {
  if (data.length === 0) return 0;
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

/** Mode(s) of a dataset (returns all modes if multiple) */
export function mode(data: number[]): number[] {
  if (data.length === 0) return [];
  const freq: Record<number, number> = {};
  for (const n of data) freq[n] = (freq[n] ?? 0) + 1;
  const maxFreq = Math.max(...Object.values(freq));
  return Object.entries(freq)
    .filter(([, f]) => f === maxFreq)
    .map(([n]) => Number(n))
    .sort((a, b) => a - b);
}

/** Range of a dataset */
export function range(data: number[]): number {
  if (data.length === 0) return 0;
  return Math.max(...data) - Math.min(...data);
}

/** Variance (population) */
export function variance(data: number[]): number {
  if (data.length === 0) return 0;
  const m = mean(data);
  return mean(data.map((x) => (x - m) ** 2));
}

/** Standard deviation (population) */
export function stdDev(data: number[]): number {
  return Math.sqrt(variance(data));
}

/** Quartiles Q1, Q2 (median), Q3 */
export function quartiles(data: number[]): { q1: number; q2: number; q3: number } {
  const sorted = [...data].sort((a, b) => a - b);
  const q2 = median(sorted);
  const mid = Math.floor(sorted.length / 2);
  const lower = sorted.slice(0, mid);
  const upper = sorted.length % 2 === 0 ? sorted.slice(mid) : sorted.slice(mid + 1);
  return { q1: median(lower), q2, q3: median(upper) };
}

/** Simple linear regression: y = slope * x + intercept */
export function linearRegression(
  points: { x: number; y: number }[]
): { slope: number; intercept: number; r2: number } {
  const n = points.length;
  if (n < 2) return { slope: 0, intercept: 0, r2: 0 };
  const mx = mean(points.map((p) => p.x));
  const my = mean(points.map((p) => p.y));
  const num = points.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0);
  const den = points.reduce((s, p) => s + (p.x - mx) ** 2, 0);
  const slope = den === 0 ? 0 : num / den;
  const intercept = my - slope * mx;
  const yHat = points.map((p) => slope * p.x + intercept);
  const ssTot = points.reduce((s, p) => s + (p.y - my) ** 2, 0);
  const ssRes = points.reduce((s, p, i) => s + (p.y - yHat[i]) ** 2, 0);
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;
  return { slope, intercept, r2 };
}

/** Generate histogram bins from data */
export function histogramBins(
  data: number[],
  binCount: number
): { min: number; max: number; count: number }[] {
  if (data.length === 0) return [];
  const minVal = Math.min(...data);
  const maxVal = Math.max(...data);
  const binWidth = (maxVal - minVal) / binCount || 1;
  const bins = Array.from({ length: binCount }, (_, i) => ({
    min: minVal + i * binWidth,
    max: minVal + (i + 1) * binWidth,
    count: 0,
  }));
  for (const val of data) {
    const idx = Math.min(Math.floor((val - minVal) / binWidth), binCount - 1);
    bins[idx].count++;
  }
  return bins;
}
