import { describe, expect, it } from 'vitest';
import { nakshatraOf, norm360, padaOf, signOf } from '../src/index';

const SPAN = 360 / 27;

describe('norm360', () => {
  it('stays inside [0, 360) even for a tiny negative value', () => {
    expect(norm360(-1e-20)).toBe(0);
    expect(norm360(360)).toBe(0);
    expect(norm360(-10)).toBe(350);
    expect(norm360(725)).toBe(5);
  });
});

describe('signOf', () => {
  it('numbers signs from 0 (Aries) to 11 (Pisces)', () => {
    expect(signOf(0)).toBe(0);
    expect(signOf(29.999999)).toBe(0);
    expect(signOf(30)).toBe(1);
    expect(signOf(165.84)).toBe(5);
    expect(signOf(359.999999)).toBe(11);
  });
  it('wraps instead of returning 12', () => {
    expect(signOf(360)).toBe(0);
    expect(signOf(-0.000001)).toBe(11);
    expect(signOf(-1e-20)).toBe(0);
  });
});

describe('nakshatraOf', () => {
  it('numbers nakshatras from 0 (Ashwini) to 26 (Revati) in spans of 13d20m', () => {
    expect(nakshatraOf(0)).toBe(0);
    expect(nakshatraOf(13.333333)).toBe(0);
    expect(nakshatraOf(13.333334)).toBe(1);
    expect(nakshatraOf(359.999999)).toBe(26);
  });
  it('never returns 27', () => {
    expect(nakshatraOf(360)).toBe(0);
    expect(nakshatraOf(26 * SPAN + SPAN - 1e-12)).toBe(26);
  });
});

describe('padaOf', () => {
  it('numbers the four quarters of a nakshatra from 1', () => {
    expect(padaOf(0)).toBe(1);
    expect(padaOf(3.333333)).toBe(1);
    expect(padaOf(3.333334)).toBe(2);
    expect(padaOf(SPAN - 1e-9)).toBe(4);
    expect(padaOf(SPAN)).toBe(1);
  });
  it('matches the Moon of a known chart: 20d53m in Sagittarius is Purva Ashadha, pada 3', () => {
    const lon = 240 + 20 + 53 / 60 + 15 / 3600;
    expect(signOf(lon)).toBe(8);
    expect(nakshatraOf(lon)).toBe(19);
    expect(padaOf(lon)).toBe(3);
  });
});
