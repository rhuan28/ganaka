import { describe, expect, it } from 'vitest';
import { AV_CONTRIBUTORS, AV_PLANETS, ashtakavarga, ekadhipatyaReduction, trikonaReduction, type AvSigns } from '../src/index';

const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
const SPREAD: AvSigns = { sun: 0, moon: 3, mars: 5, mercury: 1, jupiter: 8, venus: 11, saturn: 6, lagna: 4 };

describe('the bindus', () => {
  it("total 48, 49, 39, 54, 56, 52 and 39 in the planets' charts, 337 in all, 49 in the Lagna's, whatever the signs", () => {
    for (const signs of [SPREAD, { sun: 2, moon: 2, mars: 2, mercury: 2, jupiter: 2, venus: 2, saturn: 2, lagna: 2 }]) {
      const av = ashtakavarga(signs);
      expect(AV_CONTRIBUTORS.map((p) => sum(av.bhinna[p]))).toEqual([48, 49, 39, 54, 56, 52, 39, 49]);
      expect(sum(av.sarva)).toBe(337);
      // Every sign gets at most one bindu from each contributor.
      for (const owner of AV_CONTRIBUTORS) for (const s of av.bhinna[owner]) expect(s).toBeLessThanOrEqual(8);
    }
  });
  it('are given in the houses counted from each contributor', () => {
    // The Sun in Aries gives the Sun's chart bindus in Aries, Taurus, Cancer, Libra and on.
    expect(ashtakavarga(SPREAD).prastara.sun.sun).toEqual([1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0]);
  });
  it("move two places between the schools: Jupiter in the Moon's chart, Mars in Venus's, as PL9 labels them the other way round", () => {
    // PL9's "Varamihira", the default, gives Parashara's places; its "Parashara" gives Varahamihira's.
    const p = ashtakavarga(SPREAD).prastara;
    const v = ashtakavarga(SPREAD, { method: 'parashara' }).prastara;
    // Jupiter in Sagittarius: its 2nd, Capricorn, gives no bindu; its 12th, Scorpio, does.
    expect([v.moon.jupiter[9], v.moon.jupiter[7]]).toEqual([1, 0]);
    expect([p.moon.jupiter[9], p.moon.jupiter[7]]).toEqual([0, 1]);
    // Mars in Virgo: its 4th, Sagittarius, out; its 5th, Capricorn, in.
    expect([p.venus.mars[8], p.venus.mars[9]]).toEqual([0, 1]);
  });
});

