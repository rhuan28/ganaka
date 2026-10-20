import { describe, expect, it } from 'vitest';
import { NotImplementedOptionError, kalachakraDashas, kalachakraPadaSequence, strongerOfAxis, type DashaPeriod, type Planet9 } from '../src/index';

const A = 365.2421875;
const PADA = 10 / 3;
const S = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];
const names = (q: number[]) => q.map((s) => S[s]!.slice(0, 3)).join(' ');
const jd = (d: number, m: number, y: number) => {
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045 - 0.5;
};
const inDay = (t: number, d: number, m: number, y: number) => t >= jd(d, m, y) - 0.06 && t < jd(d, m, y) + 1.06;
const find = (periods: DashaPeriod[], path: string[]) => {
  let list = periods;
  let p!: DashaPeriod;
  for (const l of path) { p = list.find((x) => x.lord === l)!; list = p.sub ?? []; }
  return p;
};

// REF 0010, as the core computes it in the pl9 mode.
const REF10 = { sun: 42.39944, moon: 26.889314, mars: 127.250034, mercury: 54.08714, jupiter: 227.293074, venus: 19.543524, saturn: 329.693659, rahu: 191.654478, ketu: 11.654478 } as Record<Planet9, number>;
const JD10 = 2449865.4694144;

describe('the sequences of the Kalachakra', () => {
  it('give each pada its nine signs, savya and apasavya, with Deha and Jeeva', () => {
    // Ashwini, pada 1: savya, Deha the first sign, Jeeva the last.
    expect(kalachakraPadaSequence(0.5)).toMatchObject({ savya: true, deha: 0, jeeva: 8 });
    expect(names(kalachakraPadaSequence(0.5).sequence)).toBe('ari tau gem can leo vir lib sco sag');
    expect(names(kalachakraPadaSequence(PADA + 0.5).sequence)).toBe('cap aqu pis sco lib vir can leo gem');
    // Bharani, pada 4.
    expect(names(kalachakraPadaSequence(13.334 + 3 * PADA + 0.5).sequence)).toBe('can leo gem tau ari pis aqu cap sag');
    // Krittika repeats Ashwini.
    expect(kalachakraPadaSequence(2 * 40 / 3 + 0.5).sequence).toEqual(kalachakraPadaSequence(0.5).sequence);
    // Rohini, pada 1: apasavya, the reverse of Bharani pada 4; Deha the last sign, Jeeva the first.
    const rohini = kalachakraPadaSequence(3 * 40 / 3 + 0.5);
    expect(names(rohini.sequence)).toBe('sag cap aqu pis ari tau gem leo can');
    expect(rohini).toMatchObject({ savya: false, deha: 3, jeeva: 8 });
    // Shatabhisha, pada 4: the reverse of Ashwini pada 1.
    expect(names(kalachakraPadaSequence(23 * 40 / 3 + 3 * PADA + 0.5).sequence)).toBe('sag sco lib vir leo can gem tau ari');
    // Ardra, Mrigashira: the same reverse sequences.
    expect(kalachakraPadaSequence(5 * 40 / 3 + 0.5).sequence).toEqual(kalachakraPadaSequence(4 * 40 / 3 + 0.5).sequence);
  });
});

describe('the stronger sign of an axis', () => {
  const at = (signs: Partial<Record<Planet9, number>>, degree = 10) => {
    const base: Record<Planet9, number> = { sun: 0, moon: 0, mars: 0, mercury: 0, jupiter: 0, venus: 0, saturn: 0, rahu: 0, ketu: 0 };
    for (const p of Object.keys(base) as Planet9[]) base[p] = (signs[p] ?? 1) * 30 + degree;
    return base;
  };
  it('has more planets', () => {
    // Everything in Taurus but the Moon in Libra: Libra over Aries.
    expect(strongerOfAxis(0, at({ moon: 6 }))).toBe(6);
    expect(strongerOfAxis(6, at({ moon: 6 }))).toBe(6);
  });
  it('then more aspects or conjunctions of its lord, Jupiter and Mercury', () => {
    // No planet in Cancer or Capricorn. Jupiter in Taurus and Mercury in Scorpio (fixed) aspect both; Saturn, lord of
    // Capricorn, in Taurus aspects Capricorn; the Moon, lord of Cancer, in Libra aspects neither.
    expect(strongerOfAxis(3, at({ jupiter: 1, mercury: 7, moon: 6 }))).toBe(9);
  });
  it('then its lord in a sign of the other parity, then its lord further on in its sign', () => {
    // Leo and Aquarius empty and unaspected (Jupiter, Mercury and the Sun in Gemini, Saturn in Pisces: dual signs aspect
    // only dual signs). The Sun in Gemini, odd as Leo; Saturn in Pisces, even where Aquarius is odd: Aquarius.
    const base = at({ jupiter: 2, mercury: 2, sun: 2, saturn: 11 });
    expect(strongerOfAxis(4, base)).toBe(10);
    // Both lords of the other parity: the further one in its sign.
    const l = { ...base, sun: 3 * 30 + 25, saturn: 11 * 30 + 5 };
    expect(strongerOfAxis(4, l)).toBe(4);
  });
});

