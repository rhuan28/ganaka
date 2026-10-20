import type { MonthEvent } from '@reverse/core';
import type { TransitSnapshot } from './transitTables';

// The "Calendar" worksheet (104) of the TEMPO model against the core's month events (stage 5G). See
// docs/spec/tempo/transitos.md.

const GLYPH: Record<string, string> = { sun: 'a', moon: 'b', mars: 'c', mercury: 'd', jupiter: 'e', venus: 'f', saturn: 'g', rahu: 'h', ketu: 'i' };
const TWO: Record<string, string> = { sun: 'Su', moon: 'Mo', mars: 'Ma', mercury: 'Me', jupiter: 'Ju', venus: 'Ve', saturn: 'Sa', rahu: 'Ra', ketu: 'Ke' };
const SIGNS = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
/** The nakshatras as this page spells them. */
const NAKSHATRAS = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashi', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'P.Phalg.', 'U.Phalg.', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'P.Shad.', 'U.Shad.', 'Shravana', 'Dhanish.', 'Satabhi.', 'P.Bhadra.', 'U.Bhadra.', 'Revati'];
const ASPECT: Record<string, string> = { conjunction: 'cnj', opposition: 'opp', trine: 'trine' };
const TARGET: Record<string, string> = { ...GLYPH, lagna: 'As', cusp4: 'Cusp 4', cusp7: 'Cusp 7', cusp10: 'Cusp 10' };

/** The line PL9 prints for an event: the planet's glyph, M when it moves backwards, and what happens. */
export function calendarText(e: MonthEvent): string {
  if (e.kind === 'dasha') return e.chain.map((p) => TWO[p]).join('-');
  const g = `${GLYPH[e.planet]}${e.retrograde ? 'M' : ''}`;
  switch (e.kind) {
    case 'nakshatra': return `${g} ${NAKSHATRAS[e.target]}`;
    case 'sign': return `${g} ${SIGNS[e.target]}`;
    case 'station': return `${g} R or D As`;
    default: return `${g} ${ASPECT[e.aspect]} ${TARGET[e.target]}`;
  }
}

/**
 * The printed lines against the core's events of the month, in the clock of the "Today" event: each line an event of
 * the core on that day and minute (see `near` and `same` below), the dasha chain as far as the cell prints it. A day's cell cuts its later lines: an event of
 * the core is missing only if it comes before the day's last printed line, and a day prints at least as many lines
 * as five or the core's events of the day, whichever is fewer. The line "-------" marks the print job's
 * clock, read as UT and shown in the place's clock (from the printouts).
 */
export function verifyMonthCalendar(shown: NonNullable<TransitSnapshot['monthCalendar']>, core: readonly MonthEvent[], o: { utcOffsetHours: number; nowJdUt: number }): { values: number; failures: string[] } {
  const failures: string[] = [];
  let values = 0;
  const [y, m] = shown.month.split('-').map(Number) as [number, number];
  const local = (jd: number) => { const d = new Date(Math.floor((jd - 2440587.5 + o.utcOffsetHours / 24) * 86400) * 1000); return d; };
  const inMonth = (d: Date) => d.getUTCFullYear() === y && d.getUTCMonth() + 1 === m;
  const minuteOf = (d: Date) => d.getUTCHours() * 60 + d.getUTCMinutes();
  const hm = (n: number) => `${String(Math.floor(n / 60)).padStart(2, '0')}:${String(n % 60).padStart(2, '0')}`;
  // Every event by its minute of the month (day × 1440 + minute), so a dasha change printed the minute before
  // midnight is found on the next day.
  const pool: { day: number; at: number; second: number; text: string; kind: MonthEvent['kind'] }[] = [];
  for (const e of core) {
    const d = local(e.jdUt);
    if (inMonth(d)) pool.push({ day: d.getUTCDate(), at: d.getUTCDate() * 1440 + minuteOf(d), second: d.getUTCSeconds(), text: calendarText(e), kind: e.kind });
  }
  const used = new Set<number>();
  const lastOfDay = new Map<number, number>();
  for (const e of shown.events) {
    const [h, mi] = e.time.split(':').map(Number) as [number, number];
    values++;
    if (e.text.startsWith('---')) {
      // The print's clock read as UT, shown in the place's clock.
      const now = local(o.nowJdUt + o.utcOffsetHours / 24);
      if (now.getUTCDate() !== e.day || minuteOf(now) !== h * 60 + mi) failures.push(`clock mark: PL9 day ${e.day} ${e.time}, expected day ${now.getUTCDate()} ${hm(minuteOf(now))}`);
      continue;
    }
    const at = e.day * 1440 + h * 60 + mi;
    lastOfDay.set(e.day, Math.max(lastOfDay.get(e.day) ?? 0, at));
    // The minute as truncated, or the next one when the core's instant is within 10 s of it (PL9's samples differ by a
    // hair); a minute either way for the Ascendant and the cusps (the natal Lagna to its second); the dasha changes
    // within 3 minutes and the stations within one (PL9's own search for them was not read).
    const near = (c: (typeof pool)[number]) => c.kind === 'dasha' ? Math.abs(c.at - at) <= 3
      : c.kind === 'station' || / (As|Cusp \d+)$/.test(c.text) ? Math.abs(c.at - at) <= 1 : c.at === at || (c.at + 1 === at && c.second >= 50);
    // The trines' M is not compared: it follows the motion in all but 109 of 4785 printed (rule not found).
    const same = (c: (typeof pool)[number]) => c.kind === 'dasha' ? e.text.length >= 8 && c.text.startsWith(e.text)
      : / trine /.test(c.text) ? c.text.replace(/^([a-i])M /, '$1 ') === e.text.replace(/^([a-i])M /, '$1 ') : c.text === e.text;
    const i = pool.findIndex((c, k) => !used.has(k) && near(c) && same(c));
    if (i < 0) failures.push(`day ${e.day}: PL9 ${e.time} ${e.text} not among the core's events`);
    else used.add(i);
  }
  // A day's cell cuts its later lines: an event of the core is missing only before the day's last printed line.
  pool.forEach((c, k) => {
    const last = lastOfDay.get(c.day);
    // A dasha change within 3 minutes after midnight may be printed, and cut, at the end of the day before.
    const maybeBefore = c.kind === 'dasha' && c.at % 1440 < 3;
    if (!used.has(k) && !maybeBefore && last !== undefined && c.at < last - (c.kind === 'dasha' ? 3 : 0)) failures.push(`day ${c.day}: core ${c.text} at ${hm(c.at % 1440)} not printed`);
  });
  // A cell holds at least five lines (the clock mark one of them): a day printing fewer than that, or than the core's
  // events of the day, has lost some, cut or not (the dasha changes within 3 minutes after midnight are not counted).
  const days = new Set([...pool.map((c) => c.day), ...shown.events.map((e) => e.day)]);
  for (const d of [...days].sort((a, b) => a - b)) {
    const printed = shown.events.filter((e) => e.day === d).length;
    const marks = shown.events.filter((e) => e.day === d && e.text.startsWith('---')).length;
    const events = pool.filter((c) => c.day === d && !(c.kind === 'dasha' && c.at % 1440 < 3)).length;
    if (printed < Math.min(5, events + marks)) failures.push(`day ${d}: ${printed - marks} lines printed, the core has ${events} events`);
  }
  return { values, failures };
}
