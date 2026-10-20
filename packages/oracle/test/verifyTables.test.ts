import { describe, expect, it } from 'vitest';
import { ALL_POINTS, HOUSE_SYSTEMS, POINTS, VARGAS, houseCusps, houseOf, nakshatraOf, padaOf, signOf, vargaSign, type Chart, type PointName } from '@reverse/core';
import type { Fixture } from '../src/fixtures';
import type { TableFixture } from '../src/tables';
import { missingKinds, nearBoundary, optionCoverage, vargaCoverage, verifyChartTables, verifyPositionTables } from '../src/verifyTables';

const as = (v: number) => v / 3600;

/** A chart whose every point sits at the given longitude (100 by default), with Lagna 100 and midheaven 5. */
function chartOf(lon: Record<string, number>): Chart {
  const at = (p: string) => lon[p] ?? 100;
  const houses = Object.fromEntries(HOUSE_SYSTEMS.map((s) => [s, houseCusps(100, 5, s)])) as NonNullable<Chart['houses']>;
  const per = <T>(f: (p: PointName) => T) => Object.fromEntries(ALL_POINTS.map((p) => [p, f(p)])) as Record<PointName, T>;
  return {
    verified: true, fidelity: 'pl9', missing: [], ayanamshaDegrees: 24, midheaven: 5, houses,
    points: per((p) => ({ longitude: at(p), sign: signOf(at(p)), nakshatra: nakshatraOf(at(p)), pada: padaOf(at(p)), retrograde: p === 'saturn' })),
    pointHouses: Object.fromEntries(HOUSE_SYSTEMS.map((s) => [s, per((p) => houseOf(at(p), houses[s]))])) as Chart['pointHouses'],
    vargas: Object.fromEntries(VARGAS.map((v) => [v, per((p) => vargaSign(at(p), v))])) as Chart['vargas'],
    jaimini: {
      karakas: { seven: [{ name: 'AK', planet: 'saturn' }, { name: 'AmK', planet: 'moon' }], eight: [] }, karakamsha: 2,
      aspects: { movableFixed: [['moon', 'mars']], dual: ['sun', 'rahu', 'ketu'] },
      arudhaPadas: { D1: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2], D9: [], D10: [] }, arudhaLagna: 9, upapada: 7, induLagna: 7,
      specialLagnas: { bhava: 114.9158, hora: 0, ghatika: 0, jaiminiHora: 0 },
    },
    fromMoon: {},
    fromSun: {},
  };
}
const fixtureOf = (lon: Record<string, number>): Fixture => ({
  id: 'ref-0001', kind: 'random', input: { jdUt: 2451545, latitude: 0, longitudeEast: 0 },
  pl9: { longitudes: Object.fromEntries(POINTS.map((p) => [p, lon[p] ?? 100])) },
  provenance: { program: '', ayanamsha: 'Lahiri', method: '', extractedOn: '' },
});
const tableOf = (pl9: Partial<TableFixture['pl9']>): TableFixture => ({
  id: 'ref-0001',
  pl9: { signs: {}, nakshatras: {}, padas: {}, retrograde: {}, cusps: {}, starts: {}, houses: {}, vargas: {}, longitudes: {}, ...pl9 } as TableFixture['pl9'],
  provenance: { program: '', ayanamsha: 'Lahiri', method: 'test', extractedOn: '' },
});

describe('nearBoundary', () => {
  it('is true when the PL9 result is what the rule gives just across the boundary', () => {
    expect(nearBoundary(signOf, 30 + as(0.2), 0.5, 0)).toBe(true);
    expect(nearBoundary(signOf, 30 - as(0.2), 0.5, 1)).toBe(true);
  });
  it('is false away from a boundary, or when the PL9 result is not a neighbour', () => {
    expect(nearBoundary(signOf, 45, 0.5, 0)).toBe(false);
    expect(nearBoundary(signOf, 30 + as(0.2), 0.5, 5)).toBe(false);
  });
  it('wraps at 360 degrees', () => {
    expect(nearBoundary(signOf, as(0.2), 0.5, 11)).toBe(true);
  });
});

