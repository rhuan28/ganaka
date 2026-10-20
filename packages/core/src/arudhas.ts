import { SIGN_LORDS, type Planet7 } from './specialLagnas';

/**
 * 'parashara' and 'knrao' are PL9's "Bhavapada calculation"; PL9's K.N.Rao keeps the count alone, as 'none' does,
 * which is also how PL9 gives the Arudha Lagna among its special points. See docs/spec/arudhas.md.
 */
export type PadaMethod = 'parashara' | 'knrao' | 'none';

/**
 * Arudha pada, 0 to 11, of a house in `houseSign` whose lord is in `lordSign`: as many signs on from the lord as the
 * lord is from the house. By Parashara, a pada that falls in the house itself or in its seventh moves to the tenth
 * from there; by K.N.Rao, as PL9 gives it, it stays.
 */
export function arudhaPada(houseSign: number, lordSign: number, method: PadaMethod): number {
  const distance = (lordSign - houseSign + 12) % 12;
  const pada = (lordSign + distance) % 12;
  if (method !== 'parashara') return pada;
  return pada === houseSign || pada === (houseSign + 6) % 12 ? (pada + 9) % 12 : pada;
}

/** The arudha padas of the twelve houses, the first house first; each sign takes its lord from SIGN_LORDS. */
export function arudhaPadas(lagnaSign: number, signOf: (planet: Planet7) => number, method: PadaMethod): number[] {
  return Array.from({ length: 12 }, (_, h) => {
    const sign = (lagnaSign + h) % 12;
    return arudhaPada(sign, signOf(SIGN_LORDS[sign]!), method);
  });
}

/**
 * The Upapada as PL9 gives it: the pada of the twelfth house, counted backwards from an even Lagna, so that the
 * twelfth from an even Lagna is the sign after it.
 */
export function upapada(lagnaSign: number, signOf: (planet: Planet7) => number): number {
  const twelfth = lagnaSign % 2 === 0 ? (lagnaSign + 11) % 12 : (lagnaSign + 1) % 12;
  return arudhaPada(twelfth, signOf(SIGN_LORDS[twelfth]!), 'parashara');
}
