import { describe, expect, it } from 'vitest';
import { raja } from '../src/yogas/families/raja';
import { yogaChartFrom } from '../src/yogas/chart';
import type { Planet9 } from '../src/jaimini';

type Lons = Record<Planet9, number> & { lagna?: number };
const STRONG = { sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1 };
const ids = (lons: Lons) => raja(yogaChartFrom(lons, STRONG)).yogas.filter((y) => y.present).map((y) => y.id);
// Lagna in Aries: the lords Mars (1st), Moon (4th), Sun (5th), Venus (7th), Jupiter (9th), Saturn (10th), placed so
// that Mars is neither conjunct nor in mutual full aspect with any of them.
const LONS: Lons = { lagna: 10, sun: 130, moon: 40, mars: 15, mercury: 100, jupiter: 70, venus: 345, saturn: 280, rahu: 200, ketu: 20 };

describe('the Raja yogas', () => {
  it('pair the lords of angles and trines by conjunction or mutual full aspect', () => {
    expect(ids(LONS)).not.toContain('rajaLagnaLord');
    // Mars (lord of the 1st) joins Jupiter (lord of the 9th) in Gemini.
    expect(ids({ ...LONS, mars: 75 })).toContain('rajaLagnaLord');
    // Mars in Sagittarius and Jupiter in Gemini aspect each other on the 7th.
    expect(ids({ ...LONS, mars: 255 })).toContain('rajaLagnaLord');
  });

  it('count the lords of the 11th, 9th and 2nd from the Moon, in an angle from it', () => {
    // Aquarius rising: Jupiter rules the 2nd and the 11th. The Moon in Leo: the lords of the 11th, 9th and 2nd from
    // it are Mercury, Mars and Mercury; the angles from it are Leo, Scorpio, Aquarius and Taurus.
    expect(ids({ ...LONS, lagna: 310, moon: 130, mercury: 220 })).toContain('rajaJupiterLordOfWealth');
    expect(ids({ ...LONS, lagna: 310, moon: 130, mercury: 160, mars: 70 })).not.toContain('rajaJupiterLordOfWealth');
  });

  it('need the Lagna', () => {
    const { lagna: _, ...noLagna } = LONS;
    const r = raja(yogaChartFrom(noLagna, STRONG));
    expect(r.yogas).toEqual([]);
    expect(r.missing).toHaveLength(51);
  });
});
