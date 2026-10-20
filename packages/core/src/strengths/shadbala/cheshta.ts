import type { Ephemeris } from '@reverse/ephemeris';
import type { Fidelity } from '../../fidelity';
import { ephemerisInstant, planetLongitude } from '../../planets';
import { norm360 } from '../../zodiac';

/**
 * Cheshta Bala of Mars to Saturn as PL9 computes it: the part of its arc of motion the planet has gone, between the
 * moments PL9's own series give for each cycle and the station it finds a day at a time. See
 * docs/spec/strengths/shadbala.md, "Cheshta".
 */

export type CheshtaPlanet = 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn';

interface Series {
  /** The moment, a Julian day, of the k-th zero of the cycle, and of the k-th top. */
  zero: (k: number) => number;
  top: (k: number) => number;
  /** The last k the series hold. */
  last: number;
  /** The days before the top where the search for the station begins. */
  search: number;
}

const MERCURY: [number, number, number, number][] = [[-4.363, -6.4117, 6.6144, -0.7605], [-3.2831, 6.9952, -3.9994, -5.4142], [7.6603, -0.6195, -2.68848, 6.1661]];

const SERIES: Record<CheshtaPlanet, Series> = {
  mars: {
    zero: (k) => 2380725 + 779.9307 * k + 8.3717 + 17.4314 * Math.sin(0.8549 * k) - 10.8387 * Math.cos(0.8549 * k),
    top: (k) => 2380350 + 779.9449 * k - 7.9668 - 19.0764 * Math.sin(0.8549 * k) + 16.1501 * Math.cos(0.8549 * k),
    last: 113, search: 30,
  },
  mercury: {
    zero: (k) => { const [a, b] = MERCURY[((k % 3) + 3) % 3]!; return 2380632 + 115.8775 * k + 4.5231 + a * Math.sin(0.09973 * k) + b * Math.cos(0.09973 * k); },
    top: (k) => { const [, , c, d] = MERCURY[((k % 3) + 3) % 3]!; return 2380691 + 115.8776 * k + 3.5036 + c * Math.sin(0.09973 * k) + d * Math.cos(0.09973 * k); },
    last: 766, search: 10,
  },
  venus: { zero: (k) => 2380469 + 583.9214 * k - 3.1004, top: (k) => 2380760 + 583.921 * k - 2.1953, last: 152, search: 21 },
  jupiter: {
    zero: (k) => 2380665 + 398.8825 * k + 4.8226 - 3.5836 * Math.sin(0.57776 * k) - 5.5003 * Math.cos(0.57776 * k),
    top: (k) => 2380863 + 398.8815 * k + 6.1374 + 1.3601 * Math.sin(0.5791 * k) - 6.2723 * Math.cos(0.5791 * k),
    last: 222, search: 55,
  },
  saturn: {
    zero: (k) => 2380607 + 378.0963 * k - 8.5965 - 1.4827 * Math.sin(0.2209 * k) + 8.3813 * Math.cos(0.2209 * k),
    top: (k) => 2380792 + 378.0954 * k - 4.4261 - 3.2208 * Math.sin(0.21726 * k) + 2.9859 * Math.cos(0.21726 * k),
    last: 235, search: 60,
  },
};

/** The first Julian day PL9's ephemeris computes (3000 BC). */
const EPHEMERIS_START = 625000.5;

const oriented = (from: number, to: number) => norm360(to - from);
const least = (a: number, b: number) => { const d = norm360(a - b); return d > 180 ? 360 - d : d; };

/**
 * The cycle of the birth, PL9's way: the first zero not before the birth, and the top its index gives (for Mercury to
 * Saturn the top one index back); a birth before that top takes the zero before. Outside the series a date is 0.
 */
function cycle(planet: CheshtaPlanet, jd: number, fidelity: Fidelity = 'pl9'): { zero: number; top: number; direction: 1 | -1; index: number } {
  const s = SERIES[planet];
  if (fidelity !== 'pl9') {
    // Corrected: the same series carried on past their ends (docs/spec/corrections.md, 21).
    let i = Math.floor((jd - s.zero(0)) / ((s.zero(10) - s.zero(0)) / 10)) - 2;
    while (s.zero(i) < jd) i++;
    while (s.zero(i - 1) >= jd) i--;
    const top = s.top(planet === 'mars' ? i : i - 1);
    return jd < top ? { zero: s.zero(i - 1), top, direction: 1, index: i - 1 } : { zero: s.zero(i), top, direction: -1, index: i };
  }
  const zero = (k: number) => (k < 0 || k > s.last ? 0 : s.zero(k));
  let i = 0;
  while (i <= s.last && zero(i) < jd) i++;
  const j = planet === 'mars' || i === 0 ? i : i - 1;
  const top = i > s.last ? 0 : s.top(j);
  return jd < top ? { zero: zero(i - 1), top, direction: 1, index: i - 1 } : { zero: zero(i), top, direction: -1, index: i };
}

/** Whether PL9's series give the cycle of a birth: outside them it takes the date 0, and its Cheshta cannot be had. */
export function inCheshtaSeries(planet: CheshtaPlanet, jdUt: number, fidelity: Fidelity = 'pl9'): boolean {
  if (fidelity !== 'pl9') return true;
  const { index } = cycle(planet, jdUt);
  return index >= 0 && index <= SERIES[planet].last;
}

/** Sidereal longitude and speed of a planet at a moment. */
type Look = (jd: number) => { longitude: number; speed: number };

/** The station near the top: a day at a time, until the motion changes sign (at most 12 looks). */
function station(look: Look, start: number, direction: 1 | -1): number {
  let date = start;
  let previous: number | undefined;
  let longitude = 0;
  for (let i = 0; i < 12; i++) {
    const p = look(date);
    longitude = p.longitude;
    const sign = p.speed >= 0 ? 1 : -1;
    if (previous !== undefined && sign !== previous) return longitude;
    previous = sign;
    date += p.speed * direction >= 0 ? 1 : -1;
  }
  return longitude;
}

/** The positions along the cycle are computed as the chart's: `ayanamsha` gives the angle taken out at each moment. */
export function cheshta(eph: Ephemeris, planet: CheshtaPlanet, jdUt: number, ayanamsha: (jd: number) => number, fidelity: Fidelity = 'pl9'): number {
  const s = SERIES[planet];
  const { zero, top, direction } = cycle(planet, jdUt, fidelity);
  // A date outside the series is 0, before the ephemeris: PL9 then reads a cleared position.
  const look: Look = (jd) => {
    if (jd < EPHEMERIS_START) return { longitude: 0, speed: 0 };
    // The longitude as the chart's; the motion is the true one (with the nutation), whose sign PL9 reads.
    const p = planetLongitude(eph, jd, planet, ayanamsha(jd), fidelity);
    return { longitude: p.longitude, speed: eph.tropical(ephemerisInstant(eph, jd, fidelity), planet).longitudeSpeed };
  };
  const at = (jd: number) => look(jd).longitude;
  const la = at(zero), lb = at(top), lc = at(jdUt);
  const ls = station(look, top - direction * s.search, direction);
  const [direct, gone] = zero > top ? [oriented(ls, la), oriented(lc, la)] : [oriented(la, ls), oriented(la, lc)];
  const total = direct + least(lb, ls);
  let part = gone > 300 ? 360 - gone : gone;
  if (look(jdUt).speed <= 0) part = direct + least(lc, ls);
  // Past the series PL9 has no arc at all (zero, top and station at the date 0): the core gives 0, not PL9's value.
  if (!(total > 0)) return 0;
  return (60 * Math.min(part, total)) / total;
}
