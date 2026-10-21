import { describe, expect, it } from 'vitest';
import { aspectTable, lordships, shadvargaDispositors, taraMatrix, type Planet9 } from '../src/index';

// REF 0010 as PL9 prints it ("Nakshatra spatial matrix" and "Signs in all vargas" pages).
const dms = (sign: number, d: number, m: number, s: number) => sign * 30 + d + m / 60 + s / 3600;
const LON: Record<'lagna' | Planet9, number> = {
  lagna: dms(3, 16, 30, 55), sun: dms(1, 12, 23, 58), moon: dms(0, 26, 53, 22), mars: dms(4, 7, 15, 0),
  mercury: dms(1, 24, 5, 14), jupiter: dms(7, 17, 17, 35), venus: dms(0, 19, 32, 37), saturn: dms(10, 29, 41, 37),
  rahu: dms(6, 11, 39, 16), ketu: dms(0, 11, 39, 16),
};

describe('aspectTable', () => {
  const t = aspectTable(LON);
  const row = (on: Planet9) => t.value[t.planets.indexOf(on)]!.map(Math.trunc);
  it('gives the aspects on the Sun as PL9 prints them', () => {
    expect(row('sun')).toEqual([0, 0, 12, 0, 50, 0, 53, 45, 0]);
  });
  it('gives the aspects on Mars as PL9 prints them', () => {
    expect(row('mars')).toEqual([39, 39, 0, 28, 40, 36, 15, 2, 57]);
  });
});

describe('taraMatrix', () => {
  it('counts each cell from the column to the row, as the nakshatra matrix', () => {
    const m = taraMatrix(LON);
    expect(m.points[0]).toBe('lagna');
    expect(m.cells[0]!.slice(1).map((c) => c.name)).toEqual(['Pratyak', 'Sadhaka', 'Mitra', 'Kshema', 'Atimitra', 'Vadha', 'Sampat', 'Vipat', 'Mitra']);
    expect(m.cells[1]![0]).toMatchObject({ name: 'Sadhaka', good: true });
  });
});

describe('lordships', () => {
  it('places the lord of each house of D1', () => {
    const signs = { lagna: 3, sun: 1, moon: 0, mars: 4, mercury: 1, jupiter: 7, venus: 0, saturn: 10 };
    expect(lordships(signs).map((l) => [l.house, l.lord, l.inHouse])).toEqual([
      [1, 'moon', 10], [2, 'sun', 11], [3, 'mercury', 11], [4, 'venus', 10], [5, 'mars', 2], [6, 'jupiter', 5],
      [7, 'saturn', 8], [8, 'saturn', 8], [9, 'jupiter', 5], [10, 'mars', 2], [11, 'venus', 10], [12, 'mercury', 11],
    ]);
  });
});

describe('shadvargaDispositors', () => {
  // Signs (0 = Aries) in D1, D2, D3, D9, D12, D30, from the "Signs in all vargas" page.
  const S = { sun: [1, 3, 5, 0, 5, 11], mars: [4, 4, 4, 2, 6, 10], jupiter: [7, 4, 11, 8, 1, 11], rahu: [6, 4, 10, 9, 10, 8] };
  const vargas = Object.fromEntries(['D1', 'D2', 'D3', 'D9', 'D12', 'D30'].map((v, i) => [v, Object.fromEntries(Object.entries(S).map(([p, s]) => [p, s[i]]))]));
  const d = shadvargaDispositors(vargas as never);
  it('counts the lords of each planet\'s signs, most first', () => {
    expect(d.sun).toEqual([{ lord: 'mercury', count: 2 }, { lord: 'moon', count: 1 }, { lord: 'mars', count: 1 }, { lord: 'jupiter', count: 1 }, { lord: 'venus', count: 1 }]);
    expect(d.mars).toEqual([{ lord: 'sun', count: 3 }, { lord: 'mercury', count: 1 }, { lord: 'venus', count: 1 }, { lord: 'saturn', count: 1 }]);
    expect(d.rahu!.map((x) => [x.lord, x.count])).toEqual([['saturn', 3], ['sun', 1], ['jupiter', 1], ['venus', 1]]);
  });
});
