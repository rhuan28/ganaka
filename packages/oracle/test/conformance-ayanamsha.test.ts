import { describe, expect, it } from 'vitest';
import { PLANETS, ayanamshaPl9, planetLongitude, type AyanamshaName } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures, worstByField } from '../src/conformance';

const NAMES: AyanamshaName[] = ['sayana', 'yukteshwar', 'raman', 'bhasin', 'fagan', 'krishnamurti', 'krishnamurtiNew', 'trueChitra'];

describe('ayanamshas against PL9, 30 charts each', () => {
  for (const name of NAMES) {
    it(`${name}: Sun to Pluto within 0.5 arcsecond`, async () => {
      const eph = await createSwissEphemeris();
      const fixtures = loadFixtures(`fixtures-ayanamsha/${name}`);
      expect(fixtures).toHaveLength(30);
      const worst = worstByField(fixtures, (fx) => {
        const ay = ayanamshaPl9(eph, fx.input.jdUt, name, 0, 'pl9');
        return Object.fromEntries(PLANETS.map((p) => [p, planetLongitude(eph, fx.input.jdUt, p, ay).longitude]));
      });
      eph.close();
      for (const p of PLANETS) expect(Math.abs(worst[p]!.arcsec), `${name} ${p} worst in ${worst[p]!.chartId}`).toBeLessThan(0.5);
    });
  }

  it('lahiri with a manual offset of one degree', async () => {
    const eph = await createSwissEphemeris();
    const worst = worstByField(loadFixtures('fixtures-ayanamsha/lahiri-offset'), (fx) => {
      const ay = ayanamshaPl9(eph, fx.input.jdUt, 'lahiri', 1);
      return Object.fromEntries(PLANETS.map((p) => [p, planetLongitude(eph, fx.input.jdUt, p, ay).longitude]));
    });
    eph.close();
    for (const p of PLANETS) expect(Math.abs(worst[p]!.arcsec), `${p} worst in ${worst[p]!.chartId}`).toBeLessThan(0.5);
  });
});