describe('the Kalachakra dasha', () => {
  const run = (levels: 1 | 2 | 3 | 4 | 5 = 3, cycles = 1) =>
    kalachakraDashas(REF10.moon, REF10, JD10, { yearDays: A, levels, cycles, antardashas: 12, sequence: 'continue' }, 'pl9');
  it('starts from the sign the pada and the balance give, and goes on through the zodiac', () => {
    const k = run(1);
    expect(k).toMatchObject({ savya: true, deha: 0, jeeva: 8 });
    expect(k.periods.map((p) => p.lord).slice(0, 4)).toEqual(['aries', 'taurus', 'gemini', 'cancer']);
    // Balance at birth: Aries, 0y 3m 25d.
    expect((k.periods[0]!.end - JD10) / A).toBeCloseTo(0.32, 2);
    expect(inDay(k.periods[1]!.start, 22, 9, 1995)).toBe(true);
    expect(k.periods).toHaveLength(12);
    expect(k.periods[1]!.end - k.periods[1]!.start).toBeCloseTo(16 * A, 6);
  });
  it('divides each period in twelve equal parts from the stronger sign of its axis, forwards from an odd sign', () => {
    const k = run(3).periods;
    const taurus = find(k, ['taurus']);
    // Taurus is even: backwards, from Taurus.
    expect(taurus.sub!.map((p) => p.lord).slice(0, 3)).toEqual(['taurus', 'aries', 'pisces']);
    expect(inDay(find(k, ['taurus', 'pisces']).start, 23, 5, 1998)).toBe(true);
    expect(taurus.sub![1]!.end - taurus.sub![1]!.start).toBeCloseTo((16 * A) / 12, 6);
    // Cancer starts from Capricorn, Leo from Aquarius: the stronger of each axis in this chart.
    expect(find(k, ['cancer']).sub![0]!.lord).toBe('capricorn');
    expect(find(k, ['leo']).sub!.map((p) => p.lord).slice(0, 2)).toEqual(['aquarius', 'pisces']);
    // Pratyantardashas by the same rule: in Taurus-Taurus, Aries begins on 01-11-1995.
    expect(inDay(find(k, ['taurus', 'taurus', 'aries']).start, 1, 11, 1995)).toBe(true);
    expect(find(k, ['aries', 'pisces']).sub!.map((p) => p.lord).slice(0, 2)).toEqual(['virgo', 'leo']);
  });
  it('divides five levels down with every period inside its parent', () => {
    const all = (ps: DashaPeriod[]): DashaPeriod[] => ps.flatMap((p) => [p, ...all(p.sub ?? [])]);
    const k = kalachakraDashas(REF10.moon, REF10, JD10, { yearDays: A, levels: 5, cycles: 1, antardashas: 12, sequence: 'continue' }, 'pl9').periods.slice(0, 1);
    for (const p of all(k)) {
      expect(p.end).toBeGreaterThan(p.start);
      if (p.sub) {
        expect(p.sub[0]!.start).toBe(p.start);
        expect(p.sub.at(-1)!.end).toBe(p.end);
      }
    }
    expect(all(k)).toHaveLength(1 + 12 + 144 + 1728 + 20736);
  });
  it('declares the options not measured yet', () => {
    expect(() => kalachakraDashas(REF10.moon, REF10, JD10, { yearDays: A, levels: 2, cycles: 1, antardashas: 9, sequence: 'continue' }, 'pl9')).toThrow(NotImplementedOptionError);
    expect(() => kalachakraDashas(REF10.moon, REF10, JD10, { yearDays: A, levels: 2, cycles: 1, antardashas: 12, sequence: 'samePada' }, 'pl9')).toThrow(NotImplementedOptionError);
  });
  it('starts a pada with nothing gone, and runs the whole sequence out at its end', () => {
    for (const lon of [0, PADA, 40 / 3 - 1e-9, 360 - 1e-9]) {
      const k = kalachakraDashas(lon, REF10, JD10, { yearDays: A, levels: 1, cycles: 1, antardashas: 12, sequence: 'continue' }, 'pl9');
      expect(k.periods[0]!.start).toBeLessThanOrEqual(JD10);
      expect(k.periods[0]!.end).toBeGreaterThan(JD10);
    }
  });
});

