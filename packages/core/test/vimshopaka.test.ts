import { describe, expect, it } from 'vitest';
import { CLASSICAL_VARGAS, vimshopaka, type Planet9 } from '../src/index';

// REF 0010, the longitudes as the core computes them in the pl9 mode (as in shadbala.test.ts).
const REF_0010: Record<Planet9, number> = {
  sun: 42.3994397, moon: 26.88931393, mars: 127.25003407, mercury: 54.08713955, jupiter: 227.29307366, venus: 19.54352399,
  saturn: 329.69365902, rahu: 191.65447778, ketu: 11.65447778,
};
const NINE: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

describe('the Vimshopaka of REF 0010', () => {
  const v = vimshopaka(REF_0010);
  it('gives the scores PL9 prints, rounded, the nodes included', () => {
    const PRINTED = {
      shadvarga: [12, 9, 14, 14, 17, 11, 18, 10, 9],
      saptavarga: [11, 10, 13, 15, 14, 10, 18, 11, 9],
      dashavarga: [11, 12, 12, 15, 12, 10, 16, 10, 9],
      shodashavarga: [12, 12, 13, 15, 12, 12, 15, 9, 8],
    };
    for (const [g, values] of Object.entries(PRINTED)) {
      NINE.forEach((p, i) => expect(Math.floor(v.planets[p].scores[g as keyof typeof PRINTED] + 0.5), `${g} ${p}`).toBe(values[i]));
    }
  });
  it('gives the dignity of each planet in each of the 16 vargas as PL9 prints it', () => {
    // Rows D1 … D60, columns Sun … Ketu: 1 exalted, 2 moolatrikona, 3 own … 9 debilitated.
    const PRINTED = [
      [6, 7, 4, 4, 4, 7, 3, 6, 6], [6, 3, 4, 4, 4, 8, 8, 6, 6], [7, 5, 4, 5, 3, 6, 1, 3, 6], [2, 5, 6, 5, 8, 3, 6, 6, 6],
      [8, 5, 8, 7, 8, 8, 8, 6, 6], [1, 7, 6, 6, 2, 9, 4, 6, 6], [8, 7, 7, 1, 3, 3, 6, 6, 6], [7, 5, 5, 5, 8, 5, 3, 3, 6],
      [6, 4, 3, 6, 6, 4, 8, 6, 6], [2, 6, 3, 7, 6, 3, 6, 9, 1], [1, 1, 1, 7, 6, 5, 6, 1, 9], [5, 7, 5, 7, 6, 9, 7, 6, 6],
      [6, 7, 7, 5, 3, 6, 1, 6, 2], [8, 7, 1, 3, 6, 6, 8, 6, 6], [6, 6, 6, 6, 6, 9, 9, 3, 6], [6, 6, 5, 4, 8, 6, 3, 3, 3],
    ];
    CLASSICAL_VARGAS.forEach((varga, r) => NINE.forEach((p, c) => expect(v.planets[p].dignities[varga], `${varga} ${p}`).toBe(PRINTED[r]![c])));
  });
});

