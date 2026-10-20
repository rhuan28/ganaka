import { norm360 } from '../zodiac';

export const AVASTHAS = ['infant', 'youth', 'adolescent', 'old', 'dead'] as const;
export type Avastha = (typeof AVASTHAS)[number];

/**
 * The Baladi Avastha as PL9's Muhurta page shows it (from the printouts: 18 of 18 planets in the two Muhurta charts):
 * the sign in bands of 6 degrees, infant, youth, adolescent, old and dead in the odd signs (Aries, Gemini...), the
 * order reversed in the even ones. PL9 prints "Youth." for the second band and "Adoles." for the third.
 */
export function baladiAvastha(longitude: number): Avastha {
  const l = norm360(longitude);
  const band = Math.min(4, Math.floor((l % 30) / 6));
  return AVASTHAS[Math.floor(l / 30) % 2 === 0 ? band : 4 - band]!;
}
