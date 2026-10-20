import type { Ephemeris } from '@reverse/ephemeris';
import type { AyanamshaFrame } from './ayanamsha';
import { InvalidInputError } from './errors';
import { lagnaLongitude } from './lagna';
import { planetLongitude } from './planets';
import { norm360 } from './zodiac';

export class SunriseUndefinedError extends Error {
  readonly jdUt: number;
  readonly latitude: number;
  constructor(jdUt: number, latitude: number) {
    super(`the sunrise search does not settle around Julian day ${jdUt} at latitude ${latitude}`);
    this.name = 'SunriseUndefinedError';
    this.jdUt = jdUt;
    this.latitude = latitude;
  }
}

/** Julian days, UT. */
export interface DayFrame {
  /** The sunrise PL9 assigns to the instant. */
  sunrise: number;
  /** The sunset that follows it. */
  sunset: number;
  /** The sunrise after that. */
  nextSunrise: number;
  /** True when the Sun is above the eastern-western horizon line at the instant, as PL9 decides it. */
  isDay: boolean;
}

// Constants of the search, as PL9 has them. See docs/spec/nascer-do-sol.md.
const MEAN_SOLAR_MOTION = 0.985653; // degrees per day
const SUNRISE_TOLERANCE = 0.0005; // degrees
const SUNSET_TOLERANCE = 0.001; // degrees
const MAX_ITERATIONS = 9;
const FIRST_SLOPE = 360; // degrees of ascendant per day
const STEEP_LATITUDE = 60;
const NEXT_SUNRISE_START = 1.1; // days after the sunrise
const MAX_WANDER_DAYS = 3; // not PL9's: a guard of this implementation

/** b - a, reduced to (-180, 180]. */
function signedDifference(a: number, b: number): number {
  let d = b < a ? b + 360 - a : b - a;
  if (d > 180) d -= 360;
  return d;
}

interface Search {
  sunrise: number;
  sunset?: number;
  isDay: boolean;
}

/**
 * Sunrise, and optionally the following sunset, for an instant, by the secant search that
 * docs/spec/nascer-do-sol.md describes as PL9's:
 * the Sun rises when the Lagna equals its longitude and sets when the point opposite the Lagna does.
 * The steps reproduce PL9's so that the result is the same to a fraction of a millisecond.
 */
function pl9Search(
  eph: Ephemeris,
  jdUt: number,
  latitude: number,
  longitudeEast: number,
  frame: AyanamshaFrame,
  wantSunset: boolean,
  refineWithTrueSun: boolean,
): Search {
  const sun = (jd: number) => planetLongitude(eph, jd, 'sun', frame.sunAyanamsha(jd), frame.fidelity).longitude;
  const lagna = (jd: number) => lagnaLongitude(eph, jd, latitude, longitudeEast, frame.lagnaAyanamsha(jd), frame.fidelity);
  const sunAtBirth = sun(jdUt);
  const sunAheadOfLagna = norm360(sunAtBirth - lagna(jdUt));
  const isDay = sunAheadOfLagna >= 180 || sunAheadOfLagna <= 0;
  // Fraction of the day elapsed since 06:00 local mean time, and the quarter of the day it falls in.
  const sinceSix = (((jdUt + longitudeEast / 360 + 0.25) % 1) + 1) % 1;
  const quarter = Math.floor(sinceSix * 4);
  let guess: number;
  if (!isDay && quarter === 0) guess = jdUt - 1; // morning, Sun not yet up: yesterday's sunrise
  else if (isDay && quarter === 3) guess = jdUt + 1 - sinceSix; // before 06:00 with the Sun already up
  else guess = jdUt - sinceSix;

  const steep = latitude > STEEP_LATITUDE || latitude < -STEEP_LATITUDE;
  let previousTime = Number.NaN;
  let previousLagna = Number.NaN;
  const secantSearch = (start: number, shift: number, tolerance: number, linearDays: (t: number) => number): number => {
    let t = start;
    let slope = FIRST_SLOPE;
    let iteration = 1;
    for (;;) {
      const a = lagna(t);
      const point = shift === 0 ? a : norm360(a + shift);
      let error = signedDifference(point, linearDays(t) * MEAN_SOLAR_MOTION + sunAtBirth);
      let last = false;
      let secant = true;
      if ((error < tolerance && error > -tolerance) || iteration === MAX_ITERATIONS) {
        if (refineWithTrueSun) error = signedDifference(point, sun(t));
        last = true;
        iteration = MAX_ITERATIONS + 1;
      } else if (iteration === 1) {
        secant = false;
        if (steep) slope *= 2;
      }
      if (secant) {
        slope = Number.isNaN(previousTime) ? FIRST_SLOPE : signedDifference(previousLagna, a) / (t - previousTime);
        if (steep && iteration < 4) slope *= 2;
      }
      previousTime = t;
      previousLagna = a;
      t = error / slope + t;
      // A search that wanders days away has not found a sunrise; PL9 has no such guard and returns nonsense there.
      if (!Number.isFinite(t) || Math.abs(t - jdUt) > MAX_WANDER_DAYS) return Number.NaN;
      if (last) return t;
      iteration++;
    }
  };

  const sunrise = secantSearch(guess, 0, SUNRISE_TOLERANCE, (t) => t - jdUt);
  if (!wantSunset) return { sunrise, isDay };
  if (!Number.isFinite(sunrise)) return { sunrise, sunset: Number.NaN, isDay };
  const sunset = secantSearch(guess + 0.5, 180, SUNSET_TOLERANCE, () => sunrise - jdUt);
  return { sunrise, sunset, isDay };
}

