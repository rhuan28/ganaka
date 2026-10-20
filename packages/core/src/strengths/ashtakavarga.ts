import type { Fidelity } from '../fidelity';

/**
 * The Ashtakavarga as PL9 computes it. See docs/spec/strengths/ashtakavarga.md.
 */

export const AV_PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const;
export type AvPlanet = (typeof AV_PLANETS)[number];
export type AvContributor = AvPlanet | 'lagna';
export const AV_CONTRIBUTORS: readonly AvContributor[] = [...AV_PLANETS, 'lagna'];

export interface AshtakavargaOptions {
  /** PL9's "Ashtakavarga": the places of Varahamihira, or of Parashara. */
  method: 'varahamihira' | 'parashara';
  /** PL9's "Ekhadipatya reductions": Parashara's rule, or the other one. */
  ekadhipatya: 'parashara' | 'other';
  /** PL9's "Rashi multiplier for Virgo". */
  virgoMultiplier: 6 | 5;
}

export const DEFAULT_ASHTAKAVARGA_OPTIONS: AshtakavargaOptions = Object.freeze({
  method: 'varahamihira', ekadhipatya: 'parashara', virgoMultiplier: 6,
}) as AshtakavargaOptions;

/**
 * Houses, counted from each contributor's sign, where it gives a bindu in each chart: Varahamihira's places, the
 * Lagna's own chart included.
 */
const PLACES: Record<AvContributor, Record<AvContributor, number[]>> = {
  sun: { sun: [1, 2, 4, 7, 8, 9, 10, 11], moon: [3, 6, 10, 11], mars: [1, 2, 4, 7, 8, 9, 10, 11], mercury: [3, 5, 6, 9, 10, 11, 12], jupiter: [5, 6, 9, 11], venus: [6, 7, 12], saturn: [1, 2, 4, 7, 8, 9, 10, 11], lagna: [3, 4, 6, 10, 11, 12] },
  moon: { sun: [3, 6, 7, 8, 10, 11], moon: [1, 3, 6, 7, 10, 11], mars: [2, 3, 5, 6, 9, 10, 11], mercury: [1, 3, 4, 5, 7, 8, 10, 11], jupiter: [1, 2, 4, 7, 8, 10, 11], venus: [3, 4, 5, 7, 9, 10, 11], saturn: [3, 5, 6, 11], lagna: [3, 6, 10, 11] },
  mars: { sun: [3, 5, 6, 10, 11], moon: [3, 6, 11], mars: [1, 2, 4, 7, 8, 10, 11], mercury: [3, 5, 6, 11], jupiter: [6, 10, 11, 12], venus: [6, 8, 11, 12], saturn: [1, 4, 7, 8, 9, 10, 11], lagna: [1, 3, 6, 10, 11] },
  mercury: { sun: [5, 6, 9, 11, 12], moon: [2, 4, 6, 8, 10, 11], mars: [1, 2, 4, 7, 8, 9, 10, 11], mercury: [1, 3, 5, 6, 9, 10, 11, 12], jupiter: [6, 8, 11, 12], venus: [1, 2, 3, 4, 5, 8, 9, 11], saturn: [1, 2, 4, 7, 8, 9, 10, 11], lagna: [1, 2, 4, 6, 8, 10, 11] },
  jupiter: { sun: [1, 2, 3, 4, 7, 8, 9, 10, 11], moon: [2, 5, 7, 9, 11], mars: [1, 2, 4, 7, 8, 10, 11], mercury: [1, 2, 4, 5, 6, 9, 10, 11], jupiter: [1, 2, 3, 4, 7, 8, 10, 11], venus: [2, 5, 6, 9, 10, 11], saturn: [3, 5, 6, 12], lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11] },
  venus: { sun: [8, 11, 12], moon: [1, 2, 3, 4, 5, 8, 9, 11, 12], mars: [3, 4, 6, 9, 11, 12], mercury: [3, 5, 6, 9, 11], jupiter: [5, 8, 9, 10, 11], venus: [1, 2, 3, 4, 5, 8, 9, 10, 11], saturn: [3, 4, 5, 8, 9, 10, 11], lagna: [1, 2, 3, 4, 5, 8, 9, 11] },
  saturn: { sun: [1, 2, 4, 7, 8, 10, 11], moon: [3, 6, 11], mars: [3, 5, 6, 10, 11, 12], mercury: [6, 8, 9, 10, 11, 12], jupiter: [5, 6, 11, 12], venus: [6, 11, 12], saturn: [3, 5, 6, 11], lagna: [1, 3, 4, 6, 10, 11] },
  lagna: { sun: [3, 4, 6, 10, 11, 12], moon: [3, 6, 10, 11, 12], mars: [1, 3, 6, 10, 11], mercury: [1, 2, 4, 6, 8, 10, 11], jupiter: [1, 2, 4, 5, 6, 7, 9, 10, 11], venus: [1, 2, 3, 4, 5, 8, 9], saturn: [1, 3, 4, 6, 10, 11], lagna: [3, 6, 10, 11] },
};