describe('verifyPositionTables', () => {
  it('passes a chart that agrees and counts what it checked', () => {
    const v = verifyPositionTables(tableOf({ signs: { sun: 3, moon: 3 }, nakshatras: { sun: 7 }, padas: { sun: 3 }, retrograde: { saturn: true, sun: false } }), fixtureOf({}), chartOf({}), 0.5);
    expect(v.failures).toEqual([]);
    expect(v.borderCases).toEqual([]);
    expect(v.checked).toBe(6);
  });
  it('reports a different sign away from a boundary', () => {
    const v = verifyPositionTables(tableOf({ signs: { moon: 4 } }), fixtureOf({}), chartOf({}), 0.5);
    expect(v.failures).toEqual([{ what: 'sign', key: 'moon', expected: 4, actual: 3 }]);
  });
  it('lists a different sign as a border case when PL9 is within the tolerance of the boundary', () => {
    const v = verifyPositionTables(tableOf({ signs: { moon: 4 } }), fixtureOf({ moon: 120 - as(0.2) }), chartOf({ moon: 120 - as(0.3) }), 0.5);
    expect(v.failures).toEqual([]);
    expect(v.borderCases).toEqual([{ what: 'sign', key: 'moon' }]);
  });
  it('reports a different direction of motion; it has no border case', () => {
    const v = verifyPositionTables(tableOf({ retrograde: { saturn: false } }), fixtureOf({}), chartOf({}), 0.5);
    expect(v.failures).toEqual([{ what: 'retrograde', key: 'saturn', expected: false, actual: true }]);
  });
});

describe('verifyChartTables', () => {
  const chart = chartOf({ moon: 200 });
  const d9 = vargaSign(200, 'D9');
  it('passes when vargas, houses and cusps agree', () => {
    const table = tableOf({
      vargas: { D9: { moon: d9 } },
      houses: { sripati: { moon: houseOf(200, chart.houses!.sripati) } },
      cusps: { sripati: [...chart.houses!.sripati.middles] },
    });
    const v = verifyChartTables(table, fixtureOf({ moon: 200 }), chart, 0.5);
    expect(v.failures).toEqual([]);
    expect(v.checked).toBe(14);
  });
  it('reports a different varga sign away from a boundary', () => {
    const v = verifyChartTables(tableOf({ vargas: { D9: { moon: (d9 + 1) % 12 } } }), fixtureOf({ moon: 200 }), chart, 0.5);
    expect(v.failures).toEqual([{ what: 'varga D9', key: 'moon', expected: (d9 + 1) % 12, actual: d9 }]);
  });
  it('lists a different house as a border case when PL9 is within the tolerance of where the house begins', () => {
    const start = chart.houses!.sripati.starts[4]!; // house 5 begins here
    const c = chartOf({ moon: start - as(0.2) });
    const v = verifyChartTables(tableOf({ houses: { sripati: { moon: 5 } } }), fixtureOf({ moon: start - as(0.1) }), c, 0.5);
    expect(v.failures).toEqual([]);
    expect(v.borderCases).toEqual([{ what: 'house sripati', key: 'moon' }]);
  });
  it('reports a cusp more than an arcsecond away', () => {
    const cusps = [...chart.houses!.equal.middles];
    cusps[2] = cusps[2]! + as(1.5);
    const v = verifyChartTables(tableOf({ cusps: { equal: cusps } }), fixtureOf({}), chart, 0.5);
    expect(v.failures.map((f) => `${f.what} ${f.key}`)).toEqual(['cusp equal 3']);
  });
  it('checks where each house begins', () => {
    const starts = [...chart.houses!.sripati.starts];
    expect(verifyChartTables(tableOf({ starts: { sripati: starts } }), fixtureOf({}), chart, 0.5).failures).toEqual([]);
    starts[4] = starts[4]! + as(1.5);
    expect(verifyChartTables(tableOf({ starts: { sripati: starts } }), fixtureOf({}), chart, 0.5).failures.map((f) => `${f.what} ${f.key}`)).toEqual(['start sripati 5']);
  });
  it('refuses a house system the core does not compute', () => {
    expect(() => verifyChartTables(tableOf({ houses: { placidus: { moon: 1 } } }), fixtureOf({}), chart, 0.5)).toThrow(/placidus/);
  });
});

describe('missingKinds', () => {
  const full = tableOf({
    signs: { sun: 0 }, nakshatras: { sun: 0 }, padas: { sun: 1 },
    cusps: { sripati: Array(12).fill(0), equal: Array(12).fill(0) }, starts: { sripati: Array(12).fill(0), equal: Array(12).fill(0) },
    vargas: Object.fromEntries(VARGAS.map((v) => [v, { sun: 0 }])),
  });
  it('is empty when every kind appears in some fixture', () => {
    expect(missingKinds([tableOf({}), full], HOUSE_SYSTEMS, VARGAS)).toEqual([]);
  });
  it('asks for each kind in a minimum number of charts, so token data cannot turn the gate green', () => {
    const token = tableOf({ cusps: full.pl9.cusps, starts: full.pl9.starts });
    const many = Array.from({ length: 30 }, () => full);
    expect(missingKinds([...many, token], HOUSE_SYSTEMS, VARGAS, 30)).toEqual([]);
    const noHouses = { ...full, pl9: { ...full.pl9, cusps: {}, starts: {} } };
    expect(missingKinds([...Array.from({ length: 30 }, () => noHouses), token], HOUSE_SYSTEMS, VARGAS, 30)).toEqual(['cusp sripati', 'start sripati', 'cusp equal', 'start equal']);
  });
  it('names what no fixture holds', () => {
    const { D60: _dropped, ...vargas } = full.pl9.vargas;
    const partial = { ...full, pl9: { ...full.pl9, vargas, cusps: { sripati: full.pl9.cusps.sripati! }, starts: { sripati: full.pl9.starts.sripati! } } };
    expect(missingKinds([partial], HOUSE_SYSTEMS, VARGAS)).toEqual(['cusp equal', 'start equal', 'varga D60']);
    expect(missingKinds([], HOUSE_SYSTEMS, VARGAS)).toContain('sign');
  });
});

