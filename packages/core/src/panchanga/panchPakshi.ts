import type { Ephemeris } from '@reverse/ephemeris';
import type { CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { norm360 } from '../zodiac';
import { computePanchanga } from './compute';
import { tithiOf } from './elements';

/** The five birds, numbered from 1 in this order. */
export const BIRDS = ['vulture', 'owl', 'crow', 'cock', 'peacock'] as const;
export type Bird = (typeof BIRDS)[number];
/** The five activities, numbered from 1 in this order. */
export const ACTIVITIES = ['eating', 'walking', 'ruling', 'sleeping', 'dying'] as const;
export type Activity = (typeof ACTIVITIES)[number];

export interface PakshiPart { bird: Bird; activity: Activity; relation: 'self' | 'friend' | 'enemy'; startJdUt: number }
export interface PakshiYama { activity: Activity; startJdUt: number; endJdUt: number; parts: PakshiPart[] }
export interface PakshiDay {
  /** The bird that comes to eating from the weekday's first bird, by day and by night. */
  ruling: { day: Bird; night: Bird };
  /** The weekday's dying bird. */
  dying: Bird;
  /** The native's bird's five yamas from sunrise to sunset, and from sunset to the next sunrise. */
  day: PakshiYama[];
  night: PakshiYama[];
}
export interface PanchPakshi extends PakshiDay {
  bird: Bird;
  /** The bright fortnight: the tithi at the instant below 16. */
  bright: boolean;
  /** The civil weekday of the instant in the place's clock, 0 = Sunday (the page's header). */
  weekday: number;
  /** The Vedic weekday, of the sunrise before the instant, 1 = Sunday to 7 = Saturday (the tables'). */
  vara: number;
}

const wrap = (n: number) => ((n - 1) % 5 + 5) % 5 + 1;

/** The native's bird: the natal Moon in five spans of nakshatras (5, 6, 5, 5, 6), counted back when the Moon is past the opposition of the Sun. Read in PL9. */
export function natalBird(sun: number, moon: number): Bird {
  const m = norm360(moon);
  const n = m < 66.666 ? 1 : m < 146.666 ? 2 : m < 213.3333 ? 3 : m < 280 ? 4 : 5;
  return BIRDS[(norm360(moon - sun) > 180 ? 6 - n : n) - 1]!;
}

// Read in PL9, by fortnight (bright, dark) and by day or night.
/** The next bird: by night the one before; by day the next in the bright half, three on in the dark. */
const nextBird = (bright: boolean, day: boolean, b: number) => wrap(!day ? b - 1 : bright ? b + 1 : b + 3);
/** The next activity: one, two, three or four on (bright day, bright night, dark day, dark night). */
const nextActivity = (bright: boolean, day: boolean, a: number) => wrap(a + (bright ? (day ? 1 : 2) : (day ? 3 : 4)));
/** Each activity's share of a yama, twenty-fourths, by activity 1 to 5. */
const SHARES = { brightDay: [5, 6, 8, 3, 2], brightNight: [5, 5, 4, 4, 6], darkDay: [8, 6, 3, 2, 5], darkNight: [7, 7, 3, 3, 4] } as const;
/** The weekday's first bird (it rules the first yama), Sunday to Saturday. */
const FIRST = { brightDay: [3, 4, 3, 4, 5, 1, 2], brightNight: [2, 3, 2, 3, 4, 5, 1], darkDay: [3, 4, 3, 2, 1, 5, 4], darkNight: [2, 5, 2, 3, 4, 1, 5] } as const;
/** The weekday's dying bird, Sunday to Saturday. */
const DYING = { bright: [2, 3, 4, 5, 1, 2, 1], dark: [3, 2, 1, 5, 4, 5, 4] } as const;
const key = (bright: boolean, day: boolean) => `${bright ? 'bright' : 'dark'}${day ? 'Day' : 'Night'}` as const;

/** The relation of a bird to the native's: friends in pairs, some by fortnight. Read in PL9. */
function relation(bright: boolean, a: number, b: number): PakshiPart['relation'] {
  if (a === b) return 'self';
  const pairs = [[1, 5], [2, 3], [4, 5], ...(bright ? [[1, 2], [3, 4]] : [[1, 3], [2, 4]])];
  return pairs.some(([x, y]) => (a === x && b === y) || (a === y && b === x)) ? 'friend' : 'enemy';
}

/**
 * The Panch Pakshi of a day for the native's bird, the fortnight and the Vedic weekday (1 = Sunday), from its sunrise,
 * sunset and next sunrise: each of the day and the night in five equal yamas; in the first, the native's bird does
 * what it comes to walking the birds and the activities from the weekday's first bird ruling; each later yama the next
 * activity; each yama in five parts, from the native's bird and the yama's activity, by the activities' shares, the
 * birds and the activities in turn. Read in PL9 (docs/spec/time/panchanga.md).
 */
export function panchPakshiDay(bird: Bird, bright: boolean, vara: number, sunrise: number, sunset: number, nextSunrise: number): PakshiDay {
  const own = BIRDS.indexOf(bird) + 1;
  const half = (day: boolean, from: number, to: number): PakshiYama[] => {
    const k = key(bright, day);
    let b: number = FIRST[k][vara - 1]!, a = 3;
    for (let i = 0; i < 5 && b !== own; i++) { b = nextBird(bright, day, b); a = nextActivity(bright, day, a); }
    const length = (to - from) / 5;
    return Array.from({ length: 5 }, (_, y) => {
      const start = from + y * length;
      const yama = y === 0 ? a : (a = nextActivity(bright, day, a));
      const parts: PakshiPart[] = [];
      let pb = own, pa = yama, t = start;
      for (let j = 0; j < 5; j++) {
        parts.push({ bird: BIRDS[pb - 1]!, activity: ACTIVITIES[pa - 1]!, relation: relation(bright, own, pb), startJdUt: t });
        t += length * SHARES[k][pa - 1]! / 24;
        pb = nextBird(bright, day, pb); pa = nextActivity(bright, day, pa);
      }
      return { activity: ACTIVITIES[yama - 1]!, startJdUt: start, endJdUt: y === 4 ? to : start + length, parts };
    });
  };
  const ruling = (day: boolean) => {
    let b: number = FIRST[key(bright, day)][vara - 1]!, a = 3;
    do { b = nextBird(bright, day, b); a = nextActivity(bright, day, a); } while (a !== 1);
    return BIRDS[b - 1]!;
  };
  return {
    ruling: { day: ruling(true), night: ruling(false) },
    dying: BIRDS[DYING[bright ? 'bright' : 'dark'][vara - 1]! - 1]!,
    day: half(true, sunrise, sunset),
    night: half(false, sunset, nextSunrise),
  };
}

/**
 * PL9's Panch Pakshi (worksheet 39) at an instant and place: the native's bird by the natal Moon, the fortnight by the
 * tithi at the instant, and the Vedic day: from the sunrise before the instant to the next (the panchanga's), with its
 * weekday (from the printouts: a clock at 04:06 on a Saturday takes Friday's tables, one at 06:33 Saturday's). The
 * header prints the civil weekday. Null where that day has no sunrise.
 */
export function panchPakshi(eph: Ephemeris, natal: ChartInput, at: ChartInput & { utcOffsetHours: number }, coreOptions?: Partial<CoreOptions>): PanchPakshi | null {
  const n = computePositions(eph, natal, coreOptions).points;
  const now = computePositions(eph, at, coreOptions).points;
  const local = at.jdUt + 0.5 + at.utcOffsetHours / 24;
  const p = computePanchanga(eph, at, coreOptions);
  if (p.sunrise === null || p.sunset === null || p.nextSunrise === null) return null;
  const bird = natalBird(n.sun.longitude, n.moon.longitude);
  const bright = tithiOf(now.sun.longitude, now.moon.longitude) < 16;
  const weekday = (Math.floor(local) + 1) % 7;
  const vara = (Math.floor(p.sunrise + 0.5 + at.utcOffsetHours / 24) + 1) % 7 + 1;
  return { bird, bright, weekday, vara, ...panchPakshiDay(bird, bright, vara, p.sunrise, p.sunset, p.nextSunrise) };
}
