import { julianDayUt, type Body, type Ephemeris } from '@reverse/ephemeris';
import { norm360 } from './angles';
import type { ChartKind, ChartSpec } from './pl9xml';
import { mulberry32 } from './rng';
import { findZero } from './search';

export const REFSET_SEED = 20261012;

const JD_MIN = julianDayUt(1801, 1, 2);
const JD_MAX = julianDayUt(2048, 12, 30);
const EDGE_ARCSEC = 1.5;
const SIGN_BODIES: Body[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const STATION_BODIES: Body[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];

const round7 = (v: number) => Number(v.toFixed(7));
const round4 = (v: number) => Number(v.toFixed(4));

/**
 * `pl9NextSunrise`, when given, is the first sunrise after an instant as PL9 has it; it adds six pairs of charts
 * 20 seconds on either side of such a sunrise. Without it the set stops before them.
 */
export function buildReferenceSet(
  eph: Ephemeris,
  seed: number = REFSET_SEED,
  pl9NextSunrise?: (jdUt: number, latitude: number, longitudeEast: number) => number,
): ChartSpec[] {
  const rnd = mulberry32(seed);
  const out: ChartSpec[] = [];
  const between = (lo: number, hi: number) => lo + (hi - lo) * rnd();
  const add = (kind: ChartKind, jdUt: number, note: string) => {
    out.push({
      id: `ref-${String(out.length + 1).padStart(4, '0')}`,
      jdUt: round7(jdUt),
      latitude: round4(between(-65, 65)),
      longitudeEast: round4(between(-180, 180)),
      kind,
      note,
    });
  };
  const sidereal = (jd: number, body: Body) =>
    norm360(eph.lahiriSiderealReference(jd, body));

  for (let i = 0; i < 200; i++) add('random', between(JD_MIN, JD_MAX), '');
  for (let i = 0; i < 40; i++) add('recent', between(julianDayUt(2005, 1, 1), JD_MAX), '');
  for (let i = 0; i < 20; i++) add('early', between(JD_MIN, julianDayUt(1830, 12, 31)), '');

  /** Signed distance, in degrees, from the nearest multiple of `span`. */
  const offsetFrom = (span: number, body: Body) => (jd: number) => {
    const g = sidereal(jd, body) % span;
    return g < span / 2 ? g : g - span;
  };
  /** Two instants straddling a boundary crossing, EDGE_ARCSEC of longitude on each side. */
  const straddle = (body: Body, span: number): [number, number] => {
    const f = offsetFrom(span, body);
    const step = body === 'moon' ? 0.05 : 0.5;
    const near = (a: number, b: number) => Math.abs(a) < span / 4 && Math.abs(b) < span / 4;
    for (let attempt = 0; attempt < 50; attempt++) {
      const t0 = findZero(f, between(JD_MIN + 400, JD_MAX - 400), step, 2000, near);
      if (t0 === null) continue;
      const speed = Math.abs(eph.tropical(t0, body).longitudeSpeed);
      if (speed < 0.005) continue; // too close to a station: the offset would not be monotonic
      const dt = EDGE_ARCSEC / 3600 / speed;
      const a = f(round7(t0 - dt));
      const b = f(round7(t0 + dt));
      if (a * b < 0) return [t0 - dt, t0 + dt];
    }
    throw new Error(`no usable ${span}-degree boundary crossing found for ${body}`);
  };

  for (const body of SIGN_BODIES) {
    const [before, after] = straddle(body, 30);
    add('sign-edge', before, `${body} just before a sign boundary`);
    add('sign-edge', after, `${body} just after a sign boundary`);
  }
  for (let i = 0; i < 3; i++) {
    const [before, after] = straddle('moon', 360 / 27);
    add('nakshatra-edge', before, 'moon just before a nakshatra boundary');
    add('nakshatra-edge', after, 'moon just after a nakshatra boundary');
  }
  for (const body of STATION_BODIES) {
    const speed = (jd: number) => eph.tropical(jd, body).longitudeSpeed;
    let t0: number | null = null;
    for (let attempt = 0; attempt < 50 && t0 === null; attempt++) {
      t0 = findZero(speed, between(JD_MIN + 400, JD_MAX - 1200), 1, 900);
    }
    if (t0 === null) throw new Error(`no station found for ${body}`);
    add('station', t0 - 0.05, `${body} just before a station`);
    add('station', t0 + 0.05, `${body} just after a station`);
  }
  // Charts for sunrise-dependent points. See docs/spec/nascer-do-sol.md.
  const EDGE_MINUTES = 15;
  const place = () => ({ latitude: round4(between(-50, 50)), longitudeEast: round4(between(-180, 180)) });
  const addAt = (kind: ChartKind, jdUt: number, p: { latitude: number; longitudeEast: number }, note: string) => {
    out.push({ id: `ref-${String(out.length + 1).padStart(4, '0')}`, jdUt: round7(jdUt), ...p, kind, note });
  };
  for (const event of ['rise', 'set'] as const) {
    for (let i = 0; i < 10; i++) {
      const p = place();
      const t = eph.sunRiseSetReference(between(JD_MIN + 400, JD_MAX - 400), p.latitude, p.longitudeEast, { event, disc: 'centre', refraction: true });
      if (t === null) throw new Error('no sunrise or sunset below 50 degrees of latitude');
      const kind: ChartKind = event === 'rise' ? 'sunrise-edge' : 'sunset-edge';
      addAt(kind, t - EDGE_MINUTES / 1440, p, `${EDGE_MINUTES} min before sun${event}`);
      addAt(kind, t + EDGE_MINUTES / 1440, p, `${EDGE_MINUTES} min after sun${event}`);
    }
  }
  for (let s = 0; s < 4; s++) {
    const p = place();
    const t0 = between(JD_MIN + 400, JD_MAX - 400);
    for (let k = 0; k < 8; k++) addAt('day-series', t0 + k / 8, p, `series ${s + 1}, instant ${k + 1} of 8`);
  }
  for (let i = 0; i < 6; i++) {
    const shift = i % 2 === 0 ? 0 : 180;
    const f = (jd: number) => (norm360(sidereal(jd, 'moon') - sidereal(jd, 'trueNode') - shift + 180) % 360) - 180;
    const t = findZero(f, between(JD_MIN + 400, JD_MAX - 400), 0.5, 200, (a, b) => Math.abs(a) < 90 && Math.abs(b) < 90);
    if (t === null) throw new Error('no conjunction of the Moon with a node found');
    add('moon-node', t, shift === 0 ? 'moon on rahu' : 'moon on ketu');
  }
  if (pl9NextSunrise) {
    const TIGHT_SECONDS = 20;
    for (let i = 0; i < 6; i++) {
      const p = place();
      const t = pl9NextSunrise(between(JD_MIN + 400, JD_MAX - 400), p.latitude, p.longitudeEast);
      addAt('sunrise-tight', t - TIGHT_SECONDS / 86400, p, `${TIGHT_SECONDS} s before the sunrise PL9 uses`);
      addAt('sunrise-tight', t + TIGHT_SECONDS / 86400, p, `${TIGHT_SECONDS} s after the sunrise PL9 uses`);
    }
  }
  return out;
}
