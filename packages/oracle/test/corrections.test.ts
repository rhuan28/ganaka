import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { ayanamshaFrame, computeChart, computePositions, dayFrame, lagnaLongitude, planetLongitude, pl9DeltaTSeconds, type AyanamshaFrame } from '@reverse/core';
import { createSwissEphemeris, julianDayUt, type Ephemeris } from '@reverse/ephemeris';
import { arcsecDiff } from '../src/angles';
import { loadFixtures } from '../src/conformance';
import { verifyChart } from '../src/verify';

let eph: Ephemeris;
let pl9: AyanamshaFrame;
let corrected: AyanamshaFrame;
beforeAll(async () => {
  eph = await createSwissEphemeris();
  pl9 = ayanamshaFrame(eph, 'lahiri', 0, 'pl9');
  corrected = ayanamshaFrame(eph, 'lahiri', 0, 'corrected');
});
afterAll(() => eph.close());

const wrap = (v: number) => ((((v + 180) % 360) + 360) % 360) - 180;
/** How far the Sun's degree is from the horizon at an instant, in degrees. */
function off(jd: number, lat: number, lon: number, shift: number, f: AyanamshaFrame): number {
  const sun = planetLongitude(eph, jd, 'sun', f.sunAyanamsha(jd), f.fidelity).longitude;
  return Math.abs(wrap(lagnaLongitude(eph, jd, lat, lon, f.lagnaAyanamsha(jd), f.fidelity) + shift - sun));
}

describe('the pl9 mode is still PL9', () => {
  it('passes the whole reference set', () => {
    const bad = loadFixtures().map((fx) => verifyChart(fx, computePositions(eph, fx.input, { fidelity: 'pl9' }), 0.5)).filter((v) => v.longitudeFailures.length);
    expect(bad.map((v) => v.chartId)).toEqual([]);
  });
});

describe('correction: the sunset when PL9\'s search settles at once', () => {
  it('is most of a degree off the horizon in the pl9 mode and on it in the corrected mode', () => {
    for (const fx of loadFixtures('fixtures-corner')) {
      const { jdUt, latitude, longitudeEast } = fx.input;
      expect(off(dayFrame(eph, jdUt, latitude, longitudeEast, pl9).sunset, latitude, longitudeEast, 180, pl9), fx.id).toBeGreaterThan(0.5);
      expect(off(dayFrame(eph, jdUt, latitude, longitudeEast, corrected).sunset, latitude, longitudeEast, 180, corrected), fx.id).toBeLessThan(1e-6);
    }
  });
  it('moves Gulika by more than ten arcminutes in those charts', () => {
    for (const fx of loadFixtures('fixtures-corner')) {
      const a = computePositions(eph, fx.input, { fidelity: 'pl9' }).points.gulika!.longitude;
      const b = computePositions(eph, fx.input, { fidelity: 'corrected' }).points.gulika!.longitude;
      expect(Math.abs(arcsecDiff(a, b)), fx.id).toBeGreaterThan(600);
    }
  });
});

describe('correction: the sunset and the next sunrise of an ordinary chart', () => {
  it('are a fraction of a second to a few seconds off in the pl9 mode, and exact in the corrected mode', () => {
    let worstPl9 = 0;
    let worstCorrected = 0;
    for (const fx of loadFixtures().slice(0, 120)) {
      const { jdUt, latitude, longitudeEast } = fx.input;
      const a = dayFrame(eph, jdUt, latitude, longitudeEast, pl9);
      const b = dayFrame(eph, jdUt, latitude, longitudeEast, corrected);
      worstPl9 = Math.max(worstPl9, off(a.sunset, latitude, longitudeEast, 180, pl9), off(a.nextSunrise, latitude, longitudeEast, 0, pl9));
      worstCorrected = Math.max(worstCorrected, off(b.sunset, latitude, longitudeEast, 180, corrected), off(b.nextSunrise, latitude, longitudeEast, 0, corrected));
    }
    console.log(`worst distance from the horizon: pl9 ${worstPl9.toFixed(5)} deg, corrected ${worstCorrected.toExponential(1)} deg`);
    expect(worstPl9).toBeGreaterThan(1e-4);
    expect(worstCorrected).toBeLessThan(1e-6);
  });
});

