import { describe, expect, it } from 'vitest';
import { aspectsFully, conjunct, exchange, houseFrom, houseLord, inGroup, ownSign, signOf, signOfHouse } from '../src/yogas/primitives';
import type { Planet9 } from '../src/jaimini';

const signs = (o: Partial<Record<Planet9, number>>) => ({ sun: 0, moon: 1, mars: 2, mercury: 3, jupiter: 4, venus: 5, saturn: 6, rahu: 7, ketu: 1, ...o });

describe('the houses', () => {
  it('count whole signs from the reference, which is the 1st', () => {
    expect(houseFrom(0, 0)).toBe(1);
    expect(houseFrom(10, 1)).toBe(4);
    expect(signOfHouse(10, 4)).toBe(1);
    expect(signOf(359.99)).toBe(11);
    expect(signOf(-1)).toBe(11);
  });
  it('form the groups, the trine without the 1st', () => {
    expect([1, 4, 7, 10].every((h) => inGroup(h, 'kendra'))).toBe(true);
    expect(inGroup(1, 'trikona')).toBe(false);
    expect(inGroup(9, 'trikona') && inGroup(9, 'apoklima')).toBe(true);
    expect(inGroup(11, 'upachaya') && !inGroup(11, 'dusthana')).toBe(true);
  });
  it('have the lords of their signs', () => {
    expect(houseLord(0, 1)).toBe('mars');
    expect(houseLord(0, 8)).toBe('mars');
    expect(houseLord(9, 2)).toBe('saturn');
    expect(houseLord(3, 2)).toBe('sun');
  });
});

describe('the relations between planets', () => {
  it('see full sign aspects: the 7th for all, and the special ones', () => {
    expect(aspectsFully('sun', 0, 6)).toBe(true);
    expect(aspectsFully('sun', 0, 3)).toBe(false);
    expect(aspectsFully('mars', 0, 3) && aspectsFully('mars', 0, 7)).toBe(true);
    expect(aspectsFully('jupiter', 0, 4) && aspectsFully('jupiter', 0, 8)).toBe(true);
    expect(aspectsFully('saturn', 0, 2) && aspectsFully('saturn', 0, 9)).toBe(true);
    expect(aspectsFully('rahu', 0, 4) && aspectsFully('ketu', 0, 8)).toBe(true);
    expect(aspectsFully('saturn', 0, 4)).toBe(false);
  });
  it('see a conjunction in the same sign and an exchange of signs', () => {
    expect(conjunct(signs({ mars: 4 }), 'mars', 'jupiter')).toBe(true);
    expect(conjunct(signs({}), 'mars', 'mars')).toBe(false);
    // Mars in Sagittarius (Jupiter's) and Jupiter in Aries (Mars's).
    expect(exchange(signs({ mars: 8, jupiter: 0 }), 'mars', 'jupiter')).toBe(true);
    expect(exchange(signs({ mars: 8, jupiter: 2 }), 'mars', 'jupiter')).toBe(false);
  });
  it('count moolatrikona as own sign', () => {
    expect([ownSign(2), ownSign(3), ownSign(1), ownSign(4)]).toEqual([true, true, false, false]);
  });
});
