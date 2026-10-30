import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { computePlanetInfo, computeUpagrahas, parseChartInput } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';

// PL9's "Sub-Planets" and "Health" sheets for REF 0010 (reports survey, 2026-10-29). Longitudes as PL9 prints them,
// sign index and degrees:minutes:seconds; the bench of 135 charts is the M2R print model.
const at = (sign: number, dms: string) => { const [d, m, s] = dms.split(':').map(Number); return sign * 30 + d! + m! / 60 + s! / 3600; };
const GULIKAADI: Record<string, [number, [number, string], [number, string]]> = {
  kaalavela: [2, [2, '10:39:04'], [3, '03:47:40']], paridhi: [3, [3, '03:47:40'], [3, '25:19:18']], mrityu: [4, [3, '25:19:18'], [4, '16:41:44']],
  ardhaprahara: [5, [4, '16:41:44'], [5, '08:15:00']], yamakantaka: [6, [5, '08:15:00'], [5, '29:46:39']], kodanda: [7, [5, '29:46:39'], [6, '21:07:44']],
  gulika: [1, [1, '12:12:20'], [2, '10:39:04']],
};

describe("the Sub-Planets and Health sheets against PL9, REF 0010", () => {
  it('gives each Gulikaadi upagraha its part and its Lagna at the beginning and the end, within a second and a half', async () => {
    const eph = await createSwissEphemeris();
    const fx = JSON.parse(readFileSync(new URL('../fixtures/ref-0010.json', import.meta.url), 'utf8'));
    const u = computeUpagrahas(eph, parseChartInput(fx.input), { fidelity: 'pl9' });
    eph.close();
    expect(u.isDay).toBe(true);
    for (const row of u.rows) {
      const [part, [bs, bd], [es, ed]] = GULIKAADI[row.name]!;
      expect(row.part, row.name).toBe(part);
      expect(Math.abs(row.beginning - at(bs, bd)) * 3600, `${row.name} beginning`).toBeLessThan(1.5);
      expect(Math.abs(row.ending - at(es, ed)) * 3600, `${row.name} ending`).toBeLessThan(1.5);
    }
  });

  it('places each planet in the subtle scheme by its house and decanate', async () => {
    const eph = await createSwissEphemeris();
    const fx = JSON.parse(readFileSync(new URL('../fixtures/ref-0010.json', import.meta.url), 'utf8'));
    const h = computePlanetInfo(eph, parseChartInput(fx.input), {}, { fidelity: 'pl9' }).health!;
    eph.close();
    // Left arm, Left thigh, Right eye, Left testicle, Right heart, Left side, Left calf, Right side, Left side.
    const idx = { sun: 31, moon: 29, mars: 3, mercury: 32, jupiter: 13, venus: 28, saturn: 23, rahu: 10, ketu: 28 };
    for (const [p, i] of Object.entries(idx)) expect(h[p as 'sun'].sookshma, p).toEqual({ index: i });
    expect(h.sun.sthoola).toEqual({ sign: 1, house: 11 });
  });
});
