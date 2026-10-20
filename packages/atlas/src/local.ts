import type { TzDatabase } from './tz';

export interface LocalDateTime { year: number; month: number; day: number; hour: number; minute: number; second: number }
export interface LocalReading { jdUt: number; utcOffsetHours: number; dstHours: number; abbreviation: string }
export interface LocalResolution {
  /** 'ok': one reading; 'ambiguous': the hour repeated when the clocks go back, both readings, the earlier first;
   *  'nonexistent': the hour skipped when they go forward, no reading. */
  status: 'ok' | 'ambiguous' | 'nonexistent';
  readings: LocalReading[];
  /** For a skipped hour, the offsets (hours) before and after the jump. */
  gap?: { before: number; after: number };
}

const toJd = (seconds: number) => seconds / 86400 + 2440587.5;

/**
 * A local date and time at a zone: each offset in force a day before or a day after is tried, and kept when the
 * instant it gives has that same offset. Never chooses between two readings: the caller (and the astrologer) does.
 */
export function resolveLocal(tz: TzDatabase, zone: string, local: LocalDateTime): LocalResolution {
  // setUTCFullYear, not Date.UTC, which reads the years 0 to 99 as 1900 to 1999.
  const d = new Date(0);
  d.setUTCFullYear(local.year, local.month - 1, local.day);
  d.setUTCHours(local.hour, local.minute, local.second, 0);
  const l = d.getTime() / 1000;
  const before = tz.offsetAtUt(zone, toJd(l - 86400)).utcOffsetSeconds;
  const after = tz.offsetAtUt(zone, toJd(l + 86400)).utcOffsetSeconds;
  const readings: LocalReading[] = [];
  for (const o of new Set([before, after])) {
    const t = l - o;
    const at = tz.offsetAtUt(zone, toJd(t));
    if (at.utcOffsetSeconds === o) readings.push({ jdUt: toJd(t), utcOffsetHours: o / 3600, dstHours: at.dstSeconds / 3600, abbreviation: at.abbreviation });
  }
  readings.sort((a, b) => a.jdUt - b.jdUt);
  if (!readings.length) return { status: 'nonexistent', readings, gap: { before: before / 3600, after: after / 3600 } };
  return { status: readings.length > 1 ? 'ambiguous' : 'ok', readings };
}
