import type { Planet9 } from '../jaimini';
import { norm360 } from '../zodiac';

/**
 * The benefic or malefic nature of the nine planets, natural and functional, as PL9 sets it when it builds a chart
 * with its default options. The yogas take one of the two (docs/spec/yogas.md, "Benefics and malefics").
 */

export type Nature = 'benefic' | 'malefic' | 'neutral';
export interface YogaNatureOptions {
  /** PL9's "Use functional mal/ben": the functional nature replaces the natural one in the yogas. */
  functionalNature?: boolean;
}

const NINE: readonly Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
const SEVEN = NINE.slice(0, 7);
const CODE: Record<string, Nature> = { B: 'benefic', M: 'malefic', N: 'neutral' };

/**
 * By the Lagna's sign from Aries, the Sun to Saturn: Parashara's lists as PL9 prints them (B benefic, M malefic,
 * N neutral). The nodes are not in it: they follow their place (functionalNatures).
 */
export const FUNCTIONAL_BY_LAGNA = ['BNBMBMM', 'BMNBMMB', 'MNMNMBB', 'NBBMBMN', 'BNBMBMM', 'NMMBMBM', 'MNMBMNB', 'NBNMBMM', 'BNBMNMM', 'NMMBMBN', 'NMMNMBB', 'MBBMBMM'];

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
const arc = (a: number, b: number) => { const d = Math.abs(norm360(a) - norm360(b)); return Math.min(d, 360 - d); };

/**
 * The functional nature, by the sign of the Lagna; null without it. Each of the seven by the list of its Lagna. A
 * node alone in its sign is benefic in the 1st, 5th or 9th house from the Lagna, malefic in the 6th, 8th or 12th and
 * neutral elsewhere; with planets in its sign, it takes the nature of the nearest of them in longitude (the first in
 * the planets' order on a tie).
 */
export function functionalNatures(longitudes: Partial<Record<'lagna' | Planet9, number>> & Record<Planet9, number>): Record<Planet9, Nature> | null {
  if (longitudes.lagna === undefined) return null;
  const lagna = signOf(longitudes.lagna);
  const out = {} as Record<Planet9, Nature>;
  SEVEN.forEach((p, i) => { out[p] = CODE[FUNCTIONAL_BY_LAGNA[lagna]![i]!]!; });
  for (const node of ['rahu', 'ketu'] as const) {
    const sign = signOf(longitudes[node]);
    const mates = NINE.filter((p) => p !== node && signOf(longitudes[p]) === sign);
    if (mates.length === 0) {
      const house = ((sign - lagna + 12) % 12) + 1;
      out[node] = [1, 5, 9].includes(house) ? 'benefic' : [6, 8, 12].includes(house) ? 'malefic' : 'neutral';
      continue;
    }
    let nearest = mates[0]!;
    for (const p of mates) if (arc(longitudes[p], longitudes[node]) < arc(longitudes[nearest], longitudes[node])) nearest = p;
    out[node] = out[nearest];
  }
  return out;
}

/**
 * The natural nature. The Sun, Mars, Saturn, Rahu and Ketu are malefic, Jupiter and Venus benefic. The Moon is
 * benefic when it is past the Sun by more than 0° and up to 180° (waxing), malefic otherwise. Mercury is benefic
 * unless a malefic shares its sign; then the planets just before and after it in longitude (the nine, round the
 * zodiac) decide, when they share its sign: both benefic make it benefic, both malefic malefic, one of each neutral,
 * or benefic when the one after it is the Moon. When only the one after it shares its sign, PL9 looks at the one
 * before it, which does not: Mercury is malefic if that planet is.
 */
export function naturalNatures(longitudes: Record<Planet9, number>): Record<Planet9, Nature> {
  const elongation = norm360(longitudes.moon - longitudes.sun);
  const out: Record<Planet9, Nature> = {
    sun: 'malefic', moon: elongation > 0 && elongation <= 180 ? 'benefic' : 'malefic', mars: 'malefic', mercury: 'benefic',
    jupiter: 'benefic', venus: 'benefic', saturn: 'malefic', rahu: 'malefic', ketu: 'malefic',
  };
  const sign = signOf(longitudes.mercury);
  if (NINE.some((p) => p !== 'mercury' && signOf(longitudes[p]) === sign && out[p] === 'malefic')) out.mercury = 'malefic';
  // The nine in order of longitude; a stable sort keeps the planets' order on a tie, as PL9's does.
  const order = [...NINE].sort((a, b) => norm360(longitudes[a]) - norm360(longitudes[b]));
  const at = order.indexOf('mercury');
  const before = order[(at + 8) % 9]!, after = order[(at + 1) % 9]!;
  const withBefore = signOf(longitudes[before]) === sign, withAfter = signOf(longitudes[after]) === sign;
  if (withBefore && withAfter) {
    const b = out[before], a = out[after];
    if (b === 'benefic' && a === 'benefic') out.mercury = 'benefic';
    else if (b === 'malefic' && a === 'malefic') out.mercury = 'malefic';
    else out.mercury = after === 'moon' ? 'benefic' : 'neutral';
  } else if (withBefore || withAfter) {
    if (out[before] === 'malefic') out.mercury = 'malefic';
  }
  return out;
}

/** The natures the yogas use: the natural ones, or the functional ones with the option (null without a Lagna). */
export function yogaNatures(longitudes: Partial<Record<'lagna' | Planet9, number>> & Record<Planet9, number>, options: YogaNatureOptions = {}): Record<Planet9, Nature> | null {
  return options.functionalNature ? functionalNatures(longitudes) : naturalNatures(longitudes);
}
