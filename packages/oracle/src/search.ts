/**
 * Walks from `start` in increments of `step` until f changes sign across a
 * step the caller accepts, then bisects. Returns null if no such step is found.
 */
export function findZero(
  f: (x: number) => number,
  start: number,
  step: number,
  maxSteps: number,
  valid: (f0: number, f1: number) => boolean = () => true,
): number | null {
  let x0 = start;
  let f0 = f(x0);
  if (f0 === 0) return x0;
  for (let i = 0; i < maxSteps; i++) {
    const x1 = x0 + step;
    const f1 = f(x1);
    if (f1 === 0) return x1;
    if (f0 * f1 < 0 && valid(f0, f1)) {
      let lo = x0;
      let hi = x1;
      let flo = f0;
      for (let k = 0; k < 80; k++) {
        const mid = (lo + hi) / 2;
        const fm = f(mid);
        if (flo * fm <= 0) {
          hi = mid;
        } else {
          lo = mid;
          flo = fm;
        }
      }
      return (lo + hi) / 2;
    }
    x0 = x1;
    f0 = f1;
  }
  return null;
}
