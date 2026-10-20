import { describe, expect, it } from 'vitest';
import type { Body, Ephemeris } from '@reverse/ephemeris';
import { julianDayUt } from '@reverse/ephemeris';
import { norm360 } from '../src/angles';
import { REFSET_SEED, buildReferenceSet } from '../src/refset';

const RATE: Record<string, number> = { sun: 0.9856, moon: 13.1764, mercury: 1.2, venus: 1.1, mars: 0.524, jupiter: 0.0831, saturn: 0.0335 };
const WOBBLES = new Set(['mercury', 'venus', 'mars', 'jupiter', 'saturn']);

const notUsed = () => {
  throw new Error('not used in this test');
};
const unused = {
  meanEquinoxLongitude: notUsed, obliquityAndNutation: notUsed, siderealTimeHours: notUsed,
  ascendantTropical: notUsed, siderealReference: notUsed, ayanamshaReference: notUsed,
  sunRiseSetReference: notUsed, sunEquatorial: notUsed, housesReference: notUsed,
};

/** Uniform motion for Sun and Moon; planets get a speed that changes sign, so stations exist. */
const fake: Ephemeris = {
  ...unused,
  tropical(jdUt: number, body: Body) {
    const rate = RATE[body] ?? 0.01;
    const t = jdUt - 2400000;
    if (WOBBLES.has(body)) {
      const amp = 120;
      return { longitude: norm360(rate * t + amp * Math.sin(t / 60)), latitude: 0, distance: 1, longitudeSpeed: rate + (amp / 60) * Math.cos(t / 60) };
    }
    return { longitude: norm360(rate * t), latitude: 0, distance: 1, longitudeSpeed: rate };
  },
  deltaTSeconds: () => 60,
  // First event after jd: sunrise at .25 and sunset at .75 of every Julian day.
  sunRiseSetReference: (jd: number, _lat: number, _lon: number, o: { event: string }) => {
    const f = o.event === 'rise' ? 0.25 : 0.75;
    return Math.floor(jd - f) + 1 + f;
  },
  lahiriAyanamshaReference: () => 24,
  lahiriSiderealReference: (jd: number, body: Body) => norm360(fake.tropical(jd, body).longitude - 24),
  close: () => undefined,
};

const set = buildReferenceSet(fake);
const sid = (jd: number, body: Body) => fake.lahiriSiderealReference(jd, body);

