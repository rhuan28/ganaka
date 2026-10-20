import type { Ephemeris } from '@reverse/ephemeris';
import type { CoreOptions } from '../options';
import { computePositions } from '../positions';
import { norm360 } from '../zodiac';

/** The elements whose ends PL9 searches, with the arc of one and the steps of its search (read in PL9). */
export type PanchangaKind = 'tithi' | 'karana' | 'yoga' | 'nakshatra';
const SPAN: Record<PanchangaKind, number> = { tithi: 12, karana: 6, yoga: 40 / 3, nakshatra: 40 / 3 };
const STEPS: Record<PanchangaKind, number> = { tithi: 4, karana: 3, yoga: 3, nakshatra: 3 };

/** The arc the element counts and its speed, degrees and degrees a day, at an instant. */
function measure(eph: Ephemeris, kind: PanchangaKind, jdUt: number, coreOptions?: Partial<CoreOptions>): { value: number; speed: number } {
  const p = computePositions(eph, { jdUt, latitude: 0, longitudeEast: 0 }, coreOptions).points;
  const sun = p.sun.longitude, moon = p.moon.longitude, vs = p.sun.longitudeSpeed!, vm = p.moon.longitudeSpeed!;
  if (kind === 'tithi' || kind === 'karana') return { value: norm360(moon - sun), speed: vm - vs };
  if (kind === 'yoga') return { value: norm360(sun + moon), speed: vm + vs };
  return { value: moon, speed: vm };
}

/**
 * The end of the element running at an instant, as PL9 finds it: from the instant, a fixed number of straight-line
 * steps on the speed at each step (four for the tithi, three for the karana, the yoga and the nakshatra), with no
 * test of how close they came. Read in PL9.
 */
export function elementEnd(eph: Ephemeris, kind: PanchangaKind, fromJdUt: number, coreOptions?: Partial<CoreOptions>): number {
  const span = SPAN[kind];
  const target = (Math.floor(measure(eph, kind, fromJdUt, coreOptions).value / span) + 1) * span;
  let t = fromJdUt;
  for (let i = 0; i < STEPS[kind]; i++) {
    const { value, speed } = measure(eph, kind, t, coreOptions);
    let d = target - value;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    t += d / speed;
  }
  return t;
}

/** The start of the element running at an instant: the same search towards the start of its arc. */
export function elementStart(eph: Ephemeris, kind: PanchangaKind, fromJdUt: number, coreOptions?: Partial<CoreOptions>): number {
  const span = SPAN[kind];
  const target = Math.floor(measure(eph, kind, fromJdUt, coreOptions).value / span) * span;
  let t = fromJdUt;
  for (let i = 0; i < STEPS[kind]; i++) {
    const { value, speed } = measure(eph, kind, t, coreOptions);
    let d = target - value;
    if (d > 180) d -= 360;
    if (d < -180) d += 360;
    t += d / speed;
  }
  return t;
}
