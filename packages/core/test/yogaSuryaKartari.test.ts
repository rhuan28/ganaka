import { describe, expect, it } from 'vitest';
import { surya } from '../src/yogas/families/surya';
import { kartari } from '../src/yogas/families/kartari';
import { yogaChartFrom } from '../src/yogas/chart';
import type { Planet9 } from '../src/jaimini';

type Lons = Record<Planet9, number> & { lagna?: number };
const STRONG = { sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1 };
const ids = (r: { yogas: { id: string; present: boolean }[] }) => r.yogas.filter((y) => y.present).map((y) => y.id);

describe('the Sun\'s yogas', () => {
  // Sun in Leo; Venus in Virgo (2nd from it); the waxing Moon in Libra (3rd); the rest away from Cancer and Virgo.
  const LONS: Lons = { lagna: 10, sun: 130, moon: 190, mars: 250, mercury: 220, jupiter: 280, venus: 160, saturn: 310, rahu: 40, ketu: 220 };
  it('see Vesi by a benefic, and the Moon\'s house from the Sun', () => {
    const r = ids(surya(yogaChartFrom(LONS, STRONG)));
    expect(r).toEqual(expect.arrayContaining(['veshi', 'veshiBenefics', 'veshiVenus', 'uttamadiApoklima']));
    expect(r).not.toContain('veshiMalefics');
    expect(r).not.toContain('ubhayachari');
  });
  it('see Vesi by benefics with the Moon in the 2nd conjunct a benefic, and no malefic there', () => {
    const r = ids(surya(yogaChartFrom({ ...LONS, moon: 165 }, STRONG)));
    expect(r).toContain('veshiBenefics');
    expect(ids(surya(yogaChartFrom({ ...LONS, moon: 165, mars: 170 }, STRONG)))).not.toContain('veshiBenefics');
  });
  it('give Vasi by Saturn in a male and a female form', () => {
    const lons = { ...LONS, saturn: 100, venus: 280, jupiter: 300 };
    expect(ids(surya(yogaChartFrom(lons, STRONG)))).toContain('voshiSaturnMale');
    expect(ids(surya(yogaChartFrom(lons, STRONG, { sex: 'female' })))).toContain('voshiSaturnFemale');
  });
});

describe('the Kartari yogas of the Lagna', () => {
  const ADHI: Lons = { lagna: 10, sun: 160, moon: 340, mars: 190, mercury: 140, jupiter: 220, venus: 130, saturn: 70, rahu: 100, ketu: 280 };
  // Lagna in Aries; the Sun in Taurus (2nd) and the waning Moon in Pisces (12th), both malefic.
  const LONS: Lons = { lagna: 10, sun: 40, moon: 340, mars: 70, mercury: 220, jupiter: 160, venus: 190, saturn: 0, rahu: 50, ketu: 230 };
  it('never see Lagna Adhi with the natural natures: the nodes together aspect every other sign', () => {
    expect(ids(kartari(yogaChartFrom(ADHI, STRONG)))).not.toContain('lagnaAdhi');
  });
  it('see Lagna Adhi by the functional natures with benefics in the 6th, 7th and 8th free of malefics', () => {
    // Lagna in Aries: the Sun, Mars and Jupiter benefic; Mercury, Venus and Saturn malefic; the nodes neutral in
    // the 4th and the 10th. The Sun in Virgo, Mars in Libra, Jupiter in Scorpio; Mercury and Venus in Leo, Saturn
    // in Gemini.
    expect(ids(kartari(yogaChartFrom(ADHI, STRONG, { functionalNature: true })))).toContain('lagnaAdhi');
    // Saturn in Aries aspects Libra, the 7th.
    expect(ids(kartari(yogaChartFrom({ ...ADHI, saturn: 5 }, STRONG, { functionalNature: true })))).not.toContain('lagnaAdhi');
  });
  it('see Papa Kartari with malefics in the 2nd and the 12th', () => {
    expect(ids(kartari(yogaChartFrom({ ...LONS, moon: 340 }, STRONG)))).toContain('papaKartari');
    expect(kartari(yogaChartFrom((({ lagna: _, ...o }) => o)(LONS), STRONG)).missing).toHaveLength(3);
  });
});

describe('the surya yogas that read the natures, without a Lagna', () => {
  it('are missing under the functional natures, which need the Lagna', () => {
    const lons = { sun: 130, moon: 190, mars: 250, mercury: 220, jupiter: 280, venus: 160, saturn: 310, rahu: 40, ketu: 220 };
    const STRONG7 = { sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1 };
    const r = surya(yogaChartFrom(lons, STRONG7, { functionalNature: true }));
    const missing = r.missing.map((m) => m.id);
    for (const id of ['veshiBenefics', 'veshiMalefics', 'voshiBenefics', 'voshiMalefics']) {
      expect(missing).toContain(id);
      expect(r.yogas.map((y) => y.id)).not.toContain(id);
    }
    const natural = surya(yogaChartFrom(lons, STRONG7)).missing.map((m) => m.id);
    for (const id of ['veshiBenefics', 'veshiMalefics', 'voshiBenefics', 'voshiMalefics']) expect(natural).not.toContain(id);
  });
});