/**
 * Parashara's places differ in two: Jupiter in the Moon's chart (12 for 2), Mars in Venus's (5 for 4). PL9 gives
 * Parashara's places with its option "Varamihira" and Varahamihira's with "Parashara"; corrected, each gives its own.
 * See docs/spec/corrections.md.
 */
function places(owner: AvContributor, contributor: AvContributor, method: AshtakavargaOptions['method'], fidelity: Fidelity): number[] {
  const p = PLACES[owner][contributor];
  if (method !== (fidelity === 'pl9' ? 'varahamihira' : 'parashara')) return p;
  if (owner === 'moon' && contributor === 'jupiter') return [...p.filter((h) => h !== 2), 12].sort((a, b) => a - b);
  if (owner === 'venus' && contributor === 'mars') return [...p.filter((h) => h !== 4), 5].sort((a, b) => a - b);
  return p;
}

const mod12 = (n: number) => ((n % 12) + 12) % 12;

/** Signs 0 (Aries) to 11 of the seven planets and the Lagna. */
export type AvSigns = Record<AvContributor, number>;

/** For one chart, the bindu each contributor gives each sign (0 or 1), by sign from Aries. */
function prastaraOf(owner: AvContributor, signs: AvSigns, method: AshtakavargaOptions['method'], fidelity: Fidelity): Record<AvContributor, number[]> {
  return Object.fromEntries(AV_CONTRIBUTORS.map((c) => {
    const row = Array<number>(12).fill(0);
    for (const h of places(owner, c, method, fidelity)) row[mod12(signs[c] + h - 1)] = 1;
    return [c, row];
  })) as Record<AvContributor, number[]>;
}

/** Trikona reduction: in each triangle of signs (Aries, Leo, Sagittarius and so on), each less the least of the three. */
export function trikonaReduction(bindus: readonly number[]): number[] {
  const out = [...bindus];
  for (let s = 0; s < 4; s++) {
    const least = Math.min(out[s]!, out[s + 4]!, out[s + 8]!);
    for (const t of [s, s + 4, s + 8]) out[t] = out[t]! - least;
  }
  return out;
}

/** The two signs of each lord with two, in PL9's order: Mars, Venus, Mercury, Jupiter, Saturn. */
const EKADHIPATYA_PAIRS: [number, number][] = [[0, 7], [1, 6], [2, 5], [8, 11], [9, 10]];

/**
 * Ekadhipatya reduction, after the Trikona: for each lord's two signs, nothing when either has no bindu or both are
 * occupied (by a planet or the Lagna); both empty: equal, both 0; unequal, both take the less (Parashara) or both
 * lose it (the other rule); one occupied: the empty one keeps what it has more than the occupied, else 0.
 */
