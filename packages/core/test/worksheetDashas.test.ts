import { describe, expect, it } from 'vitest';
import { dashaRows, deepenAnnual, monthlyReturn, moonMudda, type AnnualPeriod } from '../src/index';
import { fakeSky } from './fakeSky';

const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: 150.6744444 };
const o = { fidelity: 'pl9' } as const;
const p = (lord: string, start: number, end: number, sub: AnnualPeriod[] = []): AnnualPeriod => ({ lord: lord as never, startJdUt: start, endJdUt: end, sub });

describe('the dasha lists of the Varshaphala worksheets', () => {
  it('divide a Mudda period by the Vimshottari years, from its own lord, as deep as asked', () => {
    const [top] = deepenAnnual([p('venus', 0, 120)], 3, 'mudda');
    expect(top!.sub.map((s) => s.lord).slice(0, 3)).toEqual(['venus', 'sun', 'moon']);
    expect(top!.sub[0]!.endJdUt).toBeCloseTo(20, 9);
    expect(top!.sub[0]!.sub[1]!.lord).toBe('sun');
    expect(top!.sub[0]!.sub[1]!.endJdUt - top!.sub[0]!.sub[1]!.startJdUt).toBeCloseTo(20 * 6 / 120, 9);
  });
  it('divide a Patyayini period by the shares of its second level, from its own lord', () => {
    const year = [p('sun', 0, 10, [p('sun', 0, 1), p('moon', 1, 10)]), p('moon', 10, 100, [p('moon', 10, 91), p('sun', 91, 100)])];
    const [, moon] = deepenAnnual(year, 3, 'patyayini');
    // The Sun's share is a tenth, the Moon's nine tenths.
    expect(moon!.sub[1]!.sub.map((s) => [s.lord, s.endJdUt - s.startJdUt])).toEqual([['sun', 0.9], ['moon', 8.1]].map(([l, d]) => [l, expect.closeTo(d as number, 9)]));
  });
  it('take the Mudda of a chart\'s Moon over a cycle, its first period begun by the part of the nakshatra the Moon has run', () => {
    const m = moonMudda(fakeSky, natal, 30, 2, o);
    expect(m[0]!.startJdUt).toBeLessThanOrEqual(natal.jdUt);
    expect(m[0]!.endJdUt).toBeGreaterThan(natal.jdUt);
    const total = m.slice(0, 9).reduce((t, x) => t + x.endJdUt - x.startJdUt, 0);
    expect(total).toBeCloseTo(30, 9);
  });
  it('list fifteen rows from the one running at an instant, or from the first when the instant comes before, without the parts shorter than asked', () => {
    const tree = deepenAnnual([p('venus', 0, 120), p('sun', 120, 156)], 2, 'mudda');
    const rows = dashaRows(tree, 25, 15);
    expect(rows[0]!.chain).toEqual(['venus', 'sun']);
    expect(rows).toHaveLength(15);
    expect(dashaRows(tree, -5, 3)[0]!.chain).toEqual(['venus', 'venus']);
    // In the Sun's 36 days its own part lasts 1.8 days and Mars's 2.1: both left out below 2.5.
    const short = dashaRows(tree, 119, 15, 2.5).map((r) => r.chain.join('-'));
    expect(short.slice(0, 3)).toEqual(['venus-ketu', 'sun-moon', 'sun-rahu']);
  });
  it('keep the first part of the dasha however short', () => {
    const tree = [p('sun', 0, 10, [p('sun', 0, 0.001), p('moon', 0.001, 10)])];
    expect(dashaRows(tree, -1, 15, 0.5).map((r) => r.chain.join('-'))).toEqual(['sun-sun', 'sun-moon']);
  });
});

describe('the worksheets\' dasha lists at the print\'s clock', () => {
  it('give sixteen rows per list, each from the instant it starts at, with the monthly and daily returns of the age at the clock', async () => {
    const { ageAt, worksheetDashaLists } = await import('../src/index');
    const at = { jdUt: natal.jdUt + 31.4 * 365.25636, utcOffsetHours: 5.5 };
    const w = worksheetDashaLists(fakeSky, natal, at, undefined, o);
    expect(Object.keys(w.rows).sort()).toEqual(['daily', 'kalidasa', 'kalidasa4', 'monthly', 'mudda', 'muddaNone', 'natal', 'patyayini']);
    for (const r of Object.values(w.rows)) expect(r).toHaveLength(16);
    // The clock read as UT: its local time taken for UT, as the other pages of the clock do.
    expect(w.starts.natal).toBeCloseTo(at.jdUt + 5.5 / 24, 9);
    expect(w.starts.daily).toBe(w.returns.daily);
    expect(w.rows.natal[0]!.startJdUt).toBeLessThanOrEqual(w.starts.natal);
    expect(w.rows.natal[1]!.startJdUt).toBeGreaterThan(w.starts.natal);
    const age = ageAt(natal.jdUt, at.jdUt);
    expect(w.returns.monthly).toBe(monthlyReturn(fakeSky, natal, age.years, age.months, 'true', o));
  });
});
