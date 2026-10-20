import { describe, expect, it } from 'vitest';
import { ayanamshaPl9, nodeLongitudes } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures, worstByField } from '../src/conformance';

describe('lunar nodes against PL9, Lahiri, reference set', () => {
  it('keeps Rahu and Ketu within 0.5 arcsecond', async () => {
    const eph = await createSwissEphemeris();
    const worst = worstByField(loadFixtures(), (fx) => {
      const n = nodeLongitudes(eph, fx.input.jdUt, ayanamshaPl9(eph, fx.input.jdUt, 'lahiri', 0, 'pl9'));
      return { rahu: n.rahu.longitude, ketu: n.ketu.longitude };
    });
    eph.close();
    expect(Math.abs(worst.rahu!.arcsec), `rahu worst in ${worst.rahu!.chartId}`).toBeLessThan(0.5);
    expect(Math.abs(worst.ketu!.arcsec), `ketu worst in ${worst.ketu!.chartId}`).toBeLessThan(0.5);
    // Measured: 0.015". A looser bound here would hide a regression in the plane term (docs/spec/nodo.md).
    expect(Math.abs(worst.rahu!.arcsec)).toBeLessThan(0.03);
  });
});