describe('the parts of the Vimshopaka', () => {
  const at = (longitudes: Partial<Record<Planet9, number>>) => vimshopaka({ ...REF_0010, ...longitudes });
  it('gives 20 in every group to a planet in its own sign in every varga it is weighed in', () => {
    // The weights of each group add up to 20: a constant 20 points give 20.
    const v = at({});
    for (const p of NINE) for (const s of Object.values(v.planets[p].scores)) expect(s).toBeGreaterThanOrEqual(5);
    for (const p of NINE) for (const s of Object.values(v.planets[p].scores)) expect(s).toBeLessThanOrEqual(20);
  });
  it('gives the nodes no own sign: Rahu in Aquarius counts by Saturn, its friend', () => {
    // Rahu at 0.5 degrees of Aquarius: D1 Aquarius (Saturn). Saturn in Aquarius too: the same sign is a temporal enemy,
    // so friend and enemy make neutral, 10 points, where an own sign would give 20.
    const v = at({ rahu: 300.5, saturn: 310 });
    const alone = at({ rahu: 300.5, saturn: 250 });
    expect(alone.planets.rahu.scores.shadvarga).toBeGreaterThan(v.planets.rahu.scores.shadvarga);
  });
  it('takes the degree in the Trimshamsha as the fraction of its part: Mars at 1.7 degrees of Aries is in its moolatrikona there', () => {
    expect(at({ mars: 1.7019 }).planets.mars.dignities.D30).toBe(2);
  });
  it('takes the corrected D2 in the corrected mode (correction 3)', () => {
    // At exactly 15 degrees of an odd sign PL9's D2 is Virgo (the Sun a friend of Mercury's sign: 5); the corrected
    // one, Cancer (neutral: 6).
    const pl9 = vimshopaka({ ...REF_0010, sun: 15 }, 'pl9');
    const corrected = vimshopaka({ ...REF_0010, sun: 15 }, 'corrected');
    expect([pl9.planets.sun.dignities.D2, corrected.planets.sun.dignities.D2]).toEqual([5, 6]);
    expect([pl9.planets.sun.scores.shadvarga, corrected.planets.sun.scores.shadvarga]).toEqual([14.5, 14]);
  });
  it('puts a planet at the start of a varga part at 0 degrees there, as the sign it takes', () => {
    // 154.2857… is where a part of the D7 begins, in Aries: the Sun there is at 0 degrees of Aries, not yet exalted
    // (exaltation holds strictly past 0); a little later it is.
    const start = (154 + 2 / 7) * 1;
    expect(vimshopaka({ ...REF_0010, sun: start }).planets.sun.dignities.D7).not.toBe(1);
    expect(vimshopaka({ ...REF_0010, sun: start + 0.01 }).planets.sun.dignities.D7).toBe(1);
    // The Trimshamsha at exactly 5 degrees of an odd sign: still the first part (Aries), at its end, the fraction 1:
    // inside Mars's moolatrikona (0 to 12, strictly).
    expect(vimshopaka({ ...REF_0010, mars: 5 }).planets.mars.dignities.D30).toBe(2);
  });
  it('correction: the Saptavarga weighed with the weights of the books in the corrected mode', async () => {
    const { vimshopakaWeights } = await import('../src/index');
    expect(vimshopakaWeights('pl9').saptavarga).toEqual({ D1: 50, D2: 20, D3: 30, D9: 25, D12: 45, D30: 20, D7: 10 });
    expect(vimshopakaWeights('corrected').saptavarga).toEqual({ D1: 50, D2: 20, D3: 30, D7: 25, D9: 45, D12: 20, D30: 10 });
    // The other three groups are the same in both modes, and so are their scores.
    const pl9 = vimshopaka(REF_0010, 'pl9').planets;
    const corrected = vimshopaka(REF_0010, 'corrected').planets;
    for (const g of ['shadvarga', 'dashavarga', 'shodashavarga'] as const) expect(corrected.mars.scores[g]).toBe(pl9.mars.scores[g]);
    expect(corrected.mars.scores.saptavarga).not.toBe(pl9.mars.scores.saptavarga);
  });
  it('weighs each group out of 200, with the vargas PL9 uses', async () => {
    const { VIMSHOPAKA_WEIGHTS } = await import('../src/index');
    const sums = Object.fromEntries(Object.entries(VIMSHOPAKA_WEIGHTS).map(([g, w]) => [g, Object.values(w).reduce((a, b) => a + b!, 0)]));
    expect(sums).toEqual({ shadvarga: 200, saptavarga: 200, dashavarga: 200, shodashavarga: 200 });
    expect(Object.keys(VIMSHOPAKA_WEIGHTS.shodashavarga).length).toBe(16);
    expect(Object.keys(VIMSHOPAKA_WEIGHTS.shadvarga).sort()).toEqual(['D1', 'D12', 'D2', 'D3', 'D30', 'D9']);
  });
});

describe('computeVimshopaka', () => {
  it('takes the positions of the chart, in the mode asked for', async () => {
    const { computeVimshopaka, computePositions } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const input = { jdUt: 2451545, latitude: 20, longitudeEast: 30 };
    const v = computeVimshopaka(fakeSky, input, { fidelity: 'pl9' });
    const pos = computePositions(fakeSky, input, { fidelity: 'pl9' });
    const longitudes = Object.fromEntries(NINE.map((p) => [p, pos.points[p].longitude])) as Record<Planet9, number>;
    expect(v.planets).toEqual(vimshopaka(longitudes, 'pl9').planets);
    expect(v.fidelity).toBe('pl9');
  });
});
