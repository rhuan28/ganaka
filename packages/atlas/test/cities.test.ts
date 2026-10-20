import { describe, expect, it } from 'vitest';
import { loadCities, loadTz } from '../src/index';

const cities = loadCities();
const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const find = (name: string, country: string) => cities.find((c) => c.name === name && c.country.code === country);

describe('the cities', () => {
  it('hold the places the astrologers use, with their region and zone', () => {
    const sp = find('São Paulo', 'BR')!;
    expect([sp.country.name, sp.admin1?.name, sp.timeZone]).toEqual(['Brazil', 'São Paulo', 'America/Sao_Paulo']);
    expect(sp.population).toBeGreaterThan(10_000_000);
    expect(find('Taubaté', 'BR')).toBeDefined();
    expect(find('Jaipur', 'IN')!.timeZone).toBe('Asia/Kolkata');
    expect(find('New York City', 'US')).toBeDefined();
  });
  it('have a zone the time zone database knows, already canonical', () => {
    const tz = loadTz();
    const unknown = cities.filter((c) => tz.canonical(c.timeZone) !== c.timeZone);
    expect(unknown.slice(0, 5)).toEqual([]);
  });
  it('keep at most eight other names, in Latin script, none the name again but for accents and case', () => {
    const wrong: string[] = [];
    for (const c of cities) {
      if (c.altNames.length > 8) wrong.push(`${c.name}: ${c.altNames.length} names`);
      const own = new Set([fold(c.name), fold(c.asciiName)]);
      for (const a of c.altNames) {
        if (own.has(fold(a))) wrong.push(`${c.name}: "${a}" is its own name`);
        if (!/^[\p{Script=Latin}\p{N}\p{Zs}'’.,()\-]+$/u.test(a)) wrong.push(`${c.name}: "${a}" not in Latin script`);
      }
    }
    expect(wrong.slice(0, 5)).toEqual([]);
  });
});
