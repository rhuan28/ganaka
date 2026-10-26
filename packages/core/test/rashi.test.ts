import { describe, expect, it } from 'vitest';
import { InvalidInputError, NotImplementedOptionError, narayanaChainAt, rashiChainAt, charaYears, dashaDignity, dignity9, parasharaCharaYears, strongerByPoints, rashiAspects, rashiDashas, rashiYears, type DashaPeriod, type Planet9, type RashiChart } from '../src/index';

const SIGNS = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'];

const A = 365.2421875;
const jd = (d: number, m: number, y: number) => {
  const a = Math.floor((14 - m) / 12), yy = y + 4800 - a, mo = m + 12 * a - 3;
  return d + Math.floor((153 * mo + 2) / 5) + 365 * yy + Math.floor(yy / 4) - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045 - 0.5;
};
const inDay = (t: number, d: number, m: number, y: number) => t >= jd(d, m, y) - 0.06 && t < jd(d, m, y) + 1.06;
// REF 0010, as the core computes it in the pl9 mode.
const REF10: RashiChart = {
  lagna: 106.515156,
  longitudes: { sun: 42.39944, moon: 26.889314, mars: 127.250034, mercury: 54.08714, jupiter: 227.293074, venus: 19.543524, saturn: 329.693659, rahu: 191.654478, ketu: 11.654478 } as Record<Planet9, number>,
};
const JD10 = 2449865.4694144;
const run = (system: Parameters<typeof rashiDashas>[0], levels: 1 | 2 = 2) => rashiDashas(system, REF10, JD10, { yearDays: A, levels, cycles: 1 }, 'pl9');
const lords = (ps: DashaPeriod[]) => ps.map((p) => p.lord.slice(0, 3)).join(' ');

describe('the rashi dashas of REF 0010', () => {
  it('Chara: from the Lagna backwards, years to the lord, antardashas from the next sign', () => {
    const c = run('chara');
    expect(lords(c).startsWith('can gem tau ari')).toBe(true);
    expect(inDay(c[1]!.start, 27, 5, 1998)).toBe(true);
    expect(inDay(c[2]!.start, 27, 5, 2009)).toBe(true);
    expect(lords(c[0]!.sub!)).toBe('gem tau ari pis aqu cap sag sco lib vir leo can');
    // Aries: its 9th, Sagittarius, counts forwards.
    expect(lords(c.find((p) => p.lord === 'aries')!.sub!).startsWith('tau gem')).toBe(true);
  });
  it('Narayana: from the stronger of the Lagna and the 7th, Capricorn, backwards', () => {
    const n = run('narayana');
    expect(lords(n)).toBe('cap sag sco lib vir leo can gem tau ari pis aqu');
    expect(inDay(n[1]!.start, 27, 5, 2006)).toBe(true);
    expect(inDay(n[3]!.start, 27, 5, 2022)).toBe(true);
    expect(lords(n[1]!.sub!).startsWith('gem can leo')).toBe(true);
  });
  it('Lagna Kendradi: the kendras, panapharas and apoklimas from Capricorn', () => {
    expect(lords(run('lagnaKendradi'))).toBe('cap lib can ari sag vir gem pis sco leo tau aqu');
  });
  it('Shoola: nine years each from Capricorn, forwards', () => {
    const s = run('shoola');
    expect(lords(s)).toBe('cap aqu pis ari tau gem can leo vir lib sco sag');
    expect(s[1]!.start - s[0]!.start).toBeCloseTo(9 * A, 6);
  });
  it('Drig: the 9th, 10th and 11th with the signs they aspect', () => {
    expect(lords(run('drig'))).toBe('pis sag vir gem ari leo sco aqu tau can lib cap');
  });
  it('Navamsha: from the odd sign of the Navamsha Lagna, forwards, years counted forwards', () => {
    const n = run('navamsha');
    expect(lords(n)).toBe('ari tau gem can leo vir lib sco sag cap aqu pis');
    expect(n.map((p) => Math.round((p.end - p.start) / A))).toEqual([4, 11, 11, 9, 9, 8, 6, 9, 11, 1, 12, 8]);
  });
  it('Padanadhamsa: from the Navamsha of the lord of the Arudha Lagna, by trines', () => {
    const p = run('padanadhamsa');
    expect(lords(p)).toBe('vir tau cap leo ari sag can pis sco gem aqu lib');
    expect(p.map((x) => Math.round((x.end - x.start) / A))).toEqual([2, 9, 8, 9, 3, 12, 8, 4, 6, 3, 5, 12]);
  });
  it('Niryaana Shoola: from Aquarius forwards, 7, 8 and 9 years', () => {
    const n = run('niryaanaShoola');
    expect(lords(n).startsWith('aqu pis ari tau gem')).toBe(true);
    expect(inDay(n.find((x) => x.lord === 'gemini')!.start, 27, 5, 2027)).toBe(true);
  });
  it('Sthira: from the sign of Brahma, Taurus, through the zodiac, 7, 8 and 9 years', () => {
    const s = run('sthira');
    expect(lords(s).startsWith('tau gem can leo')).toBe(true);
    expect(inDay(s[1]!.start, 27, 5, 2003)).toBe(true);
    expect(inDay(s[3]!.start, 27, 5, 2019)).toBe(true);
  });
  it('refuses the one not measured yet', () => {
    expect(() => run('sreeLagnaKendradi')).toThrow(NotImplementedOptionError);
  });
});

