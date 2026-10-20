import { describe, expect, it } from 'vitest';
import { parseVarshaphala } from '../src/varshaphalaTables';

describe('the raw Varshaphala files', () => {
  it('read each part by its keys', () => {
    const v = parseVarshaphala([
      'chart\tREF 0010',
      'vsreturn\t1.date\t27 May 1996',
      'vsreturn\t1.time\t05:24',
      'vsreturn\t1.lagna\t26:46',
      'vsreturn\t1.yearLord\tvenus',
      'vsreturn\t1.muntha\tLeo 16:30:50',
      'vsmonth\t2.monthLord\tsun',
      'vsyear\tpassed\t35',
      'vsplanet\tjupiter.speed\t-00:07:08',
      'vsharsha\tsun.total\t10',
      'vspancha\tsun.uchcha\t16.40',
      'vslords\tmunthaPati.planet\tmercury',
      'vslords\tmunthaSign\tGem 16:30:50',
      'vsyoga\t3.present\t1',
      'vsyoga\t4.planets\tmoon-sun,sun-saturn',
      'vstripataki\tcell.sun\t5',
      'vstripataki\tvedha.moon\tsaturn rahu ketu',
      'vssaham\tPunya.degree\t22:07:02',
      'vsdasha\tmuddaBirth.1.2.start\t06-06-2030 01:44',
      'vsdasha\tpatyayini.1.1.end\t10-06-2030 16:52',
      '',
    ].join('\n'));
    expect(v.chart).toBe('REF 0010');
    expect(v.parts.vsreturn['1.muntha']).toBe('Leo 16:30:50');
    expect(v.parts.vsyear.passed).toBe('35');
    expect(v.parts.vsdasha['patyayini.1.1.end']).toBe('10-06-2030 16:52');
    expect(v.parts.vsmonth['2.monthLord']).toBe('sun');
  });

  it('refuse a part, a key or a value they do not know, naming the line', () => {
    expect(() => parseVarshaphala('chart\tREF 0010\nvsfoo\tx\t1\n')).toThrow(/line 2/);
    expect(() => parseVarshaphala('chart\tREF 0010\nvsreturn\t1.pluto\t10:00\n')).toThrow(/line 2/);
    expect(() => parseVarshaphala('chart\tREF 0010\nvsreturn\t1.sun\tten\n')).toThrow(/line 2/);
    expect(() => parseVarshaphala('chart\tREF 0010\nvsyoga\t17.present\t1\n')).toThrow(/line 2/);
    expect(() => parseVarshaphala('chart\tREF 0010\nvsdasha\tvimshottari.1.lord\tsun\n')).toThrow(/line 2/);
  });
});

