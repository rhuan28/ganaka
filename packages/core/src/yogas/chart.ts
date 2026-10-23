import type { Fidelity } from '../fidelity';
import type { Planet9 } from '../jaimini';
import { dignity9, type Planet7 } from '../strengths/dignity';
import { DASHAVARGA, goodVargas } from '../planetInfo/columns';
import { vargaSign } from '../vargas';
import { combustInTable } from '../varshaphala/tajika';
import { charaKarakas, type KarakaPlanet } from '../karakas';
import { norm360 } from '../zodiac';
import { aspectsFully, houseFrom, NINE, signOf } from './primitives';
import { yogaNatures, type Nature, type YogaNatureOptions } from './natures';

export interface YogaChartOptions extends YogaNatureOptions {
  /** The native's sex, which a few yogas depend on. PL9's chart files default to male. */
  sex?: 'male' | 'female';
}

/** One chart a yoga reads, the birth chart or its navamsa: the signs, the dignities and the Lagna's sign. */
export interface YogaVarga {
  signs: Record<Planet9, number>;
  /** The nine-level dignity (1 exalted … 9 debilitated), in this chart. */
  dignity: Record<Planet9, number>;
  /** Null where the Lagna is not defined (beyond the polar circle). */
  lagnaSign: number | null;
}

/** What a yoga reads of a chart. */
export interface YogaChart extends YogaVarga {
  longitudes: Record<Planet9, number>;
  lagnaLongitude: number | null;
  navamsa: YogaVarga;
  /** Benefic, malefic or neutral, as the yogas take them (natural, or functional with the option); null when the
   * functional nature is asked for and there is no Lagna. */
  natures: Record<Planet9, Nature> | null;
  /** The Shadbala over its required minimum, Sun to Saturn; null when it cannot be computed. */
  shadbalaRatio: Record<Planet7, number> | null;
  sex: 'male' | 'female';
  /** Combust as PL9's planet tables mark it (the Moon within 12° of the Sun). */
  combust: Record<Planet9, boolean>;
  /** The Chaturthamsha (D4): the longitude of each planet in it (sign × 30 + degrees) and its sign. */
  d4: { longitudes: Record<Planet9, number>; signs: Record<Planet9, number> };
  /** The Atmakaraka by seven karakas (PL9's default), and the Karakamsha, its sign in the navamsa. */
  atmakaraka: Planet9;
  karakamsha: number;
  /** The chara karakas by rank (seven, PL9's default), the Atmakaraka first. */
  karakas: Planet9[];
  /** Gulika's sign; null where it is not defined. */
  gulikaSign: number | null;
  /**
   * The varga dignity: in how many of the Dashavarga each planet is in its own or its exaltation sign (5 Simhasana,
   * 6 Paravata ... 10 Vaisheshika), as docs/spec/planet-info.md counts it.
   */
  vargaDignity: Record<Planet9, number>;
}

export interface Yoga {
  /** Our stable name of the yoga. */
  id: string;
  family: string;
  present: boolean;
  /** The planets that form it, and the houses (from the Lagna) they are in; empty when absent or unknown. */
  planets: Planet9[];
  houses: number[];
}

export interface MissingYoga { id: string; reason: string }
export interface YogaResult { yogas: Yoga[]; missing: MissingYoga[] }

/** The yoga chart of sidereal longitudes (the Lagna optional) and the Shadbala ratios. */
export function yogaChartFrom(longitudes: Record<Planet9, number> & { lagna?: number }, shadbalaRatio: Record<Planet7, number> | null,
  options: YogaChartOptions = {}, fidelity: Fidelity = 'pl9', speeds: Partial<Record<Planet9, number>> = {}, gulika: number | null = null): YogaChart {
  const { lagna, ...planets } = longitudes;
  const signs = Object.fromEntries(NINE.map((p) => [p, signOf(planets[p])])) as Record<Planet9, number>;
  const inNavamsa = (l: number) => vargaSign(l, 'D9', fidelity) * 30 + (((l * 9) % 30) + 30) % 30;
  const nav = Object.fromEntries(NINE.map((p) => [p, inNavamsa(planets[p])])) as Record<Planet9, number>;
  const inD4 = (l: number) => vargaSign(l, 'D4', fidelity) * 30 + (((l * 4) % 30) + 30) % 30;
  const d4 = Object.fromEntries(NINE.map((p) => [p, inD4(planets[p])])) as Record<Planet9, number>;
  const karakas = charaKarakas(planets as Record<KarakaPlanet, number>, 7).map((k) => k.planet as Planet9);
  const atmakaraka = karakas[0]!;
  return {
    longitudes: planets, signs, lagnaSign: lagna === undefined ? null : signOf(lagna), lagnaLongitude: lagna ?? null,
    dignity: Object.fromEntries(NINE.map((p) => [p, dignity9(p, planets)])) as Record<Planet9, number>,
    navamsa: {
      signs: Object.fromEntries(NINE.map((p) => [p, signOf(nav[p])])) as Record<Planet9, number>,
      dignity: Object.fromEntries(NINE.map((p) => [p, dignity9(p, nav)])) as Record<Planet9, number>,
      lagnaSign: lagna === undefined ? null : vargaSign(lagna, 'D9', fidelity),
    },
    natures: yogaNatures(longitudes, options), shadbalaRatio, sex: options.sex ?? 'male',
    combust: Object.fromEntries(NINE.map((p) => [p, combustInTable(p, planets[p], planets.sun, speeds[p] ?? 0)])) as Record<Planet9, boolean>,
    d4: { longitudes: d4, signs: Object.fromEntries(NINE.map((p) => [p, signOf(d4[p])])) as Record<Planet9, number> },
    atmakaraka, karakamsha: signOf(nav[atmakaraka]), karakas, gulikaSign: gulika === null ? null : signOf(gulika),
    vargaDignity: Object.fromEntries(NINE.map((p) => [p, goodVargas(p, planets[p], DASHAVARGA, fidelity)])) as Record<Planet9, number>,
  };
}

/** The house of a planet counted from the Lagna or from another planet's sign; null without the Lagna. */
export function houseOf(v: YogaVarga, planet: Planet9, from: 'lagna' | Planet9 = 'lagna'): number | null {
  const ref = from === 'lagna' ? v.lagnaSign : v.signs[from];
  return ref === null ? null : houseFrom(ref, v.signs[planet]);
}

/** Whether `by` casts a full sign aspect on `on`, in the given chart. */
export const aspectedBy = (v: YogaVarga, on: Planet9, by: Planet9): boolean => on !== by && aspectsFully(by, v.signs[by], v.signs[on]);

/** Birth by day: the Sun at least 180° ahead of the Lagna, above the horizon. Null without the Lagna. */
export const dayBirth = (ch: YogaChart): boolean | null =>
  ch.lagnaLongitude === null ? null : norm360(ch.longitudes.sun - ch.lagnaLongitude) >= 180;

/** The planets of a nature (none when the natures are unknown). */
export const ofNature = (ch: YogaChart, nature: Nature): Planet9[] => (ch.natures ? NINE.filter((p) => ch.natures![p] === nature) : []);
