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
  it('see the yogas of a varga dignity, which must be exactly the one named', () => {
    // The varga dignity is set by hand: building a chart with a planet own or exalted in ten vargas is long.
    const withDignity = (lons: Lons, p: Planet9, n: number) => { const ch = yogaChartFrom(lons, STRONG); return dhana({ ...ch, vargaDignity: { ...ch.vargaDignity, [p]: n } }); };
    const present = (r: ReturnType<typeof dhana>) => r.yogas.filter((y) => y.present).map((y) => y.id);
    // The 2nd lord Venus strong and with the 4th lord, the Moon, in Pisces; the Moon Vaisheshika (10).
    expect(present(withDignity({ ...LONS, moon: 350 }, 'moon', 10))).toContain('matrumulaladdhana');
    expect(present(withDignity({ ...LONS, moon: 350 }, 'moon', 9))).not.toContain('matrumulaladdhana');
    // Mars, the Lagna lord, Vaisheshika; Venus with Jupiter, or with Mercury, the 6th lord.
    expect(present(withDignity({ ...LONS, jupiter: 350 }, 'mars', 10))).toContain('putramulaladdhana');
    expect(present(withDignity({ ...LONS, mercury: 350 }, 'mars', 10))).toContain('satrumuladdhana');
    // Jupiter, the 9th lord, in Simhasana (5) and with the lords of the 1st and the 10th.
    expect(present(withDignity({ ...LONS, mars: 75, saturn: 72 }, 'jupiter', 5))).toContain('danNinthLordTenthLordState');
    expect(present(withDignity({ ...LONS, mars: 75, saturn: 72 }, 'jupiter', 6))).not.toContain('danNinthLordTenthLordState');
  });
  it('see Svaveeryaddhana with the Lagna lord the strongest planet, by Shadbala over the minimum, the later on a tie', () => {
    // Mars, the Lagna lord, in Aries with Jupiter; Venus, the 2nd lord, Vaisheshika.
    const lons = { ...LONS, jupiter: 20 };
    const run = (ratio: Record<string, number>) => { const ch = yogaChartFrom(lons, { ...STRONG, ...ratio }); return dhana({ ...ch, vargaDignity: { ...ch.vargaDignity, venus: 10 } }); };
    const present = (r: ReturnType<typeof dhana>) => r.yogas.filter((y) => y.present).map((y) => y.id);
    expect(present(run({ mars: 1.5 }))).toContain('svaveeryaddhanaStrongLagnaLord');
    expect(present(run({ mars: 1.5, saturn: 1.6 }))).not.toContain('svaveeryaddhanaStrongLagnaLord');
    // A tie goes to the later planet: Saturn after Mars.
    expect(present(run({ mars: 1.5, saturn: 1.5 }))).not.toContain('svaveeryaddhanaStrongLagnaLord');
    expect(present(run({ mars: 1.5, sun: 1.5 }))).toContain('svaveeryaddhanaStrongLagnaLord');
    // Without the Shadbala it cannot be told.
    expect(dhana(yogaChartFrom(lons, null)).missing.map((m) => m.id)).toEqual(['svaveeryaddhanaStrongLagnaLord']);
  });
});
