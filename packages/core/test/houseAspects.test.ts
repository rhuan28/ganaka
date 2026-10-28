import { describe, expect, it } from 'vitest';
import { aspectValue, houseAspects } from '../src';

// The Lagna at 15° Aries; Mars and the rest spread so that the aspects differ.
const L = { lagna: 15, sun: 195, moon: 100, mars: 45, mercury: 210, jupiter: 250, venus: 300, saturn: 330, rahu: 70, ketu: 250 };

describe('the aspects on the houses', () => {
  it('gives twelve houses, each with its sign\'s lord', () => {
    const h = houseAspects(L);
    expect(h.map((x) => x.house)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(h[0]!.lord).toBe('mars');
    expect(h[3]!.lord).toBe('moon');
  });
  it('cuts the aspect on the house\'s point to the whole percent', () => {
    // The Sun exactly opposite the Lagna: a full aspect on the 1st house.
    expect(houseAspects(L)[0]!.onHouse[0]).toBe(100);
    const v = aspectValue('moon', 15 + 90 - 100);
    expect(houseAspects(L)[3]!.onHouse[1]).toBe(Math.trunc(v / 0.6));
  });
  it('cuts the house\'s half before adding the lord\'s, the lord counting nothing on itself', () => {
    const h1 = houseAspects(L)[0]!;
    const sun = Math.trunc(Math.trunc(aspectValue('sun', 15 - 195 + 360) / 1.2) + aspectValue('sun', 45 - 195 + 360) / 1.2);
    expect(h1.withLord[0]).toBe(sun);
    expect(h1.withLord[2]).toBe(Math.trunc(aspectValue('mars', 15 - 45 + 360) / 1.2));
  });
});
