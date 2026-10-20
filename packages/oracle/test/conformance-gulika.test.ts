import { describe, expect, it } from 'vitest';
import { ayanamshaFrame, gulikaLongitude } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures, worstByField } from '../src/conformance';

describe('Gulika against PL9, Lahiri, reference set', () => {
  it('stays within 0.5 arcsecond', async () => {
    const eph = await createSwissEphemeris();
    const frame = ayanamshaFrame(eph, 'lahiri', 0, 'pl9');
    const worst = worstByField(loadFixtures(), (fx) => {
      const { jdUt, latitude, longitudeEast } = fx.input;
      return { gulika: gulikaLongitude(eph, jdUt, latitude, longitudeEast, frame) };
    });
    eph.close();
    console.log(`Gulika worst: ${worst.gulika!.arcsec.toFixed(4)}" at ${worst.gulika!.chartId}`);
    expect(Math.abs(worst.gulika!.arcsec)).toBeLessThanOrEqual(0.5);
  });
});