describe('the reductions', () => {
  it('Trikona: each of three signs in a triangle less the least of them', () => {
    expect(trikonaReduction([4, 2, 3, 5, 6, 1, 0, 4, 2, 3, 5, 2])).toEqual([2, 1, 3, 3, 4, 0, 0, 2, 0, 2, 5, 0]);
  });
  it('Ekadhipatya: the cases of the two signs of a lord', () => {
    const none = Array<boolean>(12).fill(false);
    const at = (...s: number[]) => none.map((_, i) => s.includes(i));
    const b = (aries: number, scorpio: number) => { const x = Array<number>(12).fill(0); x[0] = aries; x[7] = scorpio; return x; };
    const pair = (x: number[]) => [x[0], x[7]];
    expect(pair(ekadhipatyaReduction(b(3, 0), none, 'parashara'))).toEqual([3, 0]);
    expect(pair(ekadhipatyaReduction(b(3, 3), none, 'parashara'))).toEqual([0, 0]);
    expect(pair(ekadhipatyaReduction(b(3, 5), none, 'parashara'))).toEqual([3, 3]);
    expect(pair(ekadhipatyaReduction(b(3, 5), none, 'other'))).toEqual([0, 2]);
    expect(pair(ekadhipatyaReduction(b(3, 5), at(7), 'parashara'))).toEqual([0, 5]);
    expect(pair(ekadhipatyaReduction(b(6, 5), at(7), 'parashara'))).toEqual([1, 5]);
    expect(pair(ekadhipatyaReduction(b(6, 5), at(0, 7), 'parashara'))).toEqual([6, 5]);
    // The Sun's and the Moon's signs are never reduced.
    expect(ekadhipatyaReduction(Array<number>(12).fill(2), none, 'parashara').slice(3, 5)).toEqual([2, 2]);
  });
  it('never leave a sign below 0', () => {
    for (let k = 0; k < 50; k++) {
      const signs = Object.fromEntries(AV_CONTRIBUTORS.map((c, i) => [c, (k * (i + 3) + i * 5) % 12])) as AvSigns;
      const av = ashtakavarga(signs, { ekadhipatya: k % 2 ? 'other' : 'parashara' });
      for (const p of AV_PLANETS) for (const x of [...av.trikona[p], ...av.ekadhipatya[p]]) expect(x).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('the pindas', () => {
  it('multiply the signs and the planets, Virgo by 6 or 5', () => {
    const six = ashtakavarga(SPREAD);
    const five = ashtakavarga(SPREAD, { virgoMultiplier: 5 });
    for (const p of AV_PLANETS) {
      const r = six.ekadhipatya[p];
      expect(six.pindas[p].rashi).toBe([7, 10, 8, 4, 10, 6, 7, 8, 9, 5, 11, 12].reduce((n, m, s) => n + m * r[s]!, 0));
      expect(six.pindas[p].sodhya).toBe(six.pindas[p].rashi + six.pindas[p].graha);
      expect(six.pindas[p].rashi - five.pindas[p].rashi).toBe(r[5]);
      // Mars in Virgo, Mercury in Taurus and so on: each planet's multiplier takes the bindus of its sign.
      expect(six.pindas[p].graha).toBe(5 * r[0]! + 5 * r[3]! + 8 * r[5]! + 5 * r[1]! + 10 * r[8]! + 7 * r[11]! + 5 * r[6]!);
    }
  });
});

describe('computeAshtakavarga', () => {
  const input = { jdUt: 2451545, latitude: 20, longitudeEast: 30 };
  it('takes the signs of the chart, and refuses where the Lagna is not defined', async () => {
    const { computeAshtakavarga, computePositions, LagnaUndefinedError } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const av = computeAshtakavarga(fakeSky, input, {}, { fidelity: 'pl9' });
    const pos = computePositions(fakeSky, input, { fidelity: 'pl9' });
    expect(av.prastara.sun.sun[Math.floor(pos.points.sun.longitude / 30)]).toBe(1);
    expect(av.options).toEqual({ method: 'varahamihira', ekadhipatya: 'parashara', virgoMultiplier: 6 });
    expect(() => computeAshtakavarga(fakeSky, { ...input, latitude: 89 })).toThrow(LagnaUndefinedError);
  });
  it('checks its options', async () => {
    const { computeAshtakavarga, InvalidOptionError } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    expect(() => computeAshtakavarga(fakeSky, input, { method: 'jaimini' as 'parashara' })).toThrow(InvalidOptionError);
    expect(() => computeAshtakavarga(fakeSky, input, { virgoMultiplier: 4 as 5 })).toThrow(InvalidOptionError);
    expect(() => computeAshtakavarga(fakeSky, input, { other: 1 } as never)).toThrow(InvalidOptionError);
  });
});

describe('corrections of the Ashtakavarga', () => {
  it("correction: the names of the method the right way round", () => {
    // Jupiter in Sagittarius: in the Moon's chart, its 2nd (Capricorn) is Varahamihira's place, its 12th (Scorpio) Parashara's.
    const pl9 = ashtakavarga(SPREAD, {}, 'pl9').prastara.moon.jupiter;
    const corrected = ashtakavarga(SPREAD, {}, 'corrected').prastara.moon.jupiter;
    expect([pl9[9], pl9[7]]).toEqual([0, 1]);
    expect([corrected[9], corrected[7]]).toEqual([1, 0]);
    const parashara = ashtakavarga(SPREAD, { method: 'parashara' }, 'corrected').prastara.moon.jupiter;
    expect([parashara[9], parashara[7]]).toEqual([0, 1]);
  });
});