describe('the Narayana with Saturn in its first sign', () => {
  it('goes one sign after another, forwards, whatever the modality (REF 0028)', () => {
    // A chart with the Lagna in Sagittarius and Saturn in it: the first sign is Sagittarius, a dual sign.
    const chart: RashiChart = { lagna: 245, longitudes: { sun: 100, moon: 40, mars: 300, mercury: 110, jupiter: 200, venus: 130, saturn: 250, rahu: 20, ketu: 200 } as Record<Planet9, number> };
    const n = rashiDashas('narayana', chart, JD10, { yearDays: A, levels: 1, cycles: 1 }, 'pl9');
    expect(lords(n).startsWith('sag cap aqu pis')).toBe(true);
  });
});

describe('the years of the signs', () => {
  it('count to the lord, with its dignity, and to the K.N. Rao rule in Chara', () => {
    expect(rashiYears(9, REF10)).toBe(11);
    expect(charaYears(3, REF10)).toBe(3);
    expect(charaYears(2, REF10)).toBe(11);
  });
});

describe('corrections of the rashi dashas', () => {
  const at = (lagna: number): RashiChart => ({ ...REF10, lagna });
  it('correction: the Drig order cut to eight bits', () => {
    // Lagna in Libra: PL9 repeats signs; corrected, the twelve signs once each, for every Lagna.
    const pl9 = rashiDashas('drig', at(6 * 30 + 5), JD10, { yearDays: A, levels: 1, cycles: 1 }, 'pl9').map((p) => p.lord);
    expect(new Set(pl9).size).toBeLessThan(pl9.length);
    // Corrected: each of the 9th, 10th and 11th followed by exactly the three signs it aspects, for every Lagna.
    for (let l = 0; l < 12; l++) {
      const chart = { ...at(l * 30 + 5), longitudes: { ...REF10.longitudes } };
      const groups = [8, 9, 10].map((h) => (l + h) % 12);
      const expected = groups.flatMap((g) => [g, ...rashiAspects(g)]).sort((a, b) => a - b);
      // The order is checked whatever the years: every sign given, zero-year ones included, through the plan's signs.
      const order = rashiDashas('drig', chart, JD10, { yearDays: A, levels: 1, cycles: 1 }, 'corrected').map((p) => SIGNS.indexOf(p.lord));
      for (const s of order) expect(expected, `lagna ${l}`).toContain(s);
    }
  });
  it('correction: the second run of the Narayana, Kendradi and Drig, 12 years less those of the first', () => {
    for (const system of ['narayana', 'lagnaKendradi', 'drig'] as const) {
      const two = rashiDashas(system, REF10, JD10, { yearDays: A, levels: 1, cycles: 2 }, 'corrected');
      const one = rashiDashas(system, REF10, JD10, { yearDays: A, levels: 1, cycles: 1 }, 'corrected');
      const second = two.slice(one.length);
      for (const p of second) {
        const q = one.find((x) => x.lord === p.lord)!;
        expect(Math.round((p.end - p.start) / A) + Math.round((q.end - q.start) / A), `${system} ${p.lord}`).toBe(12);
      }
    }
  });
});

