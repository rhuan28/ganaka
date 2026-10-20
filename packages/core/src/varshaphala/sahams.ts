import type { Planet9 } from '../jaimini';
import { SIGN_LORDS } from '../specialLagnas';
import type { Planet7 } from '../strengths/dignity';
import { norm360 } from '../zodiac';
import type { Varshaphala } from './annual';

/** What the Sahams read of the annual chart: the longitudes, the middles of the (Sripati) houses, day or night. */
export interface SahamInput {
  longitude: Record<Planet9 | 'lagna', number>;
  /** The middle of each house, index 0 the 1st. */
  middles: number[];
  isDay: boolean | null;
}

type Point = Planet9 | 'lagna' | 'punya' | 'vidya' | 'cancer15' | `middle${number}` | `lord${number}` | 'sunSignLord' | 'moonSignLord';

/**
 * The Sahams as PL9 counts them (from the printouts: each formula checked in 161 annual charts, see
 * docs/spec/tempo/varshaphala.md): A - B + C, with 30 degrees added when C is not between B and A (counting from B
 * forwards); where `swap`, A and B change places by night. Middles are the houses' middles; lords, the place of the
 * lord of the house's sign counted from the Lagna's.
 */
export const SAHAMS: readonly { name: string; english: string; a: Point; b: Point; c: Point; swap: boolean }[] = [
  { name: 'Punya', english: 'Fortune', a: 'moon', b: 'sun', c: 'lagna', swap: true },
  { name: 'Vidya', english: 'Learning', a: 'sun', b: 'moon', c: 'lagna', swap: true },
  { name: 'Yasa', english: 'Fame', a: 'jupiter', b: 'punya', c: 'lagna', swap: true },
  { name: 'Mitra', english: 'Friend', a: 'jupiter', b: 'punya', c: 'venus', swap: true },
  { name: 'Mahatmya', english: 'Greatness', a: 'punya', b: 'mars', c: 'lagna', swap: true },
  { name: 'Asha', english: 'Desire', a: 'saturn', b: 'venus', c: 'lagna', swap: true },
  { name: 'Samartha', english: 'Ability', a: 'mars', b: 'lord1', c: 'lagna', swap: true },
  { name: 'Bhratru', english: 'Brothers', a: 'jupiter', b: 'saturn', c: 'lagna', swap: false },
  { name: 'Gaurava', english: 'Respect', a: 'sun', b: 'moon', c: 'jupiter', swap: true },
  { name: 'Pitru', english: 'Father', a: 'saturn', b: 'sun', c: 'lagna', swap: true },
  { name: 'Raja', english: 'King', a: 'saturn', b: 'sun', c: 'lagna', swap: true },
  { name: 'Matru', english: 'Mother', a: 'moon', b: 'venus', c: 'lagna', swap: true },
  { name: 'Putra', english: 'Children', a: 'jupiter', b: 'moon', c: 'lagna', swap: true },
  { name: 'Jeeva', english: 'Life', a: 'saturn', b: 'jupiter', c: 'lagna', swap: true },
  { name: 'Karma', english: 'Action', a: 'mars', b: 'mercury', c: 'lagna', swap: true },
  { name: 'Roga', english: 'Disease', a: 'saturn', b: 'moon', c: 'lagna', swap: true },
  { name: 'Kali', english: 'Strife', a: 'jupiter', b: 'mars', c: 'lagna', swap: true },
  { name: 'Sastra', english: 'Science', a: 'jupiter', b: 'saturn', c: 'mercury', swap: true },
  { name: 'Bandhu', english: 'Relatives', a: 'mercury', b: 'moon', c: 'lagna', swap: false },
  { name: 'Mrityu', english: 'Death', a: 'middle8', b: 'moon', c: 'saturn', swap: false },
  { name: 'Paradesa', english: 'Foreign Country', a: 'middle9', b: 'lord9', c: 'lagna', swap: false },
  { name: 'Artha', english: 'Finance', a: 'middle2', b: 'lord2', c: 'lagna', swap: false },
  { name: 'Paradara', english: 'Adultery', a: 'venus', b: 'sun', c: 'lagna', swap: false },
  { name: 'Vanik', english: 'Trade', a: 'moon', b: 'mercury', c: 'lagna', swap: false },
  { name: 'Karyasiddhi', english: 'Success', a: 'saturn', b: 'sun', c: 'sunSignLord', swap: false },
  { name: 'Vivaha', english: 'Marriage', a: 'venus', b: 'saturn', c: 'lagna', swap: false },
  { name: 'Santapa', english: 'Sorrow', a: 'saturn', b: 'moon', c: 'middle6', swap: false },
  { name: 'Sraddha', english: 'Devotion', a: 'venus', b: 'mars', c: 'lagna', swap: false },
  { name: 'Preeti', english: 'Love', a: 'vidya', b: 'punya', c: 'lagna', swap: false },
  { name: 'Jadya', english: 'Chronic Disease', a: 'mars', b: 'saturn', c: 'mercury', swap: true },
  { name: 'Vyapara', english: 'Business', a: 'mars', b: 'mercury', c: 'lagna', swap: false },
  { name: 'Satru', english: 'Enemy', a: 'mars', b: 'saturn', c: 'lagna', swap: true },
  { name: 'Jalapathana', english: 'Voyage', a: 'cancer15', b: 'saturn', c: 'lagna', swap: true },
  { name: 'Bandhana', english: 'Imprisonment', a: 'punya', b: 'saturn', c: 'lagna', swap: true },
  { name: 'Apamrityu', english: 'Accidental Death', a: 'middle8', b: 'mars', c: 'lagna', swap: true },
  { name: 'Prasava', english: 'Delivery of Child', a: 'jupiter', b: 'mercury', c: 'lagna', swap: true },
  { name: 'Labha', english: 'Monetary Gains', a: 'middle11', b: 'lord11', c: 'lagna', swap: false },
];

