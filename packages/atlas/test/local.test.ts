import { describe, expect, it } from 'vitest';
import { loadTz, resolveLocal } from '../src/index';

const tz = loadTz();
const at = (year: number, month: number, day: number, hour: number, minute = 0, second = 0) => ({ year, month, day, hour, minute, second });

describe('a local date at a place', () => {
  it('has one reading on an ordinary day, the instant the local time less the offset', () => {
    const r = resolveLocal(tz, 'America/Sao_Paulo', at(1995, 5, 27, 20, 15, 57));
    expect(r.status).toBe('ok');
    expect(r.readings).toHaveLength(1);
    expect(r.readings[0]!.utcOffsetHours).toBe(-3);
    expect(r.readings[0]!.jdUt).toBeCloseTo(Date.UTC(1995, 4, 27, 23, 15, 57) / 86400000 + 2440587.5, 9);
  });
  it('says the hour skipped when daylight saving starts, with the offsets on either side', () => {
    const sp = resolveLocal(tz, 'America/Sao_Paulo', at(2018, 11, 4, 0, 30));
    expect([sp.status, sp.readings.length]).toEqual(['nonexistent', 0]);
    expect(sp.gap).toEqual({ before: -3, after: -2 });
    expect(resolveLocal(tz, 'Europe/Berlin', at(2021, 3, 28, 2, 30)).status).toBe('nonexistent');
  });
  it('gives both readings of the hour repeated when it ends, the earlier first', () => {
    const sp = resolveLocal(tz, 'America/Sao_Paulo', at(2019, 2, 16, 23, 30));
    expect(sp.status).toBe('ambiguous');
    expect(sp.readings.map((r) => r.utcOffsetHours)).toEqual([-2, -3]);
    expect(sp.readings[0]!.jdUt).toBeLessThan(sp.readings[1]!.jdUt);
    const b = resolveLocal(tz, 'Europe/Berlin', at(2021, 10, 31, 2, 30));
    expect([b.status, b.readings.map((r) => r.dstHours)]).toEqual(['ambiguous', [1, 0]]);
  });
  it('reads a year below 100 as that year, not as 19xx', () => {
    const r = resolveLocal(tz, 'Europe/London', at(50, 6, 1, 12));
    expect(r.readings[0]!.jdUt).toBeLessThan(1800000);
  });
  it('reads India\'s war time', () => {
    const k = resolveLocal(tz, 'Asia/Kolkata', at(1943, 6, 1, 12));
    expect([k.status, k.readings[0]!.utcOffsetHours]).toEqual(['ok', 6.5]);
  });
});
