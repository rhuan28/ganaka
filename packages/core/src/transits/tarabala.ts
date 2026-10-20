import { nakshatraOf, signOf } from '../zodiac';

/** The nine taras, counted from the natal Moon's nakshatra, as PL9 names them. */
export const TARAS = ['Janma', 'Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhaka', 'Vadha', 'Mitra', 'Atimitra'] as const;
const GOOD_TARAS = [2, 4, 6, 8, 9];
const BAD_HOUSES = [6, 8, 12];

/** The tara (1 to 9) of the transit Moon from the natal Moon: the nakshatras between them, in nines. Read in PL9. */
export function tarabala(natalMoon: number, transitMoon: number): { count: number; name: (typeof TARAS)[number]; good: boolean } {
  const count = ((((nakshatraOf(transitMoon) - nakshatraOf(natalMoon)) % 9) + 9) % 9) + 1;
  return { count, name: TARAS[count - 1]!, good: GOOD_TARAS.includes(count) };
}

/** The house (1 to 12) of the transit Moon's sign from the natal Moon's; bad at 6, 8 and 12. Read in PL9. */
export function chandrabala(natalMoon: number, transitMoon: number): { house: number; good: boolean } {
  const house = ((((signOf(transitMoon) - signOf(natalMoon)) % 12) + 12) % 12) + 1;
  return { house, good: !BAD_HOUSES.includes(house) };
}