const SCAN_STEP_DAYS = 2 / 1440; // two minutes
const SCAN_WINDOW_DAYS = 1 / 24;
const SCAN_WINDOWS = 30;
const SCAN_MARGIN_DAYS = 5 / 1440;
const FAST_SWING_DEGREES = 30;
const TIME_RESOLUTION_DAYS = 1e-10; // finer than a Julian day near the present can tell apart

/** A step holds a crossing when the value goes from negative to positive without the jump of the wrap at 180. */
const holdsCrossing = (a: number, b: number): boolean => a < 0 && b >= 0 && b - a < 180;

/**
 * Exact crossings of the horizon by the Sun's degree.
 * `shift` is 0 for the eastern horizon (the Lagna) and 180 for the western one.
 *
 * The horizon point is scanned against a stand-in for the Sun — its place at `around`, moved at the mean rate —
 * which needs no ephemeris; each crossing found that way is then pinned down against the real Sun.
 */
function exactCrossings(eph: Ephemeris, latitude: number, longitudeEast: number, frame: AyanamshaFrame, shift: number, around: number) {
  const sun = (jd: number) => planetLongitude(eph, jd, 'sun', frame.sunAyanamsha(jd), frame.fidelity).longitude;
  const lagna = (jd: number) => lagnaLongitude(eph, jd, latitude, longitudeEast, frame.lagnaAyanamsha(jd), frame.fidelity);
  /** How far the horizon point is ahead of the Sun, in (-180, 180]: it goes from negative to positive at a crossing. */
  const ahead = (jd: number) => -signedDifference(norm360(lagna(jd) + shift), sun(jd));

  const sunAround = sun(around);
  const ayanamshaAround = frame.lagnaAyanamsha(around);
  const rough = (jd: number) =>
    -signedDifference(
      norm360(lagnaLongitude(eph, jd, latitude, longitudeEast, ayanamshaAround, frame.fidelity) + shift),
      norm360(sunAround + (jd - around) * MEAN_SOLAR_MOTION),
    );

  /** Crossings of the stand-in between a and b, in ascending order. A fast swing of the Lagna is looked at in finer steps. */
  const roughCrossings = (a: number, b: number, depth: number): number[] => {
    const fa = rough(a);
    const fb = rough(b);
    if (Math.abs(fb - fa) > FAST_SWING_DEGREES && depth < 3) {
      const out: number[] = [];
      for (let k = 0; k < 8; k++) out.push(...roughCrossings(a + ((b - a) * k) / 8, a + ((b - a) * (k + 1)) / 8, depth + 1));
      return out;
    }
    if (!holdsCrossing(fa, fb)) return [];
    let lo = a;
    let hi = b;
    while (hi - lo > TIME_RESOLUTION_DAYS) {
      const mid = (lo + hi) / 2;
      if (mid <= lo || mid >= hi) break;
      if (rough(mid) < 0) lo = mid;
      else hi = mid;
    }
    return [hi];
  };

  /** The crossing of the real Sun next to a crossing of the stand-in, or NaN when none is found around it. */
  const pinDown = (near: number): number => {
    // From two seconds either side outwards: where the Lagna swings fast a wide bracket would straddle the wrap.
    let half = SCAN_STEP_DAYS / 64;
    for (let attempt = 0; attempt < 6; attempt++, half *= 4) {
      let lo = near - half;
      let hi = near + half;
      if (!holdsCrossing(ahead(lo), ahead(hi))) continue;
      while (hi - lo > TIME_RESOLUTION_DAYS) {
        const mid = (lo + hi) / 2;
        if (mid <= lo || mid >= hi) break;
        if (ahead(mid) < 0) lo = mid;
        else hi = mid;
      }
      return hi;
    }
    return Number.NaN;
  };

  const inWindow = (from: number, to: number): number[] => {
    const out: number[] = [];
    const steps = Math.ceil((to - from) / SCAN_STEP_DAYS);
    for (let k = 0; k < steps; k++) out.push(...roughCrossings(from + ((to - from) * k) / steps, from + ((to - from) * (k + 1)) / steps, 0));
    return out;
  };

  return {
    /** The last crossing at or before `jd`, or NaN. */
    lastAtOrBefore(jd: number): number {
      if (!Number.isFinite(jd)) return Number.NaN;
      for (let w = 0; w < SCAN_WINDOWS; w++) {
        const to = w === 0 ? jd + SCAN_MARGIN_DAYS : jd - w * SCAN_WINDOW_DAYS;
        for (const near of inWindow(jd - (w + 1) * SCAN_WINDOW_DAYS, to).reverse()) {
          const t = pinDown(near);
          if (Number.isFinite(t) && t <= jd) return t;
        }
      }
      return Number.NaN;
    },
    /** The first crossing after `jd`, or NaN. */
    firstAfter(jd: number): number {
      if (!Number.isFinite(jd)) return Number.NaN;
      for (let w = 0; w < SCAN_WINDOWS; w++) {
        const from = w === 0 ? jd - SCAN_MARGIN_DAYS : jd + w * SCAN_WINDOW_DAYS;
        for (const near of inWindow(from, jd + (w + 1) * SCAN_WINDOW_DAYS)) {
          const t = pinDown(near);
          if (Number.isFinite(t) && t > jd) return t;
        }
      }
      return Number.NaN;
    },
  };
}

