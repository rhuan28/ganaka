import { describe, expect, it } from 'vitest';
import { computePositions, type ChartInput } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures } from '../src/conformance';
import { verifyChart } from '../src/verify';

/** Charts saved in PL9 with a time zone or daylight saving: 5.5 h and 10 h west, 3 h and 10 h east, one hour of daylight saving. */
describe('charts written in a local clock, against PL9', () => {
  it('agree once the local time is turned into universal time and the clock offset is given', async () => {
    const eph = await createSwissEphemeris();
    const fixtures = loadFixtures('fixtures-zone');
    const verdicts = fixtures.map((fx) => verifyChart(fx, computePositions(eph, fx.input, { fidelity: 'pl9' }), 0.5));
    expect(fixtures).toHaveLength(5);
    expect(verdicts.flatMap((v) => v.longitudeFailures.map((f) => `${v.chartId} ${f.point} ${f.arcsec.toFixed(3)}"`))).toEqual([]);
    expect(verdicts.flatMap((v) => v.categoricalFailures.map((f) => `${v.chartId} ${f.point} ${f.what}`))).toEqual([]);
    eph.close();
  });
  it('need the clock offset for Gulika: without it the weekday is wrong in one of the five', async () => {
    const eph = await createSwissEphemeris();
    const wrong = loadFixtures('fixtures-zone').filter((fx) => {
      const { utcOffsetHours: _dropped, ...input } = fx.input as ChartInput;
      return verifyChart(fx, computePositions(eph, input, { fidelity: 'pl9' }), 0.5).longitudeFailures.some((f) => f.point === 'gulika');
    });
    eph.close();
    expect(wrong.map((fx) => fx.id)).toEqual(['zone-9004']);
  });
});
