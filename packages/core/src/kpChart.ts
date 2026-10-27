import type { Ephemeris } from '@reverse/ephemeris';
import { ayanamshaFrame } from './ayanamsha';
import { computeDashas } from './dashas/compute';
import { InvalidInputError } from './errors';
import type { Planet9 } from './jaimini';
import { kpLords, type KpLords } from './kp';
import { LagnaUndefinedError, lagnaLongitude, pl9LocalSiderealTime, pl9MeanObliquity, pl9NutationThirteenTerms } from './lagna';
import { resolveOptions, type CoreOptions } from './options';
import { vedicWeekday } from './panchanga/compute';
import { computePositions, type ChartInput } from './positions';
import { calendarSpan } from './remedies';
import { norm360 } from './zodiac';

/**
 * The Krishnamurti chart as PL9's KP pages give it (docs/spec/kp.md): the Placidus cusps with their KP lords, the
 * significators of each house, the houses each planet signifies by strength, the ruling planets and Fortuna, and the
 * horary chart by a number from 1 to 249.
 */

const RAD = Math.PI / 180;
const NINE: readonly Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
type Lord7 = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';
const SIGN_LORD: Lord7[] = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
const DAY_LORD: Lord7[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const STAR_ORDER: readonly Planet9[] = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
const YEARS: Record<Planet9, number> = { ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 };
const NAKSHATRA = 40 / 3;

/**
 * The tropical longitude of a Placidus cusp between the angles, as PL9 finds it: from the sidereal time plus the
 * cusp's offset, ten rounds of the semi-arc, with no test of convergence. `nocturnal` for the cusps under the horizon
 * (2 and 3), `f` the share of the semi-arc (1.5 or 3).
 */
function placidusCusp(theta: number, eps: number, phi: number, offset: number, f: number, nocturnal: boolean): number {
  let x = (theta + offset) * RAD;
  const t = Math.tan(eps * RAD) * Math.tan(phi * RAD), th = theta * RAD;
  for (let i = 0; i < 10; i++) {
    const a = Math.acos((nocturnal ? 1 : -1) * Math.sin(x) * t);
    x = nocturnal ? th + Math.PI - a / f : th + a / f;
  }
  return toEcliptic(x, eps);
}

/** A right ascension on the ecliptic: atan(tan x / cos ε), taken to the quadrant of x as PL9 does. */
function toEcliptic(x: number, eps: number): number {
  let l = Math.atan(Math.tan(x) / Math.cos(eps * RAD));
  if (l < 0) l += Math.PI;
  if (Math.sin(x) < 0) l += Math.PI;
  return norm360(l / RAD);
}

/**
 * The twelve Placidus cusps, sidereal, as PL9 computes them (read in PL9): the Lagna's sidereal time, mean obliquity,
 * nutation and ayanamsha; cusp 1 the Lagna, 10 the midheaven, 11, 12, 2 and 3 by the semi-arcs, the others opposite.
 */
export function placidusCusps(jdUt: number, latitude: number, longitudeEast: number, ayanamshaDegrees: number, fidelity: 'pl9' | 'corrected' = 'pl9'): number[] {
  const eps = pl9MeanObliquity(jdUt);
  if (!Number.isFinite(latitude) || Math.abs(latitude) >= 90 - eps) throw new LagnaUndefinedError(latitude);
  const theta = pl9LocalSiderealTime(jdUt, longitudeEast);
  const shift = pl9NutationThirteenTerms(jdUt, fidelity) + ayanamshaDegrees;
  const sidereal = (tropical: number) => norm360(tropical - shift);
  const c = new Array<number>(12);
  c[0] = lagnaLongitude(undefined as unknown as Ephemeris, jdUt, latitude, longitudeEast, ayanamshaDegrees, fidelity);
  c[9] = sidereal(toEcliptic(theta * RAD, eps));
  c[10] = sidereal(placidusCusp(theta, eps, latitude, 30, 3, false));
  c[11] = sidereal(placidusCusp(theta, eps, latitude, 60, 1.5, false));
  c[1] = sidereal(placidusCusp(theta, eps, latitude, 120, 1.5, true));
  c[2] = sidereal(placidusCusp(theta, eps, latitude, 150, 3, true));
  for (const k of [3, 4, 5, 6, 7, 8]) c[k] = norm360(c[(k + 6) % 12]! + 180);
  return c;
}

/** The house, 1 to 12, of a longitude among the cusps: from a cusp to the next, the cusp itself included. */
export function cuspHouse(longitude: number, cusps: readonly number[]): number {
  const l = norm360(longitude);
  for (let h = 0; h < 12; h++) {
    const a = cusps[h]!, b = cusps[(h + 1) % 12]!;
    if (norm360(l - a) < norm360(b - a)) return h + 1;
  }
  return 12;
}

/** The 249 parts of PL9's horary numbers: the 243 subs of the nakshatras, the six cut by a sign change counted twice. */
const HORARY_PARTS: number[] = (() => {
  const starts: number[] = [];
  for (let n = 0; n < 27; n++) {
    let at = n * NAKSHATRA;
    const first = STAR_ORDER.indexOf(STAR_ORDER[n % 9]!);
    for (let k = 0; k < 9; k++) {
      const end = at + (YEARS[STAR_ORDER[(first + k) % 9]!] * NAKSHATRA) / 120;
      starts.push(at);
      // A sign that begins inside the sub starts a part of its own.
      const sign = Math.ceil(at / 30 - 1e-9) * 30;
      if (sign > at + 1e-9 && sign < end - 1e-9) starts.push(sign);
      at = end;
    }
  }
  return starts;
})();

/** The horary number, 1 to 249, of a sidereal longitude. */
export function horaryNumber(longitude: number): number {
  const l = norm360(longitude);
  let n = 0;
  while (n + 1 < HORARY_PARTS.length && HORARY_PARTS[n + 1]! <= l + 1e-12) n++;
  return n + 1;
}

export interface KpHouse {
  house: number;
  cusp: number;
  lords: KpLords;
  /** The planets in the house (from its cusp to the next), and those in a nakshatra each of them rules, in turn. */
  occupants: Planet9[];
  tenantsOfOccupants: Planet9[];
  /** The lord of the cusp's sign, and the planets in a nakshatra it rules. */
  owner: Lord7;
  tenantsOfOwner: Planet9[];
}
export interface KpPlanet {
  longitude: number;
  retrograde: boolean;
  lords: KpLords;
  house: number;
  /** The houses the planet signifies, by strength (PL9's V.Strong, Strong, Normal and Weak). */
  signifies: { veryStrong: number[]; strong: number[]; normal: number[]; weak: number[] };
}
export interface KpChart {
  cusps: number[];
  houses: KpHouse[];
  planets: Record<Planet9, KpPlanet>;
  ruling: {
    day: Lord7 | null; lagna: Lord7; lagnaStar: Planet9; lagnaSub: Planet9; moonSign: Lord7; moonStar: Planet9; moonSub: Planet9;
    /** Cusp 1 + the Moon − the Sun. */
    fortuna: number;
  };
  /** The Vimshottari period running at birth: its lord, its end and what is left of it (PL9's "Bal. of dasha"). */
  balance: { lord: string; endJdUt: number; years: number; months: number; days: number };
  /** For a horary chart: its number and the instant whose Ascendant opens it (the cusps' instant). */
  horary?: { number: number; cuspsJdUt: number };
}
export interface KpOptions {
  /** A horary chart: the planets at the instant, the cusps where the Ascendant enters this part (1 to 249). */
  horary?: number;
}

/**
 * The instant PL9 takes for a horary number: back in time from a moment after the instant, by 0.0015 day (0.0005
 * after landing on the next number) until the Ascendant falls in the number's part, then by 0.0001 and 0.000005 day
 * while it stays there (read in PL9). Where the Ascendant runs fast (high latitudes) that first step can pass over a
 * small part day after day, and PL9's search never ends: then, and always in the corrected mode, the first step is
 * 0.0002 day. Up to two days back.
 */
function horaryInstant(jdUt: number, latitude: number, longitudeEast: number, number: number, ayanamsha: (jd: number) => number, fidelity: 'pl9' | 'corrected'): number {
  const numberAt = (jd: number) => horaryNumber(lagnaLongitude(undefined as unknown as Ephemeris, jd, latitude, longitudeEast, ayanamsha(jd), fidelity));
  const search = (coarse: number, near: number): number | null => {
    let t = jdUt + 0.001;
    for (let n = numberAt(t); n !== number; n = numberAt(t)) {
      t -= n === number + 1 || n === number - 248 ? near : coarse;
      if (t < jdUt - 2) return null;
    }
    for (const step of [0.0001, 0.000005]) while (numberAt(t - step) === number) t -= step;
    return t;
  };
  const t = (fidelity === 'pl9' ? search(0.0015, 0.0005) : null) ?? search(0.0002, 0.0002);
  if (t === null) throw new InvalidInputError(`the Ascendant does not reach horary number ${number} in two days`);
  return t;
}

export function computeKpChart(eph: Ephemeris, input: ChartInput, options: KpOptions = {}, coreOptions?: Partial<CoreOptions>): KpChart {
  const core = resolveOptions(coreOptions);
  if (options.horary !== undefined && !(Number.isInteger(options.horary) && options.horary >= 1 && options.horary <= 249)) throw new InvalidInputError('the horary number must be a whole number from 1 to 249');
  const frame = ayanamshaFrame(eph, core.ayanamsha, core.ayanamshaOffsetDegrees, core.fidelity);
  const pos = computePositions(eph, input, core).points;
  const cuspsJd = options.horary ? horaryInstant(input.jdUt, input.latitude, input.longitudeEast, options.horary, frame.lagnaAyanamsha, core.fidelity) : input.jdUt;
  const cusps = placidusCusps(cuspsJd, input.latitude, input.longitudeEast, frame.lagnaAyanamsha(cuspsJd), core.fidelity);
  const lon = Object.fromEntries(NINE.map((p) => [p, pos[p].longitude])) as Record<Planet9, number>;
  const house = Object.fromEntries(NINE.map((p) => [p, cuspHouse(lon[p], cusps)])) as Record<Planet9, number>;
  const star = Object.fromEntries(NINE.map((p) => [p, kpLords(lon[p]).star])) as Record<Planet9, Planet9>;
  const tenants = (lord: Planet9) => NINE.filter((p) => star[p] === lord);
  const ownerOf = (h: number) => SIGN_LORD[Math.floor(cusps[h - 1]! / 30)]!;
  const houses: KpHouse[] = cusps.map((c, i) => {
    const occupants = NINE.filter((p) => house[p] === i + 1);
    const owner = ownerOf(i + 1);
    return { house: i + 1, cusp: c, lords: kpLords(c), occupants, tenantsOfOccupants: occupants.flatMap(tenants), owner, tenantsOfOwner: tenants(owner) };
  });
  // A planet's houses: 2 for the house its star lord holds and for its own, 1 for each house either rules by cusp.
  const planets = Object.fromEntries(NINE.map((p) => {
    const score = new Array<number>(13).fill(0);
    for (const q of [star[p], p]) {
      score[house[q]]! += 2;
      for (let h = 1; h <= 12; h++) if (ownerOf(h) === q) score[h]! += 1;
    }
    const at = (test: (s: number) => boolean) => [...score.keys()].filter((h) => h > 0 && test(score[h]!));
    return [p, {
      longitude: lon[p], retrograde: pos[p].retrograde === true, lords: kpLords(lon[p]), house: house[p],
      signifies: { veryStrong: at((s) => s >= 4), strong: at((s) => s === 3), normal: at((s) => s === 2), weak: at((s) => s === 1) },
    }];
  })) as Record<Planet9, KpPlanet>;
  const day = vedicWeekday(eph, input, core);
  const asc = kpLords(cusps[0]!), moon = kpLords(lon.moon);
  const first = computeDashas(eph, input, { system: 'vimshottari', levels: 1 }, core).periods[0]!;
  return {
    cusps, houses, planets,
    ruling: {
      day: day === null ? null : DAY_LORD[day]!, lagna: ownerOf(1), lagnaStar: asc.star, lagnaSub: asc.sub,
      moonSign: SIGN_LORD[Math.floor(lon.moon / 30)]!, moonStar: moon.star, moonSub: moon.sub,
      fortuna: norm360(cusps[0]! + lon.moon - lon.sun),
    },
    balance: { lord: first.lord, endJdUt: first.end, ...calendarSpan(input.jdUt, first.end) },
    ...(options.horary ? { horary: { number: options.horary, cuspsJdUt: cuspsJd } } : {}),
  };
}