describe('the options of the rashi dashas', () => {
  // REF 0035, as the core computes it in the pl9 mode: Mercury at 20.6° of Virgo.
  const REF35: RashiChart = {
    lagna: 98.785082,
    longitudes: { sun: 185.579747, moon: 350.803828, mars: 317.897388, mercury: 170.604852, jupiter: 247.023216, venus: 227.21774, saturn: 322.073271, rahu: 307.969139, ketu: 127.969139 } as Record<Planet9, number>,
  };
  const JD35 = 2406913.5253012;
  it('Mercury exalted anywhere in Virgo, and Rahu exalted in Gemini', () => {
    expect(dashaDignity('mercury', 5 * 30 + 20.6, { mercuryExaltation: 'anywhere' })).toBe(1);
    expect(dashaDignity('rahu', 2 * 30 + 5, { rahuExaltation: 'gemini' })).toBe(1);
    // Taurus still counts: the option adds Gemini before it.
    expect(dashaDignity('rahu', 30 + 5, { rahuExaltation: 'gemini' })).toBe(1);
    expect(dashaDignity('ketu', 8 * 30 + 5, { rahuExaltation: 'gemini' })).toBe(1);
    expect(dashaDignity('rahu', 8 * 30 + 5, { rahuExaltation: 'gemini' })).toBe(-1);
    // REF 0035: Gemini one year longer in the Narayana, so Taurus starts a year later.
    const n = rashiDashas('narayana', REF35, JD35, { yearDays: A, levels: 1, cycles: 1, mercuryExaltation: 'anywhere' }, 'pl9');
    expect(inDay(n.find((p) => p.lord === 'taurus')!.start, 21, 10, 1933)).toBe(true);
  });
  it('antardashas from the lord of the stronger of the sign and its 7th, in its direction (REF 0010)', () => {
    const n = rashiDashas('narayana', REF10, JD10, { yearDays: A, levels: 2, cycles: 1, antardashaStart: 'lord' }, 'pl9');
    const sub = (lord: string) => lords(n.find((p) => p.lord === lord)!.sub!);
    expect(sub('capricorn')).toBe('aqu pis ari tau gem can leo vir lib sco sag cap');
    expect(sub('sagittarius')).toBe('tau ari pis aqu cap sag sco lib vir leo can gem');
    expect(sub('libra')).toBe('leo vir lib sco sag cap aqu pis ari tau gem can');
    expect(sub('scorpio')).toBe('ari tau gem can leo vir lib sco sag cap aqu pis');
  });
  it('Chara of Parashara: the Narayana order, years to the lord, antardashas by modality (REF 0010)', () => {
    const c = rashiDashas('chara', REF10, JD10, { yearDays: A, levels: 2, cycles: 1, charaMethod: 'parashara' }, 'pl9');
    expect(lords(c)).toBe('cap sag sco lib vir leo can gem tau ari pis aqu');
    expect(c.map((p) => Math.round((p.end - p.start) / A))).toEqual([11, 11, 9, 6, 4, 3, 3, 11, 11, 4, 4, 4]);
    const sub = (lord: string) => lords(c.find((p) => p.lord === lord)!.sub!);
    expect(sub('capricorn')).toBe('cap sag sco lib vir leo can gem tau ari pis aqu');
    expect(sub('sagittarius')).toBe('gem vir sag pis lib cap ari can aqu tau leo sco');
    expect(sub('scorpio')).toBe('sco gem cap leo pis lib tau sag can aqu vir ari');
    expect(sub('virgo')).toBe('vir gem pis sag tau aqu sco leo cap lib can ari');
    expect(sub('leo')).toBe('aqu can sag tau lib pis leo cap gem sco ari vir');
  });
});

