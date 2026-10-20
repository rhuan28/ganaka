import { describe, expect, it } from 'vitest';
import { computePositions } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures } from '../src/conformance';
import { loadTableFixtures } from '../src/tables';
import { verifyPositionTables } from '../src/verifyTables';

describe('sign, nakshatra, pada and retrogression read from PL9', () => {
  it('agree with the core', async () => {
    const eph = await createSwissEphemeris();
    const byId = new Map(loadFixtures().map((fx) => [fx.id, fx]));
    const verdicts = loadTableFixtures().map((t) => {
      const fx = byId.get(t.id);
      if (!fx) throw new Error(`${t.id}: no position fixture`);
      return verifyPositionTables(t, fx, computePositions(eph, fx.input, { fidelity: 'pl9' }), 0.5);
    });
    eph.close();
    expect(verdicts.reduce((s, v) => s + v.checked, 0)).toBeGreaterThan(0);
    expect(verdicts.flatMap((v) => v.failures.map((f) => `${v.chartId} ${f.what} ${f.key}: PL9 ${f.expected}, core ${f.actual}`))).toEqual([]);
  });
});
