import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { computeBirthPanchanga, parseChartInput } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';

// PL9's "Astronomical Details" and "Basic Calculations" sheets for REF 0010 (reports survey, 2026-10-29), the clock in
// UT (the chart's zone is 0). The bench of 135 charts is the M2R print model.
const utc = (t: number) => new Date((t - 2440587.5) * 86_400_000 + 500).toISOString().replace('T', ' ').slice(0, 19);

describe("the birth's astronomical details against PL9, REF 0010", () => {
  it('gives the day counts, the Moon’s ingresses, the new Moons, the Moon’s rise and set, the hora and the Tamil date', async () => {
    const eph = await createSwissEphemeris();
    const fx = JSON.parse(readFileSync(new URL('../fixtures/ref-0010.json', import.meta.url), 'utf8'));
    const b = computeBirthPanchanga(eph, parseChartInput(fx.input), { fidelity: 'pl9' });
    const a = b.astronomy!;
    eph.close();
    expect(a.ahargana).toBe(69307);
    expect(a.daysSince1900!.toFixed(2)).toBe('34845.18');
    expect([a.midnight, a.midday, a.moonSignEntry, a.moonSignExit, a.lastNewMoon, a.nextNewMoon, a.moonrise, a.moonset].map(utc)).toEqual([
      '1995-05-28 13:56:40', '1995-05-28 01:54:41', '1995-05-25 17:28:22', '1995-05-28 05:33:07',
      '1995-04-29 17:36:19', '1995-05-29 09:27:07', '1995-05-28 18:01:28', '1995-05-28 08:25:49',
    ]);
    expect([a.hora, a.dayPart, a.westernSign]).toEqual([5, 'sunriseToMidday', 2]);
    // YUVA, VAIKASI, Sani-kizhamai, 13.
    expect(a.tamil).toEqual({ year: 8, month: 1, weekday: 6, date: 13 });
    // The ayanamsha printed, -23:47:43: the mean one plus the nutation, to the nearest second.
    expect(Math.round(b.ayanamshaShown * 3600)).toBe(23 * 3600 + 47 * 60 + 43);
  });
});
