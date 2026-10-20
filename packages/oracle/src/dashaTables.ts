import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { DASHA_SYSTEMS, DASHA_SYSTEM_NAMES, SIGN_NAMES, type DashaLord, type DashaOptions, type DashaSystem } from '@reverse/core';
import type { Provenance } from './fixtures';

/** The start of a period as PL9 printed it: "YYYY-MM-DD" to the day, or "YYYY-MM-DDTHH:MM" to the minute, truncated. */
export interface ShownDasha {
  system: DashaSystem;
  path: DashaLord[];
  start: string;
  precision: 'day' | 'minute';
  /** The mark of a worksheet's dasha cell set to another starting point or varga: "As", "Su", "D9". */
  cell?: string;
}

const CELL_BASES: Record<string, DashaOptions['base']> = {
  As: 'lagna', Su: 'sun', Mo: 'moon', Ma: 'mars', Me: 'mercury', Ju: 'jupiter', Ve: 'venus', Sa: 'saturn', Ra: 'rahu', Ke: 'ketu',
};

/** The dasha options a cell's mark stands for. */
export function cellOptions(cell: string): Partial<DashaOptions> {
  if (CELL_BASES[cell]) return { base: CELL_BASES[cell] };
  if (/^D\d+$/.test(cell)) return { varga: cell as DashaOptions['varga'] };
  throw new Error(`unknown mark of a dasha cell "${cell}"`);
}
/** Each start written "system path start", as in `encodeDasha`: a fixture holds over a thousand. */
/** The Kalachakra's header: Deha, Jeeva, and the sign whose balance runs at birth. */
export interface KalachakraHeader { deha: DashaLord; jeeva: DashaLord; balance: DashaLord }

export interface DashaFixture {
  id: string;
  pl9: { dashas: string[]; kalachakra?: KalachakraHeader };
  /** The dasha options PL9 printed with, where they are not its usual ones. */
  options?: Partial<DashaOptions>;
  provenance: Provenance;
}

export function encodeDasha(d: ShownDasha): string {
  return `${d.system} ${d.path.join('-')} ${d.start}`;
}

export function decodeDasha(text: string): ShownDasha {
  const [system, path, start] = text.split(' ') as [DashaSystem, string, string];
  return { system, path: path.split('-') as DashaLord[], start, precision: start.includes('T') ? 'minute' : 'day' };
}

/** Reads a raw file written by read-dashas.py. */
export function parseDashas(text: string): { chart: string; dashas: ShownDasha[]; kalachakra?: KalachakraHeader } {
  let chart = '';
  let kalachakra: KalachakraHeader | undefined;
  const dashas: ShownDasha[] = [];
  text.split(/\r?\n/).forEach((line, n) => {
    if (!line.trim()) return;
    const f = line.split('\t');
    const where = `line ${n + 1}`;
    if (f[0] === 'chart' && f.length === 2) {
      chart = f[1]!;
      return;
    }
    if (f[0] === 'kalachakra' && f.length === 4) {
      if (f.slice(1).some((x) => !(SIGN_NAMES as readonly string[]).includes(x))) throw new Error(`${where}: not three signs`);
      kalachakra = { deha: f[1] as DashaLord, jeeva: f[2] as DashaLord, balance: f[3] as DashaLord };
      return;
    }
    if (f[0] !== 'dasha' || (f.length !== 5 && f.length !== 6)) throw new Error(`${where}: not a dasha line`);
    const [, system, path, start, precision, cell] = f as [string, DashaSystem, string, string, ShownDasha['precision'], string?];
    if (cell !== undefined) cellOptions(cell);
    if (!DASHA_SYSTEM_NAMES.includes(system)) throw new Error(`${where}: unknown system "${system}"`);
    const lords = path.split('-') as DashaLord[];
    const known: readonly string[] = system in DASHA_SYSTEMS ? DASHA_SYSTEMS[system as keyof typeof DASHA_SYSTEMS].lords : SIGN_NAMES;
    if (lords.length < 1 || lords.length > 5 || lords.some((l) => !known.includes(l))) throw new Error(`${where}: "${path}" is not a path of ${system}`);
    const form = precision === 'day' ? /^\d{4}-\d\d-\d\d$/ : precision === 'minute' ? /^\d{4}-\d\d-\d\dT\d\d:\d\d$/ : null;
    if (!form || !form.test(start)) throw new Error(`${where}: "${start}" is not a start to the ${precision}`);
    dashas.push({ system, path: lords, start, precision, ...(cell ? { cell } : {}) });
  });
  if (!chart) throw new Error('no chart line');
  return { chart, dashas, ...(kalachakra ? { kalachakra } : {}) };
}

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export function loadDashaFixtures(dirName = 'fixtures-dashas'): DashaFixture[] {
  const dir = join(root, dirName);
  const out = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as DashaFixture);
  if (out.length === 0) throw new Error(`no dasha fixtures in ${dir}`);
  return out;
}
