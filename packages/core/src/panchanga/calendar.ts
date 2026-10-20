import type { Ephemeris } from '@reverse/ephemeris';
import type { CoreOptions } from '../options';
import { computePositions } from '../positions';
import { signOf } from '../zodiac';

/**
 * The twelve lunar months as PL9 prints them, from Chaitra; an intercalary month takes "Adhik " before its name, or
 * "First " in 'krishnadiHalf' (from the printouts).
 */
export const LUNAR_MONTHS: readonly string[] = ['Chaitra', 'Vaishaka', 'Jyeshtha', 'Ashaadh', 'Shravan', 'Bhadrapada', 'Aswini', 'Kartikka', 'Margshirsha', 'Pausha', 'Magha', 'Phalguna'];

/**
 * PL9's three ways of naming the month of a date ("Indian Calendar"): 'krishnadi' (purnimanta: a dark fortnight
 * belongs to the month of the next new Moon), 'shukladi' (amanta: to the month of the new Moon before it), and
 * 'krishnadiHalf' (purnimanta, with the intercalary test made on the new Moon before). Read in PL9.
 */
export type CalendarMode = 'krishnadi' | 'shukladi' | 'krishnadiHalf';

export interface LunarDate {
  /** 0 = Chaitra … 11 = Phalguna. */
  month: number;
  adhika: boolean;
  /** "Adhik Chaitra", as PL9 prints it. */
  name: string;
  /** The fortnight: bright (shukla) or dark (krishna). */
  paksha: 'shukla' | 'krishna';
}

const sunMoon = (eph: Ephemeris, jdUt: number, coreOptions?: Partial<CoreOptions>) => {
  const p = computePositions(eph, { jdUt, latitude: 0, longitudeEast: 0 }, coreOptions).points;
  return { sun: p.sun.longitude, moon: p.moon.longitude };
};
const elongation = (eph: Ephemeris, jdUt: number, coreOptions?: Partial<CoreOptions>) => {
  const { sun, moon } = sunMoon(eph, jdUt, coreOptions);
  return (((moon - sun) % 360) + 360) % 360;
};

/** The new Moon (elongation 0) before or after an instant: steps of a day, then halving to a second. */
export function newMoon(eph: Ephemeris, jdUt: number, direction: -1 | 1, coreOptions?: Partial<CoreOptions>): number {
  // Going back, the elongation falls to 0 from above; going forwards, it wraps from 360 to 0.
  let a = jdUt, ea = elongation(eph, a, coreOptions);
  for (let i = 0; i < 40; i++) {
    const b = a + direction, eb = elongation(eph, b, coreOptions);
    const wrapped = direction > 0 ? eb < ea : eb > ea;
    if (wrapped) {
      let lo = Math.min(a, b), hi = Math.max(a, b);
      for (let k = 0; k < 40; k++) { const m = (lo + hi) / 2; if (elongation(eph, m, coreOptions) > 180) lo = m; else hi = m; }
      return (lo + hi) / 2;
    }
    a = b; ea = eb;
  }
  throw new Error('no new Moon within forty days');
}

/** The month a new Moon starts: named by the Sun's sign at it, Pisces giving Chaitra. */
const monthAt = (eph: Ephemeris, nm: number, coreOptions?: Partial<CoreOptions>) => (signOf(sunMoon(eph, nm, coreOptions).sun) + 1) % 12;

/**
 * The lunar month of an instant. The month of a new Moon is the Sun's sign then (Pisces → Chaitra); two new Moons
 * with the Sun in one sign make the first intercalary (adhika). Read in PL9.
 */
export function lunarDate(eph: Ephemeris, jdUt: number, mode: CalendarMode = 'krishnadi', coreOptions?: Partial<CoreOptions>): LunarDate {
  const paksha = elongation(eph, jdUt, coreOptions) < 180 ? 'shukla' : 'krishna';
  const before = newMoon(eph, jdUt, -1, coreOptions);
  const after = newMoon(eph, jdUt, 1, coreOptions);
  // The new Moon that names the month: the one before, or for a dark fortnight in the purnimanta modes the next.
  const naming = paksha === 'krishna' && mode !== 'shukladi' ? after : before;
  const month = monthAt(eph, naming, coreOptions);
  // Intercalary (read in PL9): in 'krishnadi' and 'shukladi', when the amanta month that holds the date has its two
  // new Moons in one Sun sign (no sankranti); in 'krishnadiHalf', when the naming new Moon and the one before it do.
  const adhika = mode === 'krishnadiHalf'
    ? monthAt(eph, newMoon(eph, naming - 1, -1, coreOptions), coreOptions) === month
    : monthAt(eph, before, coreOptions) === monthAt(eph, after, coreOptions);
  return { month, adhika, name: `${adhika ? (mode === 'krishnadiHalf' ? 'First ' : 'Adhik ') : ''}${LUNAR_MONTHS[month]}`, paksha };
}

/**
 * The Vikram year of a date (read in PL9), from its civil year and month (1 to 12), its lunar month in the system's
 * way of naming and the tithi (1 to 30). Chaitradi (the year turns at Chaitra, months named purnimanta): the civil
 * year plus 57, plus 56 from January to May in Pausha, Magha or Phalguna, and in Chaitra while its dark fortnight
 * runs. Kartikadi (the year turns at Kartika, months named amanta): plus 56, plus 57 from July to December in Kartika
 * to Magha.
 */
export function vikramSamvat(civilYear: number, civilMonth: number, date: LunarDate, tithi: number, system: 'chaitradi' | 'kartikadi'): number {
  const m = date.month + 1;
  if (system === 'kartikadi') return civilYear + (civilMonth > 6 && m >= 8 && m <= 11 ? 57 : 56);
  if (civilMonth < 6 && m >= 10) return civilYear + 56;
  if (m === 1 && !date.adhika) return civilYear + (tithi < 16 ? 57 : 56);
  return civilYear + 57;
}
