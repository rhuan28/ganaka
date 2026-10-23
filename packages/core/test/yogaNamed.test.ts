import { describe, expect, it } from 'vitest';
import { named } from '../src/yogas/families/named';
import { yogaChartFrom } from '../src/yogas/chart';
import type { Planet9 } from '../src/jaimini';

type Lons = Record<Planet9, number> & { lagna?: number };
const STRONG = { sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1 };
// Lagna in Aries: Mars (1st lord) in Leo, Venus (2nd) in Taurus, Mercury (3rd) in Virgo, Moon (4th) in Libra.
const LONS: Lons = { lagna: 10, sun: 100, moon: 190, mars: 130, mercury: 160, jupiter: 250, venus: 40, saturn: 300, rahu: 70, ketu: 250 };
const ids = (lons: Lons, opts = {}) => named(yogaChartFrom(lons, STRONG, opts)).yogas.filter((y) => y.present).map((y) => y.id);

describe('the other named yogas', () => {
  it('see a house lord in a dusthana: Ava for the 1st, Mriti for the 3rd', () => {
    expect(ids(LONS)).toContain('mriti');
    expect(ids(LONS)).not.toContain('ava');
    expect(ids({ ...LONS, mars: 170 })).toContain('ava');
  });
  it('see Maha-Bhagya for a man born by day with the Sun, the Moon and the Lagna in odd signs', () => {
    // The Sun in Libra, 180° ahead of the Lagna (above the horizon), the Moon in Sagittarius: all odd.
    const day: Lons = { ...LONS, sun: 190, moon: 250 };
    expect(ids(day)).toContain('mahaBhagyaMale');
    expect(ids(day, { sex: 'female' })).not.toContain('mahaBhagyaMale');
  });
  it('never see the yogas PL9 cannot read', () => {
    expect(named(yogaChartFrom(LONS, STRONG)).yogas.filter((y) => ['dhenu', 'saraswati', 'amshavatara'].includes(y.id)).every((y) => !y.present)).toBe(true);
  });
});
