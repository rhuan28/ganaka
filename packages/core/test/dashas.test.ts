import { describe, expect, it } from 'vitest';
import { NAKSHATRA_DASHA_SYSTEMS, dashaYearDays, nakshatraDashas, startingPoint, type DashaPeriod } from '../src/index';

const N = 40 / 3;
const A = 365.2421875;
/** Julian day of a calendar date and time, Gregorian. */
const jd = (d: number, m: number, y: number, hh = 0, mm = 0) => {
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045 - 0.5 + (hh + mm / 60) / 24;
};
const years = (p: DashaPeriod) => (p.end - p.start) / A;
const find = (periods: DashaPeriod[], path: string[]): DashaPeriod => {
  let list = periods;
  let found: DashaPeriod | undefined;
  for (const lord of path) {
    found = list.find((p) => p.lord === lord);
    if (!found) throw new Error(`no ${lord} in ${list.map((p) => p.lord).join(',')}`);
    list = found.sub ?? [];
  }
  return found!;
};

describe('the thirteen nakshatra dashas', () => {
  const TOTALS: Record<string, number> = {
    vimshottari: 120, ashtottari: 108, yogini: 36, shodashottari: 116, dwadashottari: 112, panchottari: 105, shatabdika: 100,
    chaturshitisama: 84, dwisaptatisama: 72, shastihayani: 60, shattrimshatsama: 36, tribhagi: 80, tribhagi40: 40,
  };
  it('cover a whole cycle of their years, and every level fills the period above it', () => {
    expect([...NAKSHATRA_DASHA_SYSTEMS].sort()).toEqual(Object.keys(TOTALS).sort());
    for (const system of NAKSHATRA_DASHA_SYSTEMS) {
      const mds = nakshatraDashas(system, 123.456, 2451545, { yearDays: A, levels: 3 }, 'pl9');
      expect((mds.at(-1)!.end - mds[0]!.start) / A, system).toBeCloseTo(TOTALS[system]!, 9);
      for (const md of mds) {
        expect(md.sub![0]!.lord, system).toBe(md.lord);
        expect(md.sub![0]!.start).toBeCloseTo(md.start, 9);
        expect(md.sub!.at(-1)!.end).toBeCloseTo(md.end, 9);
        for (let i = 1; i < md.sub!.length; i++) expect(md.sub![i]!.start).toBe(md.sub![i - 1]!.end);
        for (const ad of md.sub!) {
          expect(ad.sub![0]!.start).toBeCloseTo(ad.start, 9);
          expect(ad.sub!.at(-1)!.end).toBeCloseTo(ad.end, 9);
          expect(ad.level).toBe(2);
          expect(ad.sub![0]!.level).toBe(3);
        }
      }
      // The period running at birth is the first one.
      expect(mds[0]!.start).toBeLessThanOrEqual(2451545);
      expect(mds[0]!.end).toBeGreaterThan(2451545);
    }
  });
  it('start from the lord the count of nakshatras gives', () => {
    const lordAt = (system: (typeof NAKSHATRA_DASHA_SYSTEMS)[number], k: number) => startingPoint(system, k * N + 1, 'pl9').lord;
    expect(lordAt('vimshottari', 0)).toBe('ketu');
    expect(lordAt('vimshottari', 2)).toBe('sun');
    expect(lordAt('vimshottari', 26)).toBe('mercury');
    expect(lordAt('yogini', 0)).toBe('bhramari');
    expect(lordAt('yogini', 5)).toBe('mangala');
    expect(lordAt('shodashottari', 7)).toBe('sun');
    // From Pushya to Ashwini is the 21st: 21 mod 8 = 5, Ketu.
    expect(lordAt('shodashottari', 0)).toBe('ketu');
    expect(lordAt('dwadashottari', 26)).toBe('sun');
    // Backwards from Revati: Uttara Bhadrapada is the second, Jupiter.
    expect(lordAt('dwadashottari', 25)).toBe('jupiter');
    expect(lordAt('panchottari', 16)).toBe('sun');
    expect(lordAt('shatabdika', 26)).toBe('sun');
    expect(lordAt('chaturshitisama', 14)).toBe('sun');
    expect(lordAt('dwisaptatisama', 18)).toBe('sun');
    expect(lordAt('shattrimshatsama', 21)).toBe('moon');
    expect(lordAt('tribhagi', 2)).toBe('sun');
  });
  it('take the elapsed part from the degree in the nakshatra', () => {
    expect(startingPoint('vimshottari', 26.889313763196, 'pl9').elapsed).toBeCloseTo((26.889313763196 - 2 * N) / N, 12);
  });
  it('in Ashtottari and Shastihayani take the elapsed part of the group, with Abhijit as a nakshatra of its own', () => {
    // Bharani, last of Rahu's four in Ashtottari: (3 + f) / 4.
    const f = (23.83 - N) / N;
    expect(startingPoint('ashtottari', 23.83, 'pl9')).toEqual({ lord: 'rahu', elapsed: expect.closeTo((3 + f) / 4, 12) });
    // Abhijit, third of Saturn's four in Ashtottari, first of Saturn's three in Shastihayani.
    const abhijit = (277.411 - (276 + 40 / 60)) / (4 + 13 / 60 + 20 / 3600);
    expect(startingPoint('ashtottari', 277.411, 'pl9').elapsed).toBeCloseTo((2 + abhijit) / 4, 12);
    expect(startingPoint('shastihayani', 277.411, 'pl9')).toEqual({ lord: 'saturn', elapsed: expect.closeTo(abhijit / 3, 12) });
    // Uttara Ashadha shortened to 276°40', last of Venus's four in Shastihayani.
    expect(startingPoint('shastihayani', 270.339, 'pl9').elapsed).toBeCloseTo((3 + (270.339 - 20 * N) / 10) / 4, 12);
    // Shravana: the fraction from 280°04' in the pl9 mode. Position 0 in Ashtottari in the pl9 mode, 3 corrected.
    const shravana = (287.32 - (280 + 4 / 60)) / (22 * N - (280 + 4 / 60));
    expect(startingPoint('ashtottari', 287.32, 'pl9').elapsed).toBeCloseTo(shravana / 4, 12);
    expect(startingPoint('shastihayani', 287.32, 'pl9').elapsed).toBeCloseTo((1 + shravana) / 3, 12);
    const shortShravana = (287.32 - (280 + 53 / 60 + 20 / 3600)) / (293 + 20 / 60 - (280 + 53 / 60 + 20 / 3600));
    expect(startingPoint('ashtottari', 287.32, 'corrected').elapsed).toBeCloseTo((3 + shortShravana) / 4, 12);
    expect(startingPoint('shastihayani', 287.32, 'corrected').elapsed).toBeCloseTo((1 + shortShravana) / 3, 12);
  });
  it('gives Tribhagi as Vimshottari with every length times two thirds, and Tribhagi 40 times one third', () => {
    const v = nakshatraDashas('vimshottari', 200, 2451545, { yearDays: A, levels: 2 }, 'pl9');
    const t = nakshatraDashas('tribhagi', 200, 2451545, { yearDays: A, levels: 2 }, 'pl9');
    const t40 = nakshatraDashas('tribhagi40', 200, 2451545, { yearDays: A, levels: 2 }, 'pl9');
    for (let i = 0; i < 9; i++) {
      expect(t[i]!.lord).toBe(v[i]!.lord);
      expect(years(t[i]!)).toBeCloseTo((years(v[i]!) * 2) / 3, 9);
      expect(years(t40[i]!)).toBeCloseTo(years(v[i]!) / 3, 9);
    }
    expect(2451545 - t[0]!.start).toBeCloseTo(((2451545 - v[0]!.start) * 2) / 3, 6);
  });
  it('reproduce REF 0010 as PL9 printed it', () => {
    const mds = nakshatraDashas('vimshottari', 26.889313763196, 2449865.4694144, { yearDays: A, levels: 4 }, 'pl9');
    // The mahadasha of the Moon begins on 20-04-2001.
    const moon = find(mds, ['moon']);
    expect(moon.start).toBeGreaterThanOrEqual(jd(20, 4, 2001));
    expect(moon.start).toBeLessThan(jd(21, 4, 2001));
    // The sookshma Rahu-Saturn-Rahu-Rahu begins at 16:30 of 11-06-2025: PL9 truncates to the minute.
    const s = find(mds, ['rahu', 'saturn', 'rahu', 'rahu']);
    expect((s.start - jd(11, 6, 2025, 16, 30)) * 1440).toBeGreaterThanOrEqual(-0.05);
    expect((s.start - jd(11, 6, 2025, 16, 30)) * 1440).toBeLessThan(1);
  });
  it('take the year PL9 calls 365.25 as 365.2422 in single precision, and as 365.25 corrected', () => {
    expect(dashaYearDays('365.25', 'pl9')).toBe(365.2421875);
    expect(dashaYearDays('365.25', 'corrected')).toBe(365.25);
    expect(dashaYearDays('365.2422', 'corrected')).toBe(365.2422);
    expect(dashaYearDays('360', 'pl9')).toBe(360);
    expect(dashaYearDays('327.85', 'pl9')).toBe(327.85);
  });
});

