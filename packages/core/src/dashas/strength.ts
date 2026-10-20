import { PLANETS_9, rashiAspects, type Planet9 } from '../jaimini';
import { SIGN_LORDS } from '../specialLagnas';
import { norm360 } from '../zodiac';

/** Sign of exaltation (0 = Aries) and the degree below which a planet counts as exalted in it: the whole sign but for Mercury. */
const EXALTATION: Record<Exclude<Planet9, 'rahu' | 'ketu'>, [number, number]> = {
  sun: [0, 30], moon: [1, 30], mars: [9, 30], mercury: [5, 15], jupiter: [3, 30], venus: [11, 30], saturn: [6, 30],
};

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);

/**
 * +1 exalted, -1 debilitated, 0 otherwise, as PL9 counts it for the strength of signs: exalted strictly inside the
 * sign of exaltation, Mercury only below 15° of Virgo; debilitated anywhere in the sign opposite; Rahu exalted in
 * Gemini and Ketu in Sagittarius, each debilitated in the other's, and otherwise as in PL9's nine steps of dignity
 * (`points.ts`): Rahu exalted in Taurus, Ketu in Scorpio.
 */
export function exaltationState(planet: Planet9, longitude: number): -1 | 0 | 1 {
  const sign = signOf(longitude);
  if (planet === 'rahu' || planet === 'ketu') {
    // Gemini and Sagittarius first; else the nine steps of dignity, which exalt Rahu in Taurus and Ketu in Scorpio.
    const high = planet === 'rahu' ? 2 : 8;
    if (sign === high) return 1;
    if (sign === (high + 6) % 12) return -1;
    const usual = planet === 'rahu' ? 1 : 7;
    return sign === usual ? 1 : sign === (usual + 6) % 12 ? -1 : 0;
  }
  const [s, upTo] = EXALTATION[planet];
  const degree = norm360(longitude) % 30;
  if (sign === s && degree > 0 && degree < upTo) return 1;
  return sign === (s + 6) % 12 ? -1 : 0;
}

/** Whether `from` aspects `to` (signs) or sits in it. */
const reaches = (from: number, to: number) => from === to || rashiAspects(from).includes(to);

/**
 * The lord of a sign as PL9 takes it for the strength of signs. Scorpio and Aquarius have two, Mars and Ketu,
 * Saturn and Rahu: the other one when one sits in the sign; else the one with more planets beside it; then the one
 * aspected by more of Jupiter, Mercury and the lord of its sign (not counting itself); then the better dignity;
 * then the one further from the sign, counted forwards from an odd sign and backwards from an even one.
 */
export function strengthLord(sign: number, longitudes: Record<Planet9, number>): Planet9 {
  if (sign !== 7 && sign !== 10) return SIGN_LORDS[sign]!;
  const [a, b]: [Planet9, Planet9] = sign === 7 ? ['mars', 'ketu'] : ['saturn', 'rahu'];
  const s = (p: Planet9) => signOf(longitudes[p]);
  if (s(a) === sign) return b;
  if (s(b) === sign) return a;
  const compare = (f: (p: Planet9) => number): Planet9 | null => (f(a) > f(b) ? a : f(b) > f(a) ? b : null);
  const beside = (p: Planet9) => PLANETS_9.filter((q) => q !== p && s(q) === s(p)).length;
  const aspected = (p: Planet9) => {
    const lord = SIGN_LORDS[s(p)]!;
    // Jupiter or Mercury as the lord counts twice, as in PL9.
    return (['jupiter', 'mercury', lord] as Planet9[]).filter((q) => q !== p && rashiAspects(s(q)).includes(s(p))).length;
  };
  // Signs counted 1 to 12 from the sign, the sign itself the 1st... towards the lord.
  const distance = (p: Planet9) => ((sign % 2 === 0 ? s(p) - sign : sign - s(p)) % 12 + 12) % 12 || 12;
  return compare(beside) ?? compare(aspected) ?? compare((p) => exaltationState(p, longitudes[p])) ?? compare(distance) ?? a;
}

/**
 * The stronger of two signs, as PL9 decides it (for the Kalachakra's sub-periods; its "strongest of the first and the
 * seventh"): more planets in it; then more aspects or conjunctions of Jupiter, Mercury and its lord; then more exalted
 * planets in it; then dual over fixed over movable; then its lord in a sign of the other parity; then its lord (for
 * Scorpio and Aquarius, `strengthLord`) further on in its sign; a full tie gives `b`. See docs/spec/dashas/forca-signos.md.
 */
export function strongerSign(a: number, b: number, longitudes: Record<Planet9, number>): number {
  const s = (p: Planet9) => signOf(longitudes[p]);
  const criteria: ((sign: number) => number)[] = [
    (sign) => PLANETS_9.filter((p) => s(p) === sign).length,
    // The lord is counted again when it is Jupiter or Mercury, as PL9 does.
    (sign) => (['jupiter', 'mercury', SIGN_LORDS[sign]!] as Planet9[]).reduce((n, p) => n + (rashiAspects(s(p)).includes(sign) ? 1 : 0) + (s(p) === sign ? 1 : 0), 0),
    (sign) => PLANETS_9.filter((p) => s(p) === sign && exaltationState(p, longitudes[p]) === 1).length,
    (sign) => [1, 2, 3][sign % 3]!,
    (sign) => (s(SIGN_LORDS[sign]!) % 2 !== sign % 2 ? 1 : 0),
    (sign) => norm360(longitudes[strengthLord(sign, longitudes)]) % 30,
  ];
  for (const f of criteria) {
    const x = f(a);
    const y = f(b);
    if (x > y) return a;
    if (y > x) return b;
  }
  return b;
}

/** PL9's "Rahu's Exaltation sign for Rashi Dashas" and "Mercury Exaltation for Rashi Dasha". */
export interface DashaDignityOptions {
  rahuExaltation: 'taurus' | 'gemini';
  mercuryExaltation: 'degree' | 'anywhere';
}

/**
 * +1 exalted, -1 debilitated, 0 otherwise, as PL9 counts it in the years of the rashi dashas: exalted anywhere in the
 * sign of exaltation, Mercury only up to 15° of Virgo unless `mercuryExaltation` is 'anywhere'; Rahu exalted in
 * Taurus and Ketu in Scorpio, or in Gemini and Sagittarius with `rahuExaltation` 'gemini'; debilitated anywhere in
 * the sign opposite.
 */
export function dashaDignity(planet: Planet9, longitude: number, options: Partial<DashaDignityOptions> = {}): -1 | 0 | 1 {
  const sign = signOf(longitude);
  // With Gemini, Rahu exalted in Gemini (Ketu in Sagittarius) first, and still in Taurus (Scorpio) otherwise.
  if (options.rahuExaltation === 'gemini' && (planet === 'rahu' || planet === 'ketu')) {
    const gemini = planet === 'rahu' ? 2 : 8;
    if (sign === gemini) return 1;
    if (sign === (gemini + 6) % 12) return -1;
  }
  const high = planet === 'rahu' ? 1 : planet === 'ketu' ? 7 : EXALTATION[planet][0];
  const degree = norm360(longitude) % 30;
  // With the option, Mercury by sign alone; otherwise strictly inside the degrees.
  const bySign = planet === 'mercury' && options.mercuryExaltation === 'anywhere';
  if (sign === high && (bySign || (degree > 0 && (planet !== 'mercury' || degree < 15)))) return 1;
  return sign === (high + 6) % 12 ? -1 : 0;
}
