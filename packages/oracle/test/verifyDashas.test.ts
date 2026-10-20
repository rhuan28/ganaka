import { describe, expect, it } from 'vitest';
import { calendarOf, dashaYearDays, nakshatraDashas, type DashaPeriod, type DashaSystem } from '@reverse/core';
import { decodeDasha, encodeDasha, parseDashas, type DashaFixture, type ShownDasha } from '../src/dashaTables';
import { DAY_EDGE_SLACK, outside, shownJd, verifyDashas } from '../src/verifyDashas';

const two = (n: number) => String(n).padStart(2, '0');
const day = (jd: number) => { const c = calendarOf(jd); return `${c.year}-${two(c.month)}-${two(c.day)}`; };
const minute = (jd: number) => { const c = calendarOf(jd); return `${day(jd)}T${two(c.hour)}:${two(c.minute)}`; };

describe('parseDashas', () => {
  it('reads the raw lines of the reader', () => {
    const r = parseDashas('chart\tREF 0010\ndasha\tvimshottari\tmoon-mars\t2002-02-19\tday\ndasha\tvimshottari\trahu-saturn-rahu-rahu\t2025-06-11T16:30\tminute\n');
    expect(r.chart).toBe('REF 0010');
    expect(r.dashas).toEqual([
      { system: 'vimshottari', path: ['moon', 'mars'], start: '2002-02-19', precision: 'day' },
      { system: 'vimshottari', path: ['rahu', 'saturn', 'rahu', 'rahu'], start: '2025-06-11T16:30', precision: 'minute' },
    ]);
  });
  it('refuses what is not a dasha of the system, nor a start to its precision', () => {
    expect(() => parseDashas('chart\tX\ndasha\tvimshottari\tmangala\t2002-02-19\tday')).toThrow(/path/);
    expect(() => parseDashas('chart\tX\ndasha\tnope\tmoon\t2002-02-19\tday')).toThrow(/system/);
    expect(() => parseDashas('chart\tX\ndasha\tyogini\tulka\t2002-02-19T10:00\tday')).toThrow(/start/);
    expect(() => parseDashas('dasha\tyogini\tulka\t2002-02-19\tday')).toThrow(/chart/);
  });
});

describe('encodeDasha', () => {
  it('writes a start in one line and reads it back with its precision', () => {
    const d: ShownDasha = { system: 'vimshottari', path: ['rahu', 'saturn', 'rahu', 'rahu'], start: '2025-06-11T16:30', precision: 'minute' };
    expect(encodeDasha(d)).toBe('vimshottari rahu-saturn-rahu-rahu 2025-06-11T16:30');
    expect(decodeDasha(encodeDasha(d))).toEqual(d);
    expect(decodeDasha('yogini ulka-siddha 1996-04-20').precision).toBe('day');
  });
});

describe('shownJd and outside', () => {
  it('take a shown start as the day or the minute it stands for', () => {
    expect(shownJd('2000-01-01')).toBe(2451544.5);
    expect(shownJd('2000-01-01T12:00')).toBe(2451545);
    expect(shownJd('2000-01-01T12:00', 5.5)).toBeCloseTo(2451545 - 5.5 / 24, 12);
    const d: ShownDasha = { system: 'vimshottari', path: ['moon'], start: '2000-01-01', precision: 'day' };
    expect(outside(2451545.4, d)).toBe(0);
    expect(outside(2451545.6, d)).toBeCloseTo(0.1, 9);
    expect(outside(2451544.4, d)).toBeCloseTo(0.1, 9);
    const m: ShownDasha = { ...d, start: '2000-01-01T12:00', precision: 'minute' };
    expect(outside(2451545 + 0.5 / 1440, m)).toBe(0);
    expect(outside(2451545 + 2 / 1440, m)).toBeCloseTo(1 / 1440, 9);
  });
});

