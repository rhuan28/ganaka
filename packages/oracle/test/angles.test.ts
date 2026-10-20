import { describe, expect, it } from 'vitest';
import { arcsecDiff, norm360 } from '../src/angles';

describe('norm360', () => {
  it('wraps negatives and values past a full turn', () => {
    expect(norm360(-10)).toBe(350);
    expect(norm360(725)).toBe(5);
    expect(norm360(360)).toBe(0);
  });
});

describe('arcsecDiff', () => {
  it('is a plain difference away from the wrap', () => {
    expect(arcsecDiff(10.001, 10)).toBeCloseTo(3.6, 9);
  });
  it('takes the short way across 0/360', () => {
    expect(arcsecDiff(0.0001, 359.9999)).toBeCloseTo(0.72, 6);
    expect(arcsecDiff(359.9999, 0.0001)).toBeCloseTo(-0.72, 6);
  });
  it('reports opposite points as +180 degrees', () => {
    expect(arcsecDiff(180, 0)).toBe(648000);
  });
});
