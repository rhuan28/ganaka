import { describe, expect, it } from 'vitest';
import { parseMuhurta } from '../src/muhurtaTables';

describe('the raw Muhurta files', () => {
  it('read each part by its keys', () => {
    const m = parseMuhurta([
      'chart\tREF 0010',
      'muchart\tD9.lagna\tSco',
      'muchart\tD60.mandi\tAri',
      'muplanet\tsun.degree\t29:42:26',
      'muplanet\tmars.rc\tc',
      'muplanet\tmoon.nakshatra\tJyeshtha',
      'muplanet\tmoon.syllable\tNoh',
      'muplanet\tmoon.dignity\tDebil.',
      'muplanet\tmoon.sbRatio\t0.86',
      'muplanet\tmoon.sbCount\t3',
      'muplanet\tmoon.vb\t12',
      'muplanet\tmoon.avastha\tYouth.',
      'mukaksha\tsun.lord\tlagna',
      'mukaksha\tsun.sarva\t31',
      'mugochara\ttarabala\tVadha: Dangers',
      'mugochara\tvimshottari\tRa-Ve-Su-Me-Ve',
      'mudasha\tmuhurta2.2.chain\td-i',
      'mudasha\tnative4.1.date\t05-10-2026',
      'mudasha\tmuhurta4.1.day\tWed',
      'mubala\thouse.Gem\t628.46',
      'mubala\tvimshopaka.sun\t9.3',
      'muthermo\tactivity\tTravelling',
      'muthermo\tlevel\t0.3345',
      '',
    ].join('\n'));
    expect(m.chart).toBe('REF 0010');
    expect(m.parts.muchart['D9.lagna']).toBe('Sco');
    expect(m.parts.muplanet['moon.avastha']).toBe('Youth.');
    expect(m.parts.mudasha['native4.1.date']).toBe('05-10-2026');
    expect(m.parts.mubala['house.Gem']).toBe('628.46');
    expect(m.parts.muthermo.level).toBe('0.3345');
  });

  it('refuse a part, a key or a value they do not know, naming the line', () => {
    expect(() => parseMuhurta('chart\tREF 0010\nmufoo\tx\t1\n')).toThrow(/line 2/);
    expect(() => parseMuhurta('chart\tREF 0010\nmuchart\tD7.sun\tAri\n')).toThrow(/line 2/);
    expect(() => parseMuhurta('chart\tREF 0010\nmuplanet\tsun.degree\tten\n')).toThrow(/line 2/);
    expect(() => parseMuhurta('chart\tREF 0010\nmubala\thouse.Xyz\t1.00\n')).toThrow(/line 2/);
    expect(() => parseMuhurta('chart\tREF 0010\nmuthermo\tlevel\t1.5\n')).toThrow(/line 2/);
  });
});

describe('the Muhurta check', () => {
  const load = async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const { createSwissEphemeris } = await import('@reverse/ephemeris');
    const { computeMuhurtaInputs } = await import('../src/muhurtaTables');
    const root = join(__dirname, '..');
    const fx = JSON.parse(readFileSync(join(root, 'fixtures-muhurta', '2030', 'ref-0010.json'), 'utf8')) as import('../src/muhurtaTables').MuhurtaFixture;
    const natal = (JSON.parse(readFileSync(join(root, 'refset-tempo.json'), 'utf8')) as { id: string; jdUt: number; latitude: number; longitudeEast: number }[]).find((r) => r.id === 'ref-0010')!;
    const eph = await createSwissEphemeris();
    try { return { fx, computed: computeMuhurtaInputs(eph, natal, '2030', 'travelling') }; } finally { eph.close(); }
  };
  it('accepts REF 0010\'s Muhurta in 2030 as PL9 printed it', async () => {
    const { verifyMuhurta } = await import('../src/muhurtaTables');
    const { fx, computed } = await load();
    const v = verifyMuhurta(fx.pl9, computed, ['vb ketu']);
    expect(v.failures).toEqual([]);
    expect(v.values).toBeGreaterThan(250);
  });
  it('names each value that differs', async () => {
    const { verifyMuhurta } = await import('../src/muhurtaTables');
    const { fx, computed } = await load();
    const wrong = { ...computed, thermometer: { ...computed.thermometer, level: 0.5 }, bhava: { ...computed.bhava, Gem: 1 }, planets: { ...computed.planets, sun: { ...computed.planets.sun!, avastha: 'dead' } } };
    const f = verifyMuhurta(fx.pl9, wrong, ['vb ketu']).failures.map((x) => x.split(':')[0]);
    expect(f).toEqual(expect.arrayContaining(['thermometer level', 'bhava Gem', 'planet sun avastha']));
  });
  it('fails a printout that lacks one of its three dasha lists', async () => {
    const { verifyMuhurta } = await import('../src/muhurtaTables');
    const { fx, computed } = await load();
    const mudasha = Object.fromEntries(Object.entries(fx.pl9.mudasha).filter(([k]) => !k.startsWith('native4.')));
    const f = verifyMuhurta({ ...fx.pl9, mudasha }, computed, ['vb ketu']).failures.map((x) => x.split(':')[0]);
    expect(f).toContain('dasha native4');
  });
});

describe('the thermometer\'s other activities', () => {
  for (const activity of ['general', 'marriage'] as const) {
    it(`accepts REF 0010's ${activity} thermometer on 2 July 2030 as PL9 printed it, and refuses the travelling one`, async () => {
      const { readFileSync } = await import('node:fs');
      const { join } = await import('node:path');
      const { createSwissEphemeris } = await import('@reverse/ephemeris');
      const { computeMuhurtaInputs, verifyMuhurta } = await import('../src/muhurtaTables');
      const root = join(__dirname, '..');
      const fx = JSON.parse(readFileSync(join(root, 'fixtures-muhurta-options', activity, 'ref-0010.json'), 'utf8')) as import('../src/muhurtaTables').MuhurtaFixture;
      const natal = (JSON.parse(readFileSync(join(root, 'refset-tempo.json'), 'utf8')) as { id: string; jdUt: number; latitude: number; longitudeEast: number }[]).find((r) => r.id === 'ref-0010')!;
      const eph = await createSwissEphemeris();
      try {
        expect(verifyMuhurta(fx.pl9, computeMuhurtaInputs(eph, natal, '2030-07-02', activity), ['vb rahu', 'vb ketu'], { someLists: true }).failures).toEqual([]);
        const wrong = verifyMuhurta(fx.pl9, computeMuhurtaInputs(eph, natal, '2030-07-02', 'travelling'), ['vb rahu', 'vb ketu'], { someLists: true }).failures.map((x) => x.split(':')[0]);
        expect(wrong).toEqual(expect.arrayContaining(['thermometer level']));
      } finally { eph.close(); }
    });
  }
});