describe('correction: the sunrise search at high latitudes', () => {
  it('fails or lands off the horizon in the pl9 mode at 66 degrees, and never in the corrected mode', () => {
    let pl9Bad = 0;
    let correctedBad = 0;
    const n = 120;
    for (let k = 0; k < n; k++) {
      const jd = julianDayUt(2001, 1, 1, 7) + k * 3.04;
      try {
        const a = dayFrame(eph, jd, 66, 10, pl9);
        if (Math.max(off(a.sunrise, 66, 10, 0, pl9), off(a.sunset, 66, 10, 180, pl9)) > 0.5) pl9Bad++;
      } catch {
        pl9Bad++;
      }
      const b = dayFrame(eph, jd, 66, 10, corrected);
      // A Julian day resolves 0.04 ms, and at this latitude the Lagna can cover a thousandth of a degree in that.
      if (Math.max(off(b.sunrise, 66, 10, 0, corrected), off(b.sunset, 66, 10, 180, corrected), off(b.nextSunrise, 66, 10, 0, corrected)) > 1e-3) correctedBad++;
    }
    console.log(`66 degrees: pl9 bad in ${pl9Bad} of ${n}, corrected bad in ${correctedBad}`);
    expect(pl9Bad).toBeGreaterThan(n / 4);
    expect(correctedBad).toBe(0);
  });
  it('gives the whole chart in the corrected mode where the pl9 mode drops Gulika and Prana Pada', () => {
    const input = { jdUt: 2451925.9916666667, latitude: 66, longitudeEast: 10 };
    const a = computeChart(eph, input, { fidelity: 'pl9' });
    expect(a.missing).toEqual([
      { what: 'gulika', reason: 'sunriseNotFound' }, { what: 'pranaPada', reason: 'sunriseNotFound' }, { what: 'mandi', reason: 'sunriseNotFound' },
      { what: 'specialLagnas', reason: 'sunriseNotFound' },
    ]);
    expect(a.points.gulika).toBeUndefined();
    expect(a.points.lagna).toBeDefined();
    expect(a.houses).toBeDefined();
    expect(computeChart(eph, input, { fidelity: 'corrected' }).missing).toEqual([]);
  });
  it('does not crash a few metres below the polar circle, where the Lagna sweeps half the zodiac in minutes', () => {
    for (const latitude of [66.5606079988133, -66.5606079988133, 66.559, 66.55]) {
      for (let k = 0; k < 40; k++) {
        const input = { jdUt: 2451544.5 + k * 9.13, latitude, longitudeEast: 10 };
        const c = computeChart(eph, input, { fidelity: 'corrected' });
        for (const m of c.missing) expect(m.reason, `${latitude} ${k}`).toBe('sunriseNotFound');
        if (!c.missing.length) {
          const f = dayFrame(eph, input.jdUt, latitude, 10, corrected);
          expect(f.sunrise).toBeLessThanOrEqual(input.jdUt);
          expect(f.nextSunrise).toBeGreaterThan(input.jdUt);
        }
      }
    }
  });
  it('finds a frame in every one of those instants down to half a thousandth of a degree from the circle', () => {
    for (let k = 0; k < 40; k++) {
      expect(computeChart(eph, { jdUt: 2451544.5 + k * 9.13, latitude: 66.5601, longitudeEast: 10 }, { fidelity: 'corrected' }).missing, `${k}`).toEqual([]);
    }
  });
  it('gives a chart, without the sunrise points, when the day frame would need data beyond the ephemeris', () => {
    const edge = julianDayUt(2399, 12, 19, 18);
    for (const fidelity of ['pl9', 'corrected'] as const) {
      const c = computeChart(eph, { jdUt: edge, latitude: 20, longitudeEast: 30 }, { fidelity });
      expect(c.points.sun).toBeDefined();
      expect(c.points.lagna).toBeDefined();
    }
  });
  it('costs a few milliseconds a chart in the corrected mode, not tens', () => {
    const fixtures = loadFixtures().slice(0, 60);
    let calls = 0;
    const counting = new Proxy(eph, { get: (target, key) => {
      const value = (target as unknown as Record<string | symbol, unknown>)[key];
      return typeof value === 'function' ? (...args: unknown[]) => (calls++, (value as (...a: unknown[]) => unknown).apply(target, args)) : value;
    } });
    for (const fx of fixtures) computeChart(counting, fx.input, { fidelity: 'corrected' });
    console.log(`corrected mode: ${(calls / fixtures.length).toFixed(0)} ephemeris calls per chart`);
    expect(calls / fixtures.length).toBeLessThan(600);
  });
});

