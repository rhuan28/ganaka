import { describe, expect, it } from 'vitest';
import { findZero } from '../src/search';

describe('findZero', () => {
  it('finds a root by stepping then bisecting', () => {
    expect(findZero((x) => x - 3.3, 0, 1, 10)).toBeCloseTo(3.3, 9);
  });
  it('finds a root when the function decreases', () => {
    expect(findZero((x) => 3.3 - x, 0, 1, 10)).toBeCloseTo(3.3, 9);
  });
  it('returns null when no sign change occurs within the steps', () => {
    expect(findZero((x) => x + 5, 0, 1, 10)).toBeNull();
  });
  it('skips a sign change the caller declares invalid', () => {
    // sawtooth: jumps from +5 to -5 at x = 5 (not a root), crosses zero at x = 10
    const f = (x: number) => ((x + 5) % 10) - 5;
    const root = findZero(f, 1, 1, 30, (f0, f1) => Math.abs(f0) < 2 && Math.abs(f1) < 2);
    expect(root).toBeCloseTo(10, 9);
  });
  it('returns the start when it is already a root', () => {
    expect(findZero((x) => x - 2, 2, 1, 10)).toBe(2);
  });
});