describe('verifyDashas', () => {
  const jdUt = 2449865.4694144;
  const moon = 26.889313763196;
  const periods = nakshatraDashas('vimshottari', moon, jdUt, { yearDays: dashaYearDays('365.25', 'pl9'), levels: 4 }, 'pl9');
  const at = (path: string[]): DashaPeriod => {
    let list = periods;
    let p!: DashaPeriod;
    for (const l of path) { p = list.find((x) => x.lord === l)!; list = p.sub ?? []; }
    return p;
  };
  /** The periods of the pl9 mode for a birth at `jd`, three cycles. */
  const sky = (jd: number, yearDays = dashaYearDays('365.25', 'pl9')) => (system: DashaSystem) =>
    nakshatraDashas(system as Parameters<typeof nakshatraDashas>[0], moon, jd, { yearDays, levels: 4, cycles: 3 }, 'pl9');
  const fixture = (dashas: ShownDasha[]): DashaFixture => ({ id: 'ref-0010', pl9: { dashas: dashas.map(encodeDasha) }, provenance: { program: 'PL9', ayanamsha: 'Lahiri', method: 'test', extractedOn: '2026-10-14' } });

  it('accepts the starts of the pl9 mode, to the day and to the minute, and in a later cycle', () => {
    const v = verifyDashas(fixture([
      { system: 'vimshottari', path: ['moon'], start: day(at(['moon']).start), precision: 'day' },
      { system: 'vimshottari', path: ['rahu', 'saturn', 'rahu', 'rahu'], start: minute(at(['rahu', 'saturn', 'rahu', 'rahu']).start), precision: 'minute' },
      { system: 'vimshottari', path: ['moon', 'mars'], start: day(at(['moon', 'mars']).start + 120 * dashaYearDays('365.25', 'pl9')), precision: 'day' },
    ]), sky(jdUt));
    expect(v.failures).toEqual([]);
    expect(v.bySystem.vimshottari).toEqual({ periods: 3, failures: 0, atLimit: 0 });
  });
  it('counts a start just across midnight as at the limit, and anything further as a failure', () => {
    // Moving the birth moves every start with it: put the start of Moon-Rahu at 23:00 UT.
    const start = at(['moon', 'rahu']).start;
    const shift = Math.floor(start + 0.5) - 0.5 + 23 / 24 - start;
    const sookshma = at(['rahu', 'saturn', 'rahu', 'rahu']).start + shift;
    const v = verifyDashas(fixture([
      { system: 'vimshottari', path: ['moon', 'rahu'], start: day(start + shift + 1), precision: 'day' },
      { system: 'vimshottari', path: ['moon', 'rahu'], start: day(start + shift + 2), precision: 'day' },
      { system: 'vimshottari', path: ['rahu', 'saturn', 'rahu', 'rahu'], start: minute(sookshma + 3 / 1440), precision: 'minute' },
      { system: 'vimshottari', path: ['rahu', 'saturn', 'rahu', 'rahu'], start: minute(sookshma - 2 / 1440), precision: 'minute' },
    ]), sky(jdUt + shift));
    expect(v.failures.map((f) => f.path)).toEqual(['moon-rahu', 'rahu-saturn-rahu-rahu', 'rahu-saturn-rahu-rahu']);
    expect(v.bySystem.vimshottari).toEqual({ periods: 4, failures: 3, atLimit: 1 });
  });
  it('takes a shift of the minutes under one minute, the same for every start of a chart, as at the limit', () => {
    // Put the sookshma Rahu-Saturn-Rahu-Rahu at 30 seconds past a minute.
    const start = at(['rahu', 'saturn', 'rahu', 'rahu']).start;
    const shift = (Math.floor(start * 1440) + 0.5) / 1440 - start;
    const s = start + shift;
    const one = (jd: number): ShownDasha => ({ system: 'vimshottari', path: ['rahu', 'saturn', 'rahu', 'rahu'], start: minute(jd), precision: 'minute' });
    // Shown a minute early: the core 1.5 minutes after it.
    expect(verifyDashas(fixture([one(s - 1 / 1440)]), sky(jdUt + shift)).bySystem.vimshottari).toEqual({ periods: 1, failures: 0, atLimit: 1 });
    // Shown a minute late, and a minute early: each alone at the limit, but no single shift fits both.
    const v = verifyDashas(fixture([one(s + 1 / 1440), one(s - 1 / 1440)]), sky(jdUt + shift));
    expect(v.failures.map((f) => f.path)).toEqual(['rahu-saturn-rahu-rahu (spread)']);
  });
  it('compares with the periods it is given', () => {
    const p360 = nakshatraDashas('vimshottari', moon, jdUt, { yearDays: 360, levels: 2 }, 'pl9');
    const shown: ShownDasha = { system: 'vimshottari', path: ['moon', 'mars'], start: day(p360.find((p) => p.lord === 'moon')!.sub![1]!.start), precision: 'day' };
    expect(verifyDashas(fixture([shown]), sky(jdUt, 360)).failures).toEqual([]);
    expect(verifyDashas(fixture([shown]), sky(jdUt)).failures).toHaveLength(1);
  });
  it('counts a path the system does not hold as a failure', () => {
    const v = verifyDashas(fixture([{ system: 'yogini', path: ['moon'], start: '2000-01-01', precision: 'day' }]), sky(jdUt));
    expect(v.failures).toHaveLength(1);
  });
});

