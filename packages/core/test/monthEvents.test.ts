import { describe, expect, it } from 'vitest';
import { monthEvents } from '../src/index';
import { fakeSky } from './fakeSky';

const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: 150.6744444 };
const o = { fidelity: 'pl9' } as const;
const from = 2461314.5, to = from + 31;

describe('the events of a month ("Calendar")', () => {
  const ev = monthEvents(fakeSky, natal, from, to, o)!;
  it('lists them in time order, within the month', () => {
    expect(ev.length).toBeGreaterThan(50);
    expect(ev.every((e, i) => e.jdUt >= from && e.jdUt < to && (i === 0 || ev[i - 1]!.jdUt <= e.jdUt))).toBe(true);
  });
  it('gives the entries into signs and nakshatras as the core\'s search finds them', async () => {
    const { crossings } = await import('../src/index');
    const signs = crossings(fakeSky, from, to, 30, o).map((c) => `${c.planet} ${c.part}`);
    expect(ev.flatMap((e) => (e.kind === 'sign' ? [`${e.planet} ${e.target}`] : []))).toEqual(signs);
  });
  it('gives the conjunctions, oppositions and trines to the natal planets, Ascendant and cusps 4, 7 and 10', () => {
    const kinds = new Set(ev.filter((e) => e.kind === 'aspect').map((e) => e.aspect));
    expect([...kinds].sort()).toEqual(['conjunction', 'opposition', 'trine']);
    const targets = new Set(ev.filter((e) => e.kind === 'aspect').map((e) => e.target));
    expect([...targets].every((t) => ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu', 'lagna', 'cusp4', 'cusp7', 'cusp10'].includes(String(t)))).toBe(true);
  });
  it('gives each new period of the natal Vimshottari\'s fifth level', () => {
    const d = ev.filter((e) => e.kind === 'dasha');
    expect(d.length).toBeGreaterThan(0);
    expect(d[0]!.chain).toHaveLength(5);
  });
  it('lists the dasha changes only from the instant asked (PL9: the first day of the month at 0h UT)', () => {
    const first = ev.find((e) => e.kind === 'dasha')!;
    const later = monthEvents(fakeSky, natal, from, to, o, { dashasFromJdUt: first.jdUt + 1e-6 })!;
    expect(later.filter((e) => e.kind === 'dasha')).toHaveLength(ev.filter((e) => e.kind === 'dasha').length - 1);
    expect(later.filter((e) => e.kind !== 'dasha')).toEqual(ev.filter((e) => e.kind !== 'dasha'));
  });
  it('marks each event of a planet moving backwards', () => {
    expect(ev.filter((e) => e.kind !== 'dasha').every((e) => typeof e.retrograde === 'boolean')).toBe(true);
  });
  it('is null without the natal Lagna', () => {
    expect(monthEvents(fakeSky, { ...natal, latitude: 89.5 }, from, to, o)).toBeNull();
  });
});
