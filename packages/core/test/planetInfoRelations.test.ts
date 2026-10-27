import { describe, expect, it } from 'vitest';
import { compoundRelations, finalDispositor, hemmed, NATURAL_RELATIONS_9, temporalRelations } from '../src';
import type { Planet9 } from '../src/jaimini';

// REF 0010: Sun Taurus, Moon Aries, Mars Leo, Mercury Taurus, Jupiter Scorpio, Venus Aries, Saturn Aquarius, Rahu Libra, Ketu Aries.
const LONS: Record<Planet9, number> = { sun: 42.4, moon: 26.9, mars: 127.25, mercury: 54.09, jupiter: 227.29, venus: 19.54, saturn: 329.69, rahu: 191.65, ketu: 11.65 };

describe('the relations of the planet tables', () => {
  it('gives the planets before and after, as PL9\'s Hemmed column for REF 0010', () => {
    expect(hemmed('sun', LONS)).toEqual({ previous: 'moon', next: 'mercury' }); // "Mo,Me"
    expect(hemmed('moon', LONS)).toEqual({ previous: 'venus', next: 'sun' }); // "Ve,Su"
    expect(hemmed('mars', LONS)).toEqual({ previous: 'mercury', next: 'rahu' }); // "Me,Ra"
    expect(hemmed('ketu', LONS)).toEqual({ previous: 'saturn', next: 'venus' }); // "Sa,Ve", across Aries 0°
  });

  it("gives PL9's Fin.D. column for REF 0010: the first lord to come back", () => {
    const nine: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
    expect(nine.map((p) => finalDispositor(p, LONS))).toEqual(['sun', 'mars', 'mars', 'venus', 'mars', 'venus', 'saturn', 'venus', 'mars']);
  });

  it('keeps the classical relations of the seven and adds the nodes', () => {
    expect(NATURAL_RELATIONS_9.sun.moon).toBe(1);
    expect(NATURAL_RELATIONS_9.sun.venus).toBe(-1);
    expect(NATURAL_RELATIONS_9.mercury.moon).toBe(-1);
    expect(NATURAL_RELATIONS_9.rahu.jupiter).toBe(1);
    expect(NATURAL_RELATIONS_9.ketu.mars).toBe(1);
    for (const p of Object.keys(NATURAL_RELATIONS_9) as Planet9[]) expect(NATURAL_RELATIONS_9[p][p]).toBe(0);
  });

  // PL9's "Compound relations" page for REF 0010 (capture 18), rows and columns Sun to Ketu.
  const NINE: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
  const grid = (rows: string[], values: Record<string, number>) => rows.map((r) => r.split(' ').map((x) => (x === '-' ? 0 : values[x]!)));
  const asGrid = (m: Record<Planet9, Record<Planet9, number>>) => NINE.map((a) => NINE.map((b) => m[a][b]));

  it("gives the page's natural table", () => {
    expect(asGrid(NATURAL_RELATIONS_9)).toEqual(grid([
      '- F F N F E E E E', 'F - N F N N N E E', 'F F - E F N N E F', 'F E N - N F N N N', 'F F F E - E N N N',
      'E E N F N - F F F', 'E E E F N F - F E', 'E E E N F F F - E', 'E E F N N F E E -',
    ], { F: 1, N: 0, E: -1 }));
  });

  it("gives the page's temporal table, by the signs", () => {
    expect(asGrid(temporalRelations(LONS))).toEqual(grid([
      '- F F E E F F E F', 'F - E F E E F E E', 'F E - F F E E F E', 'E F F - E F F E F', 'E E F E - E F F E',
      'F E E F E - F E E', 'F F E F F F - E F', 'E E F E F E E - E', 'F E E F E E F E -',
    ], { F: 1, E: -1 }));
  });

  it("gives the page's compound table, the natural plus the temporal", () => {
    expect(asGrid(compoundRelations(LONS))).toEqual(grid([
      '- GF GF E N N N GE N', 'GF - E GF E E F GE GE', 'GF N - N GF E E N N', 'N N F - E GF F E F', 'N N GF GE - GE F F E',
      'N GE E GF E - GF N N', 'N N GE GF F GF - N N', 'GE GE N E GF N N - GE', 'N GE N F E N N GE -',
    ], { GF: 2, F: 1, N: 0, E: -1, GE: -2 }));
  });
});
