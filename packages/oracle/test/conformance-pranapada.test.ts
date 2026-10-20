import { describe, expect, it } from 'vitest';
import { ayanamshaFrame, pranaPadaLongitude } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures, worstByField } from '../src/conformance';

describe('Prana Pada against PL9, Lahiri, reference set', () => {
  it('stays within 0.5 arcsecond', async () => {
    const eph = await createSwissEphemeris();
    const frame = ayanamshaFrame(eph, 'lahiri', 0, 'pl9');
    const worst = worstByField(loadFixtures(), (fx) => {
      const { jdUt, latitude, longitudeEast } = fx.input;
      return { pranaPada: pranaPadaLongitude(eph, jdUt, latitude, longitudeEast, frame) };
    });
    eph.close();
    console.log(`Prana Pada worst: ${worst.pranaPada!.arcsec.toFixed(4)}" at ${worst.pranaPada!.chartId}`);
    expect(Math.abs(worst.pranaPada!.arcsec)).toBeLessThanOrEqual(0.5);
  });
});
