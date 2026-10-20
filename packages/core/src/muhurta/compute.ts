import type { Ephemeris } from '@reverse/ephemeris';
import { computeDashas } from '../dashas/compute';
import type { DashaPeriod } from '../dashas/engine';
import type { Fidelity } from '../fidelity';
import { PLANETS_9, type Planet9 } from '../jaimini';
import { resolveOptions, type CoreOptions } from '../options';
import { computePanchanga, type PanchangaElement } from '../panchanga/compute';
import { computePositions, type ChartInput, type PointPosition } from '../positions';
import { AV_PLANETS, type AvPlanet, type AvSigns } from '../strengths/ashtakavarga';
import type { BhavaRow } from '../strengths/bhavaBala';
import { computeBhavaBala, computeShadbala } from '../strengths/compute';
import { dignity9 } from '../strengths/dignity';
import { vimshopaka, type VimshopakaRow } from '../strengths/vimshopaka';
import { dashasAt } from '../transits/dashasAt';
import { transitKakshas, type KakshaRow } from '../transits/kaksha';
import { chandrabala, tarabala } from '../transits/tarabala';
import { vargaSign } from '../vargas';
import { signOf } from '../zodiac';
import { combustOf } from '../varshaphala/tajika';
import { baladiAvastha, type Avastha } from './avastha';
import { MUHURTA_ACTIVITIES, panchangThermometer, thermometerYoga, type MuhurtaActivity, type ThermometerInputs } from './thermometer';

/** The vargas PL9's Muhurta pages draw besides the chart. */
export const MUHURTA_VARGAS = ['D9', 'D10', 'D16', 'D24', 'D60'] as const;
export type MuhurtaVarga = (typeof MUHURTA_VARGAS)[number];

export interface MuhurtaPlanet {
  /** PL9's dignity in nine steps (1 exalted … 9 debilitated). */
  dignity: number;
  retrograde: boolean;
  combust: boolean;
  avastha: Avastha;
  vimshopaka: VimshopakaRow['scores'];
  /** The Shadbala over its minimum, and the planets' order by it (1 the strongest); null without the Lagna. */
  shadbalaRatio: number | null;
  shadbalaRank: number | null;
  /** How many of the six balas reach their minimums (PL9's "SB#"); null without the Lagna. */
  shadbalaStrong: number | null;
}

export interface Muhurta {
  at: ChartInput;
  points: Partial<Record<'lagna' | Planet9, PointPosition>>;
  planets: Record<Planet9, MuhurtaPlanet>;
  /** The sign (Aries 0) of the Lagna and the nine planets in each varga drawn. */
  vargas: Record<MuhurtaVarga, Partial<Record<'lagna' | Planet9, number>>>;
  /** The kakshas of the Muhurta's planets in the native's Ashtakavarga; null without the natal Lagna. */
  kakshas: Record<AvPlanet, KakshaRow> | null;
  /** PL9's "Gochara data": from the native's Moon, the panchanga of the instant and the native's dashas running. */
  gochara: {
    tarabala: ReturnType<typeof tarabala>;
    chandrabala: ReturnType<typeof chandrabala>;
    tithi: PanchangaElement;
    karana: PanchangaElement;
    yoga: PanchangaElement;
    nakshatra: PanchangaElement;
    dashas: ReturnType<typeof dashasAt>;
  };
  /** The Muhurta chart's own Vimshottari, four levels, from its first mahadasha. */
  muhurtaDasha: DashaPeriod[];
  /** The Bhava Bala of the Muhurta chart, house 1 first; null without the Lagna. */
  bhavaBala: BhavaRow[] | null;
  thermometer: { activity: MuhurtaActivity; inputs: ThermometerInputs; score: number; level: number };
  /** The nakshatra and tithi PL9's "Nakshatra & Tithi Activities" texts are about (the texts are not given). */
  activities: { nakshatra: number; tithi: number };
  missing: { what: string; reason: string }[];
  fidelity: Fidelity;
}

export interface MuhurtaOptions extends Partial<CoreOptions> {
  activity?: MuhurtaActivity;
}

/**
 * PL9's evaluation of an instant ("Muhurta", "Muhurta - dashas and balas", "Muhurta vargas") for a native: see
 * docs/spec/time/muhurta.md. `at.utcOffsetHours` is the clock of the place, which gives the weekday.
 */
