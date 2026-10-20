import type { Ephemeris } from '@reverse/ephemeris';
import type { CoreOptions } from '../options';
import { computePositions } from '../positions';
import { PLANETS_9, type Planet9 } from '../jaimini';

export interface Ingress {
  planet: Planet9;
  /** The sign entered, 0 = Aries. */
  sign: number;
  jdUt: number;
  /** Whether the planet entered it moving backwards. */
  retrograde: boolean;
}

/** PL9's step: positions every half day, the crossing placed by straight lines between them (read in PL9). */
const STEP = 0.5;

/**
 * Each moment a planet crosses a multiple of `width` degrees between two instants: sidereal longitudes every half
 * day of universal time from a whole day, the moment interpolated linearly between the two samples around it (PL9's
 * search, read in PL9). `part` is the part entered, 0 at Aries 0°.
 */
export function crossings(eph: Ephemeris, fromJdUt: number, toJdUt: number, width: number, coreOptions?: Partial<CoreOptions>, planets: readonly Planet9[] = PLANETS_9): { planet: Planet9; part: number; jdUt: number; retrograde: boolean }[] {
  const place = { latitude: 0, longitudeEast: 0 };
  const sample = (jdUt: number) => computePositions(eph, { jdUt, ...place }, coreOptions).points;
  const parts = Math.round(360 / width);
  const out: { planet: Planet9; part: number; jdUt: number; retrograde: boolean }[] = [];
  let t = Math.floor(fromJdUt - 0.5) + 0.5;
  let before = sample(t);
  for (; t < toJdUt; t += STEP) {
    const after = sample(t + STEP);
    for (const p of planets) {
      const a = before[p].longitude, b = after[p].longitude;
      let delta = b - a;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      if (delta === 0) continue;
      // Every boundary between the two samples (a fast planet, the Moon, can cross two kakshas in a half day), each
      // placed on the same straight line: going forwards, the start of each part entered; backwards, its end.
      const pa = Math.floor(a / width);
      const steps = delta > 0 ? Math.floor((a + delta) / width) - pa : pa - Math.floor((a + delta) / width);
      for (let n = 1; n <= steps; n++) {
        const entered = delta > 0 ? pa + n : pa - n;
        const boundary = (delta > 0 ? entered : entered + 1) * width;
        const jdUt = t + (STEP * (boundary - a)) / delta;
        if (jdUt >= fromJdUt && jdUt < toJdUt) out.push({ planet: p, part: ((entered % parts) + parts) % parts, jdUt, retrograde: delta < 0 });
      }
    }
    before = after;
  }
  return out.sort((x, y) => x.jdUt - y.jdUt);
}

/** The sign entries of the planets between two instants, as PL9's "Yearly transit overview" finds them. */
export function signIngresses(eph: Ephemeris, fromJdUt: number, toJdUt: number, coreOptions?: Partial<CoreOptions>, planets: readonly Planet9[] = PLANETS_9): Ingress[] {
  return crossings(eph, fromJdUt, toJdUt, 30, coreOptions, planets).map(({ part, ...c }) => ({ ...c, sign: part }));
}
