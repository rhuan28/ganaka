import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_POINTS, VARGAS } from '@reverse/core';
import type { Provenance } from './fixtures';

export interface TableFixtureData {
  chart: string;
  method: string;
  signs: Record<string, number>;
  nakshatras: Record<string, number>;
  padas: Record<string, number>;
  retrograde: Record<string, boolean>;
  cusps: Record<string, number[]>;
  /** system -> 12 longitudes where each house begins */
  starts: Record<string, number[]>;
  houses: Record<string, Record<string, number>>;
  vargas: Record<string, Record<string, number>>;
  /** Longitudes PL9 shows and does not export, with the precision of the display. Absent in older fixtures. */
  longitudes: Record<string, ShownLongitude>;
  /** Arudha padas of the twelve houses, the first house first, in the Rashi, Navamsha and Dashamsha. */
  arudhas: Partial<Record<'D1' | 'D9' | 'D10', number[]>>;
  /** Planets in the order of the karaka names, with seven and with eight karakas. */
  karakas: Partial<Record<'7' | '8', string[]>>;
  /** Signs of PL9's Jaimini special points. */
  special: Partial<Record<(typeof SPECIAL_POINTS_JAIMINI)[number], number>>;
  /** Planet pairs in movable and fixed signs, "a-b"; planets in dual signs, "a-b-c". */
  aspects: { movableFixed: string[]; dual: string[] };
  /** Options PL9 was set to, when not those observed. */
  options: Record<string, string>;
}
/** `second`: rounded to the arcsecond. `minute`: truncated to the arcminute. */
export interface ShownLongitude { degrees: number; shown: 'second' | 'minute' }
/** Mandi and the Bhrigu point of the chart with degrees; Gulika by the two methods of the page Sub-Planets. */
export const SHOWN_LONGITUDES = ['mandi', 'bhrigu', 'gulikaBeginning', 'gulikaEnd', 'bhavaLagna', 'horaLagna', 'ghatikaLagna', 'jaiminiHoraLagna'] as const;
export const SPECIAL_POINTS_JAIMINI = ['arudhaLagna', 'upapada', 'karakamsha', 'induLagna'] as const;
const KARAKA_NAMES: Record<'7' | '8', string[]> = { '7': ['AK', 'AmK', 'BK', 'MK', 'PiK', 'GK', 'DK'], '8': ['AK', 'AmK', 'BK', 'MK', 'PiK', 'PuK', 'GK', 'DK'] };
const KARAKA_PLANETS = new Set(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu']);
const ASPECT_PLANETS = new Set(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']);
const OPTIONS: Record<string, string[]> = { karakas: ['seven', 'eight'], bhavapada: ['parashara', 'knrao'] };
export interface TableFixture { id: string; pl9: Omit<TableFixtureData, 'chart' | 'method'>; provenance: Provenance }

const POINT_SET = new Set<string>(ALL_POINTS);
const VARGA_SET = new Set<string>(VARGAS);

/** Reads the raw table format of the extraction (one table per block, a header line naming the varga, then a line per point). */
export function parseTables(text: string): TableFixtureData {
  const out: TableFixtureData = { chart: '', method: '', signs: {}, nakshatras: {}, padas: {}, retrograde: {}, cusps: {}, starts: {}, houses: {}, vargas: {}, longitudes: {}, karakas: {}, special: {}, arudhas: {}, aspects: { movableFixed: [], dual: [] }, options: {} };
  const pending: Record<string, (number | undefined)[]> = {};
  const karakaPending: Record<string, (string | undefined)[]> = {};
  const partial: Record<'cusp' | 'start', Record<string, (number | undefined)[]>> = { cusp: {}, start: {} };
  const int = (what: string, raw: string | undefined, lo: number, hi: number): number => {
    const v = Number(raw);
    if (raw === undefined || !Number.isInteger(v) || v < lo || v > hi) throw new Error(`${what}: "${raw}" is not an integer from ${lo} to ${hi}`);
    return v;
  };
  const point = (raw: string | undefined): string => {
    if (!raw || !POINT_SET.has(raw)) throw new Error(`unknown point "${raw}"`);
    return raw;
  };
  const put = <T>(target: Record<string, T>, key: string, value: T, what: string) => {
    if (key in target) throw new Error(`duplicate ${what} for "${key}"`);
    target[key] = value;
  };
  for (const [n, rawLine] of text.split(/\r?\n/).entries()) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const f = line.split('\t').map((s) => s.trim());
    const bad = () => new Error(`line ${n + 1} is not understood: "${line}"`);
    switch (f[0]) {
      case 'chart': if (f.length !== 2) throw bad(); out.chart = f[1]!; break;
      case 'method': if (f.length !== 2) throw bad(); out.method = f[1]!; break;
      case 'sign': if (f.length !== 3) throw bad(); put(out.signs, point(f[1]), int('sign', f[2], 1, 12) - 1, 'sign'); break;
      case 'nakshatra': if (f.length !== 3) throw bad(); put(out.nakshatras, point(f[1]), int('nakshatra', f[2], 1, 27) - 1, 'nakshatra'); break;
      case 'pada': if (f.length !== 3) throw bad(); put(out.padas, point(f[1]), int('pada', f[2], 1, 4), 'pada'); break;
      case 'retro': if (f.length !== 3) throw bad(); put(out.retrograde, point(f[1]), int('retro', f[2], 0, 1) === 1, 'retro'); break;
      case 'house': if (f.length !== 4) throw bad(); put((out.houses[f[1]!] ??= {}), point(f[2]), int('house', f[3], 1, 12), 'house'); break;
      case 'varga':
        if (f.length !== 4) throw bad();
        if (!VARGA_SET.has(f[1]!)) throw new Error(`unknown varga "${f[1]}"`);
        put((out.vargas[f[1]!] ??= {}), point(f[2]), int('varga', f[3], 1, 12) - 1, 'varga');
        break;
      case 'longitude': {
        if (f.length !== 4) throw bad();
        if (!(SHOWN_LONGITUDES as readonly string[]).includes(f[1]!)) throw new Error(`unknown longitude "${f[1]}"`);
        if (f[2] !== 'second' && f[2] !== 'minute') throw new Error(`longitude: unknown precision "${f[2]}"`);
        const deg = Number(f[3]);
        if (!Number.isFinite(deg) || deg < 0 || deg >= 360) throw new Error(`longitude: "${f[3]}" is not a longitude in [0, 360)`);
        put(out.longitudes, f[1]!, { degrees: deg, shown: f[2] }, 'longitude');
        break;
      }
      case 'arudha': {
        if (f.length !== 4 || !['D1', 'D9', 'D10'].includes(f[1]!)) throw bad();
        const k = int('pada house', f[2], 1, 12);
        const list = (pending[f[1]!] ??= new Array<number | undefined>(12).fill(undefined));
        if (list[k - 1] !== undefined) throw new Error(`duplicate pada ${k} for ${f[1]}`);
        list[k - 1] = int('pada sign', f[3], 1, 12) - 1;
        break;
      }
      case 'karaka': {
        if (f.length !== 4 || (f[1] !== '7' && f[1] !== '8')) throw bad();
        const k = KARAKA_NAMES[f[1]].indexOf(f[2]!);
        if (k < 0 || !KARAKA_PLANETS.has(f[3]!)) throw new Error(`karaka: "${f[2]}" or "${f[3]}" is not understood`);
        const list = (karakaPending[f[1]] ??= new Array<string | undefined>(KARAKA_NAMES[f[1]].length).fill(undefined));
        if (list[k] !== undefined) throw new Error(`duplicate karaka ${f[2]}`);
        list[k] = f[3]!;
        break;
      }
      case 'special':
        if (f.length !== 3) throw bad();
        if (!(SPECIAL_POINTS_JAIMINI as readonly string[]).includes(f[1]!)) throw new Error(`unknown special point "${f[1]}"`);
        put(out.special as Record<string, number>, f[1]!, int('special', f[2], 1, 12) - 1, 'special point');
        break;
      case 'aspect':
        if (f.length !== 3 || (f[1] !== 'movableFixed' && f[1] !== 'dual')) throw bad();
        if (f[2]!.split('-').some((p) => !ASPECT_PLANETS.has(p)) || (f[1] === 'movableFixed' && f[2]!.split('-').length !== 2)) throw new Error(`aspect "${f[2]}" is not understood`);
        out.aspects[f[1]].push(f[2]!);
        break;
      case 'options':
        if (f.length !== 2) throw bad();
        for (const item of f[1]!.split(',')) {
          const [name, value] = item.split('=');
          if (!name || !value || !OPTIONS[name]?.includes(value)) throw new Error(`option "${item}" is not understood`);
          out.options[name] = value;
        }
        break;
      case 'cusp':
      case 'start': {
        if (f.length !== 4) throw bad();
        const k = int(f[0], f[2], 1, 12);
        const deg = Number(f[3]);
        if (!Number.isFinite(deg) || deg < 0 || deg >= 360) throw new Error(`${f[0]}: "${f[3]}" is not a longitude in [0, 360)`);
        const list = (partial[f[0]][f[1]!] ??= new Array<number | undefined>(12).fill(undefined));
        if (list[k - 1] !== undefined) throw new Error(`duplicate ${f[0]} ${k} for "${f[1]}"`);
        list[k - 1] = deg;
        break;
      }
      default: throw bad();
    }
  }
  if (!out.chart || !out.method) throw new Error('the file has no chart or no method line');
  for (const [varga, list] of Object.entries(pending)) {
    if (list.some((v) => v === undefined)) throw new Error(`pada chart ${varga} does not have all 12 houses`);
    out.arudhas[varga as 'D1'] = list as number[];
  }
  for (const [count, list] of Object.entries(karakaPending)) {
    if (list.some((v) => v === undefined)) throw new Error(`karaka table ${count} is incomplete`);
    out.karakas[count as '7'] = list as string[];
  }
  out.aspects.movableFixed.sort();
  out.aspects.dual.sort();
  for (const kind of ['cusp', 'start'] as const) {
    for (const [system, list] of Object.entries(partial[kind])) {
      if (list.some((v) => v === undefined)) throw new Error(`system "${system}" does not have all 12 values of "${kind}"`);
      (kind === 'cusp' ? out.cusps : out.starts)[system] = list as number[];
    }
  }
  return out;
}

type Held = Omit<TableFixtureData, 'chart' | 'method'>;

function mergeAspects(a: Held['aspects'] | undefined, b: Held['aspects'] | undefined): Held['aspects'] {
  const empty = (x: Held['aspects'] | undefined) => !x || (x.movableFixed.length === 0 && x.dual.length === 0);
  if (empty(a)) return b ?? { movableFixed: [], dual: [] };
  if (empty(b) || JSON.stringify(a) === JSON.stringify(b)) return a!;
  throw new Error(`the two readings disagree on aspects: ${JSON.stringify(a)} and ${JSON.stringify(b)}`);
}

/**
 * What two readings of the same chart hold, together. A value both hold has to be the same in both.
 * Cusps and beginnings are kept from the first reading: the second may show them with less precision.
 */
export function mergeTables(old: Held, add: Held): Held {
  const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);
  const union = <T>(what: string, a: Record<string, T> = {}, b: Record<string, T> = {}): Record<string, T> => {
    const out = { ...a };
    for (const [key, value] of Object.entries(b)) {
      if (key in out && !same(out[key], value)) throw new Error(`the two readings disagree on ${what} ${key}: ${JSON.stringify(out[key])} and ${JSON.stringify(value)}`);
      out[key] = value;
    }
    return out;
  };
  const nested = (what: string, a: Record<string, Record<string, number>> = {}, b: Record<string, Record<string, number>> = {}) =>
    Object.fromEntries([...new Set([...Object.keys(a), ...Object.keys(b)])].map((name) => [name, union(`${what} ${name}`, a[name], b[name])]));
  return {
    signs: union('sign', old.signs, add.signs),
    nakshatras: union('nakshatra', old.nakshatras, add.nakshatras),
    padas: union('pada', old.padas, add.padas),
    retrograde: union('retro', old.retrograde, add.retrograde),
    cusps: { ...add.cusps, ...old.cusps },
    starts: { ...add.starts, ...old.starts },
    houses: nested('house', old.houses, add.houses),
    vargas: nested('varga', old.vargas, add.vargas),
    longitudes: union('longitude', old.longitudes, add.longitudes),
    arudhas: union('pada chart', old.arudhas, add.arudhas),
    karakas: union('karaka table', old.karakas, add.karakas),
    special: union('special point', old.special, add.special),
    aspects: mergeAspects(old.aspects, add.aspects),
    options: union('option', old.options, add.options),
  };
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function loadTableFixtures(dirName = 'fixtures-tables'): TableFixture[] {
  const dir = join(root, dirName);
  const out = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as TableFixture);
  if (out.length === 0) throw new Error(`no table fixtures in ${dir}`);
  return out;
}
