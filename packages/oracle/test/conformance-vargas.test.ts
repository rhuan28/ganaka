import { describe, expect, it } from 'vitest';
import { CLASSICAL_VARGAS, vargaSign, type VargaName } from '@reverse/core';
import { loadFixtures } from '../src/conformance';
import { loadTableFixtures } from '../src/tables';
import { nearBoundary } from '../src/verifyTables';

describe('the sixteen vargas against PL9', () => {
  it('give the sign PL9 shows, from the longitude PL9 exports', () => {
    const byId = new Map(loadFixtures().map((fx) => [fx.id, fx]));
    const problems: string[] = [];
    const borders: string[] = [];
    const seen = new Set<string>();
    for (const t of loadTableFixtures()) {
      const fx = byId.get(t.id)!;
      for (const [varga, signs] of Object.entries(t.pl9.vargas)) {
        // The other 29 vargas, and the points PL9 does not export, are in conformance-pdf.test.ts.
        if (!(CLASSICAL_VARGAS as readonly string[]).includes(varga)) continue;
        seen.add(varga);
        for (const [point, expected] of Object.entries(signs)) {
          const ref = fx.pl9.longitudes[point];
          if (ref === undefined) continue;
          const rule = (lon: number) => vargaSign(lon, varga as VargaName, 'pl9');
          if (rule(ref) === expected) continue;
          if (nearBoundary(rule, ref, 0.5, expected)) borders.push(`${t.id} ${varga} ${point}`);
          else problems.push(`${t.id} ${varga} ${point} at ${ref}: PL9 ${expected}, core ${rule(ref)}`);
        }
      }
    }
    console.log(`varga border cases: ${borders.length}`);
    expect([...seen].sort()).toEqual([...CLASSICAL_VARGAS].sort());
    expect(problems).toEqual([]);
  });
});
