import type { Fidelity } from '../fidelity';
import type { Planet9 } from '../jaimini';
import { CLASSICAL_VARGAS, VARGA_PARTS, vargaSign, type ClassicalVargaName } from '../vargas';
import { divisionIndex, norm360 } from '../zodiac';
import { dignity9, NATURAL, SEVEN, type Planet7 } from './dignity';

/**
 * The Vimshopaka as PL9 computes it: in each group of vargas, the points of the planet's sign in each varga, weighted,
 * up to 20; and the dignity of each planet in each of the 16 vargas. See docs/spec/strengths/vimshopaka.md.
 */

export const VIMSHOPAKA_GROUPS = ['shadvarga', 'saptavarga', 'dashavarga', 'shodashavarga'] as const;
export type VimshopakaGroup = (typeof VIMSHOPAKA_GROUPS)[number];

export interface VimshopakaRow {
  /** Up to 20 in each group. */
  scores: Record<VimshopakaGroup, number>;
  /** PL9's dignity in nine steps (1 exalted … 9 debilitated) in each of the 16 vargas. */
  dignities: Record<ClassicalVargaName, number>;
}

export interface Vimshopaka {
  planets: Record<Planet9, VimshopakaRow>;
}

export const NINE: readonly Planet9[] = [...SEVEN, 'rahu', 'ketu'];

/** The weight of each varga in each group, out of 200 (PL9 divides by 10 more than the books). */
export const VIMSHOPAKA_WEIGHTS: Record<VimshopakaGroup, Partial<Record<ClassicalVargaName, number>>> = {
  shadvarga: { D1: 60, D2: 20, D3: 40, D9: 50, D12: 20, D30: 10 },
  // PL9 gives the weights of the Saptavarga to the vargas one place along: D7 10, D9 25, D12 45, D30 20.
  saptavarga: { D1: 50, D2: 20, D3: 30, D9: 25, D12: 45, D30: 20, D7: 10 },
  dashavarga: { D1: 30, D2: 15, D3: 15, D9: 15, D12: 15, D30: 15, D7: 15, D10: 15, D16: 15, D60: 50 },
  shodashavarga: { D1: 35, D2: 10, D3: 10, D9: 30, D12: 5, D30: 10, D7: 5, D10: 5, D16: 20, D60: 40, D20: 5, D4: 5, D24: 5, D27: 5, D40: 5, D45: 5 },
};

/** The weights in a mode: the corrected one gives the Saptavarga the weights of the books (docs/spec/corrections.md, 22). */
export function vimshopakaWeights(fidelity: Fidelity): typeof VIMSHOPAKA_WEIGHTS {
  if (fidelity === 'pl9') return VIMSHOPAKA_WEIGHTS;
  return { ...VIMSHOPAKA_WEIGHTS, saptavarga: { D1: 50, D2: 20, D3: 30, D7: 25, D9: 45, D12: 20, D30: 10 } };
}

/** The lord of each sign, Aries first. */
const LORD: Planet7[] = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
/** Own signs for the points (Aries 0); the nodes have none here. */
const OWN: Record<Planet9, number[]> = {
  sun: [4], moon: [3], mars: [0, 7], mercury: [2, 5], jupiter: [8, 11], venus: [1, 6], saturn: [9, 10], rahu: [], ketu: [],
};
/**
 * Natural relationship of the nodes to Sun … Saturn, as PL9's printed Vimshopaka counts it (2 friend, 1 neutral,
 * 0 enemy): Rahu befriends Venus, Jupiter and Saturn, Ketu Mars and Venus. Read from 135 printed charts; the table in
 * PL9's executable gives the nodes other values, which its reports do not show. See docs/spec/strengths/vimshopaka.md.
 */
const NODES: Record<'rahu' | 'ketu', number[]> = {
  rahu: [0, 0, 0, 1, 2, 2, 2],
  ketu: [0, 0, 2, 1, 1, 2, 0],
};
/**
 * The nodes as PL9's executable rates them, which its Muhurta and transit pages use (read in PL9): own signs (Rahu
 * Gemini, Virgo and Aquarius; Ketu Scorpio, Sagittarius and Pisces), and Ketu a friend of Saturn.
 */
