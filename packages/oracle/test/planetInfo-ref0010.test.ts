import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { computePlanetInfo, parseChartInput } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';

// PL9's "36. Declination" page for REF 0010 (inventory capture, 2026-10-20): declination, Kranti and speed, as PL9
// prints them, degrees:minutes:seconds. The full bench of 135 charts is check-planet-info.
const SHOWN: Record<string, [string, string, string]> = {
  sun: ['21:20:26', '21:27:18', '00:57:36'], moon: ['16:35:47', '18:08:33', '11:53:06'], mars: ['12:25:58', '11:21:09', '00:27:34'],
  mercury: ['22:37:26', '22:55:39', '-00:15:35'], jupiter: ['-21:17:59', '-22:11:03', '-00:07:35'], venus: ['14:26:53', '16:05:38', '01:12:51'],
  saturn: ['-04:23:16', '-02:39:33', '00:03:44'], rahu: ['-13:20:16', '-13:36:03', '-00:01:50'], uranus: ['-20:37:54', '-20:15:12', '-00:01:04'],
  neptune: ['-20:31:35', '-21:11:53', '-00:00:54'], pluto: ['-06:18:55', '-20:06:23', '-00:01:39'],
};
const degrees = (dms: string) => { const neg = dms.startsWith('-'); const [d, m, s] = dms.replace('-', '').split(':').map(Number); const v = d! + m! / 60 + s! / 3600; return neg ? -v : v; };

describe("the planet tables' astronomy against PL9, REF 0010", () => {
  it('gives the declination, the Kranti and the speed PL9 prints, within a second', async () => {
    const eph = await createSwissEphemeris();
    const fx = JSON.parse(readFileSync(new URL('../fixtures/ref-0010.json', import.meta.url), 'utf8'));
    const info = computePlanetInfo(eph, parseChartInput(fx.input), {}, { fidelity: 'pl9' });
    eph.close();
    const off: string[] = [];
    for (const [body, [dec, kr, sp]] of Object.entries(SHOWN)) {
      const p = info.points[body as keyof typeof info.points];
      for (const [what, mine, shown] of [['declination', p.declination, dec], ['kranti', p.kranti, kr], ['speed', p.speed, sp]] as const) {
        if (Math.abs(mine - degrees(shown)) * 3600 > 1) off.push(`${body} ${what} ${mine} vs ${shown}`);
      }
    }
    expect(off).toEqual([]);
  });

  it('gives the combustion and the avasthas of "23. Interpreting Grahas" (RC, Av9, Av12)', async () => {
    const eph = await createSwissEphemeris();
    const fx = JSON.parse(readFileSync(new URL('../fixtures/ref-0010.json', import.meta.url), 'utf8'));
    const info = computePlanetInfo(eph, parseChartInput(fx.input), {}, { fidelity: 'pl9' });
    eph.close();
    const nine = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
    // PL9: Poor, Unhappy, Happy, Happy, Happy, Unhappy, Healthy, Poor, Poor.
    expect(nine.map((p) => info.points[p].deeptadi)).toEqual(['deena', 'dukhita', 'mudita', 'mudita', 'mudita', 'dukhita', 'swastha', 'deena', 'deena']);
    // PL9: Nidra, Upaves., Upaves., Nidra, Agam, Agam, Kautuk, Agam, Agam.
    expect(nine.map((p) => info.points[p].shayanadi?.state)).toEqual(['nidra', 'upavesha', 'upavesha', 'nidra', 'agama', 'agama', 'kautuka', 'agama', 'agama']);
    // RC: Mercury "Rc" (retrograde and combust), Jupiter "R".
    expect(nine.filter((p) => info.points[p].combust)).toEqual(['mercury']);
    expect(nine.filter((p) => info.points[p].retrograde)).toEqual(['mercury', 'jupiter']);
  });

  it('gives the other columns of "23. Interpreting Grahas": V+, RN, Rays, HsLrd, SVdisp, SVelem, Domin., MB', async () => {
    const eph = await createSwissEphemeris();
    const fx = JSON.parse(readFileSync(new URL('../fixtures/ref-0010.json', import.meta.url), 'utf8'));
    const info = computePlanetInfo(eph, parseChartInput(fx.input), {}, { fidelity: 'pl9' });
    eph.close();
    const nine = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
    const seven = nine.slice(0, 7);
    expect(nine.map((p) => info.points[p].ownOrExaltedShadvarga)).toEqual([1, 1, 0, 0, 3, 0, 4, 0, 0]);
    // PL9 prints "9P" for the Moon; the P is read apart.
    expect(nine.map((p) => info.points[p].navamsaFromRashi)).toEqual([12, 9, 11, 4, 2, 6, 5, 4, 4]);
    seven.forEach((p, i) => expect(info.points[p].rays!).toBeCloseTo([8.2, 4.3, 0.3, 2.6, 2.5, 3.5, 2.1][i]!, 1));
    expect(seven.map((p) => info.points[p].housesRuled)).toEqual([[2], [1], [5, 10], [3, 12], [6, 9], [4, 11], [7, 8]]);
    const disp = (p: (typeof nine)[number]) => info.points[p].shadvargaDispositors!.map((d) => `${d.lord}(${d.count})`).join(' ');
    expect(nine.map(disp)).toEqual(['mercury(2)', 'jupiter(2)', 'sun(3)', 'saturn(3) sun(2)', 'jupiter(3)', 'mars(2) mercury(2)', 'venus(2) saturn(2)', 'saturn(3)', 'sun(3)']);
    const elem = (p: (typeof nine)[number]) => info.points[p].shadvargaElements!.map((e) => `${e.quality}(${e.count})`).join(' ');
    expect(elem('sun')).toBe('earth(3) dual(3) water(2)');
    expect(elem('saturn')).toBe('air(4) movable(4) water(1)');
    expect(elem('ketu')).toBe('fire(5) fixed(3) movable(2)');
    nine.forEach((p, i) => expect(info.points[p].dominance!).toBeCloseTo([0.65, 2.21, 1.73, 0.92, 2.25, 3.0, 2.35, 0.48, 2.82][i]!, 2));
    expect(nine.map((p) => info.points[p].mrityuBhaga)).toEqual(nine.map(() => null));
    expect(nine.filter((p) => info.points[p].pushkaraNavamsa)).toEqual(['moon']); // RN "9P"
    expect(nine.map((p) => info.points[p].argala)).toEqual([0, 4, 0, 0, 0, 4, 1, 0, 0]);
    expect(nine.map((p) => info.points[p].houseEffect)).toEqual([75, 23, 44, 44, 94, 78, 2, 71, 71]);
  });
});
