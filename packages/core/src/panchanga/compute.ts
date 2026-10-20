import type { Ephemeris } from '@reverse/ephemeris';
import { ayanamshaFrame } from '../ayanamsha';
import type { Fidelity } from '../fidelity';
import { LagnaUndefinedError, pl9LocalSiderealTime } from '../lagna';
import { resolveOptions, type CoreOptions } from '../options';
import { computePositions, type ChartInput } from '../positions';
import { shadbalaDay } from '../strengths/shadbala/day';
import { SunriseUndefinedError } from '../sunrise';
import { nakshatraOf, signOf } from '../zodiac';
import { lunarDate, vikramSamvat, type LunarDate } from './calendar';
import { KARANAS, TITHIS, YOGAS, karanaName, karanaOf, tithiOf, yogaOf } from './elements';
import { elementEnd, elementStart, type PanchangaKind } from './ends';
import { panchangaDay } from './sunrise';
import * as T from './tables';

export interface PanchangaElement {
  /** 1-based: tithi 1–30, karana 1–60, yoga and nakshatra 1–27. */
  index: number;
  name: string;
  /** When it ends, Julian day UT. */
  endJdUt: number;
}

export interface PanchangaAt {
  tithi: PanchangaElement;
  karana: PanchangaElement;
  yoga: PanchangaElement;
  nakshatra: PanchangaElement;
}

/** Where the Sun does not rise (beyond the polar circle, or a search that finds no sunrise), what needs it is null. */
export interface PanchangaMissing {
  what: 'sunrise';
  reason: 'beyondPolarCircle' | 'sunriseNotFound';
}

export interface Panchanga {
  /** The instant and place, and the clock of the place (hours ahead of UT) for the weekday. */
  at: ChartInput;
  /** The sunrise before the instant, the sunset after it and the next sunrise, as PL9's panchanga prints them. */
  sunrise: number | null;
  sunset: number | null;
  nextSunrise: number | null;
  /** The elements at the instant, and at the sunrise with when each ends. */
  now: Omit<PanchangaAt, never>;
  atSunrise: PanchangaAt | null;
  /** The day of the week of the sunrise before the instant, 0 = Sunday (the Vedic day runs from sunrise). */
  vara: number | null;
  paksha: 'shukla' | 'krishna';
  /** What could not be found here; the fields that need it are null. */
  missing: PanchangaMissing[];
  fidelity: Fidelity;
}

const sunMoon = (eph: Ephemeris, jdUt: number, coreOptions?: Partial<CoreOptions>) => {
  const p = computePositions(eph, { jdUt, latitude: 0, longitudeEast: 0 }, coreOptions).points;
  return { sun: p.sun.longitude, moon: p.moon.longitude };
};

function elementsAt(eph: Ephemeris, jdUt: number, searchFrom: number, coreOptions?: Partial<CoreOptions>): PanchangaAt {
  const { sun, moon } = sunMoon(eph, jdUt, coreOptions);
  const end = (kind: PanchangaKind) => elementEnd(eph, kind, searchFrom, coreOptions);
  const t = tithiOf(sun, moon), k = karanaOf(sun, moon), y = yogaOf(sun, moon), n = nakshatraOf(moon) + 1;
  return {
    tithi: { index: t, name: TITHIS[t - 1]!, endJdUt: end('tithi') },
    karana: { index: k, name: karanaName(k), endJdUt: end('karana') },
    yoga: { index: y, name: YOGAS[y - 1]!, endJdUt: end('yoga') },
    nakshatra: { index: n, name: T.BIRTH_NAKSHATRAS[n - 1]!, endJdUt: end('nakshatra') },
  };
}

/**
 * The panchanga of an instant and place: the sunrise before it, the sunset and the next sunrise (PL9's panchanga
 * search), the tithi, karana, yoga and nakshatra at the instant and at the sunrise with their ends, the Vedic weekday
 * and the fortnight. The ends are searched from the sunrise of the Shadbala, as PL9 does. See docs/spec/tempo/panchanga.md.
 */