export function ekadhipatyaReduction(bindus: readonly number[], occupied: readonly boolean[], rule: AshtakavargaOptions['ekadhipatya']): number[] {
  const out = [...bindus];
  for (const [a, b] of EKADHIPATYA_PAIRS) {
    const x = out[a]!, y = out[b]!;
    if (x === 0 || y === 0 || (occupied[a] && occupied[b])) continue;
    if (!occupied[a] && !occupied[b]) {
      if (x === y) { out[a] = 0; out[b] = 0; continue; }
      const less = Math.min(x, y);
      out[a] = rule === 'parashara' ? less : x - less;
      out[b] = rule === 'parashara' ? less : y - less;
      continue;
    }
    const [empty, full] = occupied[a] ? [b, a] : [a, b];
    out[empty] = out[empty]! > out[full]! ? out[empty]! - out[full]! : 0;
  }
  return out;
}

const RASHI_MULTIPLIERS = [7, 10, 8, 4, 10, 6, 7, 8, 9, 5, 11, 12];
const GRAHA_MULTIPLIERS: Record<AvPlanet, number> = { sun: 5, moon: 5, mars: 8, mercury: 5, jupiter: 10, venus: 7, saturn: 5 };
export interface Pindas {
  rashi: number;
  graha: number;
  sodhya: number;
}

export interface Ashtakavarga {
  /** Bindus by sign (0 = Aries) in each chart: the planets' and the Lagna's. */
  bhinna: Record<AvContributor, number[]>;
  /** The seven planets' charts summed by sign. */
  sarva: number[];
  /** For each chart, the bindu each contributor gives each sign. */
  prastara: Record<AvContributor, Record<AvContributor, number[]>>;
  /** Each chart after the Trikona reduction, and then after the Ekadhipatya. */
  trikona: Record<AvContributor, number[]>;
  ekadhipatya: Record<AvContributor, number[]>;
  pindas: Record<AvContributor, Pindas>;
}

/** The Ashtakavarga of a chart from the signs of the seven planets and the Lagna. */
export function ashtakavarga(signs: AvSigns, options: Partial<AshtakavargaOptions> = {}, fidelity: Fidelity = 'pl9'): Ashtakavarga {
  const o = { ...DEFAULT_ASHTAKAVARGA_OPTIONS, ...Object.fromEntries(Object.entries(options).filter(([, v]) => v !== undefined)) } as AshtakavargaOptions;
  const prastara = Object.fromEntries(AV_CONTRIBUTORS.map((owner) => [owner, prastaraOf(owner, signs, o.method, fidelity)])) as Ashtakavarga['prastara'];
  const bhinna = Object.fromEntries(AV_CONTRIBUTORS.map((owner) => [owner,
    Array.from({ length: 12 }, (_, s) => AV_CONTRIBUTORS.reduce((n, c) => n + prastara[owner][c][s]!, 0))])) as Ashtakavarga['bhinna'];
  const sarva = Array.from({ length: 12 }, (_, s) => AV_PLANETS.reduce((n, p) => n + bhinna[p][s]!, 0));
  const occupied = Array.from({ length: 12 }, (_, s) => AV_CONTRIBUTORS.some((c) => signs[c] === s));
  const rashiMultipliers = RASHI_MULTIPLIERS.map((m, s) => (s === 5 ? o.virgoMultiplier : m));
  const trikona = {} as Ashtakavarga['trikona'];
  const ekadhipatya = {} as Ashtakavarga['ekadhipatya'];
  const pindas = {} as Ashtakavarga['pindas'];
  for (const c of AV_CONTRIBUTORS) {
    trikona[c] = trikonaReduction(bhinna[c]);
    ekadhipatya[c] = ekadhipatyaReduction(trikona[c], occupied, o.ekadhipatya);
    const rashi = ekadhipatya[c].reduce((n, b, s) => n + rashiMultipliers[s]! * b, 0);
    const graha = AV_PLANETS.reduce((n, q) => n + GRAHA_MULTIPLIERS[q] * ekadhipatya[c][signs[q]]!, 0);
    pindas[c] = { rashi, graha, sodhya: rashi + graha };
  }
  return { bhinna, sarva, prastara, trikona, ekadhipatya, pindas };
}