describe('buildReferenceSet', () => {
  it('produces 368 charts without the tight pairs with sequential ids', () => {
    expect(set).toHaveLength(368);
    expect(set[0]!.id).toBe('ref-0001');
    expect(set[367]!.id).toBe('ref-0368');
    expect(new Set(set.map((c) => c.id)).size).toBe(368);
  });

  it('appends the new charts after the first 290, whose kinds do not change', () => {
    const old = new Set(['random', 'recent', 'early', 'sign-edge', 'nakshatra-edge', 'station']);
    expect(set.slice(0, 290).every((c) => old.has(c.kind))).toBe(true);
    expect(set.slice(290).some((c) => old.has(c.kind))).toBe(false);
  });
  it('adds the sunrise, sunset, day-series and moon-node charts', () => {
    const count = (k: string) => set.filter((c) => c.kind === k).length;
    expect([count('sunrise-edge'), count('sunset-edge'), count('day-series'), count('moon-node')]).toEqual([20, 20, 32, 6]);
  });
  it('places each edge pair at one place, 15 minutes on either side of the event', () => {
    for (const kind of ['sunrise-edge', 'sunset-edge'] as const) {
      const edges = set.filter((c) => c.kind === kind);
      for (let i = 0; i < edges.length; i += 2) {
        const [a, b] = [edges[i]!, edges[i + 1]!];
        expect([a.latitude, a.longitudeEast]).toEqual([b.latitude, b.longitudeEast]);
        expect(Math.abs(a.latitude)).toBeLessThanOrEqual(50);
        expect((b.jdUt - a.jdUt) * 1440).toBeCloseTo(30, 3);
        const event = fake.sunRiseSetReference(a.jdUt - 0.5, a.latitude, a.longitudeEast, { event: kind === 'sunrise-edge' ? 'rise' : 'set', disc: 'centre', refraction: true }) as number;
        expect(event).toBeGreaterThan(a.jdUt);
        expect(event).toBeLessThan(b.jdUt);
      }
    }
  });
  it('spaces each day series by three hours at one place', () => {
    const s = set.filter((c) => c.kind === 'day-series');
    for (let i = 0; i < s.length; i += 8) {
      for (let k = 1; k < 8; k++) {
        expect((s[i + k]!.jdUt - s[i]!.jdUt) * 24).toBeCloseTo(3 * k, 4);
        expect(s[i + k]!.latitude).toBe(s[i]!.latitude);
      }
    }
  });
  it('puts the Moon within a tenth of a degree of a node in the moon-node charts', () => {
    for (const c of set.filter((x) => x.kind === 'moon-node')) {
      const d = (norm360(sid(c.jdUt, 'moon') - sid(c.jdUt, 'trueNode') + 90) % 180) - 90;
      expect(Math.abs(d)).toBeLessThan(0.1);
    }
  });
  it('has the planned number of each kind', () => {
    const count = (k: string) => set.filter((c) => c.kind === k).length;
    expect([count('random'), count('recent'), count('early'), count('sign-edge'), count('nakshatra-edge'), count('station')])
      .toEqual([200, 40, 20, 14, 6, 10]);
  });

  it('is reproducible for the default seed and changes with another seed', () => {
    expect(buildReferenceSet(fake, REFSET_SEED)).toEqual(set);
    expect(buildReferenceSet(fake, REFSET_SEED + 1)[0]).not.toEqual(set[0]);
  });

  it('keeps every chart inside 1801-2048 and inside the latitude limits', () => {
    for (const c of set) {
      expect(c.jdUt).toBeGreaterThanOrEqual(julianDayUt(1801, 1, 1));
      expect(c.jdUt).toBeLessThanOrEqual(julianDayUt(2048, 12, 31, 24));
      expect(Math.abs(c.latitude)).toBeLessThanOrEqual(65);
      expect(Math.abs(c.longitudeEast)).toBeLessThanOrEqual(180);
    }
  });

  it('stores Julian days with at most seven decimals, as the chart file does', () => {
    for (const c of set) expect(Number(c.jdUt.toFixed(7))).toBe(c.jdUt);
  });

  it('puts recent charts after 2005 and early charts before 1831', () => {
    for (const c of set.filter((x) => x.kind === 'recent')) expect(c.jdUt).toBeGreaterThanOrEqual(julianDayUt(2005, 1, 1));
    for (const c of set.filter((x) => x.kind === 'early')) expect(c.jdUt).toBeLessThan(julianDayUt(1831, 1, 1));
  });

  it('places each sign-edge pair on opposite sides of a 30-degree boundary, within 3 arcseconds', () => {
    const edges = set.filter((c) => c.kind === 'sign-edge');
    for (let i = 0; i < edges.length; i += 2) {
      const body = edges[i]!.note.split(' ')[0] as Body;
      const offsets = [edges[i]!, edges[i + 1]!].map((c) => {
        const g = sid(c.jdUt, body) % 30;
        return (g < 15 ? g : g - 30) * 3600;
      });
      expect(Math.abs(offsets[0]!)).toBeLessThan(3);
      expect(Math.abs(offsets[1]!)).toBeLessThan(3);
      expect(offsets[0]! * offsets[1]!).toBeLessThan(0);
    }
  });

  it('places each nakshatra-edge pair on opposite sides of a 13d20m boundary', () => {
    const edges = set.filter((c) => c.kind === 'nakshatra-edge');
    const span = 360 / 27;
    for (let i = 0; i < edges.length; i += 2) {
      const offsets = [edges[i]!, edges[i + 1]!].map((c) => {
        const g = sid(c.jdUt, 'moon') % span;
        return g < span / 2 ? g : g - span;
      });
      expect(offsets[0]! * offsets[1]!).toBeLessThan(0);
    }
  });

  it('places each station pair on opposite sides of a change in direction', () => {
    const st = set.filter((c) => c.kind === 'station');
    for (let i = 0; i < st.length; i += 2) {
      const body = st[i]!.note.split(' ')[0] as Body;
      const s0 = fake.tropical(st[i]!.jdUt, body).longitudeSpeed;
      const s1 = fake.tropical(st[i + 1]!.jdUt, body).longitudeSpeed;
      expect(s0 * s1).toBeLessThan(0);
    }
  });
  it('adds six pairs 20 seconds on either side of a given sunrise when a sunrise function is passed', () => {
    const sunriseAfter = (jd: number) => Math.floor(jd - 0.25) + 1.25;
    const tight = buildReferenceSet(fake, REFSET_SEED, sunriseAfter);
    expect(tight).toHaveLength(380);
    expect(tight.slice(0, 368)).toEqual(set);
    const pairs = tight.slice(368);
    expect(pairs.every((c) => c.kind === 'sunrise-tight')).toBe(true);
    for (let i = 0; i < pairs.length; i += 2) {
      const [a, b] = [pairs[i]!, pairs[i + 1]!];
      expect([a.latitude, a.longitudeEast]).toEqual([b.latitude, b.longitudeEast]);
      expect(Math.abs(a.latitude)).toBeLessThanOrEqual(50);
      expect((b.jdUt - a.jdUt) * 86400).toBeCloseTo(40, 1);
      const sunrise = sunriseAfter(a.jdUt - 0.5);
      expect(sunrise).toBeGreaterThan(a.jdUt);
      expect(sunrise).toBeLessThan(b.jdUt);
    }
  });
});
