import type { Ephemeris } from '@reverse/ephemeris';
import type { CoreOptions } from '../options';
import { computePositions } from '../positions';
import type { Planet9 } from '../jaimini';

/** The events of PL9's Research → "Time of transits", for a transiting planet and a natal point. */
export const TRANSIT_EVENTS = ['transits', 'fullyAspects', 'entersSign', 'leavesSign', 'entersNakshatra', 'leavesNakshatra', 'within45', 'leaves45'] as const;
export type TransitEvent = (typeof TRANSIT_EVENTS)[number];

/** The houses a planet fully aspects, counted from itself: the seventh for all, Mars, Jupiter and Saturn also their own (the nodes only the seventh, from the printouts). */
const FULL_ASPECTS: Record<Planet9, number[]> = {
  sun: [7], moon: [7], mercury: [7], venus: [7], mars: [4, 7, 8], jupiter: [5, 7, 9], saturn: [3, 7, 10], rahu: [7], ketu: [7],
};

const STEP = 0.5;
const norm = (x: number) => ((x % 360) + 360) % 360;

/**
 * The first moment after `afterJdUt` the planet makes the event with the natal longitude, or undefined within
 * `withinDays`: the half-day samples and straight lines of PL9's search (see `crossings`), the targets of each event
 * a longitude crossed going forwards or going backwards.
 */
export function timeOfTransit(eph: Ephemeris, planet: Planet9, event: TransitEvent, natalLongitude: number, afterJdUt: number, coreOptions?: Partial<CoreOptions>, withinDays = 36525): { jdUt: number; retrograde: boolean } | undefined {
  const L = natalLongitude;
  const sign = Math.floor(L / 30), nak = Math.floor(L / (40 / 3));
  // Each target: a longitude, and which way the crossing must go (+1 forwards, -1 backwards, 0 either).
  const targets: [number, number][] = {
    transits: [[L, 0]],
    fullyAspects: FULL_ASPECTS[planet].map((h): [number, number] => [norm(L - (h - 1) * 30), 0]),
    entersSign: [[sign * 30, 1], [sign * 30 + 30, -1]],
    leavesSign: [[sign * 30 + 30, 1], [sign * 30, -1]],
    entersNakshatra: [[nak * 40 / 3, 1], [(nak + 1) * 40 / 3, -1]],
    leavesNakshatra: [[(nak + 1) * 40 / 3, 1], [nak * 40 / 3, -1]],
    within45: [[norm(L - 45), 1], [norm(L + 45), -1]],
    leaves45: [[norm(L + 45), 1], [norm(L - 45), -1]],
  }[event].map(([t, d]) => [norm(t), d]);
  const at = (jdUt: number) => computePositions(eph, { jdUt, latitude: 0, longitudeEast: 0 }, coreOptions).points[planet].longitude;
  let t = Math.floor(afterJdUt - 0.5) + 0.5;
  let a = at(t);
  for (; t < afterJdUt + withinDays; t += STEP) {
    const b = at(t + STEP);
    let delta = b - a;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    let best: number | undefined;
    for (const [target, direction] of targets) {
      if (delta === 0 || (direction !== 0 && Math.sign(delta) !== direction)) continue;
      let d = target - a;
      if (d > 180) d -= 360;
      if (d < -180) d += 360;
      // The target lies between the two samples, in the direction of the motion.
      const f = d / delta;
      if (f > 0 && f <= 1) {
        const jdUt = t + STEP * f;
        if (jdUt > afterJdUt && (best === undefined || jdUt < best)) best = jdUt;
      }
    }
    if (best !== undefined) return { jdUt: best, retrograde: delta < 0 };
    a = b;
  }
  return undefined;
}
