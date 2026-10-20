import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { AV_CONTRIBUTORS, type Ashtakavarga, type BhavaBala, type BhavaRow, type Vimshopaka, VIMSHOPAKA_GROUPS, CLASSICAL_VARGAS, type AshtakavargaOptions, type AvContributor, type Shadbala, type ShadbalaOptions, type ShadbalaRow } from '@reverse/core';
import type { Provenance } from './fixtures';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Each value as PL9 printed it. The Ashtakavarga written "table owner [contributor] numbers": "bhinna sun 2 3 …",
 * "pinda sun 108 37 145", "prastara sun saturn 0 1 …", "sarva 25 25 …"; signs from Aries. The Shadbala written
 * "part planet value": "dig sun 46.81", "rank sun 2".
 */
export interface StrengthFixture {
  id: string;
  pl9: { av?: string[]; sb?: string[]; bb?: string[]; vim?: string[] };
  /** The options PL9 printed with, where they are not its usual ones. */
  options?: Partial<AshtakavargaOptions> | Partial<ShadbalaOptions>;
  provenance: Provenance;
}

const OWNER = new Set<string>(AV_CONTRIBUTORS);
/** The parts of the Shadbala PL9 prints, as the core names them. */
export const SHADBALA_PARTS = [
  'uchcha', 'saptavargaja', 'ojhayugma', 'kendradi', 'drekkana', 'sthana', 'dig', 'nathonnatha', 'paksha', 'tribhaga', 'varsha', 'masa',
  'vara', 'hora', 'ayana', 'yuddha', 'kala', 'cheshta', 'naisargika', 'drik', 'total', 'rupas', 'minimum', 'ratio', 'rank', 'ishta',
  'kashta', 'strong',
] as const satisfies readonly (keyof ShadbalaRow)[];
const PART = new Set<string>(SHADBALA_PARTS);
const SEVEN = new Set(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']);
/** The parts of the Bhava Bala PL9 prints, per house: the sign (Aries 0), the degree and the five parts, the total and rupas. */
export const BHAVA_PARTS = ['sign', 'degree', 'lord', 'dig', 'drishti', 'occupants', 'dayNight', 'total', 'rupas'] as const;
const BHAVA_PART = new Set<string>(BHAVA_PARTS);
const GROUP = new Set<string>(VIMSHOPAKA_GROUPS);
const VARGA16 = new Set<string>(CLASSICAL_VARGAS);
const NINE = new Set(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']);
/** Printed as whole numbers, and compared exactly. */
const COUNTS = new Set(['minimum', 'rank', 'strong']);
const numbers = (text: string, n: number, where: string) => {
  const xs = text.trim().split(/\s+/).map(Number);
  if (xs.length !== n || xs.some((x) => !Number.isInteger(x))) throw new Error(`${where}: expected ${n} whole numbers`);
  return xs;
};

/** Reads a raw file written by read-strengths.py. */
export function parseStrengths(text: string): { chart: string; av: string[]; sb: string[]; bb: string[]; vim: string[] } {
  let chart = '';
  const av: string[] = [];
  const sb: string[] = [];
  const bb: string[] = [];
  const vim: string[] = [];
  text.split(/\r?\n/).forEach((line, n) => {
    if (!line.trim()) return;
    const f = line.split('\t');
    const where = `line ${n + 1}`;
    if (f[0] === 'chart' && f.length === 2) { chart = f[1]!; return; }
    if (f[0] === 'sb') {
      const [, part, planet, value] = f;
      if (f.length !== 4 || !PART.has(part!) || !SEVEN.has(planet!) || !/^-?\d+(\.\d+)?$/.test(value!)) throw new Error(`${where}: unknown line`);
      sb.push(`${part} ${planet} ${value}`);
      return;
    }
    if (f[0] === 'vim' || f[0] === 'vc') {
      const [kind, what, planet, value] = f;
      const known = kind === 'vim' ? GROUP.has(what!) && /^\d+$/.test(value!) : VARGA16.has(what!) && /^[1-9]$/.test(value!);
      if (f.length !== 4 || !known || !NINE.has(planet!)) throw new Error(`${where}: unknown line`);
      vim.push(`${what} ${planet} ${value}`);
      return;
    }
    if (f[0] === 'bb') {
      const [, part, house, value] = f;
      if (f.length !== 4 || !BHAVA_PART.has(part!) || !/^(1[0-2]|[1-9])$/.test(house!) || !/^-?\d+(\.\d+)?$/.test(value!)) throw new Error(`${where}: unknown line`);
      bb.push(`${part} ${house} ${value}`);
      return;
    }
    if (f[0] !== 'av') throw new Error(`${where}: unknown line`);
    const [, table, a, b, c] = f;
    if ((table === 'bhinna' || table === 'trikona' || table === 'ekadhipatya') && f.length === 4 && OWNER.has(a!)) av.push(`${table} ${a} ${numbers(b!, 12, where).join(' ')}`);
    else if (table === 'pinda' && f.length === 4 && OWNER.has(a!)) av.push(`pinda ${a} ${numbers(b!, 3, where).join(' ')}`);
    else if (table === 'prastara' && f.length === 5 && OWNER.has(a!) && OWNER.has(b!)) av.push(`prastara ${a} ${b} ${numbers(c!, 12, where).join(' ')}`);
    else if (table === 'sarva' && f.length === 3) av.push(`sarva ${numbers(a!, 12, where).join(' ')}`);
    else throw new Error(`${where}: unknown line`);
  });
  if (!chart) throw new Error('no chart line');
  return { chart, av, sb, bb, vim };
}

/** Each value PL9 printed against the core's: the count checked and one line per value that differs. */
export function verifyAshtakavarga(shown: string[], av: Ashtakavarga): { values: number; failures: string[] } {
  let values = 0;
  const failures: string[] = [];
  const compare = (label: string, printed: number[], computed: number[]) => {
    values += printed.length;
    printed.forEach((x, i) => { if (x !== computed[i]) failures.push(`${label} [${i}]: PL9 ${x}, core ${computed[i]}`); });
  };
  for (const line of shown) {
    const f = line.split(' ');
    const table = f[0]!;
    if (table === 'sarva') compare('sarva', f.slice(1).map(Number), av.sarva);
    else if (table === 'prastara') compare(`prastara ${f[1]} ${f[2]}`, f.slice(3).map(Number), av.prastara[f[1] as AvContributor][f[2] as AvContributor]);
    else if (table === 'pinda') {
      const p = av.pindas[f[1] as AvContributor];
      compare(`pinda ${f[1]}`, f.slice(2).map(Number), [p.rashi, p.graha, p.sodhya]);
    } else compare(`${table} ${f[1]}`, f.slice(2).map(Number), av[table as 'bhinna' | 'trikona' | 'ekadhipatya'][f[1] as AvContributor]);
  }
  return { values, failures };
}

/**
 * Each Shadbala value PL9 printed against the core's: to half a hundredth (and the core's own error, a hundred-
 * thousandth, measured against PL9's memory), the counts exactly. PL9's page ranks the ratio rounded to two decimals
 * and breaks a tie by a rule not found yet, so a rank that differs where the printed ratio ties another is set apart
 * as pending; anywhere else it fails (docs/spec/strengths/shadbala.md).
 */
export function verifyShadbala(shown: string[], sb: Shadbala): { values: number; failures: string[]; pending: string[] } {
  const failures: string[] = [];
  const pending: string[] = [];
  const printedRatio = new Map(shown.filter((l) => l.startsWith('ratio ')).map((l) => [l.split(' ')[1]!, l.split(' ')[2]!]));
  const printedRank = new Map(shown.filter((l) => l.startsWith('rank ')).map((l) => [l.split(' ')[1]!, Number(l.split(' ')[2])]));
  // Pending only where the printed ratio ties another planet's, and the core's rank is one PL9 gave that tied group.
  const tied = (planet: string, rank: number) => {
    const group = [...printedRatio].filter(([, v]) => v === printedRatio.get(planet)).map(([p]) => p);
    return group.length > 1 && group.some((p) => printedRank.get(p) === rank);
  };
  for (const line of shown) {
    const [part, planet, value] = line.split(' ') as [keyof ShadbalaRow, keyof Shadbala['planets'], string];
    const computed = sb.planets[planet][part];
    const printed = Number(value);
    const same = COUNTS.has(part) ? computed === printed : Math.abs(computed - printed) <= 0.005 + 1e-5;
    if (same) continue;
    const message = `${part} ${planet}: PL9 ${value}, core ${COUNTS.has(part) ? computed : computed.toFixed(4)}`;
    (part === 'rank' && tied(planet, computed) ? pending : failures).push(message);
  }
  return { values: shown.length, failures, pending };
}

/** The Shadbala read from PL9's memory: each part of the seven planets, at full precision. */
export interface ShadbalaMemoryFixture {
  id: string;
  memory: Partial<Record<keyof ShadbalaRow, number[]>>;
  provenance: Provenance;
}

const SEVEN_ORDER = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const;

/** Each part PL9 held in memory against the core's, to a ten-thousandth (the core's error measured there is ~1e-5). */
export function verifyShadbalaMemory(memory: ShadbalaMemoryFixture['memory'], sb: Shadbala): { values: number; failures: string[] } {
  let values = 0;
  const failures: string[] = [];
  for (const [part, held] of Object.entries(memory) as [keyof ShadbalaRow, number[]][]) {
    SEVEN_ORDER.forEach((p, i) => {
      values++;
      const computed = sb.planets[p][part];
      // Written so that a missing or NaN value fails.
      if (!(Math.abs(computed - held[i]!) <= 1e-4)) failures.push(`${part} ${p}: PL9 ${held[i]}, core ${computed}`);
    });
  }
  return { values, failures };
}

/**
 * Each Bhava Bala value PL9 printed against the core's: the sign and degree exactly; the five parts as PL9 prints
 * them, truncated toward zero; the total and rupas rounded. A millionth is allowed for the core's arithmetic.
 */
export function verifyBhavaBala(shown: string[], bb: BhavaBala): { values: number; failures: string[] } {
  const failures: string[] = [];
  const e = 1e-6;
  for (const line of shown) {
    const [part, house, value] = line.split(' ') as [keyof BhavaRow, string, string];
    const computed = bb.houses[Number(house) - 1]![part];
    const v = Number(value);
    const same = part === 'sign' || part === 'degree' ? computed === v
      : part === 'total' || part === 'rupas' ? Math.abs(computed - v) <= 0.5 + e
        : v > 0 ? computed > v - e && computed < v + 1 + e
          : v < 0 ? computed < v + e && computed > v - 1 - e
            : Math.abs(computed) < 1 + e;
    if (!same) failures.push(`${part} ${house}: PL9 ${value}, core ${part === 'sign' || part === 'degree' ? computed : computed.toFixed(4)}`);
  }
  return { values: shown.length, failures };
}

/**
 * Each Vimshopaka value PL9 printed against the core's: the dignities exactly; the scores rounded, and a score the core
 * finds exactly a half accepted either way (PL9 rounds those both ways, by its arithmetic).
 */
export function verifyVimshopaka(shown: string[], v: Vimshopaka): { values: number; failures: string[] } {
  const failures: string[] = [];
  for (const line of shown) {
    const [what, planet, value] = line.split(' ') as [string, keyof Vimshopaka['planets'], string];
    const row = v.planets[planet];
    const printed = Number(value);
    if (GROUP.has(what)) {
      const c = row.scores[what as keyof typeof row.scores];
      const half = Math.abs(c - Math.floor(c) - 0.5) < 1e-9;
      if (!(Math.floor(c + 0.5) === printed || (half && Math.abs(c - printed) === 0.5))) failures.push(`${what} ${planet}: PL9 ${value}, core ${c.toFixed(4)}`);
    } else {
      const c = row.dignities[what as keyof typeof row.dignities];
      if (c !== printed) failures.push(`${what} ${planet}: PL9 ${value}, core ${c}`);
    }
  }
  return { values: shown.length, failures };
}

export function loadStrengthFixtures(dirName = 'fixtures-ashtakavarga'): StrengthFixture[] {
  const dir = join(root, dirName);
  const out = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as StrengthFixture);
  if (out.length === 0) throw new Error(`no strength fixtures in ${dir}`);
  return out;
}
