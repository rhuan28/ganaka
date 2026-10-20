import { describe, expect, it } from 'vitest';
import { PLANETS, ayanamshaPl9, planetLongitude } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures, worstByField } from '../src/conformance';

describe('planet longitudes against PL9, Lahiri, reference set', () => {
  it('stay within 0.5 arcsecond for every body from the Sun to Pluto', async () => {
    const eph = await createSwissEphemeris();
    const worst = worstByField(loadFixtures(), (fx) => {
      const ay = ayanamshaPl9(eph, fx.input.jdUt, 'lahiri', 0, 'pl9');
      return Object.fromEntries(PLANETS.map((p) => [p, planetLongitude(eph, fx.input.jdUt, p, ay).longitude]));
    });
    eph.close();
    for (const p of PLANETS) expect(Math.abs(worst[p]!.arcsec), `${p} worst in ${worst[p]!.chartId}`).toBeLessThan(0.5);
    // Measured: 0.004" for the Moon, below 0.0001" for the others.
    for (const p of PLANETS) expect(Math.abs(worst[p]!.arcsec), `${p} (tight bound)`).toBeLessThan(0.01);
  });
});
