import { describe, expect, it } from 'vitest';
import { dhana } from '../src/yogas/families/dhana';
import { yogaChartFrom } from '../src/yogas/chart';
import type { Planet9 } from '../src/jaimini';

type Lons = Record<Planet9, number> & { lagna?: number };
const STRONG = { sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1 };
// Lagna in Aries: the lords Mars (1st), Venus (2nd), Sun (5th), Jupiter (9th), Saturn (11th).
const LONS: Lons = { lagna: 10, sun: 130, moon: 40, mars: 15, mercury: 100, jupiter: 70, venus: 345, saturn: 280, rahu: 200, ketu: 20 };
const ids = (lons: Lons) => dhana(yogaChartFrom(lons, STRONG)).yogas.filter((y) => y.present).map((y) => y.id);

describe('the Dhana yogas', () => {
  it('see the lords of wealth associated, by conjunction or the full aspect of the second', () => {
    expect(ids(LONS)).not.toContain('dhanaLagnaLord');
    // Venus (2nd lord) in Libra aspects Mars (1st lord) in Aries.
    expect(ids({ ...LONS, venus: 190 })).toContain('dhanaLagnaLord');
  });
  it('see the exchange of the lords of the 1st and the 2nd', () => {
    // Mars in Taurus and Venus in Aries.
    expect(ids({ ...LONS, mars: 40, venus: 20 })).toContain('ayatnadhanalabha');
  });
  it('report the yogas that test a planet\'s state as missing', () => {
    const r = dhana(yogaChartFrom(LONS, STRONG));
    expect(r.missing.map((m) => m.id)).toEqual(expect.arrayContaining(['danNinthLordState', 'matrumulaladdhana']));
    expect(r.missing).toHaveLength(7);
  });
});
