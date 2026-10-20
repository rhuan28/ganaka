import { VARGA_PARTS, divisionIndex, houseOf, nakshatraOf, padaOf, signOf, vargaSign, type Chart, type HouseSystem, type PointName, type Positions, type VargaName } from '@reverse/core';
import { arcsecDiff } from './angles';
import type { Fixture } from './fixtures';
import type { TableFixture } from './tables';

export { SHOWN_LONGITUDES } from './tables';

/** PL9 shows cusps rounded to the arcsecond: half a unit of display, and a margin. Measured worst: 0.50". */
export const CUSP_TOLERANCE_ARCSEC = 0.6;

/** A longitude PL9 shows truncated to the arcminute may be this much above the computed one, or a minute below it. */
export const MINUTE_SLACK_ARCSEC = 0.5;
/** The special lagnas move up to 1800 degrees a day with the sunrise; PL9 rounds them to the second. */
export const SPECIAL_LAGNA_TOLERANCE_ARCSEC = 1;
const SPECIAL_LAGNA_KEYS: Record<string, 'bhava' | 'hora' | 'ghatika' | 'jaiminiHora'> = {
  bhavaLagna: 'bhava', horaLagna: 'hora', ghatikaLagna: 'ghatika', jaiminiHoraLagna: 'jaiminiHora',
};

/** Stands for a value the chart does not have: it never equals a value read from PL9, so it counts as a failure. */
const ABSENT = -1;

export interface TableVerdict {
  chartId: string;
  failures: { what: string; key: string; expected: number | boolean; actual: number | boolean }[];
  borderCases: { what: string; key: string }[];
  checked: number;
}

/** True when moving the PL9 longitude by the tolerance, either way, makes the rule give the PL9 result. */
export function nearBoundary(rule: (longitude: number) => number, pl9Longitude: number, toleranceArcsec: number, expected: number): boolean {
  const d = toleranceArcsec / 3600;
  return rule(pl9Longitude - d) === expected || rule(pl9Longitude + d) === expected;
}

function categorical(
  v: TableVerdict,
  fixture: Fixture,
  toleranceArcsec: number,
  what: string,
  values: Record<string, number>,
  rule: (longitude: number) => number,
  got: (p: PointName) => number,
  computedLongitude: (p: PointName) => number | undefined = () => undefined,
): void {
  for (const [key, expected] of Object.entries(values)) {
    const actual = got(key as PointName);
    v.checked++;
    if (actual === expected) continue;
    // A point PL9 does not export has no longitude of PL9: its own computed longitude decides the border case.
    const ref = fixture.pl9.longitudes[key] ?? computedLongitude(key as PointName);
    if (ref !== undefined && nearBoundary(rule, ref, toleranceArcsec, expected)) v.borderCases.push({ what, key });
    else v.failures.push({ what, key, expected, actual });
  }
}

/** Sign, nakshatra, pada and retrogression read from PL9 against the computed positions. */
export function verifyPositionTables(table: TableFixture, fixture: Fixture, computed: Positions, toleranceArcsec: number): TableVerdict {
  const v: TableVerdict = { chartId: table.id, failures: [], borderCases: [], checked: 0 };
  categorical(v, fixture, toleranceArcsec, 'sign', table.pl9.signs, signOf, (p) => computed.points[p]?.sign ?? ABSENT);
  categorical(v, fixture, toleranceArcsec, 'nakshatra', table.pl9.nakshatras, nakshatraOf, (p) => computed.points[p]?.nakshatra ?? ABSENT);
  categorical(v, fixture, toleranceArcsec, 'pada', table.pl9.padas, padaOf, (p) => computed.points[p]?.pada ?? ABSENT);
  for (const [key, expected] of Object.entries(table.pl9.retrograde)) {
    const actual = computed.points[key as PointName]?.retrograde ?? false;
    v.checked++;
    if (actual !== expected) v.failures.push({ what: 'retrograde', key, expected, actual });
  }
  return v;
}

/**
 * Everything a table fixture holds against a computed chart: positions, vargas, houses, cusps and shown longitudes.
 * `extra` gives the longitudes that are not points of the chart, such as Gulika by the other method.
 */
