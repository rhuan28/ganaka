import type { Planet9 } from './jaimini';
import { norm360 } from './zodiac';

const ORDER: readonly Planet9[] = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
const YEARS: Record<string, number> = { ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 };
const NAKSHATRA = 40 / 3;

export interface KpLords {
  pada: number;
  star: Planet9;
  sub: Planet9;
  subSub: Planet9;
}

/**
 * The lord whose part of a nakshatra holds a point `degrees` into it: the nakshatra's 120 years of the Vimshottari
 * laid over its 13°20' from `first`, each lord its years (read in the executable). The years gone are counted whole,
 * as PL9 does; with whole years in the table that is the same as comparing them exactly. Returns the lord and how far
 * into its part the point is, as a share from 0 to 1.
 */
function part(degrees: number, first: Planet9): { lord: Planet9; into: number } {
  const years = degrees * (120 / NAKSHATRA);
  let end = 0;
  let i = ORDER.indexOf(first);
  for (let k = 0; k < 9; k++, i++) {
    const lord = ORDER[i % 9]!;
    end += YEARS[lord]!;
    if (Math.floor(years) < end) return { lord, into: 1 - (end - years) / YEARS[lord]! };
  }
  return { lord: ORDER[(i - 1) % 9]!, into: 1 };
}

/**
 * The KP lords of a sidereal longitude, as PL9 prints them ("3,Su/Sa/Ve"): the pada, the lord of the nakshatra, the
 * sub (the part of the nakshatra, from its lord) and the sub-sub (the same division of the sub, from the sub's lord).
 * PL9 lays the sub over a nakshatra again as its share times 13.33333333 plus 13.33333 less that, a difference of a
 * thousandth of a second of arc kept in both modes. See docs/spec/tempo/transitos.md.
 */
export function kpLords(longitude: number): KpLords {
  const l = norm360(longitude);
  const nak = Math.floor(l / NAKSHATRA);
  const into = l - nak * NAKSHATRA;
  const star = ORDER[nak % 9]!;
  const sub = part(into, star);
  const subSub = part((sub.into - 1) * 13.33333333 + 13.33333, sub.lord);
  return { pada: Math.min(4, Math.floor(into / (NAKSHATRA / 4)) + 1), star, sub: sub.lord, subSub: subSub.lord };
}