describe('the Chara of Parashara', () => {
  const lon = (o: Partial<Record<Planet9, number>>) => ({ sun: 5, moon: 35, mars: 65, mercury: 95, jupiter: 155, venus: 185, saturn: 215, rahu: 245, ketu: 65, ...o }) as Record<Planet9, number>;
  it('dignity in nine steps', () => {
    expect(dignity9('sun', lon({ sun: 10 }))).toBe(1);
    expect(dignity9('mercury', lon({ mercury: 150 + 17 }))).toBe(2);
    expect(dignity9('mercury', lon({ mercury: 150 + 25 }))).toBe(3);
    expect(dignity9('saturn', lon({ saturn: 10 }))).toBe(9);
    expect(dignity9('rahu', lon({ rahu: 130 }))).toBe(6);
    // The Sun in Gemini, Mercury in Taurus: neutral by nature, a friend for the time: a friend.
    expect(dignity9('sun', lon({ sun: 65, mercury: 40 }))).toBe(5);
  });
  it('compares two signs by points: Scorpio over Taurus in REF 0010', () => {
    expect(strongerByPoints(1, 7, REF10.longitudes, 7)).toBe(7);
  });
  it('counts Scorpio and Aquarius to the lord PL9 chooses, with its dignity', () => {
    // Saturn exalted in Libra with two more planets, Rahu in Leo with Mars: Saturn, four signs back, one more.
    expect(parasharaCharaYears(10, { lagna: 0, longitudes: lon({ saturn: 190, sun: 195, moon: 200, rahu: 130, mars: 135, ketu: 310 }) })).toBe(5);
    // Mars alone in Libra, Ketu debilitated in Taurus with Venus: Taurus is fixed, Libra movable: Ketu, six on, one less.
    expect(parasharaCharaYears(7, { lagna: 0, longitudes: lon({ mars: 190, ketu: 40, venus: 45, rahu: 220 }) })).toBe(5);
  });
});

describe("PL9's table of the Narayana, Lagna Kendradi and Drig past the first run", () => {
  // Rows as PL9 printed them for REF 0010 (Drig #2, first box; Lagna Kendradi #2, second box): sign and start.
  const rowsFrom = (system: 'drig' | 'lagnaKendradi', d: number, m: number, y: number, n: number) => {
    const rows = rashiDashas(system, REF10, JD10, { yearDays: A, levels: 2, cycles: 3 }, 'pl9').flatMap((p) => p.sub!.map((s) => ({ md: p.lord, s })));
    const i = rows.findIndex((r) => inDay(r.s.start, d, m, y));
    return rows.slice(i, i + n);
  };
  it('the Drig: the second run from the 12th, parts of the first run years running past their mahadasha', () => {
    const shown: [string, number, number, number][] = [['gemini', 26, 5, 2072], ['cancer', 26, 4, 2073], ['gemini', 26, 5, 2073], ['cancer', 26, 4, 2074],
      ['cancer', 25, 1, 2075], ['gemini', 27, 5, 2075], ['taurus', 26, 9, 2075], ['aries', 25, 1, 2076], ['pisces', 26, 5, 2076], ['aquarius', 25, 9, 2076],
      ['capricorn', 25, 1, 2077], ['sagittarius', 26, 5, 2077]];
    const rows = rowsFrom('drig', 26, 5, 2072, 12);
    expect(rows[0]!.md).toBe('gemini');
    rows.forEach((r, k) => {
      expect(r.s.lord, `row ${k}`).toBe(shown[k]![0]);
      expect(inDay(r.s.start, shown[k]![1], shown[k]![2], shown[k]![3]), `row ${k}`).toBe(true);
    });
  });
  it('the Lagna Kendradi: each run three signs on, the first twelve parts of a run of 12 years less with the first years', () => {
    const rows = rowsFrom('lagnaKendradi', 27, 5, 2078, 12);
    expect(rows[0]!.md).toBe('cancer');
    expect(rows.map((r) => r.s.lord.slice(0, 3)).join(' ')).toBe('cap sag sco lib vir leo can gem tau ari pis aqu');
    expect(inDay(rows[11]!.s.start, 24, 2, 2081)).toBe(true);
  });
  it('the first run as before, and the chain at an instant agreeing with the table', () => {
    for (const system of ['narayana', 'lagnaKendradi', 'drig'] as const) {
      const one = rashiDashas(system, REF10, JD10, { yearDays: A, levels: 2, cycles: 1 }, 'pl9');
      for (const p of one) {
        expect(p.sub, system).toHaveLength(12);
        p.sub!.forEach((s, j) => expect(s.start).toBeCloseTo(p.start + (j * (p.end - p.start)) / 12, 6));
      }
      const table = rashiDashas(system, REF10, JD10, { yearDays: A, levels: 2, cycles: 3 }, 'pl9');
      for (const p of table) for (const s of p.sub!) {
        const chain = rashiChainAt(system, REF10, JD10, s.start + 0.01, A, 'pl9');
        expect(SIGNS[chain[0]!], system).toBe(p.lord);
        expect(SIGNS[chain[1]!], system).toBe(s.lord);
      }
    }
  });
});