export function computePanchanga(eph: Ephemeris, at: ChartInput, coreOptions?: Partial<CoreOptions>): Panchanga {
  const core = resolveOptions(coreOptions);
  const frame = ayanamshaFrame(eph, core.ayanamsha, core.ayanamshaOffsetDegrees, core.fidelity);
  const now = elementsAt(eph, at.jdUt, at.jdUt, coreOptions);
  const paksha = now.tithi.index <= 15 ? 'shukla' : 'krishna';
  let day, searchFrom;
  try {
    day = panchangaDay(eph, at.jdUt, at.latitude, at.longitudeEast, coreOptions);
    searchFrom = shadbalaDay(eph, at.jdUt, at.latitude, at.longitudeEast, frame, sunMoon(eph, at.jdUt, coreOptions).sun).sunrise;
  } catch (e) {
    if (!(e instanceof SunriseUndefinedError || e instanceof LagnaUndefinedError)) throw e;
    const missing: PanchangaMissing[] = [{ what: 'sunrise', reason: e instanceof LagnaUndefinedError ? 'beyondPolarCircle' : 'sunriseNotFound' }];
    return { at, sunrise: null, sunset: null, nextSunrise: null, now, atSunrise: null, vara: null, paksha, missing, fidelity: core.fidelity };
  }
  const atSunrise = elementsAt(eph, searchFrom, searchFrom, coreOptions);
  // The Vedic weekday: the day of the instant in the local mean time of the place (its longitude), the day before
  // when the instant is before that day's sunrise. From the data: it gives 118 of PL9's 135 birth weekdays; PL9's
  // own rule was not found (docs/spec/tempo/panchanga.md).
  const lmt = at.longitudeEast / 360;
  const sameDay = Math.floor(at.jdUt + lmt + 0.5) === Math.floor(day.sunrise + lmt + 0.5);
  const vara = ((Math.floor(at.jdUt + lmt + 0.5) - (sameDay ? 0 : 1) + 1) % 7 + 7) % 7;
  return { at, sunrise: day.sunrise, sunset: day.sunset, nextSunrise: day.nextSunrise, now, atSunrise, vara, paksha, missing: [], fidelity: core.fidelity };
}

/** The six seasons by the tropical sign of the Sun, from Aries: two signs each. */
const SEASONS = ['Vasant', 'Grishma', 'Grishma', 'Varsha', 'Varsha', 'Sharat', 'Sharat', 'Hemant', 'Hemant', 'Shishir', 'Shishir', 'Vasant'];
/** The Rashi Paya by the house of the Moon from the Lagna. */
const PAYA_BY_HOUSE = ['Gold', 'Silver', 'Copper', 'Iron', 'Silver', 'Gold', 'Copper', 'Iron', 'Silver', 'Copper', 'Gold', 'Iron'];
/** The Vashya by the Moon's sign; Sagittarius and Capricorn change at 15 degrees. */
const VASHYA = ['Chatushpada', 'Chatushpada', 'Manava', 'Jalachara', 'Vanachara', 'Manava', 'Manava', 'Keeta', ['Manava', 'Chatushpada'], ['Chatushpada', 'Jalachara'], 'Manava', 'Jalachara'] as const;

export interface BirthPanchanga extends Panchanga {
  /** Ghatis from the sunrise to the birth (null where the Sun does not rise). */
  ishtkaalDays: number | null;
  /** When the Moon entered and leaves its nakshatra; the Bhayat (birth − entry) and Bhabhog (exit − entry). */
  moonNakEntry: number;
  moonNakExit: number;
  /** Hours: the longitude's correction to local mean time, the local mean time, and the sidereal time (not wrapped). */
  lmtCorrectionHours: number;
  lmtHours: number;
  siderealTimeHours: number;
  season: string;
  ayana: 'Uttarayan' | 'Dakshinayan';
  gola: 'Uttar' | 'Dakshin';
  /** The Chaitradi system names the month the purnimanta way; the Kartikadi system, the amanta way. */
  chaitradi: LunarDate & { samvat: number };
  kartikadi: LunarDate & { samvat: number };
  saka: number;
  avakhada: Record<string, string | null>;
  ghat: Record<string, string | null>;
}

/**
 * The panchanga PL9 prints for a birth ("Panchanga Details", "Basic Calculations"). The names of the tables come from
 * PL9's printouts; see docs/spec/tempo/panchanga.md.
 */