describe('corrections of the nakshatra dashas', () => {
  const ABHIJIT_END = 280 + 53 / 60 + 20 / 3600;
  const eps = 1e-7;
  it('correction: the dasha year PL9 calls 365.25', () => {
    // PL9 labels the option 365.25 and computes with 365.2422 in single precision.
    expect(dashaYearDays('365.25', 'pl9')).toBe(Math.fround(365.2422));
    expect(dashaYearDays('365.25', 'corrected')).toBe(365.25);
    // The year of 365.2422 stays available as an option of its own, in both modes.
    expect(dashaYearDays('365.2422', 'pl9')).toBe(365.2422);
  });
  it('correction: Shravana first in the group of Saturn in Ashtottari', () => {
    // From the end of Abhijit to the beginning of Shravana the elapsed part of the group runs back in PL9.
    const before = startingPoint('ashtottari', ABHIJIT_END - eps, 'pl9');
    const after = startingPoint('ashtottari', ABHIJIT_END + eps, 'pl9');
    expect(before.lord).toBe('saturn');
    expect(after.lord).toBe('saturn');
    expect(before.elapsed - after.elapsed).toBeGreaterThan(0.7);
    const c = (lon: number) => startingPoint('ashtottari', lon, 'corrected').elapsed;
    expect(c(ABHIJIT_END + eps) - c(ABHIJIT_END - eps)).toBeCloseTo(0, 5);
  });
  it("correction: Shravana counted from 280°04' though Abhijit holds it until 280°53'20\"", () => {
    // In Shastihayani, Abhijit and Shravana follow each other in Saturn's group: the elapsed part jumps in PL9.
    const pl9 = (lon: number) => startingPoint('shastihayani', lon, 'pl9').elapsed;
    const corrected = (lon: number) => startingPoint('shastihayani', lon, 'corrected').elapsed;
    expect(pl9(ABHIJIT_END + eps) - pl9(ABHIJIT_END - eps)).toBeGreaterThan(0.02);
    expect(corrected(ABHIJIT_END + eps) - corrected(ABHIJIT_END - eps)).toBeCloseTo(0, 5);
    // Corrected, Shravana's own part runs from 0 to 1 over its arc.
    expect(corrected(22 * N - eps)).toBeCloseTo(2 / 3, 5);
  });
});

