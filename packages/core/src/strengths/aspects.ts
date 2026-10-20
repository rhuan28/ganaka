import type { Planet9 } from '../jaimini';
import { norm360 } from '../zodiac';

/**
 * The graded aspects PL9 uses in the Drik Bala and the Bhava Bala, in virupas from 0 to 60. See
 * docs/spec/forcas/aspectos.md.
 */

/**
 * The special aspects: the angle of the peak, counted from the aspecting planet, and how fast the aspect rises
 * before it and falls after it, by degree, over thirty degrees on each side; a rise of 0 is a plateau of 60.
 */
const SPECIAL: Partial<Record<Planet9, [number, number, number][]>> = {
  mars: [[90, 1.5, 1], [210, 0, 1]],
  jupiter: [[120, 0.5, 1], [240, 0.5, 1]],
  saturn: [[60, 2, 0.5], [270, 1, 2]],
  rahu: [[120, 0.5, 1], [240, 0.5, 1]],
  ketu: [[120, 0.5, 1], [240, 0.5, 1]],
};

/** The curve every planet casts, by the angle from it to the point aspected. */
function curve(k: number): number {
  if (k <= 30) return 0;
  if (k <= 60) return (k - 30) / 2;
  if (k <= 90) return k - 60 + 15;
  if (k <= 120) return 45 - (k - 90) / 2;
  if (k <= 150) return 30 - (k - 120);
  if (k <= 180) return (k - 150) * 2;
  if (k <= 300) return 60 - (k - 180) / 2;
  return 0;
}

/** The aspect a planet casts at an angle (from it to the point, along the signs), the greater of the curve and its special aspects. */
export function aspectValue(from: Planet9, angle: number): number {
  const k = norm360(angle);
  let value = curve(k);
  for (const [peak, rise, fall] of SPECIAL[from] ?? []) {
    const d = k - peak;
    if (Math.abs(d) > 30) continue;
    value = Math.max(value, 60 - (d >= 0 ? fall : rise) * Math.abs(d));
  }
  return Math.max(0, value);
}

/** The aspect of a planet at `fromLongitude` on a point at `toLongitude`. */
export const aspectBetween = (from: Planet9, fromLongitude: number, toLongitude: number) => aspectValue(from, toLongitude - fromLongitude);
