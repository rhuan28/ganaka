import { describe, expect, it } from 'vitest';
import { ayanamshaPl9, computePositions, lagnaLongitude } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures, worstByField } from '../src/conformance';

describe('Lagna against PL9, Lahiri, reference set', () => {
  it('stays within 0.5 arcsecond at every latitude of the reference set', async () => {
    const eph = await createSwissEphemeris();
    const worst = worstByField(loadFixtures(), (fx) => ({
      lagna: lagnaLongitude(eph, fx.input.jdUt, fx.input.latitude, fx.input.longitudeEast, ayanamshaPl9(eph, fx.input.jdUt, 'lahiri', 0, 'pl9')),
    }));
    eph.close();
    expect(Math.abs(worst.lagna!.arcsec), `worst in ${worst.lagna!.chartId}`).toBeLessThan(0.5);
    // The rule read from the routine reproduces PL9 to 0.0001". See docs/spec/lagna.md.
    expect(Math.abs(worst.lagna!.arcsec)).toBeLessThan(0.001);
  });
  it('is the tropical ascendant itself with "None (Sayana)": PL9 takes no nutation out', async () => {
    const eph = await createSwissEphemeris();
    const worst = worstByField(loadFixtures('fixtures-ayanamsha/sayana'), (fx) => ({
      lagna: computePositions(eph, fx.input, { ayanamsha: 'sayana', fidelity: 'pl9' }).points.lagna!.longitude,
    }));
    eph.close();
    expect(Math.abs(worst.lagna!.arcsec), `worst in ${worst.lagna!.chartId}`).toBeLessThan(0.001);
  });
});
