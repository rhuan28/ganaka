import { describe, expect, it } from 'vitest';
import { computeShadbala } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures } from '../src/conformance';
import { loadStrengthFixtures, verifyShadbala } from '../src/strengthTables';

const input = (id: string) => loadFixtures().find((f) => f.id === id)!.input;

describe('the Cheshta Bala against PL9', () => {
  it('of REF 0010, Mercury and Jupiter retrograde, as printed', async () => {
    const eph = await createSwissEphemeris();
    const sb = computeShadbala(eph, input('ref-0010'), {}, { fidelity: 'pl9' });
    eph.close();
    const printed = { mars: 52.3, mercury: 55.53, jupiter: 58.84, venus: 21.01, saturn: 38.9 };
    for (const [p, v] of Object.entries(printed)) expect(Math.abs(sb.planets[p as keyof typeof printed].cheshta - v), p).toBeLessThanOrEqual(0.005);
  });
  it("of Saturn near its station in REF 0233, as PL9 holds it in memory (the sign of the true motion)", async () => {
    const eph = await createSwissEphemeris();
    const sb = computeShadbala(eph, input('ref-0233'), {}, { fidelity: 'pl9' });
    eph.close();
    expect(Math.abs(sb.planets.saturn.cheshta - 28.628665083240495)).toBeLessThanOrEqual(1e-4);
  });
});

describe('the Shadbala of charts that test the edges, against the printed page', () => {
  // ref-0001: two wars at once; ref-0008: born at night before local noon; ref-0289: 64 degrees south.
  for (const id of ['ref-0001', 'ref-0008', 'ref-0289']) {
    it(`of ${id}, every part`, async () => {
      const eph = await createSwissEphemeris();
      const fx = loadStrengthFixtures('fixtures-shadbala').find((f) => f.id === id)!;
      const v = verifyShadbala(fx.pl9.sb!, computeShadbala(eph, input(id), {}, { fidelity: 'pl9' }));
      eph.close();
      expect(v.failures).toEqual([]);
    });
  }
});
