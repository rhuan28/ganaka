import { describe, expect, it } from 'vitest';
import { mahapurusha } from '../src/yogas/families/mahapurusha';
import { yogaChartFrom } from '../src/yogas/chart';
import type { Planet9 } from '../src/jaimini';

type Lons = Record<Planet9, number> & { lagna?: number };
// Lagna in Aries. Mars in Capricorn (exalted, 10th), Jupiter in Cancer (exalted, 4th) with the Moon, Saturn in
// Taurus (2nd, not an angle), Venus in Libra (own, 7th), Mercury in Leo (5th).
const LONS: Lons = { lagna: 10, sun: 100, moon: 95, mars: 280, mercury: 130, jupiter: 105, venus: 190, saturn: 40, rahu: 70, ketu: 250 };
const STRONG = { sun: 1.2, moon: 1.1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1 };
const present = (lons: Lons, ratio: Record<string, number> | null = STRONG) =>
  mahapurusha(yogaChartFrom(lons, ratio as never)).yogas.filter((y) => y.present).map((y) => y.id).sort();

describe('Pancha Mahapurusha', () => {
  it('forms for a planet in an angle from the Lagna in its own sign or exaltation', () => {
    expect(present(LONS)).toEqual(['hamsa', 'hamsaWithLuminary', 'malavya', 'ruchaka']);
  });

  it('counts moolatrikona as own sign, and needs the angle', () => {
    // Saturn in Aquarius (moolatrikona up to 20°) in the 11th: no; Lagna in Taurus makes it the 10th.
    expect(present({ ...LONS, saturn: 305 })).not.toContain('shasha');
    expect(present({ ...LONS, lagna: 40, saturn: 305 })).toContain('shasha');
  });

  it('lists apart the weakened form with the Sun or the Moon in the planet\'s sign', () => {
    // The Sun joins Mars in Capricorn.
    expect(present({ ...LONS, sun: 285 })).toContain('ruchakaWithLuminary');
    expect(present({ ...LONS, sun: 285 })).toContain('ruchaka');
  });

  it('lists apart the form with the Sun and the Moon both weak', () => {
    const weak = { ...STRONG, sun: 0.9, moon: 0.8 };
    expect(present(LONS, weak)).toEqual(['hamsa', 'hamsaWeakLuminaries', 'hamsaWithLuminary', 'malavya', 'malavyaWeakLuminaries', 'ruchaka', 'ruchakaWeakLuminaries']);
    expect(present(LONS, { ...STRONG, sun: 0.9 })).not.toContain('ruchakaWeakLuminaries');
  });

  it('names the planet and its house', () => {
    const r = mahapurusha(yogaChartFrom(LONS, STRONG)).yogas.find((y) => y.id === 'ruchaka')!;
    expect(r).toMatchObject({ family: 'mahapurusha', present: true, planets: ['mars'], houses: [10] });
  });

  it('reports the forms it cannot decide as missing: all without a Lagna, the weak form without the Shadbala', () => {
    const { lagna: _, ...noLagna } = LONS;
    const r = mahapurusha(yogaChartFrom(noLagna, null));
    expect(r.yogas).toEqual([]);
    expect(r.missing).toHaveLength(15);
    const s = mahapurusha(yogaChartFrom(LONS, null));
    expect(s.missing.map((m) => m.id).sort()).toEqual(['bhadraWeakLuminaries', 'hamsaWeakLuminaries', 'malavyaWeakLuminaries', 'ruchakaWeakLuminaries', 'shashaWeakLuminaries']);
  });
});
