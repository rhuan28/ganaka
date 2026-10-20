import { norm360 } from '../zodiac';

/** The thermometer's activities, in the order PL9 numbers them (the names from the marks of their nakshatras). */
export const MUHURTA_ACTIVITIES = ['general', 'travelling', 'marriage'] as const;
export type MuhurtaActivity = (typeof MUHURTA_ACTIVITIES)[number];

export interface ThermometerInputs {
  /** The Tarabala count, 1 to 9, of the Muhurta's Moon from the native's. */
  tarabala: number;
  /** The Chandrabala house, 1 to 12. */
  chandrabala: number;
  /** The karana, 1 to 60. */
  karana: number;
  /** The thermometer's yoga, 1 to 27 (thermometerYoga). */
  yoga: number;
  /** The Muhurta Moon's nakshatra, 1 to 27. */
  nakshatra: number;
  /** The weekday, 1 = Sunday. */
  weekday: number;
  /** The tithi, 1 to 30. */
  tithi: number;
}

// The marks, 1 (bad), 2 or 3 (good), read in PL9, indexed from 1.
const TARABALA = [1, 3, 1, 3, 1, 3, 1, 3, 3];
const BAD_KARANAS = [1, 8, 15, 22, 29, 36, 43, 50, 57, 58, 59, 60];
const BAD_YOGAS = [1, 6, 8, 9, 10, 13, 15, 17, 19];
const BAD_CHANDRABALA = [6, 8, 12];
const BY_ACTIVITY: Record<MuhurtaActivity, { nakshatra: number[]; weekday: number[]; tithi: number[] }> = {
  general: {
    nakshatra: [3, 1, 1, 3, 3, 1, 3, 3, 1, 1, 1, 3, 3, 3, 3, 3, 3, 1, 3, 1, 3, 3, 3, 3, 1, 3, 3],
    weekday: [1, 3, 1, 3, 3, 3, 1],
    tithi: [1, 3, 3, 1, 3, 1, 3, 3, 1, 3, 3, 1, 3, 1, 1, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1],
  },
  travelling: {
    nakshatra: [3, 1, 1, 2, 3, 1, 2, 3, 1, 1, 1, 2, 3, 2, 1, 1, 3, 1, 2, 1, 2, 3, 3, 2, 1, 1, 3],
    weekday: [1, 1, 1, 3, 3, 3, 1],
    tithi: [1, 3, 3, 1, 3, 1, 3, 1, 1, 3, 3, 1, 3, 1, 1, 1, 3, 3, 1, 3, 1, 3, 1, 1, 3, 3, 1, 3, 1, 1],
  },
  marriage: {
    nakshatra: [1, 1, 1, 3, 3, 1, 1, 1, 1, 2, 1, 3, 3, 1, 3, 1, 3, 1, 2, 1, 3, 1, 1, 1, 1, 3, 3],
    weekday: [1, 3, 1, 3, 3, 3, 1],
    tithi: [1, 3, 3, 1, 3, 2, 3, 2, 1, 3, 3, 2, 3, 1, 2, 2, 3, 3, 1, 3, 2, 3, 2, 1, 1, 1, 1, 1, 1, 1],
  },
};

/**
 * PL9's Muhurta panchang thermometer (read in PL9): the marks of the Tarabala (weight 1), the karana, the yoga and the
 * Chandrabala (0.5 each), and, by activity, of the Moon's nakshatra (1), the weekday and the tithi (0.5 each). The
 * column is drawn filled to score / 13.5, the most the marks can give.
 */
export function panchangThermometer(i: ThermometerInputs, activity: MuhurtaActivity): { score: number; level: number } {
  const t = BY_ACTIVITY[activity];
  const mark = (table: number[], n: number) => table[n - 1]!;
  const bad = (set: number[], n: number) => (set.includes(n) ? 1 : 3);
  const score = mark(TARABALA, i.tarabala) + 0.5 * bad(BAD_KARANAS, i.karana) + 0.5 * bad(BAD_YOGAS, i.yoga) + 0.5 * bad(BAD_CHANDRABALA, i.chandrabala)
    + mark(t.nakshatra, i.nakshatra) + 0.5 * mark(t.weekday, i.weekday) + 0.5 * mark(t.tithi, i.tithi);
  return { score, level: score / 13.5 };
}

/**
 * The yoga PL9's thermometer reads: the tropical Sun and Moon plus 93°20′ (the Yogi point), in parts of 13°20′ (read
 * in PL9; the tropical longitudes from the printouts, where the sidereal ones would not give the 270 levels printed).
 */
export function thermometerYoga(siderealSun: number, siderealMoon: number, ayanamsha: number): number {
  return Math.min(26, Math.floor(norm360(siderealSun + siderealMoon + 2 * ayanamsha + 93 + 1 / 3) / (40 / 3))) + 1;
}
