import { describe, expect, it } from 'vitest';
import { kotaChakra } from '../src/index';

describe('the Kota Chakra', () => {
  it('numbers the 28 nakshatras, Abhijit among them, from the natal Moon\'s, and places each transit planet in its own', () => {
    // REF 0010: the natal Moon in Krittika (26°53' Aries) is 1; Mars in transit at 16°28' Cancer (Pushya) is 6.
    const k = kotaChakra(26 + 53 / 60, { mars: 90 + 16 + 28 / 60, moon: 240 + 10 + 47 / 60 }, 'pl9');
    expect(k.first).toBe(2);
    expect(k.places).toEqual({ mars: 6, moon: 17 });
  });
  it('counts Abhijit in its place, between Uttara Ashadha and Shravana', () => {
    const k = kotaChakra(0, { sun: 278 }, 'pl9');
    expect(k.places.sun).toBe(22);
  });
});
