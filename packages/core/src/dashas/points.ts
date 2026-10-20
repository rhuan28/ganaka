import { rashiAspects, type Planet9 } from '../jaimini';
import { charaKarakas, type KarakaPlanet } from '../karakas';
import { SIGN_LORDS } from '../specialLagnas';
import { dignity9 } from '../strengths/dignity';
import { norm360 } from '../zodiac';

/**
 * The points PL9 gives a sign and a planet when it compares two signs in the Chara dasha of Parashara: the sign's own
 * points with those of its lord. See docs/spec/dashas/forca-signos.md.
 */

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
const mod12 = (n: number) => ((n % 12) + 12) % 12;

const DIGNITY_POINTS = [60, 45, 30, 22.5, 22.5, 15, 7.5, 7.5, 3.75];
const KARAKA_POINTS = [60, 45, 30, 22.5, 15, 7.5, 3.75];

/**
 * A planet's points: by its dignity (60 exalted down to 3.75 debilitated); by its place among the chara karakas (60
 * the Atmakaraka down to 3.75 the seventh; none beyond); and by its sign from the Atmakaraka's: 60 in a kendra, 30 in
 * a panaphara, 15 in an apoklima.
 */
export function planetPoints(planet: Planet9, longitudes: Record<Planet9, number>, karakas: 7 | 8): number {
  const ranked = charaKarakas(longitudes as Record<KarakaPlanet, number>, karakas).map((k) => k.planet as Planet9);
  const rank = ranked.indexOf(planet);
  const fromAk = mod12(signOf(longitudes[planet]) - signOf(longitudes[ranked[0]!])) % 3;
  return DIGNITY_POINTS[dignity9(planet, longitudes) - 1]! + (rank >= 0 && rank < 7 ? KARAKA_POINTS[rank]! : 0) + [60, 30, 15][fromAk]!;
}

/**
 * A sign's points: 15 movable, 30 fixed, 60 dual; 60 for each of Mercury, Jupiter and its lord whose sign aspects it;
 * 15 for each planet in it from the Sun to Rahu, and 45 more when there is any.
 */
export function signPoints(sign: number, longitudes: Record<Planet9, number>): number {
  const aspecting = (['mercury', 'jupiter', SIGN_LORDS[sign]!] as Planet9[]).filter((p) => rashiAspects(signOf(longitudes[p])).includes(sign)).length;
  const inIt = (['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'] as Planet9[]).filter((p) => signOf(longitudes[p]) === sign).length;
  return [15, 30, 60][sign % 3]! + 60 * aspecting + 15 * inIt + (inIt > 0 ? 45 : 0);
}

/** Rounded to the nearest whole number, halves to the even one, as the processor does. */
const roundEven = (x: number) => {
  const r = Math.round(x);
  return Math.abs(x % 1) === 0.5 && r % 2 !== 0 ? r - 1 : r;
};

/**
 * The stronger of `a` and `b` by points: each sign's points with the rounded points of its lord (Mars for Scorpio,
 * Saturn for Aquarius); `a` only when it has more, else `b`.
 */
export function strongerByPoints(a: number, b: number, longitudes: Record<Planet9, number>, karakas: 7 | 8): number {
  const total = (s: number) => signPoints(s, longitudes) + roundEven(planetPoints(SIGN_LORDS[s]! as Planet9, longitudes, karakas));
  return total(b) < total(a) ? a : b;
}

/**
 * Brahma, as PL9 finds it: from the Lagna or the 7th, the one with more points of its own (the Lagna when equal),
 * the lords of the 6th, the 8th and the 12th, Saturn left out; of these the one with the most points, the earlier
 * one when equal.
 */
export function brahma(lagnaSign: number, longitudes: Record<Planet9, number>, karakas: 7 | 8): Planet9 {
  const base = signPoints(lagnaSign, longitudes) < signPoints(mod12(lagnaSign + 6), longitudes) ? mod12(lagnaSign + 6) : lagnaSign;
  const [sixth, eighth, twelfth] = [5, 7, 11].map((h) => SIGN_LORDS[mod12(base + h)]! as Planet9);
  const points = (p: Planet9) => planetPoints(p, longitudes, karakas);
  let best = sixth!;
  if (best === 'saturn' || (eighth !== 'saturn' && points(eighth!) > points(best))) best = eighth!;
  if (best === 'saturn') return twelfth!;
  return twelfth !== 'saturn' && points(best) < points(twelfth!) ? twelfth! : best;
}
