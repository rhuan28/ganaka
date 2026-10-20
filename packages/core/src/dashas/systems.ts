import type { Planet9 } from '../jaimini';
import type { SignLord } from './kalachakra';

export type YoginiName = 'mangala' | 'pingala' | 'dhanya' | 'bhramari' | 'bhadrika' | 'ulka' | 'siddha' | 'sankata';
/** A planet, a yogini, or a sign (the Kalachakra's lords). */
export type DashaLord = Planet9 | YoginiName | SignLord;

export const NAKSHATRA_DASHA_SYSTEMS = [
  'vimshottari', 'ashtottari', 'yogini', 'shodashottari', 'dwadashottari', 'panchottari', 'shatabdika',
  'chaturshitisama', 'dwisaptatisama', 'shastihayani', 'shattrimshatsama', 'tribhagi', 'tribhagi40',
] as const;
export type NakshatraDashaSystem = (typeof NAKSHATRA_DASHA_SYSTEMS)[number];

/** Start by counting nakshatras from `from` (the first) to the Moon's, round the 27, forwards or backwards. */
interface CountStart { kind: 'count'; from: number; direction: 1 | -1 }
/** Start by groups of nakshatras, in the list of 28 with Abhijit (index 21). */
interface GroupStart { kind: 'groups'; groups: number[][] }

export interface DashaSystemDefinition {
  /** The lords in the order of the periods, the one `from` gives first. */
  lords: readonly DashaLord[];
  /** Years of each lord, in the order of `lords`. */
  years: readonly number[];
  start: CountStart | GroupStart;
  /** Every length multiplied by this: Tribhagi and Tribhagi 40. */
  scale: number;
}

const VIMSHOTTARI = {
  lords: ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'],
  years: [7, 20, 6, 10, 7, 18, 16, 19, 17],
} as const;

/**
 * The thirteen systems, as PL9 computes them. See docs/spec/dashas/nakshatra.md.
 * Nakshatras count from 0 = Ashwini. In the groups, 20 is Uttara Ashadha up to Abhijit, 21 Abhijit, 22 Shravana.
 */
export const DASHA_SYSTEMS: Record<NakshatraDashaSystem, DashaSystemDefinition> = {
  vimshottari: { ...VIMSHOTTARI, start: { kind: 'count', from: 0, direction: 1 }, scale: 1 },
  tribhagi: { ...VIMSHOTTARI, start: { kind: 'count', from: 0, direction: 1 }, scale: 2 / 3 },
  tribhagi40: { ...VIMSHOTTARI, start: { kind: 'count', from: 0, direction: 1 }, scale: 1 / 3 },
  // Ashwini gives Bhramari.
  yogini: {
    lords: ['bhramari', 'bhadrika', 'ulka', 'siddha', 'sankata', 'mangala', 'pingala', 'dhanya'],
    years: [4, 5, 6, 7, 8, 1, 2, 3],
    start: { kind: 'count', from: 0, direction: 1 }, scale: 1,
  },
  shodashottari: {
    lords: ['sun', 'mars', 'jupiter', 'saturn', 'ketu', 'moon', 'mercury', 'venus'],
    years: [11, 12, 13, 14, 15, 16, 17, 18],
    start: { kind: 'count', from: 7, direction: 1 }, scale: 1,
  },
  dwadashottari: {
    lords: ['sun', 'jupiter', 'ketu', 'mercury', 'rahu', 'mars', 'saturn', 'moon'],
    years: [7, 9, 11, 13, 15, 17, 19, 21],
    start: { kind: 'count', from: 26, direction: -1 }, scale: 1,
  },
  panchottari: {
    lords: ['sun', 'mercury', 'saturn', 'mars', 'venus', 'moon', 'jupiter'],
    years: [12, 13, 14, 15, 16, 17, 18],
    start: { kind: 'count', from: 16, direction: 1 }, scale: 1,
  },
  shatabdika: {
    lords: ['sun', 'moon', 'venus', 'mercury', 'jupiter', 'mars', 'saturn'],
    years: [5, 5, 10, 10, 20, 20, 30],
    start: { kind: 'count', from: 26, direction: 1 }, scale: 1,
  },
  chaturshitisama: {
    lords: ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'],
    years: [12, 12, 12, 12, 12, 12, 12],
    start: { kind: 'count', from: 14, direction: 1 }, scale: 1,
  },
  dwisaptatisama: {
    lords: ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'],
    years: [9, 9, 9, 9, 9, 9, 9, 9],
    start: { kind: 'count', from: 18, direction: 1 }, scale: 1,
  },
  shattrimshatsama: {
    lords: ['moon', 'sun', 'jupiter', 'mars', 'mercury', 'saturn', 'venus', 'rahu'],
    years: [1, 2, 3, 4, 5, 6, 7, 8],
    start: { kind: 'count', from: 21, direction: 1 }, scale: 1,
  },
  ashtottari: {
    lords: ['sun', 'moon', 'mars', 'mercury', 'saturn', 'jupiter', 'rahu', 'venus'],
    years: [6, 15, 8, 17, 10, 19, 12, 21],
    start: { kind: 'groups', groups: [[5, 6, 7, 8], [9, 10, 11], [12, 13, 14, 15], [16, 17, 18], [19, 20, 21, 22], [23, 24, 25], [26, 27, 0, 1], [2, 3, 4]] },
    scale: 1,
  },
  shastihayani: {
    lords: ['jupiter', 'sun', 'mars', 'moon', 'mercury', 'venus', 'saturn', 'rahu'],
    years: [10, 10, 10, 6, 6, 6, 6, 6],
    start: { kind: 'groups', groups: [[0, 1, 2], [3, 4, 5, 6], [7, 8, 9], [10, 11, 12, 13], [14, 15, 16], [17, 18, 19, 20], [21, 22, 23], [24, 25, 26, 27]] },
    scale: 1,
  },
};
