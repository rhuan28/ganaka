import type { Ephemeris } from '@reverse/ephemeris';
import type { AyanamshaFrame } from '../../ayanamsha';
import { lagnaLongitude } from '../../lagna';
import { SunriseUndefinedError } from '../../sunrise';
import { norm360 } from '../../zodiac';

/**
 * The sunrise and sunset the Shadbala counts from, PL9's own: the moments the Lagna reaches the Sun, and the point
 * opposite the Lagna reaches it, the Sun taken to move a degree a day from its place at birth. Found by secants
 * from a first slope of 360 degrees a day, to a thousandth of a degree, in at most nine steps; beyond 65 degrees of
 * latitude the place is taken at 60. See docs/spec/forcas/shadbala.md, "Kala".
 */

/** Signed arc from `a` to `b`, in (-180, 180]. */
const signed = (a: number, b: number) => { const d = norm360(b - a); return d > 180 ? d - 360 : d; };

export interface ShadbalaDay {
  /** The sunrise before the birth, and the sunset after it, Julian days UT. */
  sunrise: number;
  sunset: number;
  /** Whether the Sun is below the horizon at birth: within the half of the zodiac after the Lagna. */
  night: boolean;
}

export function shadbalaDay(eph: Ephemeris, jdUt: number, latitude: number, longitudeEast: number, frame: AyanamshaFrame, sun: number): ShadbalaDay {
  // PL9 takes 60 degrees north past 65; the corrected mode keeps the place's latitude (docs/spec/correcoes.md, 20).
  const pl9 = frame.fidelity === 'pl9';
  const lat = pl9 && (latitude > 65 || latitude < -65) ? 60 : latitude;
  const steep = lat > 60 || lat < -60;
  const lagna = (jd: number) => lagnaLongitude(eph, jd, lat, longitudeEast, frame.lagnaAyanamsha(jd), frame.fidelity);
  const toSun = norm360(sun - lagna(jdUt));
  const night = toSun > 0 && toSun < 180;
  const sunAt = (jd: number) => sun + (jd - jdUt);

  const STEP = 1 / 480;
  const gapAt = (point: (jd: number) => number) => (jd: number) => signed(point(jd), sunAt(jd));
  /**
   * Corrected: where the secant does not settle (far from the equator), the crossing nearest the guess, found
   * by sampling every three minutes within half a day and halving.
   */
  const bracket = (start: number, point: (jd: number) => number): number => {
    const g = gapAt(point);
    let best: number | undefined;
    for (let a = start - 0.5; a < start + 0.5; a += STEP) {
      const b = a + STEP, ga = g(a), gb = g(b);
      // A crossing, not the wrap of the gap from +180 to -180.
      if (ga >= 0 && gb < 0 && ga - gb < 180 && (best === undefined || Math.abs(a - start) < Math.abs(best - start))) best = a;
    }
    if (best === undefined) throw new SunriseUndefinedError(jdUt, latitude);
    let lo = best, hi = best + STEP;
    // The Lagna moves past the Sun: the gap goes from ahead to behind.
    for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (g(m) >= 0) lo = m; else hi = m; }
    return (lo + hi) / 2;
  };
  const settled = (t: number, point: (jd: number) => number) => Math.abs(gapAt(point)(t)) < 0.001;
  const search = (start: number, point: (jd: number) => number, single: boolean): number => {
    const t = secant(start, point, single);
    return pl9 || settled(t, point) ? t : bracket(start, point);
  };

  const secant = (start: number, point: (jd: number) => number, single: boolean): number => {
    let t = start;
    let slope = 360;
    let previousT = t;
    let previous = 0;
    for (let i = 1; i < 10; i++) {
      const here = point(t);
      const gap = signed(here, sunAt(t));
      if (gap > -0.001 && gap < 0.001) return t;
      if (i === 1) {
        if (steep) slope *= 4;
      } else {
        slope = signed(previous, here) / (t - previousT);
        if (single) slope = Math.fround(slope);
        if (steep && i < 4) slope *= 4;
      }
      previousT = t;
      previous = here;
      t = t + gap / slope;
    }
    return t;
  };

  // The first guesses: the Lagna moving 360 degrees a day, and half a day after for the sunset.
  const guess = jdUt + toSun / 360 - 1;
  const sunrise = search(guess, lagna, false);
  // The sunset is worked in single precision where PL9 does: the point opposite the Lagna, and the slope.
  const sunset = search(guess + 0.5, (jd) => norm360(180 + Math.fround(lagna(jd))), true);
  return { sunrise, sunset, night };
}
