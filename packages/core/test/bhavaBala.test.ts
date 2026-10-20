import { describe, expect, it } from 'vitest';
import { bhavaBala, shadbala, type ShadbalaInputs } from '../src/index';

// REF 0010, the inputs as the core computes them in the pl9 mode (as in shadbala.test.ts).
const REF_0010: ShadbalaInputs = {
  jdUt: 2449865.4694144, longitudeEast: 150.6744, lagna: 106.51515619,
  longitudes: { sun: 42.3994397, moon: 26.88931393, mars: 127.25003407, mercury: 54.08713955, jupiter: 227.29307366, venus: 19.54352399, saturn: 329.69365902, rahu: 191.65447778, ketu: 11.65447778 },
  cusps: [106.51515619, 131.95402545, 157.39289472, 182.83176398, 217.39289472, 251.95402545, 286.51515619, 311.95402545, 337.39289472, 2.83176398, 37.39289472, 71.95402545],
  declinations: { sun: 21.45492792, moon: 18.14255227, mars: 11.3525701, mercury: 22.92750542, jupiter: -22.18415393, venus: 16.09398758, saturn: -2.65912333 },
  latitudes: { mars: 1.42358551, mercury: -0.26246678, jupiter: 0.81142425, venus: -1.46083475, saturn: -1.963193 },
  sunrise: 2449865.26742362, sunset: 2449865.89191436, night: false, sunTropical: 66.19469495,
  cheshta: { mars: 52.30194753, mercury: 55.5262967, jupiter: 58.84020147, venus: 21.00539592, saturn: 38.90066846 },
};
const bb = (x: ShadbalaInputs) => bhavaBala(x, shadbala(x), {});
/** PL9 prints the parts truncated toward zero. */
const truncatesTo = (value: number, printed: number) =>
  printed >= 0 ? value > printed - 1e-6 && value < printed + 1 : value < printed + 1e-6 && value > printed - 1;

describe('the Bhava Bala of REF 0010', () => {
  const houses = bb(REF_0010).houses;
  const PRINTED = {
    sign: [3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2],
    lord: [287, 601, 567, 357, 381, 324, 496, 496, 324, 381, 357, 567],
    dig: [0, 20, 40, 30, 40, 20, 30, 10, 10, 60, 50, 50],
    drishti: [42, -26, -55, -22, -84, -72, -31, 6, 43, 16, 42, 36],
    occupants: [0, -60, 0, 0, 60, 0, 0, -60, 0, 0, 0, 0],
    dayNight: [0, 15, 15, 15, 15, 0, 0, 15, 0, 0, 0, 15],
  };
  it('gives each part PL9 prints, truncated', () => {
    for (const [part, values] of Object.entries(PRINTED)) {
      values.forEach((v, i) => expect(truncatesTo(houses[i]![part as keyof typeof PRINTED], v), `${part} ${i + 1}`).toBe(true));
    }
    expect(houses.map((h) => h.degree)).toEqual(Array(12).fill(16));
  });
  it('gives the totals PL9 prints, rounded, and in rupas', () => {
    expect(houses.map((h) => Math.round(h.total))).toEqual([329, 549, 566, 380, 411, 273, 495, 468, 378, 457, 450, 669]);
    expect(houses.map((h) => Math.round(h.rupas))).toEqual([5, 9, 9, 6, 7, 5, 8, 8, 6, 8, 8, 11]);
  });
  it("matches PL9's memory to a ten-thousandth", () => {
    // The first two houses as PL9 holds them.
    const memory = { lord: [287.22667319505, 601.0360613218223], drishti: [42.15992555411518, -26.7146069182946], total: [329.3865987491652, 549.3214544035277] };
    for (const [part, values] of Object.entries(memory)) {
      values.forEach((v, i) => expect(Math.abs(houses[i]![part as keyof typeof memory] - v), `${part} ${i + 1}`).toBeLessThan(1e-4));
    }
  });
});

