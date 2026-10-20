import { describe, expect, it } from 'vitest';
import { searchCities } from '../src/index';

const first = (q: string, o?: { country?: string }) => searchCities(q, o)[0];

describe('the city search', () => {
  it('finds a city with or without accents, in any case, by the start of its name', () => {
    for (const q of ['sao paulo', 'SÃO PAULO', 'sao pa']) {
      const c = first(q)!;
      expect([q, c.name, c.country.code]).toEqual([q, 'São Paulo', 'BR']);
    }
    expect(first('taubate')!.name).toBe('Taubaté');
  });
  it('finds a city by a word of its name, the most populous first', () => {
    expect(searchCities('paulo').some((c) => c.name === 'São Paulo')).toBe(true);
    const paris = searchCities('paris', { limit: 50 });
    expect([paris[0]!.name, paris[0]!.country.code]).toEqual(['Paris', 'FR']);
    expect(paris.findIndex((c) => c.country.code === 'US')).toBeGreaterThan(0);
    // A city's own name ranks above another name of a larger one ("Paris of the North", Warsaw).
    expect(paris.findIndex((c) => c.name === 'Warsaw')).toBeGreaterThan(paris.findIndex((c) => c.country.code === 'US'));
  });
  it('puts a large city whose own name starts with the query above small ones named exactly so', () => {
    expect(first('rio')!.name).toBe('Rio de Janeiro');
    expect(first('belo')!.name).toBe('Belo Horizonte');
    expect(first('porto')!.name).toBe('Porto Alegre');
  });
  it('narrows to a country, limits the list, and finds nothing for nothing', () => {
    expect([first('jaipur', { country: 'IN' })!.name, first('jaipur', { country: 'IN' })!.country.code]).toEqual(['Jaipur', 'IN']);
    expect(searchCities('san', { limit: 3 })).toHaveLength(3);
    expect(searchCities('san', { limit: 500 }).length).toBeLessThanOrEqual(50);
    expect(searchCities('')).toEqual([]);
    expect(searchCities('   ')).toEqual([]);
  });
});
