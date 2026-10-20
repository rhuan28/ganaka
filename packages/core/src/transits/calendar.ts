import type { Ephemeris } from '@reverse/ephemeris';
import type { CoreOptions } from '../options';
import { resolveOptions } from '../options';
import { LagnaUndefinedError } from '../lagna';
import { computePositions, type ChartInput } from '../positions';
import { signOf } from '../zodiac';
import { ashtakavarga, AV_PLANETS, type AshtakavargaOptions, type AvContributor, type AvPlanet, type AvSigns } from '../strengths/ashtakavarga';
import { kaksha } from './kaksha';
import { crossings } from './ingress';

export interface KakshaStretch {
  planet: AvPlanet;
  /** When the planet entered the kaksha, UT; the month's start for the kaksha it is in then. */
  jdUt: number;
  sign: number;
  kaksha: number;
  lord: AvContributor;
  bindu: 0 | 1;
  ash: number;
  /**
   * The bindus PL9 prints under the label: those of the sign the planet is in when it leaves the kaksha (the next
   * stretch's), so the next sign's for a planet that goes on from the eighth kaksha; the stretch's own when the month
   * ends first. Found in the printouts (the labels of the reference charts).
   */
  shownAsh: number;
  retrograde: boolean;
}

/**
 * PL9's "Kaksha and dasha calendar": for Sun to Saturn, the kaksha each is in at the start of a month and every
 * kaksha it enters in the month, with the lord, the bindu and the bindus of the sign as in the transit kakshas.
 * The month runs from 0h UT of its first day.
 */
export function kakshaCalendar(eph: Ephemeris, natal: ChartInput, monthStartJdUt: number, monthEndJdUt: number, coreOptions?: Partial<CoreOptions>, avOptions: Partial<AshtakavargaOptions> = {}): KakshaStretch[] {
  const fidelity = resolveOptions(coreOptions).fidelity;
  const birth = computePositions(eph, natal, coreOptions);
  if (!birth.points.lagna) throw new LagnaUndefinedError(natal.latitude);
  const natalSigns = { ...Object.fromEntries(AV_PLANETS.map((p) => [p, signOf(birth.points[p].longitude)])), lagna: signOf(birth.points.lagna.longitude) } as AvSigns;
  const av = ashtakavarga(natalSigns, avOptions, fidelity);
  const stretch = (planet: AvPlanet, jdUt: number, longitude: number, retrograde: boolean): KakshaStretch => {
    const sign = signOf(longitude);
    const k = kaksha(longitude);
    const ash = av.bhinna[planet][sign]!;
    return { planet, jdUt, sign, ...k, bindu: av.prastara[planet][k.lord][sign] as 0 | 1, ash, shownAsh: ash, retrograde };
  };
  const start = computePositions(eph, { jdUt: monthStartJdUt, latitude: 0, longitudeEast: 0 }, coreOptions).points;
  const out = AV_PLANETS.map((p) => stretch(p, monthStartJdUt, start[p].longitude, start[p].retrograde ?? false));
  for (const c of crossings(eph, monthStartJdUt, monthEndJdUt, 3.75, coreOptions, AV_PLANETS)) {
    // Inside the part entered: its start going forwards, its end going backwards.
    const longitude = c.part * 3.75 + (c.retrograde ? 3.75 - 1e-9 : 0);
    out.push(stretch(c.planet as AvPlanet, c.jdUt, longitude, c.retrograde));
  }
  out.sort((a, b) => a.jdUt - b.jdUt);
  for (const p of AV_PLANETS) {
    const mine = out.filter((s) => s.planet === p);
    mine.forEach((s, i) => { if (mine[i + 1]) s.shownAsh = mine[i + 1]!.ash; });
  }
  return out;
}