describe('the parts of the Bhava Bala', () => {
  const at = (lagna: number, longitudes: Partial<ShadbalaInputs['longitudes']> = {}, rest: Partial<ShadbalaInputs> = {}) =>
    bb({ ...REF_0010, lagna, longitudes: { ...REF_0010.longitudes, ...longitudes }, ...rest }).houses;
  it('counts equal houses from the Lagna, with its whole degree', () => {
    expect(at(0.5).map((h) => [h.sign, h.degree])).toEqual(Array.from({ length: 12 }, (_, i) => [i, 0]));
    expect(at(89.5)[0]).toMatchObject({ sign: 2, degree: 29 });
  });
  it('takes Mars for Scorpio and Saturn for Aquarius', () => {
    expect(at(215)[0]!.lord).toBe(shadbala({ ...REF_0010, lagna: 215 }).planets.mars.total);
    expect(at(305)[0]!.lord).toBe(shadbala({ ...REF_0010, lagna: 305 }).planets.saturn.total);
  });
  it('takes the Dig from the point weakest for the kind of the sign', () => {
    // Aries, quadruped, weakest in the 4th: 30 in the 1st. Cancer, an insect, weakest in the 1st: 0 there; Aries then in
    // the 10th, 180 degrees from the 4th: 60.
    expect(at(10)[0]!.dig).toBeCloseTo(30, 6);
    expect(at(100)[0]!.dig).toBeCloseTo(0, 6);
    expect(at(100)[9]!.dig).toBeCloseTo(60, 6);
    // Sagittarius: human in its first half (weakest in the 7th), quadruped in its second (weakest in the 4th).
    expect(at(250)[0]!.dig).toBeCloseTo(60, 6);
    expect(at(260)[0]!.dig).toBeCloseTo(30, 6);
  });
  it('counts the planets in the house by sign: Mercury and Jupiter add 60, the Sun, Mars and Saturn take it, the Moon and Venus nothing', () => {
    expect(at(100, { sun: 105, mercury: 110, mars: 115, saturn: 118, jupiter: 200, moon: 101, venus: 102 })[0]!.occupants).toBe(-120);
    expect(at(100, { sun: 105, mercury: 110, mars: 10, saturn: 20, jupiter: 200, moon: 300, venus: 300 })[0]!.occupants).toBe(0);
  });
  it('gives 15 to the signs of the day or of the night, and to Pisces only in the twilight', () => {
    const signs = (houses: ReturnType<typeof at>) => houses.filter((h) => h.dayNight === 15).map((h) => h.sign).sort((a, b) => a - b);
    expect(signs(at(100))).toEqual([2, 4, 5, 6, 7, 10]);
    expect(signs(at(100, {}, { night: true }))).toEqual([0, 1, 3, 8, 9]);
    expect(signs(at(100, {}, { jdUt: REF_0010.sunrise + 0.02 }))).toEqual([11]);
    expect(signs(at(100, {}, { jdUt: REF_0010.sunset + 0.02, night: true }))).toEqual([11]);
  });
  it('adds the five parts', () => {
    for (const h of bb(REF_0010).houses) {
      expect(h.total).toBeCloseTo(h.lord + h.dig + h.drishti + h.occupants + h.dayNight, 10);
      expect(h.rupas).toBeCloseTo(h.total / 60, 10);
    }
  });
});

describe('computeBhavaBala', () => {
  const input = { jdUt: 2451545, latitude: 20, longitudeEast: 30 };
  it('reads the options of the Shadbala, and refuses where the Lagna is not defined', async () => {
    const { computeBhavaBala, computeShadbala, InvalidOptionError, LagnaUndefinedError } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const o = { jupiterMercuryDrik: 'quarter' } as const;
    const b = computeBhavaBala(fakeSky, input, o, { fidelity: 'pl9' });
    expect(b.houses.length).toBe(12);
    expect(b.options.jupiterMercuryDrik).toBe('quarter');
    const sb = computeShadbala(fakeSky, input, o, { fidelity: 'pl9' });
    const lordOf = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'] as const;
    expect(b.houses[0]!.lord).toBe(sb.planets[lordOf[b.houses[0]!.sign]!].total);
    expect(() => computeBhavaBala(fakeSky, input, { digBala: 'x' as 'cusps' })).toThrow(InvalidOptionError);
    expect(() => computeBhavaBala(fakeSky, { ...input, latitude: 89 })).toThrow(LagnaUndefinedError);
  });
});

describe('the Bhava Bala in the corrected mode', () => {
  it("takes the corrected Shadbala of the lord: past PL9's series, its Cheshta carried on", async () => {
    const { computeBhavaBala, computeShadbala } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const input = { jdUt: 2480000, latitude: 20, longitudeEast: 30 };
    const bb = computeBhavaBala(fakeSky, input, {}, { fidelity: 'corrected' });
    const sb = computeShadbala(fakeSky, input, {}, { fidelity: 'corrected' });
    const lordOf = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'] as const;
    for (const h of bb.houses) {
      expect(Number.isFinite(h.total)).toBe(true);
      expect(h.lord).toBe(sb.planets[lordOf[h.sign]!].total);
    }
    expect(bb.fidelity).toBe('corrected');
  });
});

describe('the Bhava Bala outside the series of the Cheshta', () => {
  it("names, as the Shadbala does, the planets whose Cheshta is not PL9's", async () => {
    const { computeBhavaBala } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const input = { jdUt: 2480000, latitude: 20, longitudeEast: 30 };
    expect(computeBhavaBala(fakeSky, input, {}, { fidelity: 'pl9' }).cheshtaOutsideSeries).toEqual(['mars', 'mercury', 'jupiter', 'venus', 'saturn']);
    expect(computeBhavaBala(fakeSky, { ...input, jdUt: 2451545 }, {}, { fidelity: 'pl9' }).cheshtaOutsideSeries).toEqual([]);
  });
});