const NODES_IN_TIME = {
  own: { rahu: [2, 5, 10], ketu: [7, 8, 11] } as Record<'rahu' | 'ketu', number[]>,
  natural: { rahu: [0, 0, 0, 1, 2, 2, 2], ketu: [0, 0, 2, 1, 1, 2, 2] } as Record<'rahu' | 'ketu', number[]>,
};
/** Which rating of the nodes: PL9's printed Vimshopaka ('report'), or its Muhurta and transit pages ('time'). */
export type NodeRating = 'report' | 'time';
/** Points by relationship with the lord of the sign: own, great friend, friend, neutral, enemy, great enemy. */
const POINTS = { own: 20, compound: [5, 7, 10, 15, 18] };

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
/** Temporal relationship, by the signs of the birth chart: +1 when the other is 2, 3, 4, 10, 11 or 12 signs away. */
const temporal = (sign: number, other: number) => { const apart = Math.abs(other - sign); return apart !== 0 && [1, 2, 3, 9, 10, 11].includes(apart) ? 1 : -1; };

/** The points of a planet in one varga: its own sign 20; otherwise by its compound relationship with the sign's lord. */
function points(p: Planet9, varga: ClassicalVargaName, longitudes: Record<Planet9, number>, fidelity: Fidelity, nodes: NodeRating): number {
  const sign = vargaSign(longitudes[p], varga, fidelity);
  const node = p === 'rahu' || p === 'ketu' ? p : null;
  const own = node && nodes === 'time' ? NODES_IN_TIME.own[node] : OWN[p];
  if (own.includes(sign)) return POINTS.own;
  const lord = LORD[sign]!;
  const natural = node ? (nodes === 'time' ? NODES_IN_TIME.natural : NODES)[node][SEVEN.indexOf(lord)]! : NATURAL[p as Planet7][SEVEN.indexOf(lord)]!;
  // The temporal relationship stays that of the birth chart, in every varga.
  return POINTS.compound[natural + temporal(signOf(longitudes[p]), signOf(longitudes[lord])) + 1]!;
}

/** Where each part of the Trimshamsha ends, in odd and in even signs (the ends belong to the part). */
const TRIMSHAMSHA_ENDS = { odd: [5, 10, 18, 25, 30], even: [5, 12, 20, 25, 30] };

/**
 * The degree of a planet in a varga, as PL9 places it: the degree within the sign multiplied by the parts; in the
 * Trimshamsha, whose parts are unequal, the fraction of its part gone, 0 to 1 (PL9's arithmetic there).
 */
function vargaDegree(longitude: number, varga: ClassicalVargaName): number {
  const d = norm360(longitude) % 30;
  if (varga !== 'D30') {
    // From the same index the varga's sign comes from, so that a planet at the start of a part sits at 0 there.
    const n = VARGA_PARTS[varga];
    return Math.max(0, d * n - 30 * (divisionIndex(longitude, 12 * n) % n));
  }
  const ends = Math.floor(norm360(longitude) / 30) % 2 === 0 ? TRIMSHAMSHA_ENDS.odd : TRIMSHAMSHA_ENDS.even;
  const i = ends.findIndex((e) => d <= e);
  const start = i === 0 ? 0 : ends[i - 1]!;
  return (d - start) / (ends[i]! - start);
}

/** The longitudes of the nine in a varga: its sign and the degree there. */
function inVarga(longitudes: Record<Planet9, number>, varga: ClassicalVargaName, fidelity: Fidelity): Record<Planet9, number> {
  return Object.fromEntries(NINE.map((p) => [p, vargaSign(longitudes[p], varga, fidelity) * 30 + vargaDegree(longitudes[p], varga)])) as Record<Planet9, number>;
}

export function vimshopaka(longitudes: Record<Planet9, number>, fidelity: Fidelity = 'pl9', nodes: NodeRating = 'report'): Vimshopaka {
  const charts = Object.fromEntries(CLASSICAL_VARGAS.map((v) => [v, inVarga(longitudes, v, fidelity)])) as Record<ClassicalVargaName, Record<Planet9, number>>;
  const planets = {} as Record<Planet9, VimshopakaRow>;
  const weights = vimshopakaWeights(fidelity);
  for (const p of NINE) {
    const scores = Object.fromEntries(VIMSHOPAKA_GROUPS.map((g) => [g,
      Object.entries(weights[g]).reduce((s, [v, w]) => s + points(p, v as ClassicalVargaName, longitudes, fidelity, nodes) * w!, 0) / 200,
    ])) as Record<VimshopakaGroup, number>;
    // The dignity in each varga, the relationships taken from the varga's own positions.
    const dignities = Object.fromEntries(CLASSICAL_VARGAS.map((v) => [v, dignity9(p, charts[v])])) as Record<ClassicalVargaName, number>;
    planets[p] = { scores, dignities };
  }
  return { planets };
}