describe('longitudes PL9 shows without exporting them', () => {
  const second = (key: string, degrees: number) => tableOf({ longitudes: { [key]: { degrees, shown: 'second' } } });
  const minute = (key: string, degrees: number) => tableOf({ longitudes: { [key]: { degrees, shown: 'minute' } } });

  it('checks a longitude shown to the second within the rounding of the display', () => {
    const extra = { gulikaEnd: 70.650988 };
    const ok = verifyChartTables(second('gulikaEnd', 70.651111), fixtureOf({}), chartOf({}), 0.5, extra);
    expect(ok.failures).toEqual([]);
    expect(ok.checked).toBe(1);
    const bad = verifyChartTables(second('gulikaEnd', 70.651389), fixtureOf({}), chartOf({}), 0.5, extra);
    expect(bad.failures).toEqual([{ what: 'longitude', key: 'gulikaEnd', expected: 70.651389, actual: 70.650988 }]);
  });
  it('checks a longitude shown to the minute as a truncated value', () => {
    const chart = chartOf({ mandi: 58.39 });
    const failures = (shown: number) => verifyChartTables(minute('mandi', shown), fixtureOf({}), chart, 0.5).failures;
    expect(failures(58 + 23 / 60)).toEqual([]);
    expect(failures(58 + 24 / 60)).toHaveLength(1);
    expect(failures(58 + 22 / 60)).toHaveLength(1);
  });
  it('lets a truncated value be up to half an arcsecond above the computed one, and no more', () => {
    const shown = 58 + 23 / 60;
    const at = (arcsecBelow: number) => verifyChartTables(minute('mandi', shown), fixtureOf({}), chartOf({ mandi: shown - as(arcsecBelow) }), 0.5).failures;
    expect(at(0.36)).toEqual([]);
    expect(at(0.7)).toHaveLength(1);
    // Fifty-nine seconds and a half above the minute still shows that minute; sixty-one does not.
    expect(at(-59.5)).toEqual([]);
    expect(at(-61)).toHaveLength(1);
  });
  it('takes a longitude that is not a point of the chart from the extra values, and fails when it is not given', () => {
    const table = second('gulikaBeginning', 42.205556);
    expect(verifyChartTables(table, fixtureOf({}), chartOf({}), 0.5, { gulikaBeginning: 42.2055 }).failures).toEqual([]);
    expect(verifyChartTables(table, fixtureOf({}), chartOf({}), 0.5).failures).toEqual([{ what: 'longitude', key: 'gulikaBeginning', expected: 42.205556, actual: -1 }]);
  });
  it('decides a border case of a point PL9 does not export by the computed longitude', () => {
    // A part of the D150 is 0.2 degrees: 0.3" before the end of the first one of Aries.
    const chart = chartOf({ mandi: 0.2 - as(0.3) });
    expect(chart.vargas.D150.mandi).toBe(0);
    const v = verifyChartTables(tableOf({ vargas: { D150: { mandi: 1 } } }), fixtureOf({}), chart, 0.5);
    expect(v.failures).toEqual([]);
    expect(v.borderCases).toEqual([{ what: 'varga D150', key: 'mandi' }]);
    const far = verifyChartTables(tableOf({ vargas: { D150: { mandi: 5 } } }), fixtureOf({}), chart, 0.5);
    expect(far.failures).toEqual([{ what: 'varga D150', key: 'mandi', expected: 5, actual: 0 }]);
  });
  it('does not break on a table fixture written before longitudes existed', () => {
    const old = tableOf({ signs: { sun: 3 } });
    delete (old.pl9 as Partial<TableFixture['pl9']>).longitudes;
    expect(verifyChartTables(old, fixtureOf({}), chartOf({}), 0.5).failures).toEqual([]);
    expect(missingKinds([old], [], [], 1, ['mandi'])).toContain('longitude mandi');
  });
  it('reports the vargas and the longitudes that too few charts hold', () => {
    const empty = tableOf({});
    const some = tableOf({ vargas: { D5: { sun: 0 } }, longitudes: { mandi: { degrees: 1, shown: 'minute' } } });
    const kinds = (tables: TableFixture[], min: number) => missingKinds(tables, [], ['D5'], min, ['mandi']).filter((k) => k.startsWith('varga') || k.startsWith('longitude'));
    expect(kinds([empty], 1)).toEqual(['varga D5', 'longitude mandi']);
    expect(kinds([empty, some], 1)).toEqual([]);
    expect(kinds([empty, some], 2)).toEqual(['varga D5', 'longitude mandi']);
  });
});

