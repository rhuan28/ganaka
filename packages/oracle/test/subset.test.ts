import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import type { ChartSpec } from '../src/pl9xml';
import { ayanamshaSubset } from '../src/subset';

const specs = JSON.parse(readFileSync(resolve(dirname(fileURLToPath(import.meta.url)), '../refset.json'), 'utf8')) as ChartSpec[];

describe('ayanamshaSubset', () => {
  const sub = ayanamshaSubset(specs);
  it('picks thirty distinct charts, none of them a constructed edge case', () => {
    expect(sub).toHaveLength(30);
    expect(new Set(sub.map((s) => s.id)).size).toBe(30);
    for (const s of sub) expect(['random', 'recent', 'early']).toContain(s.kind);
  });
  it('spans the whole date range, in date order', () => {
    for (let i = 1; i < sub.length; i++) expect(sub[i]!.jdUt).toBeGreaterThan(sub[i - 1]!.jdUt);
    expect(sub[0]!.jdUt).toBeLessThan(2385000);   // before about 1818
    expect(sub[29]!.jdUt).toBeGreaterThan(2466000); // after about 2039
  });
  it('is stable', () => {
    expect(ayanamshaSubset(specs)).toEqual(sub);
  });
  it('refuses to pick more charts than exist', () => {
    expect(() => ayanamshaSubset(specs.slice(0, 5), 30)).toThrow(/only/);
  });
});