describe('the dasha fixtures', () => {
  it('hold only starts the reader could have written', async () => {
    const { loadDashaFixtures } = await import('../src/dashaTables');
    const all = loadDashaFixtures();
    expect(all.length).toBeGreaterThanOrEqual(30);
    for (const fx of all) {
      const raw = `chart\tREF ${fx.id.slice(4)}\n` + fx.pl9.dashas.map(decodeDasha).map((d) => `dasha\t${d.system}\t${d.path.join('-')}\t${d.start}\t${d.precision}`).join('\n');
      expect(parseDashas(raw).dashas.map(encodeDasha), fx.id).toEqual(fx.pl9.dashas);
    }
  });
});

describe('the dasha cells of a worksheet', () => {
  it('carry the mark of their option, which names the base or the varga', async () => {
    const { cellOptions } = await import('../src/dashaTables');
    const r = parseDashas('chart\tREF 0004\ndasha\tvimshottari\tsun-jupiter\t2026-03-24\tday\tAs\ndasha\tvimshottari\tmercury-venus\t2025-12-08\tday\tD9');
    expect(r.dashas.map((d) => d.cell)).toEqual(['As', 'D9']);
    expect(cellOptions('As')).toEqual({ base: 'lagna' });
    expect(cellOptions('Su')).toEqual({ base: 'sun' });
    expect(cellOptions('D9')).toEqual({ varga: 'D9' });
    expect(() => parseDashas('chart\tX\ndasha\tvimshottari\tsun\t2026-03-24\tday\tXx')).toThrow(/cell/);
  });
});

describe('the Kalachakra fixtures', () => {
  it('read signs as lords, and the header with Deha, Jeeva and the balance', () => {
    const r = parseDashas('chart\tREF 0010\nkalachakra\taries\tsagittarius\taries\ndasha\tkalachakra\ttaurus-pisces\t1998-05-23\tday');
    expect(r.kalachakra).toEqual({ deha: 'aries', jeeva: 'sagittarius', balance: 'aries' });
    expect(r.dashas[0]!.path).toEqual(['taurus', 'pisces']);
    expect(() => parseDashas('chart\tX\ndasha\tkalachakra\tmoon\t1998-05-23\tday')).toThrow(/path/);
    expect(() => parseDashas('chart\tX\ndasha\tvimshottari\ttaurus\t1998-05-23\tday')).toThrow(/path/);
    expect(() => parseDashas('chart\tX\nkalachakra\taries\tmoon\taries')).toThrow(/signs/);
  });
});
