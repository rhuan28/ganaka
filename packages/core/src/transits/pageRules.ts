import type { Ephemeris } from '@reverse/ephemeris';
import { computeDashas } from '../dashas/compute';
import type { Planet9 } from '../jaimini';
import type { CoreOptions } from '../options';
import { computeSunriseChart } from '../panchanga/sunriseChart';
import type { ChartInput } from '../positions';
import { dashasAt } from './dashasAt';
import { monthEvents, type MonthEvent } from './monthEvents';

// How PL9's pages of the print's clock place their lists in time, from the printouts. Several of them read the
// clock's local time as if it were UT. See docs/spec/time/panchanga.md and docs/spec/time/transits.md.

/**
 * The Vimshottari of the sunrise chart (worksheet 8), two levels: `count` antardashas (16 by default: the 15 printed
 * and one more, for a list PL9 starts one row later), from the one running at the clock read as UT, or from the first
 * when the clock comes before it (a birth after the clock). Null where the birth's day has no sunrise.
 */
export function sunriseDashaRows(eph: Ephemeris, natal: ChartInput, at: { jdUt: number; utcOffsetHours: number }, count = 16, coreOptions?: Partial<CoreOptions>): { chain: [Planet9, Planet9]; startJdUt: number }[] | null {
  const sr = computeSunriseChart(eph, natal, coreOptions);
  if (!sr) return null;
  const rows = computeDashas(eph, { ...natal, jdUt: sr.jdUt }, { system: 'vimshottari', levels: 2, cycles: 4 }, coreOptions).periods
    .flatMap((md) => (md.sub ?? []).map((ad) => ({ chain: [md.lord, ad.lord] as [Planet9, Planet9], startJdUt: ad.start })));
  const clock = at.jdUt + at.utcOffsetHours / 24;
  const first = clock < (rows[0]?.startJdUt ?? -Infinity) ? 0 : Math.max(0, rows.findIndex((r, i) => r.startJdUt <= clock && (rows[i + 1]?.startJdUt ?? Infinity) > clock));
  return rows.slice(first, first + count);
}

/**
 * The events of a civil month in the place's clock (worksheet 104): `monthEvents` from the month's first local
 * midnight to the next month's, with the dasha changes listed from 0h UT of the first day.
 */
export function monthCalendar(eph: Ephemeris, natal: ChartInput, month: { year: number; month: number }, place: { utcOffsetHours: number }, coreOptions?: Partial<CoreOptions>): MonthEvent[] | null {
  const midnight = (y: number, m: number) => Date.UTC(y, m - 1, 1) / 86400000 + 2440587.5 - place.utcOffsetHours / 24;
  const from = midnight(month.year, month.month), to = midnight(month.year, month.month + 1);
  return monthEvents(eph, natal, from, to, coreOptions, { dashasFromJdUt: from + place.utcOffsetHours / 24 });
}

/** The four dashas of an event as the Events page shows them (worksheet 120): at the event's clock read as UT. */
export function eventDashas(eph: Ephemeris, natal: ChartInput, event: { jdUt: number; utcOffsetHours: number }, coreOptions?: Partial<CoreOptions>): ReturnType<typeof dashasAt> {
  return dashasAt(eph, natal, event.jdUt + event.utcOffsetHours / 24, coreOptions);
}
