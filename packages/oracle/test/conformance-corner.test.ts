import { describe, expect, it } from 'vitest';
import { ayanamshaFrame, computePositions, dayFrame, lagnaLongitude, planetLongitude } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures } from '../src/conformance';
import { verifyChart } from '../src/verify';

/**
 * Charts where the search for the sunset settles on its first pass. PL9 then takes its last step with the slope
 * left over from the sunrise search, and its sunset lands most of a degree away from the horizon.
 * The core has to return that same sunset, not refuse the chart and not correct it.
 */
describe('charts whose sunset search settles at once, against PL9', () => {
  it('agree on all twenty points', async () => {
    const eph = await createSwissEphemeris();
    const fixtures = loadFixtures('fixtures-corner');
    const verdicts = fixtures.map((fx) => verifyChart(fx, computePositions(eph, fx.input, { fidelity: 'pl9' }), 0.5));
    eph.close();
    expect(fixtures).toHaveLength(2);
    expect(verdicts.flatMap((v) => v.longitudeFailures.map((f) => `${v.chartId} ${f.point} ${f.arcsec.toFixed(3)}"`))).toEqual([]);
  });
  it('really are that case: the sunset returned is more than half a degree from the true one', async () => {
    const eph = await createSwissEphemeris();
    const frame = ayanamshaFrame(eph, 'lahiri', 0, 'pl9');
    for (const fx of loadFixtures('fixtures-corner')) {
      const { jdUt, latitude, longitudeEast } = fx.input;
      const f = dayFrame(eph, jdUt, latitude, longitudeEast, frame);
      const sun = planetLongitude(eph, f.sunset, 'sun', frame.sunAyanamsha(f.sunset)).longitude;
      const setting = (lagnaLongitude(eph, f.sunset, latitude, longitudeEast, frame.lagnaAyanamsha(f.sunset)) + 180) % 360;
      expect(Math.abs((((setting - sun + 540) % 360) + 360) % 360 - 180), fx.id).toBeGreaterThan(0.5);
    }
    eph.close();
  });
});