/**
 * The day frame with exact instants: the corrected mode. The definition of sunrise is PL9's;
 * the instants are the true roots, which PL9's search only approaches. See docs/spec/correcoes.md.
 */
function exactDayFrame(eph: Ephemeris, jdUt: number, latitude: number, longitudeEast: number, frame: AyanamshaFrame): DayFrame {
  const sunrise = exactCrossings(eph, latitude, longitudeEast, frame, 0, jdUt).lastAtOrBefore(jdUt);
  if (!Number.isFinite(sunrise)) throw new SunriseUndefinedError(jdUt, latitude);
  const sunset = exactCrossings(eph, latitude, longitudeEast, frame, 180, sunrise).firstAfter(sunrise);
  if (!Number.isFinite(sunset)) throw new SunriseUndefinedError(jdUt, latitude);
  const nextSunrise = exactCrossings(eph, latitude, longitudeEast, frame, 0, sunset).firstAfter(sunset);
  if (!Number.isFinite(nextSunrise) || nextSunrise <= jdUt) throw new SunriseUndefinedError(jdUt, latitude);
  return { sunrise, sunset, nextSunrise, isDay: jdUt < sunset };
}

/** True for the error the ephemeris raises when asked for an instant outside its data. */
const outsideEphemeris = (e: unknown): boolean => e instanceof Error && e.name === 'EphemerisRangeError';

/**
 * The sunrise, sunset and next sunrise for an instant and a place: PL9's own in the 'pl9' mode of the frame,
 * the exact ones in the 'corrected' mode. See docs/spec/nascer-do-sol.md.
 */
export function dayFrame(eph: Ephemeris, jdUt: number, latitude: number, longitudeEast: number, frame: AyanamshaFrame): DayFrame {
  try {
    return dayFrameUnguarded(eph, jdUt, latitude, longitudeEast, frame);
  } catch (e) {
    // The search can step past the ends of the ephemeris data when the instant is within a day or so of them.
    if (outsideEphemeris(e)) throw new SunriseUndefinedError(jdUt, latitude);
    throw e;
  }
}

function dayFrameUnguarded(eph: Ephemeris, jdUt: number, latitude: number, longitudeEast: number, frame: AyanamshaFrame): DayFrame {
  if (![jdUt, latitude, longitudeEast].every(Number.isFinite)) throw new InvalidInputError('jdUt, latitude and longitudeEast must be finite numbers');
  if (frame.fidelity === 'corrected') return exactDayFrame(eph, jdUt, latitude, longitudeEast, frame);
  const first = pl9Search(eph, jdUt, latitude, longitudeEast, frame, true, true);
  const sunrise = first.sunrise;
  const sunset = first.sunset as number;
  if (!Number.isFinite(sunrise) || !Number.isFinite(sunset)) throw new SunriseUndefinedError(jdUt, latitude);
  const nextSunrise = pl9Search(eph, sunrise + NEXT_SUNRISE_START, latitude, longitudeEast, frame, false, false).sunrise;

  // PL9 has no check here: its search stops after a fixed number of steps and it uses whatever came out.
  // That result is returned as it is, even when it is not on the horizon: for instance, when the sunset search
  // settles on its first pass, PL9 takes its last step with the slope left over from the sunrise search and its
  // sunset lands most of a degree away (checked against PL9; see docs/spec/nascer-do-sol.md).
  // Only a result that cannot be used at all is refused: one that is not a number, or three instants out of order.
  const ordered = sunrise < sunset && sunset < nextSunrise && nextSunrise - sunrise > 0.5 && nextSunrise - sunrise < 1.5;
  if (!Number.isFinite(nextSunrise) || !ordered) throw new SunriseUndefinedError(jdUt, latitude);
  return { sunrise, sunset, nextSunrise, isDay: first.isDay };
}
