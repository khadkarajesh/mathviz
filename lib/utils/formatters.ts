/** Round to n decimal places, strip trailing zeros */
export function round(n: number, decimals = 2): number {
  return Math.round(n * 10 ** decimals) / 10 ** decimals;
}

export function formatNumber(n: number, decimals = 2): string {
  return round(n, decimals).toString();
}

/** Is the student's numeric answer within tolerance% of the correct answer? */
export function withinTolerance(
  studentAnswer: number,
  correctAnswer: number,
  tolerancePercent = 10
): boolean {
  if (correctAnswer === 0) return Math.abs(studentAnswer) < 0.5;
  const pct = Math.abs((studentAnswer - correctAnswer) / correctAnswer) * 100;
  return pct <= tolerancePercent;
}
