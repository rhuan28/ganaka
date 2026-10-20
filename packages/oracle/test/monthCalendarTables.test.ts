import { describe, expect, it } from 'vitest';
import { parseTransits } from '../src/transitTables';

const RAW = [
  'chart\tREF 0010',
  'calmonth\tnow\t2026-10',
  'calevent\tnow\t1\t06:02\tb Rohini',
  'calevent\tnow\t1\t06:11\tRa-Me-Ke-Me-',
  'calevent\tnow\t3\t12:45\tfM R or D As',
  'calevent\tnow\t17\t10:06\t-------',
].join('\n') + '\n';

// IST 1 Oct 2026 00:00 = 2461314.5 - 5.5/24.
const day = (d: number, h: number, m: number) => 2461314.5 - 5.5 / 24 + (d - 1) + (h * 60 + m) / 1440;
const core = [
  { jdUt: day(1, 6, 2.5), kind: 'nakshatra', planet: 'moon', target: 3, retrograde: false },
  { jdUt: day(1, 6, 11.2), kind: 'dasha', chain: ['rahu', 'mercury', 'ketu', 'mercury', 'venus'] },
  { jdUt: day(1, 9, 30.1), kind: 'nakshatra', planet: 'mercury', target: 14, retrograde: false },
  { jdUt: day(3, 12, 44.5), kind: 'station', planet: 'venus', retrograde: true },
];

describe('the month\'s calendar (worksheet 104)', () => {
  it('is read into the "now" snapshot', () => {
    const c = parseTransits(RAW).snaps.now!.monthCalendar!;
    expect(c.month).toBe('2026-10');
    expect(c.events[1]).toEqual({ day: 1, time: '06:11', text: 'Ra-Me-Ke-Me-' });
  });
  it('takes each printed line from the core\'s events, the day\'s later ones cut by the cell; the print\'s clock marked', async () => {
    const { verifyMonthCalendar } = await import('../src/monthCalendarTables');
    const shown = parseTransits(RAW).snaps.now!.monthCalendar!;
    const opts = { utcOffsetHours: 5.5, nowJdUt: day(17, 4, 36.3) };
    const fits = core.filter((c) => c.jdUt !== day(1, 9, 30.1));
    expect(verifyMonthCalendar(shown, fits as never, opts)).toEqual({ values: 4, failures: [] });
    // Day 1's 09:30 event comes after the last line printed; a cell holds at least five lines, so two printed of three is short.
    expect(verifyMonthCalendar(shown, core as never, opts).failures).toEqual(['day 1: 2 lines printed, the core has 3 events']);
    const gap = [...fits.slice(0, 1), { ...fits[0]!, jdUt: day(1, 6, 5.5), planet: 'sun' }, ...fits.slice(1)];
    expect(verifyMonthCalendar(shown, gap as never, opts).failures).toEqual(['day 1: core a Rohini at 06:05 not printed', 'day 1: 2 lines printed, the core has 3 events']);
  });
  it('fails a day with no line printed where the core has events', async () => {
    const { verifyMonthCalendar } = await import('../src/monthCalendarTables');
    const shown = parseTransits(RAW).snaps.now!.monthCalendar!;
    const more = [...core.filter((c) => c.jdUt !== day(1, 9, 30.1)), { jdUt: day(5, 8, 0.2), kind: 'nakshatra', planet: 'moon', target: 9, retrograde: false }];
    expect(verifyMonthCalendar(shown, more as never, { utcOffsetHours: 5.5, nowJdUt: day(17, 4, 36.3) }).failures).toEqual(['day 5: 0 lines printed, the core has 1 events']);
  });
});