export function verifyChartTables(table: TableFixture, fixture: Fixture, chart: Chart, toleranceArcsec: number, extra: Record<string, number> = {}): TableVerdict {
  const v = verifyPositionTables(table, fixture, chart, toleranceArcsec);
  for (const [varga, signs] of Object.entries(table.pl9.vargas)) {
    const name = varga as VargaName;
    categorical(v, fixture, toleranceArcsec, `varga ${varga}`, signs, (lon) => vargaSign(lon, name, chart.fidelity), (p) => chart.vargas[name]?.[p] ?? ABSENT, (p) => chart.points[p]?.longitude);
  }
  for (const [system, houses] of Object.entries(table.pl9.houses)) {
    const h = chart.houses?.[system as HouseSystem];
    if (!h) throw new Error(`${table.id}: the chart has no houses in system "${system}"`);
    categorical(v, fixture, toleranceArcsec, `house ${system}`, houses, (lon) => houseOf(lon, h), (p) => chart.pointHouses?.[system as HouseSystem][p] ?? ABSENT);
  }
  const longitudes = (what: 'cusp' | 'start', values: Record<string, number[]>) => {
    for (const [system, list] of Object.entries(values)) {
      const h = chart.houses?.[system as HouseSystem];
      if (!h) throw new Error(`${table.id}: the chart has no houses in system "${system}"`);
      const computed = what === 'cusp' ? h.middles : h.starts;
      list.forEach((expected, k) => {
        v.checked++;
        const d = arcsecDiff(computed[k]!, expected);
        if (!(Math.abs(d) <= CUSP_TOLERANCE_ARCSEC)) v.failures.push({ what: `${what} ${system}`, key: String(k + 1), expected, actual: computed[k]! });
      });
    }
  };
  longitudes('cusp', table.pl9.cusps);
  // Older table fixtures have no beginnings.
  longitudes('start', table.pl9.starts ?? {});
  // Older table fixtures have no shown longitudes.
  for (const [key, { degrees, shown }] of Object.entries(table.pl9.longitudes ?? {})) {
    v.checked++;
    const lagnaKey = SPECIAL_LAGNA_KEYS[key];
    const computed = lagnaKey ? chart.jaimini?.specialLagnas?.[lagnaKey] : chart.points[key as PointName]?.longitude ?? extra[key];
    if (computed === undefined) {
      v.failures.push({ what: 'longitude', key, expected: degrees, actual: ABSENT });
      continue;
    }
    const d = arcsecDiff(computed, degrees);
    const secondTolerance = lagnaKey ? SPECIAL_LAGNA_TOLERANCE_ARCSEC : CUSP_TOLERANCE_ARCSEC;
    const ok = shown === 'second' ? Math.abs(d) <= secondTolerance : d >= -MINUTE_SLACK_ARCSEC && d < 60 + MINUTE_SLACK_ARCSEC;
    if (!ok) v.failures.push({ what: 'longitude', key, expected: degrees, actual: computed });
  }
  verifyJaimini(v, table, chart);
  return v;
}

/**
 * Kinds of value the gate requires and too few table fixtures hold. A kind held by fewer than `minCharts`
 * charts is "not verified", never a pass.
 */
export function missingKinds(tables: TableFixture[], systems: readonly string[], vargas: readonly string[], minCharts = 1, longitudes: readonly string[] = [], jaimini = false): string[] {
  const has = (pick: (t: TableFixture) => Record<string, unknown> | undefined) =>
    tables.filter((t) => Object.keys(pick(t) ?? {}).length > 0).length >= minCharts;
  const missing: string[] = [];
  if (!has((t) => t.pl9.signs)) missing.push('sign');
  if (!has((t) => t.pl9.nakshatras)) missing.push('nakshatra');
  if (!has((t) => t.pl9.padas)) missing.push('pada');
  // Houses are checked by their middles and their beginnings; the house of a point follows from the beginnings.
  for (const s of systems) {
    if (!has((t) => (t.pl9.cusps[s] ? { present: true } : undefined))) missing.push(`cusp ${s}`);
    if (!has((t) => (t.pl9.starts?.[s] ? { present: true } : undefined))) missing.push(`start ${s}`);
  }
  for (const g of vargas) if (!has((t) => t.pl9.vargas[g])) missing.push(`varga ${g}`);
  for (const k of longitudes) if (!has((t) => (t.pl9.longitudes?.[k] ? { present: true } : undefined))) missing.push(`longitude ${k}`);
  if (jaimini) {
    for (const g of ['D1', 'D9', 'D10']) if (!has((t) => (t.pl9.arudhas?.[g as 'D1'] ? { present: true } : undefined))) missing.push(`pada ${g}`);
    for (const c of ['7', '8']) if (!has((t) => (t.pl9.karakas?.[c as '7'] ? { present: true } : undefined))) missing.push(`karakas ${c}`);
    for (const k of ['arudhaLagna', 'upapada', 'karakamsha', 'induLagna']) if (!has((t) => (t.pl9.special?.[k as 'upapada'] !== undefined ? { present: true } : undefined))) missing.push(`special ${k}`);
    if (!has((t) => (t.pl9.aspects && (t.pl9.aspects.movableFixed.length || t.pl9.aspects.dual.length) ? { present: true } : undefined))) missing.push('aspects');
  }
  return missing;
}

