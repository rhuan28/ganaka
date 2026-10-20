import { describe, expect, it } from 'vitest';
import { HOUSE_SYSTEMS, InvalidInputError, houseCusps, houseOf, lagnaLongitude, midheavenLongitude } from '../src/index';
import { fakeSky } from './fakeSky';

const norm = (v: number) => ((v % 360) + 360) % 360;

/** Worked example of docs/spec/casas.md: Lagna 100°, midheaven 5°. */
const EXAMPLE_STARTS = [84.1666667, 114.1666667, 142.5, 170.8333333, 200.8333333, 232.5, 264.1666667, 294.1666667, 322.5, 350.8333333, 20.8333333, 52.5];

describe.each(HOUSE_SYSTEMS)('houseCusps, %s', (system) => {
  const cases = [{ lagna: 100, mc: 5 }, { lagna: 350, mc: 262 }, { lagna: 0, mc: 270 }, { lagna: 12.5, mc: 300 }];
  it.each(cases)('puts the Lagna in the middle of house 1 ($lagna)', ({ lagna, mc }) => {
    const h = houseCusps(lagna, mc, system);
    expect(h.middles).toHaveLength(12);
    expect(h.starts).toHaveLength(12);
    expect(h.middles[0]).toBeCloseTo(lagna, 9);
  });
  it.each(cases)('covers the circle once: no gap, no overlap ($lagna)', ({ lagna, mc }) => {
    const h = houseCusps(lagna, mc, system);
    let total = 0;
    for (let k = 0; k < 12; k++) total += norm(h.starts[(k + 1) % 12]! - h.starts[k]!);
    expect(total).toBeCloseTo(360, 9);
    for (let k = 0; k < 12; k++) {
      expect(houseOf(h.starts[k]!, h)).toBe(k + 1);
      expect(houseOf(h.middles[k]!, h)).toBe(k + 1);
      expect(houseOf(norm(h.starts[k]! - 1e-9), h)).toBe(((k + 11) % 12) + 1);
    }
  });
  it('returns a house from 1 to 12 for any longitude, including 0 and just under 360', () => {
    const h = houseCusps(350, 262, system);
    for (const lon of [0, 1e-12, 359.999999999, 180, 350, 5, 360, -10]) {
      expect(houseOf(lon, h)).toBeGreaterThanOrEqual(1);
      expect(houseOf(lon, h)).toBeLessThanOrEqual(12);
    }
  });
});

describe('houseCusps', () => {
  it('spaces equal houses by 30 degrees', () => {
    const h = houseCusps(100, 5, 'equal');
    for (let k = 0; k < 12; k++) expect(norm(h.middles[k]! - 100 - 30 * k + 180) - 180).toBeCloseTo(0, 9);
  });
  it('puts the midheaven in the middle of house 10 in Sripati, and opposite houses opposite', () => {
    const h = houseCusps(100, 5, 'sripati');
    expect(h.middles[9]).toBeCloseTo(5, 9);
    for (let k = 0; k < 6; k++) expect(norm(h.middles[k + 6]! - h.middles[k]!)).toBeCloseTo(180, 9);
  });
  it('reproduces the worked example of docs/spec/casas.md', () => {
    const starts = houseCusps(100, 5, 'sripati').starts;
    starts.forEach((v, k) => expect(v, `house ${k + 1}`).toBeCloseTo(EXAMPLE_STARTS[k]!, 6));
  });
  it('rejects non-finite input and an unknown system', () => {
    expect(() => houseCusps(Number.NaN, 5, 'equal')).toThrow();
    // The midheaven is always less than half a circle before the Lagna.
    expect(() => houseCusps(100, 120, 'sripati')).toThrow(InvalidInputError);
    expect(() => houseCusps(100, 100, 'sripati')).toThrow(InvalidInputError);
    expect(() => houseCusps(100, 280, 'sripati')).toThrow(InvalidInputError);
    expect(() => houseCusps(100, 120, 'equal')).not.toThrow();
    expect(() => houseCusps(100, 5, 'placidus' as never)).toThrow();
    expect(() => houseOf(Number.NaN, houseCusps(100, 5, 'equal'))).toThrow();
  });
});

describe('midheavenLongitude', () => {
  it('reproduces the worked example of docs/spec/lagna.md', () => {
    // 194.9769034890 before the long nutation (11.6454") and the ayanamsha (23.5) are taken out.
    expect(midheavenLongitude(fakeSky, 2448000.25, 77.2, 23.5)).toBeCloseTo(194.976903489 - 11.6454157 / 3600 - 23.5, 7);
  });
  it('is about a quarter of the circle before the Lagna at the equator', () => {
    for (let h = 0; h < 24; h += 3) {
      const jd = 2451545 + h / 24;
      const d = norm(lagnaLongitude(fakeSky, jd, 0, 30, 24) - midheavenLongitude(fakeSky, jd, 30, 24));
      expect(d).toBeGreaterThan(80);
      expect(d).toBeLessThan(100);
    }
  });
});
