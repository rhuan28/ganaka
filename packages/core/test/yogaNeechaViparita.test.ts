import { describe, expect, it } from 'vitest';
import { neechaBhanga } from '../src/yogas/families/neechaBhanga';
import { viparita } from '../src/yogas/families/viparita';
import { yogaChartFrom } from '../src/yogas/chart';
import type { Planet9 } from '../src/jaimini';

type Lons = Record<Planet9, number> & { lagna?: number };
const STRONG = { sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1 };
// Lagna in Aries; the Sun debilitated in Libra (7th).
const LONS: Lons = { lagna: 10, sun: 190, moon: 40, mars: 130, mercury: 200, jupiter: 70, venus: 160, saturn: 280, rahu: 100, ketu: 280 };
const ids = (f: typeof neechaBhanga, lons: Lons) => f(yogaChartFrom(lons, STRONG)).yogas.filter((y) => y.present).map((y) => y.id);

describe('Neecha Bhanga', () => {
  it('sees the lord of the debilitated planet\'s exaltation sign in an angle', () => {
    expect(ids(neechaBhanga, LONS)).not.toContain('neechaBhangaExaltationLordInKendra');
    // Mars, lord of Aries where the Sun is exalted, in Cancer (4th).
    expect(ids(neechaBhanga, { ...LONS, mars: 100 })).toContain('neechaBhangaExaltationLordInKendra');
  });
  it('sees the mutual debilitation of the Sun and Saturn, and never PL9\'s first definition', () => {
    expect(ids(neechaBhanga, { ...LONS, saturn: 10 })).toContain('neechaBhangaMutualDebilitation');
    expect(ids(neechaBhanga, LONS)).not.toContain('neechaBhangaGeneral');
  });
});

describe('Viparita Raja', () => {
  it('sees the lord of the 6th, 8th or 12th in a dusthana', () => {
    // Lagna in Aries: Mercury (6th lord) in Libra, the 7th; Mars (8th lord) in Leo; Jupiter (12th lord) in Gemini.
    expect(ids(viparita, LONS)).toEqual([]);
    expect(ids(viparita, { ...LONS, mercury: 160 })).toEqual(['viparitaHarsha']);
  });
});
