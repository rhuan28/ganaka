import { describe, expect, it } from 'vitest';
import { ayanamshaPl9, planetLongitude, upagrahas } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures, worstByField } from '../src/conformance';

describe('upagrahas against PL9, reference set', () => {
  it('follow from the PL9 Sun exactly, and from the computed Sun within 0.5 arcsecond', async () => {
    const fixtures = loadFixtures();
    const fromPl9Sun = worstByField(fixtures, (fx) => ({ ...upagrahas(fx.pl9.longitudes.sun!) }));
    for (const [k, w] of Object.entries(fromPl9Sun)) expect(Math.abs(w.arcsec), `${k} in ${w.chartId}`).toBeLessThan(0.001);

    const eph = await createSwissEphemeris();
    const fromComputed = worstByField(fixtures, (fx) => {
      const sun = planetLongitude(eph, fx.input.jdUt, 'sun', ayanamshaPl9(eph, fx.input.jdUt, 'lahiri', 0, 'pl9')).longitude;
      return { ...upagrahas(sun) };
    });
    eph.close();
    for (const [k, w] of Object.entries(fromComputed)) expect(Math.abs(w.arcsec), `${k} in ${w.chartId}`).toBeLessThan(0.5);
  });
});