describe('correction: Delta T', () => {
  it('is closer to the values observed since PL9\'s table ended', () => {
    // Delta T at the start of each year, in seconds, as published from observation (IERS), to a tenth of a second.
    const observed: [number, number][] = [[2016, 68.1], [2018, 69.0], [2020, 69.4], [2022, 69.3], [2024, 69.2]];
    for (const [year, seconds] of observed) {
      const jd = julianDayUt(year, 1, 1, 0);
      const library = Math.abs(eph.deltaTSeconds(jd) - seconds);
      const program = Math.abs(pl9DeltaTSeconds(jd) - seconds);
      expect(library, `${year}: library ${eph.deltaTSeconds(jd).toFixed(2)}, PL9 ${pl9DeltaTSeconds(jd).toFixed(2)}, observed ${seconds}`).toBeLessThan(0.5);
      if (year >= 2018) expect(program, `${year}`).toBeGreaterThan(library);
    }
    // By 2024 PL9's extrapolation is seconds away from what was observed.
    expect(Math.abs(pl9DeltaTSeconds(julianDayUt(2024, 1, 1, 0)) - 69.2)).toBeGreaterThan(2);
  });
  it('in the corrected mode is the library\'s: the Moon equals the library\'s own sidereal Moon but for the Lahiri constant', () => {
    for (const year of [1850, 1990, 2030, 2048]) {
      const jd = julianDayUt(year, 6, 1, 12);
      const mine = computePositions(eph, { jdUt: jd, latitude: 0, longitudeEast: 0 }, { fidelity: 'corrected' }).points.moon.longitude;
      // PL9's Lahiri is the library's minus 0.1382": a convention, kept in both modes.
      expect(arcsecDiff(mine, eph.lahiriSiderealReference(jd, 'moon')), `${year}`).toBeCloseTo(0.1382, 2);
    }
  });
  it('matters more and more after the end of PL9\'s table: tens of seconds of time by 2048', () => {
    const jd = julianDayUt(2048, 6, 1, 12);
    const seconds = pl9DeltaTSeconds(jd) - eph.deltaTSeconds(jd);
    const a = computePositions(eph, { jdUt: jd, latitude: 0, longitudeEast: 0 }, { fidelity: 'pl9' }).points.moon.longitude;
    const b = computePositions(eph, { jdUt: jd, latitude: 0, longitudeEast: 0 }, { fidelity: 'corrected' }).points.moon.longitude;
    console.log(`2048: Delta T differs by ${seconds.toFixed(1)} s; the Moon by ${arcsecDiff(a, b).toFixed(1)} arcsec`);
    expect(Math.abs(seconds)).toBeGreaterThan(20);
    expect(Math.abs(arcsecDiff(a, b))).toBeGreaterThan(10);
  });
  it('matters little while PL9\'s table is good: under two tenths of an arcsecond for the Moon from 1950 to 2010', () => {
    for (const year of [1950, 1970, 1990, 2010]) {
      const input = { jdUt: julianDayUt(year, 6, 1, 12), latitude: 0, longitudeEast: 0 };
      const a = computePositions(eph, input, { fidelity: 'pl9' }).points.moon.longitude;
      const b = computePositions(eph, input, { fidelity: 'corrected' }).points.moon.longitude;
      expect(Math.abs(arcsecDiff(a, b)), `${year}`).toBeLessThan(0.2);
    }
  });
});

describe('correction: the nutation coefficients', () => {
  it('move the Lagna by a few thousandths of an arcsecond at most over the reference set', () => {
    let worst = 0;
    for (const fx of loadFixtures()) {
      const { jdUt, latitude, longitudeEast } = fx.input;
      const a = lagnaLongitude(eph, jdUt, latitude, longitudeEast, 24, 'pl9');
      const b = lagnaLongitude(eph, jdUt, latitude, longitudeEast, 24, 'corrected');
      worst = Math.max(worst, Math.abs(arcsecDiff(a, b)));
    }
    expect(worst).toBeGreaterThan(0);
    expect(worst).toBeLessThan(0.005);
  });
});

describe('what the corrected mode leaves alone', () => {
  it('the sunrise itself, which PL9 finds to within a few milliseconds', () => {
    let worst = 0;
    // From 1950 to 2010, where the two modes place the Sun within a hundredth of an arcsecond of each other.
    const recent = (f: { input: { jdUt: number; latitude: number } }) =>
      f.input.jdUt > julianDayUt(1950, 1, 1) && f.input.jdUt < julianDayUt(2010, 1, 1) && Math.abs(f.input.latitude) <= 60;
    for (const fx of loadFixtures().filter(recent)) {
      const { jdUt, latitude, longitudeEast } = fx.input;
      const a = dayFrame(eph, jdUt, latitude, longitudeEast, pl9).sunrise;
      const b = dayFrame(eph, jdUt, latitude, longitudeEast, corrected).sunrise;
      worst = Math.max(worst, Math.abs(a - b) * 86400);
    }
    expect(worst).toBeLessThan(0.05);
  });
});

describe('correction: Mandi at night from Wednesday to Saturday', () => {
  it('follows PL9 in the pl9 mode and the table PL9 follows in the corrected mode', () => {
    // REF 0004 is born on a Friday night. PL9 printed Mandi at 20°51' of Leo: the Lagna at 20/30 of the night.
    const fx = loadFixtures().find((f) => f.id === 'ref-0004')!;
    const a = computePositions(eph, fx.input, { fidelity: 'pl9' }).points.mandi!.longitude;
    const b = computePositions(eph, fx.input, { fidelity: 'corrected' }).points.mandi!.longitude;
    const shown = 120 + 20 + 51 / 60;
    expect(arcsecDiff(a, shown)).toBeGreaterThanOrEqual(-0.5);
    expect(arcsecDiff(a, shown)).toBeLessThan(60.5);
    // Two thirtieths of the night earlier: degrees away, in the same direction as the Lagna moves.
    expect(arcsecDiff(a, b) / 3600).toBeGreaterThan(5);
    const f = dayFrame(eph, fx.input.jdUt, fx.input.latitude, fx.input.longitudeEast, corrected);
    const t = f.sunset + ((f.nextSunrise - f.sunset) * 18) / 30;
    expect(Math.abs(arcsecDiff(b, lagnaLongitude(eph, t, fx.input.latitude, fx.input.longitudeEast, corrected.lagnaAyanamsha(t), 'corrected')))).toBeLessThan(1e-6);
  });
});