describe('corrections of the Kalachakra', () => {
  const opts = (o: Partial<{ antardashas: 12 | 9; sequence: 'continue' | 'samePada'; levels: 1 | 2 | 3 }>) =>
    ({ yearDays: A, levels: 1 as const, cycles: 2, antardashas: 12 as const, sequence: 'continue' as const, ...o });
  it('correction: the mahadashas go on through the zodiac, not to the following pada', () => {
    // REF 0010, Krittika pada 1 (Ari … Sag); the following pada, Krittika 2: Cap Aqu Pis Sco Lib Vir Can Leo Gem.
    const pl9 = kalachakraDashas(REF10.moon, REF10, JD10, opts({}), 'pl9').periods.map((p) => p.lord);
    const corrected = kalachakraDashas(REF10.moon, REF10, JD10, opts({}), 'corrected').periods.map((p) => p.lord);
    expect(pl9.slice(8, 12)).toEqual(['sagittarius', 'capricorn', 'aquarius', 'pisces']);
    expect(pl9[12]).toBe('aries');
    expect(corrected.slice(8, 13)).toEqual(['sagittarius', 'capricorn', 'aquarius', 'pisces', 'scorpio']);
    // Each mahadasha keeps the years of its sign.
    const c = kalachakraDashas(REF10.moon, REF10, JD10, opts({}), 'corrected').periods;
    expect(c[12]!.end - c[12]!.start).toBeCloseTo(7 * A, 6);
  });
  it('correction: the mahadashas cycling within the same pada, an option PL9 does not keep', () => {
    expect(() => kalachakraDashas(REF10.moon, REF10, JD10, opts({ sequence: 'samePada' }), 'pl9')).toThrow(NotImplementedOptionError);
    const c = kalachakraDashas(REF10.moon, REF10, JD10, opts({ sequence: 'samePada' }), 'corrected').periods.map((p) => p.lord);
    expect(c.slice(8, 11)).toEqual(['sagittarius', 'aries', 'taurus']);
  });
  it('correction: nine antardashas, inconsistent in PL9', () => {
    expect(() => kalachakraDashas(REF10.moon, REF10, JD10, opts({ antardashas: 9, levels: 2 }), 'pl9')).toThrow(NotImplementedOptionError);
    const c = kalachakraDashas(REF10.moon, REF10, JD10, opts({ antardashas: 9, levels: 3 }), 'corrected').periods;
    const cancer = c.find((p) => p.lord === 'cancer')!;
    // The nine signs from the mahadasha's, through the zodiac, each in proportion to its years over theirs.
    expect(cancer.sub!.map((p) => p.lord)).toEqual(['cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces']);
    const total = 21 + 5 + 9 + 16 + 7 + 10 + 4 + 4 + 10;
    expect(cancer.sub![1]!.end - cancer.sub![1]!.start).toBeCloseTo((21 * A * 5) / total, 6);
    expect(cancer.sub!.at(-1)!.end).toBe(cancer.end);
    // Leo's own nine have their own sum: Leo … Aries.
    const leo = c.find((p) => p.lord === 'leo')!;
    expect(leo.sub![0]!.end - leo.sub![0]!.start).toBeCloseTo((5 * A * 5) / (5 + 9 + 16 + 7 + 10 + 4 + 4 + 10 + 7), 6);
    expect(cancer.sub![0]!.sub!.map((p) => p.lord)[0]).toBe('cancer');
  });
});

describe('review fixes of the Kalachakra', () => {
  it('puts a Moon exactly on a pada boundary in the pada that begins there, with the running period ending after birth', () => {
    for (let k = 0; k < 108; k++) {
      const lon = (k * 10) / 3;
      expect(kalachakraPadaSequence(lon).pada, `k=${k}`).toBe(k);
      expect(kalachakraPadaSequence(lon).fraction).toBeGreaterThanOrEqual(0);
      const p = kalachakraDashas(lon, REF10, JD10, { yearDays: A, levels: 1, cycles: 1, antardashas: 12, sequence: 'continue' }, 'pl9').periods;
      expect(p[0]!.end, `k=${k}`).toBeGreaterThan(JD10);
    }
    // Inside a pada, where the time gone falls on the end of a sign: Ashwini 1, f = 0.9, at the end of Scorpio.
    const p = kalachakraDashas(3, REF10, JD10, { yearDays: A, levels: 1, cycles: 1, antardashas: 12, sequence: 'continue' }, 'pl9').periods;
    expect(p[0]!.end).toBeGreaterThan(JD10);
  });
  it('in the corrected mode, follows a pada sequence that is not in the order of the zodiac from the second mahadasha', () => {
    // Ashwini 2: Cap Aqu Pis Sco Lib Vir Can Leo Gem. Early in the pada, Capricorn runs at birth.
    const lon = 10 / 3 + 0.01;
    const run = (f: 'pl9' | 'corrected') => kalachakraDashas(lon, REF10, JD10, { yearDays: A, levels: 1, cycles: 1, antardashas: 12, sequence: 'continue' }, f).periods.map((p) => p.lord).slice(0, 5);
    expect(run('pl9')).toEqual(['capricorn', 'aquarius', 'pisces', 'aries', 'taurus']);
    expect(run('corrected')).toEqual(['capricorn', 'aquarius', 'pisces', 'scorpio', 'libra']);
  });
});
