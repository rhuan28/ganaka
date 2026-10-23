import { describe, expect, it } from 'vitest';
import { AnkaRangeError, combustion, computePlanetInfo, deeptadi, shayanadi } from '../src';
import type { Planet9 } from '../src/jaimini';
import { fakeSky } from './fakeSky';

// Sun 12° Taurus; Mercury 24° Taurus (11.7° away), Venus 19° Aries, the rest far from the Sun.
const LONS: Record<Planet9, number> = { sun: 42.4, moon: 26.9, mars: 127.25, mercury: 54.09, jupiter: 227.29, venus: 19.54, saturn: 329.69, rahu: 191.65, ketu: 11.65 };

describe('combustion', () => {
  it("uses PL9's orbs, the retrograde one for Mercury and Venus", () => {
    expect(combustion('mercury', LONS, true)).toEqual({ combust: true, combustPercent: Math.floor(100 * (1 - 11.69 / 12) + 0.5) });
    expect(combustion('mercury', LONS, false).combust).toBe(true); // 11.69 < 14
    expect(combustion('mercury', { ...LONS, mercury: 54.5 }, true).combust).toBe(false); // 12.1 is not under 12
    expect(combustion('venus', LONS, false).combust).toBe(false); // 22.9 away
  });
  it('never burns the Sun or the nodes, and gives a combust Moon 0%', () => {
    expect(combustion('sun', LONS, false).combust).toBe(false);
    expect(combustion('rahu', { ...LONS, rahu: 42 }, false).combust).toBe(false);
    expect(combustion('moon', { ...LONS, moon: 40 }, false)).toEqual({ combust: true, combustPercent: 0 });
  });
});

describe('Deeptadi', () => {
  it('follows the dignity, as REF 0010 shows it', () => {
    expect(deeptadi('sun', LONS)).toBe('deena'); // neutral: PL9's "Poor"
    expect(deeptadi('moon', LONS)).toBe('dukhita'); // enemy: "Unhappy"
    expect(deeptadi('mars', LONS)).toBe('mudita'); // great friend: "Happy"
    expect(deeptadi('saturn', LONS)).toBe('swastha'); // own sign: "Healthy"
    expect(deeptadi('jupiter', { ...LONS, jupiter: 95 })).toBe('deepta'); // exalted in Cancer
    expect(deeptadi('jupiter', { ...LONS, jupiter: 275 })).toBe('khala'); // debilitated in Capricorn
  });
});

describe('Shayanadi', () => {
  it("gives REF 0010's states: 12 ghatis after sunrise, the Moon in Krittika, the Lagna in Cancer", () => {
    const states = (['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const).map((p) => shayanadi(p, LONS, 4, 12.9, 1).state);
    expect(states).toEqual(['nidra', 'upavesha', 'upavesha', 'nidra', 'agama', 'agama', 'kautuka', 'agama', 'agama']);
  });
  it('moves the sub-state with the Anka, never the state', () => {
    const a = shayanadi('sun', LONS, 4, 12.9, 1), b = shayanadi('sun', LONS, 4, 12.9, 2);
    expect(a.number).toBe(b.number);
    expect(a.sub).not.toBe(b.sub);
    expect([0, 1, 2]).toContain(a.sub);
  });
});

describe('planet info, avasthas', () => {
  const birth = { jdUt: 2449865.4694144, latitude: 44.2377, longitudeEast: 150.6744 };
  it('reads with Anka 1 by default and says so, and refuses an Anka outside 1 to 5', () => {
    expect(computePlanetInfo(fakeSky, birth, {}, { fidelity: 'corrected' }).anka).toBe(1);
    expect(computePlanetInfo(fakeSky, birth, { anka: 3 }, { fidelity: 'corrected' }).anka).toBe(3);
    expect(() => computePlanetInfo(fakeSky, birth, { anka: 6 })).toThrow(AnkaRangeError);
    expect(() => computePlanetInfo(fakeSky, birth, { anka: 1.5 })).toThrow(AnkaRangeError);
  });
  it('leaves the Shayanadi missing without a Lagna, and keeps the rest', () => {
    const info = computePlanetInfo(fakeSky, { ...birth, latitude: 89 }, {}, { fidelity: 'corrected' });
    expect(info.missing).toContainEqual({ field: 'shayanadi', reason: 'needs the Lagna' });
    expect(info.points.sun.shayanadi).toBeUndefined();
    expect(info.points.sun.deeptadi).toBeDefined();
    expect(info.points.uranus.deeptadi).toBeUndefined();
  });
});
