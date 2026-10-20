import type { Ephemeris } from '@reverse/ephemeris';
import { ayanamshaFrame } from './ayanamsha';
import { HOUSE_SYSTEMS, houseCusps, houseOf, midheavenLongitude, type HouseSystem, type Houses } from './houses';
import { resolveOptions, type CoreOptions } from './options';
import { ALL_POINTS, computePositions, type ChartInput, type PointName, type Positions } from './positions';
import { VARGAS, vargaSign, type VargaName } from './vargas';
import { arudhaPadas, upapada } from './arudhas';
import { charaKarakas, type KarakaName, type KarakaPlanet } from './karakas';
import { PLANETS_9, houseFrom, jaiminiAspects, type Planet9 } from './jaimini';
import { LagnaUndefinedError } from './lagna';
import { induLagna, specialLagnas, type Planet7, type SpecialLagnas } from './specialLagnas';
import { SunriseUndefinedError } from './sunrise';

/** The points and charts of the Jaimini system, as PL9 gives them. See docs/spec/karakas.md and arudhas.md. */
export interface Jaimini {
  karakas: { seven: { name: KarakaName; planet: KarakaPlanet }[]; eight: { name: KarakaName; planet: KarakaPlanet }[] };
  /** Sign, 0 to 11, of the AK in the Navamsha; the AK is that of the karakas the option `karakas` chooses. */
  karakamsha: number;
  aspects: { movableFixed: [Planet9, Planet9][]; dual: Planet9[] };
  /** The padas of the twelve houses, the first house first, in the Rashi, Navamsha and Dashamsha. Absent without a Lagna. */
  arudhaPadas?: Record<'D1' | 'D9' | 'D10', number[]>;
  /** The pada of the first house without the exception, as PL9's special point. Absent without a Lagna. */
  arudhaLagna?: number;
  upapada?: number;
  induLagna?: number;
  /** Absent where the Lagna or the sunrise is not defined. */
  specialLagnas?: SpecialLagnas;
}

export interface Chart extends Positions {
  /** Sidereal longitude of the midheaven. */
  midheaven: number;
  /** Absent, with an entry in `missing`, where the Lagna is not defined. */
  houses?: Record<HouseSystem, Houses>;
  /** House, 1 to 12, of each point present, in each house system. Absent with `houses`. */
  pointHouses?: Record<HouseSystem, Partial<Record<PointName, number>>>;
  /** Sign, 0 to 11, of each point present, in each of the 45 vargas. */
  vargas: Record<VargaName, Partial<Record<PointName, number>>>;
  jaimini: Jaimini;
  /** House, 1 to 12, of each point present, counted from the sign of the Moon (Chandra lagna). */
  fromMoon: Partial<Record<PointName, number>>;
  /** House, 1 to 12, of each point present, counted from the sign of the Sun (Surya lagna). */
  fromSun: Partial<Record<PointName, number>>;
}

/** Positions, houses and vargas of a chart. */
export function computeChart(eph: Ephemeris, input: ChartInput, options?: Partial<CoreOptions>): Chart {
  const o = resolveOptions(options);
  const positions = computePositions(eph, input, o);
  const frame = ayanamshaFrame(eph, o.ayanamsha, o.ayanamshaOffsetDegrees, o.fidelity);
  const midheaven = midheavenLongitude(eph, input.jdUt, input.longitudeEast, frame.lagnaAyanamsha(input.jdUt), o.fidelity);
  const present = ALL_POINTS.filter((p) => positions.points[p] !== undefined);
  const perPoint = <T>(f: (longitude: number) => T) =>
    Object.fromEntries(present.map((p) => [p, f(positions.points[p]!.longitude)])) as Partial<Record<PointName, T>>;
  const missing = [...positions.missing];
  const lagna = positions.points.lagna;
  let houses: Record<HouseSystem, Houses> | undefined;
  let pointHouses: Record<HouseSystem, Partial<Record<PointName, number>>> | undefined;
  if (lagna) {
    const built = {} as Record<HouseSystem, Houses>;
    const placed = {} as Record<HouseSystem, Partial<Record<PointName, number>>>;
    for (const system of HOUSE_SYSTEMS) {
      built[system] = houseCusps(lagna.longitude, midheaven, system);
      placed[system] = perPoint((longitude) => houseOf(longitude, built[system]));
    }
    houses = built;
    pointHouses = placed;
  } else {
    missing.push({ what: 'houses', reason: 'beyondPolarCircle' });
  }
  const vargas = {} as Chart['vargas'];
  for (const v of VARGAS) vargas[v] = perPoint((longitude) => vargaSign(longitude, v, o.fidelity));

  const p = positions.points;
  const sign = (longitude: number) => Math.floor(longitude / 30);
  const karakaLongitudes = Object.fromEntries((['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'] as const).map((k) => [k, p[k].longitude])) as Record<KarakaPlanet, number>;
  const karakas = { seven: charaKarakas(karakaLongitudes, 7), eight: charaKarakas(karakaLongitudes, 8) };
  const ak = (o.karakas === 'eight' ? karakas.eight : karakas.seven)[0]!.planet;
  const jaimini: Jaimini = {
    karakas,
    karakamsha: vargaSign(p[ak].longitude, 'D9', o.fidelity),
    aspects: jaiminiAspects(Object.fromEntries(PLANETS_9.map((k) => [k, sign(p[k].longitude)])) as Record<Planet9, number>),
  };
  if (lagna) {
    const inVarga = (v: VargaName) => (planet: Planet7) => vargaSign(p[planet].longitude, v, o.fidelity);
    const padas = (v: VargaName) => arudhaPadas(vargaSign(lagna.longitude, v, o.fidelity), inVarga(v), o.bhavapada);
    const inRashi = (planet: Planet7) => sign(p[planet].longitude);
    jaimini.arudhaPadas = { D1: padas('D1'), D9: padas('D9'), D10: padas('D10') };
    jaimini.arudhaLagna = arudhaPadas(sign(lagna.longitude), inRashi, 'none')[0];
    jaimini.upapada = upapada(sign(lagna.longitude), inRashi);
    jaimini.induLagna = induLagna(sign(lagna.longitude), sign(p.moon.longitude));
    try {
      jaimini.specialLagnas = specialLagnas(eph, input.jdUt, input.latitude, input.longitudeEast, frame);
    } catch (e) {
      if (!(e instanceof SunriseUndefinedError || e instanceof LagnaUndefinedError)) throw e;
      missing.push({ what: 'specialLagnas', reason: 'sunriseNotFound' });
    }
  } else {
    missing.push({ what: 'arudhas', reason: 'beyondPolarCircle' }, { what: 'specialLagnas', reason: 'beyondPolarCircle' });
  }
  const from = (first: number) => perPoint((longitude) => houseFrom(sign(longitude), first));
  return {
    ...positions, missing, midheaven, ...(houses && pointHouses ? { houses, pointHouses } : {}), vargas, jaimini,
    fromMoon: from(sign(p.moon.longitude)), fromSun: from(sign(p.sun.longitude)),
  };
}
