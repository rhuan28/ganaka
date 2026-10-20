import type { Ephemeris } from '@reverse/ephemeris';
import { resolveOptions, type CoreOptions } from '../options';
import { ayanamshaFrame } from '../ayanamsha';
import { ephemerisInstant } from '../planets';
import { SunriseUndefinedError } from '../sunrise';
import { crossings } from '../transits/ingress';
import { lunarDate, vikramSamvat, type CalendarMode, type LunarDate } from './calendar';
import { computePanchanga, type PanchangaAt } from './compute';
import { elementEnd } from './ends';
import { TITHIS } from './elements';

export interface PanchangPlace {
  latitude: number;
  longitudeEast: number;
  /** Hours ahead of UT: the clock of the place, which sets the civil days. */
  utcOffsetHours: number;
}

export interface PanchangRow {
  /** The civil date of the row, in the clock of the place. */
  year: number;
  month: number;
  day: number;
  sunrise: number;
  sunset: number;
  nextSunrise: number;
  /** The weekday of the civil date, 0 = Sunday (in the 'pl9' mode, PL9's repeated one after a tithi past the next sunrise). */
  vara: number;
  /** The elements at the sunrise with their ends; the nakshatra's end found as in the transit tables. */
  atSunrise: PanchangaAt;
  /** A tithi that begins and ends between this sunrise and the next (a kshaya tithi): its number and end. */
  extraTithi: { index: number; name: string; endJdUt: number } | null;
}

export interface PanchangTable {
  /** The month, fortnight and years of the first sunrise, in the calendar mode of the table. */
  month: LunarDate;
  vikram: number;
  saka: number;
  /** The true ayanamsha (with the nutation) at the first sunrise, in degrees. */
  ayanamshaDegrees: number;
  rows: PanchangRow[];
}

/**
 * The table of PL9's Print -> Panchang: for each civil day from a date, at a place, the sunrise and sunset, the
 * elements at the sunrise with their ends and a tithi that falls wholly inside the day; and a header with the month
 * of the first sunrise in the calendar mode (Krishnadi and Krishnadi 1/2 count the Vikram year the Chaitradi way,
 * Shukladi the Kartikadi way) and the true ayanamsha. Where the Sun does not rise there is no table: it throws
 * SunriseUndefinedError. See docs/spec/time/panchanga.md.
 */
export function computePanchangTable(eph: Ephemeris, first: { year: number; month: number; day: number }, days: number, place: PanchangPlace, mode: CalendarMode = 'krishnadi', coreOptions?: Partial<CoreOptions>): PanchangTable {
  const core = resolveOptions(coreOptions);
  const rows: PanchangRow[] = [];
  for (let i = 0; i < days; i++) {
    const civil = new Date(Date.UTC(first.year, first.month - 1, first.day + i));
    const midnightUt = civil.getTime() / 86400000 + 2440587.5 - place.utcOffsetHours / 24;
    const p = computePanchanga(eph, { jdUt: midnightUt + 0.5, latitude: place.latitude, longitudeEast: place.longitudeEast, utcOffsetHours: place.utcOffsetHours }, coreOptions);
    if (p.sunrise === null || p.sunset === null || p.nextSunrise === null || p.atSunrise === null) throw new SunriseUndefinedError(midnightUt + 0.5, place.latitude);
    // The nakshatra's end in this table: the Moon every half day of universal time, the crossing placed by straight
    // lines between the samples (the transit tables' search), not the search of the birth page (from the printouts).
    const moonEnd = crossings(eph, p.sunrise, p.sunrise + 2, 40 / 3, coreOptions, ['moon'])[0]!.jdUt;
    const atSunrise = { ...p.atSunrise, nakshatra: { ...p.atSunrise.nakshatra, endJdUt: moonEnd } };
    const tithiEnd = atSunrise.tithi.endJdUt;
    let extraTithi: PanchangRow['extraTithi'] = null;
    if (tithiEnd < p.nextSunrise) {
      const end = elementEnd(eph, 'tithi', tithiEnd + 1e-6, coreOptions);
      const index = (atSunrise.tithi.index % 30) + 1;
      if (end < p.nextSunrise) extraTithi = { index, name: TITHIS[index - 1]!, endJdUt: end };
    }
    // PL9 repeats the weekday of the row above on the day after a tithi that runs past the next sunrise (from the
    // printouts); the 'corrected' mode gives the date's (docs/spec/corrections.md, correction 23).
    const above = rows[rows.length - 1];
    const repeated = core.fidelity === 'pl9' && above !== undefined && above.atSunrise.tithi.endJdUt >= above.nextSunrise;
    rows.push({ year: civil.getUTCFullYear(), month: civil.getUTCMonth() + 1, day: civil.getUTCDate(), sunrise: p.sunrise, sunset: p.sunset, nextSunrise: p.nextSunrise, vara: repeated ? above.vara : civil.getUTCDay(), atSunrise, extraTithi });
  }
  const start = rows[0]!;
  const month = lunarDate(eph, start.sunrise, mode, coreOptions);
  const tithi = start.atSunrise.tithi.index;
  const vikram = vikramSamvat(start.year, start.month, month, tithi, mode === 'shukladi' ? 'kartikadi' : 'chaitradi');
  const saka = vikramSamvat(start.year, start.month, lunarDate(eph, start.sunrise, 'krishnadi', coreOptions), tithi, 'chaitradi') - 135;
  const frame = ayanamshaFrame(eph, core.ayanamsha, core.ayanamshaOffsetDegrees, core.fidelity);
  const nutation = eph.obliquityAndNutation(ephemerisInstant(eph, start.sunrise, core.fidelity)).nutationLongitude;
  return { month, vikram, saka, ayanamshaDegrees: frame.sunAyanamsha(start.sunrise) + nutation, rows };
}