export function computeMuhurta(eph: Ephemeris, natal: ChartInput, at: ChartInput, options: MuhurtaOptions = {}): Muhurta {
  const { activity = MUHURTA_ACTIVITIES[0], ...coreOptions } = options;
  const fidelity = resolveOptions(coreOptions).fidelity;
  const now = computePositions(eph, at, coreOptions);
  const birth = computePositions(eph, natal, coreOptions);
  const missing: Muhurta['missing'] = [];
  const longitude = Object.fromEntries(PLANETS_9.map((p) => [p, now.points[p].longitude])) as Record<Planet9, number>;
  const lagna = now.points.lagna;
  if (!lagna) missing.push({ what: 'lagna', reason: 'Muhurta Lagna not defined' }, { what: 'shadbala', reason: 'Muhurta Lagna not defined' }, { what: 'bhava bala', reason: 'Muhurta Lagna not defined' });
  const sb = lagna ? computeShadbala(eph, at, {}, coreOptions) : null;
  const vim = vimshopaka(longitude, fidelity);
  const planets = Object.fromEntries(PLANETS_9.map((p) => [p, {
    dignity: dignity9(p, longitude), retrograde: (now.points[p].longitudeSpeed ?? 0) < 0,
    combust: combustOf(p, longitude[p], longitude.sun, now.points[p].longitudeSpeed ?? 0), avastha: baladiAvastha(longitude[p]), vimshopaka: vim.planets[p].scores,
    shadbalaRatio: sb && p in sb.planets ? sb.planets[p as AvPlanet].ratio : null, shadbalaRank: sb && p in sb.planets ? sb.planets[p as AvPlanet].rank : null,
    shadbalaStrong: sb && p in sb.planets ? sb.planets[p as AvPlanet].strong : null,
  }])) as Record<Planet9, MuhurtaPlanet>;
  const vargas = Object.fromEntries(MUHURTA_VARGAS.map((v) => [v, Object.fromEntries(
    [...(lagna ? [['lagna', lagna.longitude] as const] : []), ...PLANETS_9.map((p) => [p, longitude[p]] as const)].map(([k, l]) => [k, vargaSign(l, v, fidelity)]),
  )])) as Muhurta['vargas'];
  const natalLagna = birth.points.lagna;
  if (!natalLagna) missing.push({ what: 'kakshas', reason: 'natal Lagna not defined' });
  const kakshas = natalLagna
    ? transitKakshas({ ...Object.fromEntries(AV_PLANETS.map((p) => [p, signOf(birth.points[p].longitude)])), lagna: signOf(natalLagna.longitude) } as AvSigns,
      Object.fromEntries(AV_PLANETS.map((p) => [p, longitude[p]])) as Record<AvPlanet, number>, {}, fidelity)
    : null;
  const panchanga = computePanchanga(eph, at, coreOptions).now;
  const gochara = {
    tarabala: tarabala(birth.points.moon.longitude, longitude.moon), chandrabala: chandrabala(birth.points.moon.longitude, longitude.moon),
    tithi: panchanga.tithi, karana: panchanga.karana, yoga: panchanga.yoga, nakshatra: panchanga.nakshatra,
    // Before the birth PL9 prints each level's first lord (as for the transits).
    dashas: dashasAt(eph, natal, at.jdUt, coreOptions),
  };
  const weekday = ((Math.floor(at.jdUt + 0.5 + (at.utcOffsetHours ?? 0) / 24) + 1) % 7) + 1;
  const inputs: ThermometerInputs = {
    tarabala: gochara.tarabala.count, chandrabala: gochara.chandrabala.house, karana: panchanga.karana.index,
    yoga: thermometerYoga(longitude.sun, longitude.moon, now.ayanamshaDegrees), nakshatra: panchanga.nakshatra.index, weekday, tithi: panchanga.tithi.index,
  };
  return {
    at, points: { ...(lagna ? { lagna } : {}), ...Object.fromEntries(PLANETS_9.map((p) => [p, now.points[p]])) }, planets, vargas, kakshas, gochara,
    muhurtaDasha: computeDashas(eph, at, { system: 'vimshottari', levels: 4 }, coreOptions).periods,
    bhavaBala: lagna ? computeBhavaBala(eph, at, {}, coreOptions).houses : null,
    thermometer: { activity, inputs, ...panchangThermometer(inputs, activity) },
    activities: { nakshatra: panchanga.nakshatra.index, tithi: panchanga.tithi.index },
    missing, fidelity,
  };
}
