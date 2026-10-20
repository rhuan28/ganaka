import type { Planet9 } from '../../jaimini';
import type { Fidelity } from '../../fidelity';
import type { Planet7 } from '../dignity';

/** PL9's five options of the Shadbala, on its Calculation tab. */
export interface ShadbalaOptions {
  /** "Drekkana Bala method": Parashara (male, neuter, female) or Hora Ratnam (male, female, neuter). */
  drekkana: 'parashara' | 'horaRatnam';
  /** "4th/10th house in Dig bala": the cusps, or the Lagna and 90 degrees from it. */
  digBala: 'cusps' | 'kendras';
  /** "Mercury's nature for Paksha Bala": a malefic with malefics, or always benefic. */
  mercuryPaksha: 'withMalefics' | 'benefic';
  /** "Mercury nature in Drig bala": the same choice, for the Drik Bala. */
  mercuryDrik: 'withMalefics' | 'benefic';
  /** "Jup & Merc in Drig bala": their aspects at full weight, or at a quarter as the others. */
  jupiterMercuryDrik: 'full' | 'quarter';
}

export const DEFAULT_SHADBALA_OPTIONS: ShadbalaOptions = Object.freeze({
  drekkana: 'parashara', digBala: 'cusps', mercuryPaksha: 'withMalefics', mercuryDrik: 'withMalefics', jupiterMercuryDrik: 'full',
}) as ShadbalaOptions;

/** What the Shadbala of a chart is computed from. */
export interface ShadbalaInputs {
  jdUt: number;
  longitudeEast: number;
  lagna: number;
  /** Sidereal longitudes of the nine grahas. */
  longitudes: Record<Planet9, number>;
  /** The middles of the twelve houses (Sripati), house 1 first. */
  cusps: number[];
  /** Ecliptic latitudes of Mars to Saturn, in degrees, for the planetary war. */
  latitudes: Partial<Record<Planet7, number>>;
  /** Declinations of the seven planets, in degrees. */
  declinations: Record<Planet7, number>;
  /** The sunrise PL9 assigns to the instant and the sunset after it, Julian days UT. */
  sunrise: number;
  sunset: number;
  /** Whether the Sun is below the horizon at the instant. */
  night: boolean;
  /** The Sun's tropical longitude, for its Ishta. */
  sunTropical: number;
  /** The mode: 'pl9' (the default) or 'corrected'. */
  fidelity?: Fidelity;
  /** The Cheshta Bala of Mars to Saturn, computed apart (it needs the ephemeris over months). */
  cheshta: Partial<Record<Planet7, number>>;
}

export interface ShadbalaRow {
  uchcha: number; saptavargaja: number; ojhayugma: number; kendradi: number; drekkana: number; sthana: number;
  dig: number;
  nathonnatha: number; paksha: number; tribhaga: number; varsha: number; masa: number; vara: number; hora: number; ayana: number; yuddha: number;
  kala: number;
  cheshta: number; naisargika: number; drik: number;
  /** The six balas added, in shashtiamshas (virupas), and in rupas. */
  total: number; rupas: number;
  minimum: number;
  /** The total over the minimum. */
  ratio: number;
  /** 1 for the planet with the greatest ratio. */
  rank: number;
  ishta: number; kashta: number;
  /** How many of the Sthana, Dig, Kala, Ayana and Cheshta pass their minimum. */
  strong: number;
}

export interface Shadbala {
  planets: Record<Planet7, ShadbalaRow>;
  war: { planets: [Planet7, Planet7]; winner: Planet7 }[];
}
