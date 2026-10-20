import { julianDayUt } from '@reverse/ephemeris/time';
import { InvalidInputError } from './errors';
import type { ChartInput } from './positions';

function checked(jdUt: number, latitude: number, longitudeEast: number, utcOffsetHours?: number): ChartInput {
  if (!Number.isFinite(jdUt)) throw new InvalidInputError('the instant is not a finite number');
  if (!Number.isFinite(latitude) || Math.abs(latitude) > 90) throw new InvalidInputError('latitude must be between -90 and 90');
  if (!Number.isFinite(longitudeEast) || Math.abs(longitudeEast) > 180) throw new InvalidInputError('longitude must be between -180 and 180');
  if (utcOffsetHours !== undefined && (!Number.isFinite(utcOffsetHours) || Math.abs(utcOffsetHours) > 24)) throw new InvalidInputError('the clock offset must be between -24 and 24 hours');
  const base = { jdUt, latitude, longitudeEast: longitudeEast === 0 ? 0 : longitudeEast };
  return utcOffsetHours === undefined || utcOffsetHours === 0 ? base : { ...base, utcOffsetHours };
}

function utcToJulianDay(text: unknown): number {
  const m = typeof text === 'string' ? /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d+)?)Z$/.exec(text) : null;
  if (!m) throw new InvalidInputError('"utc" must look like 2000-01-01T12:00:00Z');
  const [y, mo, d, h, mi, s] = m.slice(1).map(Number) as [number, number, number, number, number, number];
  const probe = new Date(Date.UTC(y, mo - 1, d));
  if (probe.getUTCFullYear() !== y || probe.getUTCMonth() !== mo - 1 || probe.getUTCDate() !== d || h > 23 || mi > 59 || s >= 60) {
    throw new InvalidInputError(`"${text}" is not a real date and time`);
  }
  return julianDayUt(y, mo, d, h + mi / 60 + s / 3600);
}

/**
 * A birth (or any instant and place) as given by a caller: exactly one of `jdUt` (Julian day UT) and `utc`
 * ("2000-01-01T12:00:00Z"), the latitude, the longitude east and, optionally, the clock's offset from UT in hours.
 * Unknown fields are refused, so a misspelt one is never silently ignored.
 */
export function parseChartInput(value: unknown): ChartInput {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new InvalidInputError('the birth must be one JSON object');
  const o = value as Record<string, unknown>;
  const unknown = Object.keys(o).filter((k) => !['jdUt', 'utc', 'latitude', 'longitudeEast', 'utcOffsetHours'].includes(k));
  if (unknown.length) throw new InvalidInputError(`unknown field "${unknown[0]}"`);
  if (('jdUt' in o) === ('utc' in o)) throw new InvalidInputError('give exactly one of "jdUt" and "utc"');
  for (const k of ['latitude', 'longitudeEast'] as const) if (typeof o[k] !== 'number') throw new InvalidInputError(`"${k}" must be a number`);
  if ('jdUt' in o && typeof o.jdUt !== 'number') throw new InvalidInputError('"jdUt" must be a number');
  if ('utcOffsetHours' in o && typeof o.utcOffsetHours !== 'number') throw new InvalidInputError('"utcOffsetHours" must be a number');
  const jdUt = 'jdUt' in o ? (o.jdUt as number) : utcToJulianDay(o.utc);
  return checked(jdUt, o.latitude as number, o.longitudeEast as number, o.utcOffsetHours as number | undefined);
}

/** `checked` for readers of other formats (the PL9 chart file): the same ranges, the same errors. */
export function chartInputOf(jdUt: number, latitude: number, longitudeEast: number, utcOffsetHours?: number): ChartInput {
  return checked(jdUt, latitude, longitudeEast, utcOffsetHours);
}