describe('vargaCoverage', () => {
  it('counts the parts of the zodiac in which a varga was seen in PL9', () => {
    const lon: Record<string, number> = { sun: 0.05, moon: 14.9, mars: 16, mercury: 359 };
    const table = tableOf({ vargas: { D2: { sun: 4, moon: 4, mars: 3, mercury: 3, jupiter: 0 } } });
    // Sun and Moon share the first half of Aries; Jupiter has no longitude to place it.
    expect(vargaCoverage([table], (_id, point) => lon[point], 'D2')).toEqual({ seen: 3, total: 24 });
    expect(vargaCoverage([table, table], (_id, point) => lon[point], 'D2')).toEqual({ seen: 3, total: 24 });
    expect(vargaCoverage([table], (_id, point) => lon[point], 'D150')).toEqual({ seen: 0, total: 1800 });
  });
});

describe('the Jaimini values', () => {
  const failures = (pl9: Partial<TableFixture['pl9']>) => verifyChartTables(tableOf(pl9), fixtureOf({}), chartOf({}), 0.5).failures.map((f) => `${f.what} ${f.key}`);
  it('passes what agrees', () => {
    const v = verifyChartTables(tableOf({
      arudhas: { D1: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2] }, karakas: { '7': ['saturn', 'moon'] },
      special: { arudhaLagna: 9, upapada: 7, karakamsha: 2, induLagna: 7 }, aspects: { movableFixed: ['moon-mars'], dual: ['sun-rahu-ketu'] },
      longitudes: { bhavaLagna: { degrees: 114.9158 + 0.9 / 3600, shown: 'second' } },
    } as Partial<TableFixture['pl9']>), fixtureOf({}), chartOf({}), 0.5);
    expect(v.failures).toEqual([]);
    expect(v.checked).toBe(12 + 2 + 4 + 2 + 1);
  });
  it('reports each value that differs', () => {
    expect(failures({ arudhas: { D1: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 3] } } as never)).toEqual(['pada D1 12']);
    expect(failures({ karakas: { '7': ['moon', 'saturn'] } } as never)).toEqual(['karaka 7 AK', 'karaka 7 AmK']);
    expect(failures({ special: { upapada: 8 } } as never)).toEqual(['special upapada']);
    expect(failures({ aspects: { movableFixed: ['moon-jupiter'], dual: [] } } as never)).toEqual(['aspects movableFixed', 'aspects dual']);
    // A special lagna is held to one arcsecond.
    expect(failures({ longitudes: { bhavaLagna: { degrees: 114.9158 + 1.2 / 3600, shown: 'second' } } } as never)).toEqual(['longitude bhavaLagna']);
  });
  it('fails a value the chart does not have', () => {
    const chart = chartOf({});
    delete chart.jaimini.arudhaPadas;
    expect(verifyChartTables(tableOf({ arudhas: { D9: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] } } as never), fixtureOf({}), chart, 0.5).failures).toHaveLength(12);
  });
  it('names the Jaimini kinds too few charts hold', () => {
    expect(missingKinds([tableOf({})], [], [], 1, [], true)).toEqual(expect.arrayContaining(['pada D1', 'pada D9', 'pada D10', 'karakas 7', 'karakas 8', 'special upapada', 'aspects']));
  });
});

describe('optionCoverage', () => {
  const padas = { D1: Array(12).fill(0), D9: Array(12).fill(0), D10: Array(12).fill(0) };
  const printed = (options: Record<string, string>, pl9: Partial<TableFixture['pl9']>) => tableOf({ ...pl9, options } as never);
  it('counts only the charts that were printed with the option and hold the values it changes', () => {
    const tables = [
      printed({ bhavapada: 'knrao', karakas: 'eight' }, { arudhas: padas, special: { karakamsha: 3 } }),
      printed({ bhavapada: 'knrao', karakas: 'eight' }, { arudhas: { D1: padas.D1 } }),
      printed({ bhavapada: 'knrao' }, {}),
      printed({}, { arudhas: padas, special: { karakamsha: 1 } }),
    ];
    expect(optionCoverage(tables, 'bhavapada', 'knrao')).toBe(1);
    expect(optionCoverage(tables, 'karakas', 'eight')).toBe(1);
  });
});