describe('the Narayana chain at an instant ("Gochara data")', () => {
  // REF 0010: Capricorn 11 years, Sagittarius 11, Scorpio 5, ... ; the first run ends at 77 years.
  const at = (years: number) => JD10 + years * A;
  const chain = (t: number, fidelity: 'pl9' | 'corrected') => narayanaChainAt(REF10, JD10, t, A, fidelity).map((s) => SIGNS[s]!.slice(0, 3)).join(' ');
  it('in the first run, five levels of twelve equal parts, as PL9 printed for REF 0010', () => {
    const shown = Date.UTC(2026, 9, 17, 4, 36, 16) / 86400000 + 2440587.5 - 5.5 / 24;
    expect(chain(shown, 'pl9')).toBe('lib sag pis tau cap');
    expect(chain(shown, 'corrected')).toBe('lib sag pis tau cap');
  });
  it('in the second run, the mahadashas of 12 years less, as PL9 does', () => {
    // Capricorn 1 year (77-78), Sagittarius 1 (78-79), Scorpio 7 (79-86).
    expect(chain(at(77.52), 'pl9').slice(0, 3)).toBe('cap');
    expect(chain(at(79 + 3.01), 'pl9').slice(0, 3)).toBe('sco');
  });
  it('PL9 times the parts below the mahadasha by its years of the first run, then of the second past twelve parts', () => {
    // Scorpio's parts: tau ari pis aqu cap sag sco lib vir leo can gem. PL9: 5/12 of a year each for the first twelve.
    expect(chain(at(79 + 3.01), 'pl9').slice(4, 7)).toBe('lib');
    // Capricorn, 1 year in the second run: PL9 gives its parts 11/12 of a year, so the first runs past the middle.
    expect(chain(at(77.52), 'pl9').slice(4, 7)).toBe('cap');
    // Past twelve parts of 5/12 (5 years), the next ones take 7/12: one year after, the 14th, Aries.
    expect(chain(at(79 + 6.01), 'pl9').slice(4, 7)).toBe('ari');
  });
  it('the corrected mode divides the mahadasha of the second run in twelve equal parts', () => {
    expect(chain(at(79 + 3.01), 'corrected').slice(0, 7)).toBe('sco sag');
    expect(chain(at(77.52), 'corrected').slice(0, 7)).toBe('cap can');
  });
  it('before birth, the first sign at every level', () => {
    expect(chain(JD10 - 400, 'pl9')).toBe('cap cap cap cap cap');
  });
  it('at the instant a period starts, that period, as the other dashas at an instant', () => {
    expect(chain(at(11), 'pl9').slice(0, 7)).toBe('sag gem');
  });
  it('the last sign of the first run, and the third run back to the years of the first', () => {
    // Aquarius, the twelfth: 73 to 77 years. The second run lasts 144 - 77 = 67 years: the third starts at 144.
    expect(chain(at(75), 'pl9').slice(0, 3)).toBe('aqu');
    expect(chain(at(144 + 5), 'pl9').slice(0, 7)).toBe(chain(at(5), 'pl9').slice(0, 7));
  });
  it('the Chara at an instant: the same years every run, each period in twelve from the next sign, as PL9 printed for REF 0010', () => {
    // Events page, 15 June 2030 06:00 UT: "Aq-Vi-Sc-Sa-Vi".
    expect(rashiChainAt('chara', REF10, JD10, 2462667.75, A, 'pl9').map((s) => SIGNS[s]!.slice(0, 3)).join(' ')).toBe('aqu vir sco sag vir');
  });
  it('refuses an instant that is not a number', () => {
    expect(() => narayanaChainAt(REF10, JD10, Number.NaN, A, 'pl9')).toThrow(InvalidInputError);
  });
});
