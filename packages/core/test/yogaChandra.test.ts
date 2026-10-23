import { describe, expect, it } from 'vitest';
import { chandra } from '../src/yogas/families/chandra';
import { yogaChartFrom } from '../src/yogas/chart';
import type { Planet9 } from '../src/jaimini';

type Lons = Record<Planet9, number> & { lagna?: number };
// Moon in Cancer; Mars in Leo (2nd from it), Mercury in Gemini (12th); Jupiter in Scorpio (5th), Venus in Virgo
// (3rd), Saturn in Capricorn (7th), Sun in Aries (10th). Lagna in Aries; the Sun 10° ahead of the Lagna: night.
const LONS: Lons = { lagna: 10, sun: 20, moon: 100, mars: 130, mercury: 70, jupiter: 220, venus: 160, saturn: 280, rahu: 10, ketu: 190 };
const STRONG = { sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1 };
const run = (lons: Lons, sex: 'male' | 'female' = 'male') => chandra(yogaChartFrom(lons, STRONG, { sex }));
const present = (lons: Lons, sex: 'male' | 'female' = 'male') => run(lons, sex).yogas.filter((y) => y.present).map((y) => y.id);

describe('the Moon\'s yogas', () => {
  it('see Durudhara with the pair in the 2nd and the 12th, and its male or female form by the native\'s sex', () => {
    expect(present(LONS)).toContain('durudhara');
    expect(present(LONS)).toContain('durudharaMarsMercuryMale');
    expect(present(LONS)).not.toContain('durudharaMarsMercuryFemale');
    expect(present(LONS, 'female')).toContain('durudharaMarsMercuryFemale');
    expect(present(LONS)).not.toContain('sunapha');
    expect(present(LONS)).not.toContain('kemadruma');
  });

  it('see Sunapha with a planet in the 2nd only, and Kemadruma with neither', () => {
    expect(present({ ...LONS, mercury: 160 })).toEqual(expect.arrayContaining(['sunapha', 'sunaphaMars']));
    const none = { ...LONS, mars: 160, mercury: 160 };
    expect(present(none)).toContain('kemadruma');
    // Kemadruma counts Mars to Saturn; the cancellations count the Sun too.
    expect(present({ ...none, sun: 130 })).toContain('kemadruma');
    expect(present({ ...none, sun: 130 })).not.toContain('kemadrumaBhangaKendraFromMoon');
  });

  it('see Gaja-Kesari with Jupiter in an angle from the Moon, a conjunction included', () => {
    expect(present({ ...LONS, jupiter: 190 })).toEqual(expect.arrayContaining(['gajaKesari', 'gajaKesariJupiter4th']));
    expect(present({ ...LONS, jupiter: 105 })).toEqual(expect.arrayContaining(['gajaKesari', 'gajaKesariConjunct', 'gajaKesariConjunctIn4th']));
  });

  it('never see PL9\'s day form of Dhanadhana', () => {
    expect(run({ ...LONS, sun: 250 }).yogas.find((y) => y.id === 'dhanadhanaDay')!.present).toBe(false);
  });

  it('report the yogas that need the Lagna as missing without it, and compute the others', () => {
    const { lagna: _, ...noLagna } = LONS;
    const r = run(noLagna);
    expect(r.missing.map((m) => m.id)).toEqual(expect.arrayContaining(['amala', 'kalpadruma', 'shakata6th', 'dhanadhanaNight', 'gajaKesariConjunctIn1st']));
    expect(r.yogas.find((y) => y.id === 'durudhara')).toMatchObject({ present: true, houses: [] });
  });
});

describe('the chandra yogas that read the natures, without a Lagna', () => {
  it('are missing under the functional natures, which need the Lagna', () => {
    const lons = { sun: 130, moon: 190, mars: 250, mercury: 220, jupiter: 280, venus: 160, saturn: 310, rahu: 40, ketu: 220 };
    const STRONG7 = { sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1 };
    const r = chandra(yogaChartFrom(lons, STRONG7, { functionalNature: true }));
    const missing = r.missing.map((m) => m.id);
    for (const id of ['chandraAdhi', 'kemadrumaBhangaBeneficRelation', 'amalaFromMoon']) {
      expect(missing).toContain(id);
      expect(r.yogas.map((y) => y.id)).not.toContain(id);
    }
    const natural = chandra(yogaChartFrom(lons, STRONG7)).missing.map((m) => m.id);
    for (const id of ['chandraAdhi', 'kemadrumaBhangaBeneficRelation', 'amalaFromMoon']) expect(natural).not.toContain(id);
  });
});