/** B to A forwards holds C. */
const between = (from: number, to: number, x: number) => norm360(x - from) < norm360(to - from);
const saham = (a: number, b: number, c: number) => norm360(a - b + c + (between(b, a, c) ? 0 : 30));
const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);

export interface Saham { name: string; english: string; longitude: number; lord: Planet7 }

/** The Sahams of an annual chart; null without day or night. */
export function computeSahams(input: SahamInput): Saham[] | null {
  const { longitude: L, middles, isDay } = input;
  if (isDay === null) return null;
  const lagnaSign = signOf(L.lagna);
  const punya = isDay ? saham(L.moon, L.sun, L.lagna) : saham(L.sun, L.moon, L.lagna);
  const vidya = isDay ? saham(L.sun, L.moon, L.lagna) : saham(L.moon, L.sun, L.lagna);
  const at = (p: Point): number => {
    if (p === 'punya') return punya;
    if (p === 'vidya') return vidya;
    if (p === 'cancer15') return 105;
    if (p === 'sunSignLord') return L[SIGN_LORDS[signOf(L.sun)]!];
    if (p === 'moonSignLord') return L[SIGN_LORDS[signOf(L.moon)]!];
    if (p.startsWith('middle')) return middles[Number(p.slice(6)) - 1]!;
    if (p.startsWith('lord')) return L[SIGN_LORDS[(lagnaSign + Number(p.slice(4)) - 1) % 12]!];
    return L[p as Planet9 | 'lagna'];
  };
  return SAHAMS.map((s) => {
    let a = at(s.a), b = at(s.b), c = at(s.c);
    // Samartha: when Mars rules the Lagna, Jupiter - Mars instead of Mars - the Lagna's lord (from the printouts).
    if (s.name === 'Samartha' && SIGN_LORDS[lagnaSign] === 'mars') { a = L.jupiter; b = L.mars; }
    // Karyasiddhi by night: Saturn - Moon + the lord of the Moon's sign.
    if (s.name === 'Karyasiddhi' && !isDay) { b = L.moon; c = at('moonSignLord'); }
    if (s.swap && !isDay) [a, b] = [b, a];
    const longitude = saham(a, b, c);
    return { name: s.name, english: s.english, longitude, lord: SIGN_LORDS[signOf(longitude)]! };
  });
}

/** The Sahams of a Varshaphala (Sripati houses); null without a Lagna or day and night. */
export function sahams(v: Varshaphala): Saham[] | null {
  const p = v.chart.points as Record<string, { longitude: number } | undefined>;
  const middles = v.chart.houses?.sripati.middles;
  if (!p.lagna || !middles) return null;
  const names = ['lagna', 'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
  return computeSahams({ longitude: Object.fromEntries(names.map((n) => [n, p[n]!.longitude])) as SahamInput['longitude'], middles, isDay: v.isDayChart });
}