describe('the Varshaphala check', () => {
  const load = async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const { createSwissEphemeris } = await import('@reverse/ephemeris');
    const { computeVarshaphalaInputs } = await import('../src/varshaphalaTables');
    const root = join(__dirname, '..');
    const fx = JSON.parse(readFileSync(join(root, 'fixtures-varshaphala', '2030', 'ref-0010.json'), 'utf8')) as import('../src/varshaphalaTables').VarshaphalaFixture;
    const natal = (JSON.parse(readFileSync(join(root, 'refset-tempo.json'), 'utf8')) as { id: string; jdUt: number; latitude: number; longitudeEast: number }[]).find((r) => r.id === 'ref-0010')!;
    const eph = await createSwissEphemeris();
    try { return { fx, computed: computeVarshaphalaInputs(eph, natal, 35, 'true', true) }; } finally { eph.close(); }
  };
  it('accepts REF 0010 in 2030 as PL9 printed it', async () => {
    const { verifyVarshaphala } = await import('../src/varshaphalaTables');
    const { fx, computed } = await load();
    const v = verifyVarshaphala(fx.pl9, computed, []);
    expect(v.failures).toEqual([]);
    expect(v.values).toBeGreaterThan(2000);
  });
  it('names each value that differs', async () => {
    const { verifyVarshaphala } = await import('../src/varshaphalaTables');
    const { fx, computed } = await load();
    const wrong = { ...computed, lords: { ...computed.lords!, yearLord: 'sun' }, sahams: { ...computed.sahams, Punya: { ...computed.sahams.Punya!, longitude: computed.sahams.Punya!.longitude + 0.1 } } };
    const v = verifyVarshaphala(fx.pl9, wrong, []);
    expect(v.failures.map((x) => x.split(':')[0])).toEqual(expect.arrayContaining(['year lord', 'saham Punya']));
  });
  it('fails each printed Saham the core does not give, instead of passing with nothing compared', async () => {
    const { verifyVarshaphala } = await import('../src/varshaphalaTables');
    const { fx, computed } = await load();
    const v = verifyVarshaphala(fx.pl9, { ...computed, sahams: {} }, []);
    expect(v.failures.filter((x) => x.startsWith('saham '))).toHaveLength(37);
  });
  it('names each Tripataki value that differs', async () => {
    const { verifyVarshaphala } = await import('../src/varshaphalaTables');
    const { fx, computed } = await load();
    const wrong = { ...computed, tripataki: { cell: { ...computed.tripataki!.cell, sun: 6 }, vedha: { ...computed.tripataki!.vedha, moon: ['saturn'] } } };
    const f = verifyVarshaphala(fx.pl9, wrong, []).failures.map((x) => x.split(':')[0]);
    expect(f).toEqual(expect.arrayContaining(['tripataki cell sun', 'tripataki vedha moon']));
  });
  it('names a known difference that no longer happens (a stale pending)', async () => {
    const { verifyVarshaphala } = await import('../src/varshaphalaTables');
    const { fx, computed } = await load();
    const v = verifyVarshaphala(fx.pl9, computed, ['patyayini', 'saham Punya']);
    expect(v.stale).toEqual(['patyayini', 'saham Punya']);
    const wrong = { ...computed, sahams: { ...computed.sahams, Punya: { ...computed.sahams.Punya!, longitude: computed.sahams.Punya!.longitude + 0.1 } } };
    expect(verifyVarshaphala(fx.pl9, wrong, ['saham Punya']).stale).toEqual([]);
  });
  it('names the listed reports that have no printout', async () => {
    const { pendingWithoutReport } = await import('../src/varshaphalaTables');
    expect(pendingWithoutReport({ 'ref-0001 2030': ['x'], 'ref-0002 2030': ['y'] }, new Set(['ref-0001 2030']))).toEqual(['ref-0002 2030']);
  });
  it('takes a known difference named exactly before one that names it by its start', async () => {
    const { verifyVarshaphala } = await import('../src/varshaphalaTables');
    const { fx, computed } = await load();
    const p = computed.sahams.Punya!;
    const wrong = { ...computed, sahams: { ...computed.sahams, Punya: { ...p, longitude: p.longitude + 0.1, lord: p.lord === 'sun' ? 'moon' : 'sun' } } };
    expect(verifyVarshaphala(fx.pl9, wrong, ['saham Punya', 'saham Punya lord']).stale).toEqual([]);
  });
  it('checks only the 72 returns when asked (the reports above 120 years)', async () => {
    const { verifyVarshaphala } = await import('../src/varshaphalaTables');
    const { fx, computed } = await load();
    const only = verifyVarshaphala(fx.pl9, { ...computed, lords: null }, [], { returnsOnly: true });
    expect(only.failures).toEqual([]);
    expect(only.values).toBe(72 * 13);
    const wrong = { ...computed, returns: computed.returns.map((r, i) => (i === 0 ? { ...r, yearLord: 'sun' } : r)) };
    expect(verifyVarshaphala(fx.pl9, wrong, [], { returnsOnly: true }).failures[0]).toMatch(/^vsreturn 1 yearLord/);
  });
});
