import { describe, expect, it } from 'vitest';
import { computePositions } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures } from '../src/conformance';
import { verifyChart } from '../src/verify';

describe('computePositions against PL9, Lahiri, reference set', () => {
  it('has no longitude failure and no categorical failure', async () => {
    const eph = await createSwissEphemeris();
    const verdicts = loadFixtures().map((fx) => verifyChart(fx, computePositions(eph, fx.input, { fidelity: 'pl9' }), 0.5));
    eph.close();
    const lon = verdicts.flatMap((v) => v.longitudeFailures.map((f) => `${v.chartId} ${f.point} ${f.arcsec.toFixed(3)}"`));
    const cat = verdicts.flatMap((v) => v.categoricalFailures.map((f) => `${v.chartId} ${f.point} ${f.what} expected ${f.expected} got ${f.actual}`));
    expect(lon).toEqual([]);
    expect(cat).toEqual([]);
  });
});
