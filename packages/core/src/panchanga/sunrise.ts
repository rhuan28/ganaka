import type { Ephemeris } from '@reverse/ephemeris';
import { ayanamshaFrame } from '../ayanamsha';
import { lagnaLongitude } from '../lagna';
import { resolveOptions, type CoreOptions } from '../options';
import { computePositions } from '../positions';
import { dayFrame, SunriseUndefinedError } from '../sunrise';
import { norm360 } from '../zodiac';

/** The Sun's mean motion PL9's panchanga takes while it searches, degrees a day. Read in PL9. */
const SUN_SPEED = 0.985653;
const signed = (a: number, b: number) => { const d = norm360(b - a); return d > 180 ? d - 360 : d; };

export interface PanchangaDay {
  /** The sunrise before the instant, the sunset after that sunrise, and the next sunrise, Julian days UT. */
  sunrise: number;
  sunset: number;
  nextSunrise: number;
}

/**
 * The sunrise and sunset PL9's panchanga prints: the moment the Lagna (the point opposite it, for the sunset) reaches
 * a Sun moving at its mean speed from its true place at the instant searched from, by secants from a first slope of
 * 360 degrees a day (twice that past 60 degrees of latitude in the first three steps), to 0.0005 degrees for the
 * sunrise and 0.001 for the sunset, in at most nine steps; then one more secant step on the true Sun, without a check.
 * The next sunrise is searched the same way from 1.1 days after the sunrise, without the last step. Read in PL9.
 * The search never checks that it arrived, and near 65 degrees of latitude it can stop hours away; the 'corrected'
 * mode takes the exact instants instead (docs/spec/correcoes.md, corrections 1 and 2).
 */
export function panchangaDay(eph: Ephemeris, jdUt: number, latitude: number, longitudeEast: number, coreOptions?: Partial<CoreOptions>): PanchangaDay {
  const core = resolveOptions(coreOptions);
  const frame = ayanamshaFrame(eph, core.ayanamsha, core.ayanamshaOffsetDegrees, core.fidelity);
  if (core.fidelity === 'corrected') {
    const { sunrise, sunset, nextSunrise } = dayFrame(eph, jdUt, latitude, longitudeEast, frame);
    return { sunrise, sunset, nextSunrise };
  }
  const lagna = (jd: number) => lagnaLongitude(eph, jd, latitude, longitudeEast, frame.lagnaAyanamsha(jd), core.fidelity);
  const sunAt = (jd: number) => computePositions(eph, { jdUt: jd, latitude: 0, longitudeEast: 0 }, coreOptions).points.sun.longitude;
  const steep = latitude > 60 || latitude < -60;

  /** Secants on the gap from `point` to `target`; then, when `trueSun`, one more step on the gap to the true Sun. */
  const search = (start: number, point: (jd: number) => number, target: (jd: number) => number, tolerance: number, trueSun: boolean, single = false): number => {
    let t = start, slope = 360, previousT = t, previous = 0;
    for (let i = 1; i <= 9; i++) {
      const here = point(t);
      const gap = signed(here, target(t));
      if (Math.abs(gap) < tolerance) break;
      if (i > 1) { slope = signed(previous, here) / (t - previousT); if (single) slope = Math.fround(slope); }
      if (steep && i < 4) slope *= 2;
      previousT = t; previous = here;
      t += gap / slope;
    }
    if (trueSun) t += signed(point(t), sunAt(t)) / slope;
    if (!Number.isFinite(t)) throw new SunriseUndefinedError(jdUt, latitude);
    return t;
  };

  const sun0 = sunAt(jdUt);
  const guess = jdUt + norm360(sun0 - lagna(jdUt)) / 360 - 1;
  const linear = (from: number, sun: number) => (jd: number) => sun + (jd - from) * SUN_SPEED;
  const sunrise = search(guess, lagna, linear(jdUt, sun0), 0.0005, true);
  // The sunset: the point opposite the Lagna, the Sun held where the linear Sun stood at the sunrise.
  const sunAtRise = linear(jdUt, sun0)(sunrise);
  const sunset = search(guess + 0.5, (jd) => norm360(180 + Math.fround(lagna(jd))), () => sunAtRise, 0.001, true, true);
  const from = sunrise + 1.1;
  const sunNext = sunAt(from);
  const nextGuess = from + norm360(sunNext - lagna(from)) / 360 - 1;
  const nextSunrise = search(nextGuess, lagna, linear(from, sunNext), 0.0005, false);
  return { sunrise, sunset, nextSunrise };
}
