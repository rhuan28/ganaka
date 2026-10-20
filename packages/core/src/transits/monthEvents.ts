import type { Ephemeris } from '@reverse/ephemeris';
import { computeDashas } from '../dashas/compute';
import type { DashaPeriod } from '../dashas/engine';
import { PLANETS_9, type Planet9 } from '../jaimini';
import type { CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { crossings } from './ingress';

export type MonthAspect = 'conjunction' | 'opposition' | 'trine';
export type MonthTarget = Planet9 | 'lagna' | 'cusp4' | 'cusp7' | 'cusp10';

export type MonthEvent =
  | { jdUt: number; kind: 'nakshatra' | 'sign'; planet: Planet9; target: number; retrograde: boolean }
  | { jdUt: number; kind: 'aspect'; planet: Planet9; aspect: MonthAspect; target: MonthTarget; retrograde: boolean }
  | { jdUt: number; kind: 'station'; planet: Planet9; retrograde: boolean }
  | { jdUt: number; kind: 'dasha'; chain: Planet9[] };

const STEP = 0.5;
const ASPECTS: [MonthAspect, number][] = [['conjunction', 0], ['opposition', 180], ['trine', 120], ['trine', -120]];
const STATIONARY: readonly Planet9[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];

/**
 * The events PL9's "Calendar" worksheet lists for a month (its preset "Worksheet Calendar", read in PL9's options):
 * the entries of the nine planets into nakshatras and signs; their conjunctions, oppositions and trines with the natal
 * planets, Ascendant and cusps 4, 7 and 10 (the equal houses' middles, the Ascendant's square and opposite points:
 * from the printouts); the stations of Mars to Saturn; and each new period of the natal Vimshottari's fifth level,
 * from `dashasFromJdUt` (PL9 lists them from the month's first day at 0h UT: from the printouts).
 * Positions every half day of universal time, each crossing placed by a straight line between the two samples, as
 * PL9's search of transits does (`crossings`); a station at the instant the speed is nought. Null without the natal
 * Lagna. See docs/spec/tempo/transitos.md.
 */
export function monthEvents(eph: Ephemeris, natal: ChartInput, fromJdUt: number, toJdUt: number, coreOptions?: Partial<CoreOptions>, o: { dashasFromJdUt?: number } = {}): MonthEvent[] | null {
  const natalPoints = computePositions(eph, natal, coreOptions).points;
  const lagna = natalPoints.lagna?.longitude;
  if (lagna === undefined) return null;
  const out: MonthEvent[] = [];
  for (const c of crossings(eph, fromJdUt, toJdUt, 40 / 3, coreOptions)) out.push({ jdUt: c.jdUt, kind: 'nakshatra', planet: c.planet, target: c.part, retrograde: c.retrograde });
  for (const c of crossings(eph, fromJdUt, toJdUt, 30, coreOptions)) out.push({ jdUt: c.jdUt, kind: 'sign', planet: c.planet, target: c.part, retrograde: c.retrograde });
  const targets: [MonthTarget, number][] = [
    ...PLANETS_9.map((p): [MonthTarget, number] => [p, natalPoints[p].longitude]),
    ['lagna', lagna], ['cusp4', lagna + 90], ['cusp7', lagna + 180], ['cusp10', lagna + 270],
  ];
  const at = (jdUt: number) => computePositions(eph, { jdUt, latitude: 0, longitudeEast: 0 }, coreOptions).points;
  let t = Math.floor(fromJdUt - 0.5) + 0.5;
  let before = at(t);
  for (; t < toJdUt; t += STEP) {
    const after = at(t + STEP);
    for (const p of PLANETS_9) {
      const a = before[p].longitude;
      let delta = after[p].longitude - a;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      if (delta !== 0) {
        for (const [target, longitude] of targets) {
          for (const [aspect, offset] of ASPECTS) {
            let d = (longitude + offset - a) % 360;
            if (d > 180) d -= 360;
            if (d < -180) d += 360;
            const f = d / delta;
            const jdUt = t + STEP * f;
            if (f > 0 && f <= 1 && jdUt >= fromJdUt && jdUt < toJdUt) out.push({ jdUt, kind: 'aspect', planet: p, aspect, target, retrograde: delta < 0 });
          }
        }
      }
      const va = before[p].longitudeSpeed ?? 0, vb = after[p].longitudeSpeed ?? 0;
      if (STATIONARY.includes(p) && Math.sign(va) !== Math.sign(vb)) {
        let lo = t, hi = t + STEP;
        for (let i = 0; i < 40; i++) {
          const mid = (lo + hi) / 2;
          if (Math.sign(at(mid)[p].longitudeSpeed ?? 0) === Math.sign(va)) lo = mid;
          else hi = mid;
        }
        if (lo >= fromJdUt && lo < toJdUt) out.push({ jdUt: lo, kind: 'station', planet: p, retrograde: vb < 0 });
      }
    }
    before = after;
  }
  const dashas = computeDashas(eph, natal, { system: 'vimshottari', levels: 5, cycles: 3 }, coreOptions).periods;
  const walk = (ps: readonly DashaPeriod[], chain: Planet9[]) => {
    for (const p of ps) {
      const c = [...chain, p.lord as Planet9];
      if (p.sub?.length) walk(p.sub, c);
      else if (p.start >= Math.max(fromJdUt, o.dashasFromJdUt ?? fromJdUt) && p.start < toJdUt) out.push({ jdUt: p.start, kind: 'dasha', chain: c });
    }
  };
  walk(dashas, []);
  return out.sort((x, y) => x.jdUt - y.jdUt);
}