export function computeBirthPanchanga(eph: Ephemeris, natal: ChartInput, coreOptions?: Partial<CoreOptions>): BirthPanchanga {
  const p = computePanchanga(eph, natal, coreOptions);
  const pos = computePositions(eph, natal, coreOptions);
  const moon = pos.points.moon.longitude;
  const lagna = pos.points.lagna?.longitude;
  const tropicalSun = (pos.points.sun.longitude + pos.ayanamshaDegrees + 360) % 360;
  const moonSign = signOf(moon), nak = nakshatraOf(moon), pada = Math.floor(moon / (10 / 3));
  const year = new Date((natal.jdUt + (natal.utcOffsetHours ?? 0) / 24 - 2440587.5) * 86400000).getUTCFullYear();
  const amanta = lunarDate(eph, natal.jdUt, 'shukladi', coreOptions);
  const purnimanta = lunarDate(eph, natal.jdUt, 'krishnadi', coreOptions);
  const civilMonth = new Date((natal.jdUt + (natal.utcOffsetHours ?? 0) / 24 - 2440587.5) * 86400000).getUTCMonth();
  const chaitradiYear = vikramSamvat(year, civilMonth + 1, purnimanta, p.now.tithi.index, 'chaitradi');
  const vashya = VASHYA[moonSign]!;
  const lmtCorrectionHours = natal.longitudeEast / 15 - (natal.utcOffsetHours ?? 0);
  const ut = ((natal.jdUt + 0.5) % 1) * 24;
  return {
    ...p,
    ishtkaalDays: p.sunrise === null ? null : natal.jdUt - p.sunrise,
    moonNakEntry: elementStart(eph, 'nakshatra', natal.jdUt, coreOptions),
    moonNakExit: elementEnd(eph, 'nakshatra', natal.jdUt, coreOptions),
    lmtCorrectionHours,
    lmtHours: (((ut + (natal.utcOffsetHours ?? 0) + lmtCorrectionHours) % 24) + 24) % 24,
    siderealTimeHours: pl9LocalSiderealTime(natal.jdUt, 0) / 15 + natal.longitudeEast / 15,
    season: SEASONS[signOf(tropicalSun)]!,
    ayana: tropicalSun >= 270 || tropicalSun < 90 ? 'Uttarayan' : 'Dakshinayan',
    gola: tropicalSun < 180 ? 'Uttar' : 'Dakshin',
    chaitradi: { ...purnimanta, samvat: chaitradiYear },
    kartikadi: { ...amanta, samvat: vikramSamvat(year, civilMonth + 1, amanta, p.now.tithi.index, 'kartikadi') },
    saka: chaitradiYear - 135,
    avakhada: {
      varna: T.BY_SIGN_VARNA[moonSign]!, vashya: typeof vashya === 'string' ? vashya : vashya[moon - moonSign * 30 < 15 ? 0 : 1],
      yoni: T.BY_NAKSHATRA_YONI[nak]!, gana: T.BY_NAKSHATRA_GANA[nak]!, nadi: T.BY_NAKSHATRA_NADI[nak]!, yunja: T.BY_NAKSHATRA_YUNJA[nak]!,
      tatva: T.BY_SIGN_TATVA[moonSign]!, rashish: T.BY_SIGN_RASHISH[moonSign]!, naamakshar: T.BY_PADA_NAAMAKSHAR[pada]!, varga: T.BY_PADA_VARGA[pada]!,
      nakshatraPaya: T.BY_NAKSHATRA_NAKSHATRAPAYA[nak]!,
      rashiPaya: lagna === undefined ? null : PAYA_BY_HOUSE[(moonSign - signOf(lagna) + 12) % 12]!,
    },
    ghat: {
      month: T.GHAT_MONTH[moonSign]!, tithi: T.GHAT_TITHI[moonSign]!, day: T.GHAT_DAY[moonSign]!, nakshatra: T.GHAT_NAKSHATRA[moonSign]!,
      yoga: T.GHAT_YOGA[moonSign]!, karana: T.GHAT_KARANA[moonSign]!, prahar: T.GHAT_PRAHAR[moonSign]!, chandra: T.GHAT_CHANDRA[moonSign]!,
    },
  };
}

/** Ghatis, vighatis and palas of a length of time in days, each truncated, the ghatis not wrapped: "62:14:45". Read in PL9. */
export function ghatis(days: number): string {
  let v = days * 60;
  const g = Math.floor(v); v = (v - g) * 60;
  const vg = Math.floor(v);
  const p = Math.floor((v - vg) * 60);
  return `${g}:${vg}:${p}`;
}

/** The local clock time of an instant, to the nearest second, "06:59:04". Read in PL9. */
export function clockTime(jdUt: number, utcOffsetHours = 0): string {
  let s = Math.floor((((jdUt + 0.5 + utcOffsetHours / 24) % 1) + 1) % 1 * 86400 + 0.5) % 86400;
  const h = Math.floor(s / 3600); s -= h * 3600;
  const two = (n: number) => String(n).padStart(2, '0');
  return `${two(h)}:${two(Math.floor(s / 60))}:${two(s % 60)}`;
}

export { KARANAS };
