import { describe, expect, it } from 'vitest';
import { ashtakoota, computeCompatibility, dashkoota } from '../src';
import { fakeSky } from './fakeSky';

// REF 0010's Moon: 26°53' Aries, Krittika (3).
const moon = { sign: 1, nakshatra: 3, degree: 26.9 };
const scores = (rows: { name: string; score: number }[]) => Object.fromEntries(rows.map((r) => [r.name, r.score]));

describe('the kootas', () => {
  it("give PL9's Ashtakoota for REF 0010 with itself: 28 of 36, the Nadi a dosha", () => {
    const a = ashtakoota(moon, moon);
    expect(scores(a.rows)).toEqual({ varna: 1, vashya: 2, tara: 3, yoni: 4, grahamaitri: 5, gana: 6, bhakoot: 7, nadi: 0 });
    expect(a.total).toBe(28);
    expect(a.rows.filter((r) => r.dosha).map((r) => r.name)).toEqual(['nadi']);
    expect(a.verdict).toBe('good');
  });

  it("give PL9's Dashkoota for REF 0010 with itself: 30 of 44, the Rajju and Vedhai set by the cancellation", () => {
    const d = dashkoota(moon, moon);
    expect(scores(d.rows)).toEqual({
      dhinam: 1.5, ganam: 6, mahendram: 0, streeDeergham: 0, yoni: 4, rashi: 7, rashiadhipati: 5, vashyam: 0, rajju: 4, vedhai: 1,
      gender: 0.5, gothram: 0, caste: 1,
    });
    expect(d.total).toBe(30);
    expect(d.cancelled).toBe(true);
  });

  it('count from the bride to the groom', () => {
    // Bride in Ashwini (1), groom in Bharani (2): Tara 2 gives 3; reversed, the count is 9, giving 1.5.
    const a = { sign: 1, nakshatra: 1, degree: 5 }, b = { sign: 1, nakshatra: 2, degree: 20 };
    expect(scores(ashtakoota(a, b).rows).tara).toBe(3);
    expect(scores(ashtakoota(b, a).rows).tara).toBe(1.5);
  });

  it('give no verdict to a total with a half point, as PL9', () => {
    // REF 0039's Moon (Pushya, Cancer) with REF 0161's (Ashwini, Aries), the partner the bride: 31.5 (PL9's page).
    const a = ashtakoota({ sign: 1, nakshatra: 1, degree: 7.6 }, { sign: 4, nakshatra: 8, degree: 16.1 });
    expect(a.total).toBe(31.5);
    expect(a.verdict).toBeNull();
  });
});

describe('the compatibility of two charts', () => {
  const birth = { jdUt: 2449865.4694144, latitude: 44.2377, longitudeEast: 150.6744 };
  it('reads the woman as the bride, the partner when both are of one sex', () => {
    const man = { input: birth, sex: 'male' as const }, woman = { input: { ...birth, jdUt: birth.jdUt + 40 }, sex: 'female' as const };
    expect(computeCompatibility(fakeSky, man, woman, {}, { fidelity: 'corrected' }).bride).toBe('partner');
    expect(computeCompatibility(fakeSky, woman, man, {}, { fidelity: 'corrected' }).bride).toBe('native');
    expect(computeCompatibility(fakeSky, man, man, {}, { fidelity: 'corrected' }).bride).toBe('partner');
  });
  it('counts the distances both ways and gives each chart its Mangala Dosha', () => {
    const c = computeCompatibility(fakeSky, { input: birth, sex: 'male' }, { input: birth, sex: 'male' }, {}, { fidelity: 'corrected' });
    expect(c.distances.moon).toMatchObject({ signs: [1, 1], nakshatras: [1, 1] });
    expect(c.distances.moon!.native).toEqual(c.distances.moon!.partner);
    expect(c.mangala.native).toEqual(c.mangala.partner);
    expect([1, 2, 4, 7, 8, 12].includes(c.mangala.native.marsHouseFromMoon)).toBe(c.mangala.native.fromMoon);
  });
  it('needs the Lagna for the kootas of the Lagna, and keeps the Moon\'s', () => {
    const polar = { input: { ...birth, latitude: 89 }, sex: 'male' as const };
    expect(computeCompatibility(fakeSky, polar, polar, { point: 'lagna' }, { fidelity: 'corrected' }).missing).toContainEqual({ field: 'kootas', reason: 'needs the Lagna' });
    expect(computeCompatibility(fakeSky, polar, polar, {}, { fidelity: 'corrected' }).ashtakoota.rows).toHaveLength(8);
    expect(computeCompatibility(fakeSky, polar, polar, {}, { fidelity: 'corrected' }).mangala.native.fromLagna).toBeNull();
  });
});
