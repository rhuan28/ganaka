import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { EphemerisRangeError, createSwissEphemeris, julianDayUt, type Ephemeris } from '../src/index';

let eph: Ephemeris;
beforeAll(async () => {
  eph = await createSwissEphemeris();
});
afterAll(() => eph.close());

const day = julianDayUt(2000, 3, 20);
const centre = { disc: 'centre', refraction: true } as const;
const hours = (jd: number | null) => ((jd as number) - day) * 24;
const minutes = (a: number | null, b: number | null) => ((a as number) - (b as number)) * 1440;

describe('sunRiseSetReference', () => {
  it('finds sunrise near 6 h and sunset near 18 h at the equator on an equinox', () => {
    expect(hours(eph.sunRiseSetReference(day, 0, 0, { event: 'rise', ...centre }))).toBeGreaterThan(5.9);
    expect(hours(eph.sunRiseSetReference(day, 0, 0, { event: 'rise', ...centre }))).toBeLessThan(6.3);
    expect(hours(eph.sunRiseSetReference(day, 0, 0, { event: 'set', ...centre }))).toBeGreaterThan(18.0);
    expect(hours(eph.sunRiseSetReference(day, 0, 0, { event: 'set', ...centre }))).toBeLessThan(18.4);
  });
  it('returns the first event after the instant given', () => {
    const first = eph.sunRiseSetReference(day, 0, 0, { event: 'rise', ...centre }) as number;
    const second = eph.sunRiseSetReference(first + 0.01, 0, 0, { event: 'rise', ...centre }) as number;
    expect(second - first).toBeGreaterThan(0.99);
    expect(second - first).toBeLessThan(1.01);
  });
  it('rises earlier with refraction, and earlier still by the upper limb', () => {
    const geometric = eph.sunRiseSetReference(day, 0, 0, { event: 'rise', disc: 'centre', refraction: false });
    const refracted = eph.sunRiseSetReference(day, 0, 0, { event: 'rise', disc: 'centre', refraction: true });
    const limb = eph.sunRiseSetReference(day, 0, 0, { event: 'rise', disc: 'upperLimb', refraction: true });
    expect(minutes(geometric, refracted)).toBeGreaterThan(1.5);
    expect(minutes(geometric, refracted)).toBeLessThan(4);
    expect(minutes(refracted, limb)).toBeGreaterThan(0.8);
    expect(minutes(refracted, limb)).toBeLessThan(1.5);
  });
  it('returns null where the Sun does not rise that day', () => {
    expect(eph.sunRiseSetReference(julianDayUt(2000, 6, 21), 80, 0, { event: 'rise', ...centre })).toBeNull();
  });
  it('rejects a date outside the data', () => {
    expect(() => eph.sunRiseSetReference(julianDayUt(1700, 1, 1), 0, 0, { event: 'rise', ...centre })).toThrow(EphemerisRangeError);
  });
});

describe('sunEquatorial', () => {
  it('puts the Sun on the equator at an equinox and at +23.4 at the June solstice', () => {
    expect(Math.abs(eph.sunEquatorial(julianDayUt(2000, 3, 20, 7.6)).declination)).toBeLessThan(0.01);
    expect(eph.sunEquatorial(julianDayUt(2000, 6, 21)).declination).toBeGreaterThan(23.4);
  });
});

describe('housesReference', () => {
  const jd = julianDayUt(2000, 7, 1, 12);
  const norm = (v: number) => ((v % 360) + 360) % 360;
  it('agrees with ascendantTropical and spaces equal houses by 30 degrees', () => {
    const h = eph.housesReference(jd, 50, 10, 'equal');
    expect(h.cusps).toHaveLength(12);
    expect(h.ascendant).toBeCloseTo(eph.ascendantTropical(jd, 50, 10), 9);
    for (let k = 0; k < 12; k++) expect(norm(h.cusps[k]! - h.ascendant - 30 * k + 180) - 180).toBeCloseTo(0, 6);
  });
  it('puts the midheaven on the tenth Placidus cusp', () => {
    const h = eph.housesReference(jd, 50, 10, 'placidus');
    expect(h.cusps[9]).toBeCloseTo(h.midheaven, 6);
  });
  it('gives Sripati cusps different from Porphyry ones', () => {
    const s = eph.housesReference(jd, 50, 10, 'sripati');
    const p = eph.housesReference(jd, 50, 10, 'porphyry');
    expect(Math.abs(s.cusps[1]! - p.cusps[1]!)).toBeGreaterThan(1);
  });
});