/**
 * In how many parts of the zodiac a varga was seen in PL9: a part is one division of one sign.
 * `reference` gives the longitude of a point of a chart, or undefined when there is none to place it.
 */
export function vargaCoverage(tables: TableFixture[], reference: (id: string, point: string) => number | undefined, varga: VargaName): { seen: number; total: number } {
  const total = 12 * VARGA_PARTS[varga];
  const seen = new Set<number>();
  for (const t of tables) {
    for (const point of Object.keys(t.pl9.vargas[varga] ?? {})) {
      const lon = reference(t.id, point);
      if (lon !== undefined) seen.add(divisionIndex(lon, total));
    }
  }
  return { seen: seen.size, total };
}

/** Padas, karakas, special points and aspects PL9 printed, against the chart. Older fixtures have none. */
function verifyJaimini(v: TableVerdict, table: TableFixture, chart: Chart): void {
  const j = chart.jaimini;
  const check = (what: string, key: string, expected: number, actual: number | undefined) => {
    v.checked++;
    if (actual !== expected) v.failures.push({ what, key, expected, actual: actual ?? ABSENT });
  };
  for (const [varga, list] of Object.entries(table.pl9.arudhas ?? {})) {
    list!.forEach((expected, k) => check(`pada ${varga}`, String(k + 1), expected, j?.arudhaPadas?.[varga as 'D1']?.[k]));
  }
  const NAMES: Record<string, string[]> = { '7': ['AK', 'AmK', 'BK', 'MK', 'PiK', 'GK', 'DK'], '8': ['AK', 'AmK', 'BK', 'MK', 'PiK', 'PuK', 'GK', 'DK'] };
  for (const [count, planets] of Object.entries(table.pl9.karakas ?? {})) {
    const computed = count === '8' ? j?.karakas.eight : j?.karakas.seven;
    planets!.forEach((planet, k) => {
      v.checked++;
      if (computed?.[k]?.planet !== planet) v.failures.push({ what: `karaka ${count}`, key: NAMES[count]![k]!, expected: k, actual: ABSENT });
    });
  }
  for (const [key, expected] of Object.entries(table.pl9.special ?? {})) {
    check('special', key, expected!, j?.[key as 'upapada']);
  }
  const aspects = table.pl9.aspects;
  if (aspects && (aspects.movableFixed.length || aspects.dual.length || Object.keys(table.pl9.special ?? {}).length)) {
    const mf = (j?.aspects.movableFixed ?? []).map(([a, b]) => `${a}-${b}`).sort();
    const dual = j?.aspects.dual.length ? [j.aspects.dual.join('-')] : [];
    v.checked += 2;
    if (JSON.stringify(mf) !== JSON.stringify(aspects.movableFixed)) v.failures.push({ what: 'aspects', key: 'movableFixed', expected: aspects.movableFixed.length, actual: mf.length });
    if (JSON.stringify(dual) !== JSON.stringify(aspects.dual)) v.failures.push({ what: 'aspects', key: 'dual', expected: aspects.dual.length, actual: dual.length });
  }
}

/**
 * Charts printed with an option of PL9 that hold the values the option changes: the three pada charts for
 * "Bhavapada calculation", the Karakamsha for "Karakas". A chart that only declares the option checks nothing.
 */
export function optionCoverage(tables: TableFixture[], name: string, value: string): number {
  const holds = (t: TableFixture) => name === 'bhavapada'
    ? ['D1', 'D9', 'D10'].every((v) => t.pl9.arudhas?.[v as 'D1']?.length === 12)
    : t.pl9.special?.karakamsha !== undefined;
  return tables.filter((t) => t.pl9.options?.[name] === value && holds(t)).length;
}

