/** The 30 tithis as PL9 prints them, from the new Moon. */
export const TITHIS: readonly string[] = [
  ...['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'].map((n) => `Shukla ${n}`),
  'Shukla Poornima',
  ...['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'].map((n) => `Krishna ${n}`),
  'Krishna Amavasya',
];

/** The 27 yogas as PL9 prints them. */
export const YOGAS: readonly string[] = [
  'Vishkumbha', 'Preeti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shoolam', 'Ganda', 'Vriddhi', 'Dhruva',
  'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma',
  'Indra', 'Vaidhriti',
];

/** The 11 karanas: the seven movable ones, then the four fixed ones. PL9 spells Vishti "Visthi" in its Gochara data. */
export const KARANAS: readonly string[] = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'];

/** The angle of the Moon from the Sun, 0 to 360. */
const elongation = (sun: number, moon: number) => (((moon - sun) % 360) + 360) % 360;

/** The tithi, 1 to 30: the twelfths of the Moon's elongation from the Sun. */
export function tithiOf(sun: number, moon: number): number {
  return Math.min(29, Math.floor(elongation(sun, moon) / 12)) + 1;
}

/** The karana, 1 to 60: the half-tithis. */
export function karanaOf(sun: number, moon: number): number {
  return Math.min(59, Math.floor(elongation(sun, moon) / 6)) + 1;
}

/** The name of a karana, 1 to 60: Kimstughna, eight rounds of the movable seven, then Shakuni, Chatushpada and Naga. */
export function karanaName(karana: number): string {
  if (karana === 1) return KARANAS[10]!;
  if (karana >= 58) return KARANAS[karana - 51]!;
  return KARANAS[(karana - 2) % 7]!;
}

/** The yoga, 1 to 27: the parts of 13°20' of the sum of the Sun's and the Moon's longitudes. */
export function yogaOf(sun: number, moon: number): number {
  return Math.min(26, Math.floor((((sun + moon) % 360) + 360) % 360 / (40 / 3))) + 1;
}