describe('the edges of the nakshatra dashas', () => {
  const A = 365.2421875;
  const all = (ps: DashaPeriod[]): DashaPeriod[] => ps.flatMap((p) => [p, ...all(p.sub ?? [])]);
  it('start a nakshatra with nothing gone, and end it with the period running out at birth', () => {
    for (const system of NAKSHATRA_DASHA_SYSTEMS) {
      for (const lon of [5 * N, 5 * N - 1e-9, 0, 360 - 1e-9]) {
        const mds = nakshatraDashas(system, lon, 2451545, { yearDays: A, levels: 2 }, 'corrected');
        expect(mds[0]!.start, `${system} ${lon}`).toBeLessThanOrEqual(2451545);
        expect(mds[0]!.end, `${system} ${lon}`).toBeGreaterThanOrEqual(2451545);
        for (const p of all(mds)) expect(p.end, `${system} ${lon}`).toBeGreaterThan(p.start);
      }
    }
    expect(startingPoint('vimshottari', 5 * N, 'pl9').elapsed).toBe(0);
  });
  it('divide five levels down with every period inside its parent and the sum exact', () => {
    const mds = nakshatraDashas('vimshottari', 123.4, 2451545, { yearDays: A, levels: 5 }, 'pl9');
    const check = (p: DashaPeriod) => {
      if (!p.sub) return expect(p.level).toBe(5);
      expect(p.sub[0]!.start).toBe(p.start);
      expect(p.sub.at(-1)!.end).toBe(p.end);
      for (let i = 0; i < p.sub.length; i++) {
        expect(p.sub[i]!.end).toBeGreaterThan(p.sub[i]!.start);
        if (i) expect(p.sub[i]!.start).toBe(p.sub[i - 1]!.end);
        check(p.sub[i]!);
      }
    };
    mds.forEach(check);
    expect(all(mds)).toHaveLength(9 + 81 + 729 + 6561 + 59049);
  });
});

describe('the balance by time', () => {
  const half = () => 0.5;
  it('replaces the fraction of the nakshatra in the systems that count nakshatras', () => {
    expect(startingPoint('vimshottari', 2 * N + 1, 'pl9', half).elapsed).toBe(0.5);
    expect(startingPoint('yogini', 2 * N + 1, 'pl9', half).elapsed).toBe(0.5);
  });
  it('correction: the balance by time ignored in the groups', () => {
    for (const system of ['ashtottari', 'shastihayani'] as const) {
      // PL9 keeps the groups by degree with "By time" chosen.
      expect(startingPoint(system, 23.83, 'pl9', half)).toEqual(startingPoint(system, 23.83, 'pl9'));
    }
    // Corrected, the fraction of the nakshatra in the group is the time's too: Bharani, last of Rahu's four.
    expect(startingPoint('ashtottari', 23.83, 'corrected', half)).toEqual({ lord: 'rahu', elapsed: (3 + 0.5) / 4 });
    // Shastihayani: Bharani, second of Jupiter's three.
    expect(startingPoint('shastihayani', 23.83, 'corrected', half)).toEqual({ lord: 'jupiter', elapsed: (1 + 0.5) / 3 });
  });
});
