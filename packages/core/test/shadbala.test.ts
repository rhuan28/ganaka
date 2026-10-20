import { describe, expect, it } from 'vitest';
import { shadbala, type ShadbalaInputs, type ShadbalaRow } from '../src/index';

// REF 0010, the inputs as the core computes them in the pl9 mode (shadbalaInputs), and below what PL9 prints.
const REF_0010: ShadbalaInputs = {
  jdUt: 2449865.4694144, longitudeEast: 150.6744, lagna: 106.51515619,
  longitudes: { sun: 42.3994397, moon: 26.88931393, mars: 127.25003407, mercury: 54.08713955, jupiter: 227.29307366, venus: 19.54352399, saturn: 329.69365902, rahu: 191.65447778, ketu: 11.65447778 },
  cusps: [106.51515619, 131.95402545, 157.39289472, 182.83176398, 217.39289472, 251.95402545, 286.51515619, 311.95402545, 337.39289472, 2.83176398, 37.39289472, 71.95402545],
  declinations: { sun: 21.45492792, moon: 18.14255227, mars: 11.3525701, mercury: 22.92750542, jupiter: -22.18415393, venus: 16.09398758, saturn: -2.65912333 },
  latitudes: { mars: 1.42358551, mercury: -0.26246678, jupiter: 0.81142425, venus: -1.46083475, saturn: -1.963193 },
  sunrise: 2449865.26742362, sunset: 2449865.89191436, night: false, sunTropical: 66.19469495,
  cheshta: { mars: 52.30194753, mercury: 55.5262967, jupiter: 58.84020147, venus: 21.00539592, saturn: 38.90066846 },
};

const P = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const;
const PL9: Partial<Record<keyof ShadbalaRow, number[]>> = {
  uchcha: [49.2, 57.96, 3.08, 23.03, 15.9, 52.49, 16.77],
  saptavargaja: [75, 63.75, 90, 97.5, 123.75, 69.38, 142.5],
  ojhayugma: [15, 0, 30, 15, 15, 15, 30],
  kendradi: [30, 60, 30, 30, 30, 60, 30],
  drekkana: [0, 15, 15, 0, 0, 0, 0],
  sthana: [169.2, 196.71, 168.08, 165.53, 184.65, 196.86, 219.27],
  dig: [46.81, 8.02, 18.53, 42.52, 19.74, 5.57, 45.61],
  nathonnatha: [46.61, 13.39, 13.39, 60, 46.61, 46.61, 13.39],
  paksha: [54.83, 5.17, 54.83, 54.83, 5.17, 5.17, 54.83],
  tribhaga: [0, 0, 0, 60, 60, 0, 0],
  varsha: [0, 0, 15, 0, 0, 0, 0],
  masa: [30, 0, 0, 0, 0, 0, 0],
  vara: [45, 0, 0, 0, 0, 0, 0],
  hora: [0, 0, 0, 0, 0, 0, 60],
  ayana: [57.45, 6.79, 44.52, 59.33, 1.62, 50.59, 33.4],
  yuddha: [0, 0, 0, 0, 0, 0, 0],
  kala: [233.88, 25.35, 127.75, 234.16, 113.39, 102.36, 161.63],
  cheshta: [57.45, 5.17, 52.3, 55.53, 58.84, 21.01, 38.9],
  naisargika: [60, 51.42, 17.16, 25.74, 34.26, 42.84, 8.58],
  drik: [33.69, 0.55, -2.78, 43.57, -86.11, -11.39, 22.42],
  total: [601.04, 287.23, 381.04, 567.06, 324.78, 357.25, 496.4],
  rupas: [10.02, 4.79, 6.35, 9.45, 5.41, 5.95, 8.27],
  ratio: [1.54, 0.8, 1.27, 1.35, 0.83, 1.08, 1.65],
  ishta: [50.63, 31.57, 27.69, 39.28, 37.37, 36.75, 27.83],
  kashta: [9.37, 28.43, 32.31, 20.72, 22.63, 23.25, 32.17],
};

describe('the Shadbala of REF 0010', () => {
  const sb = shadbala(REF_0010);
  for (const [part, values] of Object.entries(PL9)) {
    it(`gives the ${part} PL9 prints, to half a hundredth`, () => {
      P.forEach((p, i) => expect(Math.abs(sb.planets[p][part as keyof ShadbalaRow] - values![i]!), `${part} ${p}`).toBeLessThanOrEqual(0.005));
    });
  }
  it('ranks the planets and counts the strong balas as PL9 does', () => {
    expect(P.map((p) => sb.planets[p].rank)).toEqual([2, 7, 4, 3, 6, 5, 1]);
    expect(P.map((p) => sb.planets[p].strong)).toEqual([5, 1, 4, 5, 3, 3, 4]);
    expect(P.map((p) => sb.planets[p].minimum)).toEqual([390, 360, 300, 420, 390, 330, 300]);
  });
  it("gives the Sun its Ayana and the Moon its Paksha as Cheshta, and leaves the Yuddha out of the Kala", () => {
    expect(sb.planets.sun.cheshta).toBe(sb.planets.sun.ayana);
    expect(sb.planets.moon.cheshta).toBe(sb.planets.moon.paksha);
    expect(sb.war).toEqual([]);
  });
});

describe('the planetary war', () => {
  const at = (longitudes: Partial<ShadbalaInputs['longitudes']>, latitudes: ShadbalaInputs['latitudes']) =>
    shadbala({ ...REF_0010, longitudes: { ...REF_0010.longitudes, ...longitudes }, latitudes });
  it('is won by the planet further north, and the Yuddha is the difference of the totals', () => {
    const sb = at({ mars: 100, saturn: 100.6 }, { mars: -1, mercury: 0, jupiter: 0, venus: 0, saturn: 0.5 });
    expect(sb.war).toEqual([{ planets: ['saturn', 'mars'], winner: 'saturn' }]);
    const gap = Math.abs(sb.planets.mars.total - sb.planets.saturn.total);
    expect(sb.planets.saturn.yuddha).toBeCloseTo(gap, 10);
    expect(sb.planets.mars.yuddha).toBeCloseTo(-gap, 10);
  });
  it('is always won by Venus', () => {
    const sb = at({ venus: 200, jupiter: 200.9 }, { mars: 0, mercury: 0, jupiter: 3, venus: -3, saturn: 0 });
    expect(sb.war).toEqual([{ planets: ['venus', 'jupiter'], winner: 'venus' }]);
    expect(sb.planets.jupiter.yuddha).toBeLessThan(0);
  });
  it('sets against a planet within a degree of two others the last of them, Mars to Saturn', () => {
    const sb = at({ mars: 300, jupiter: 300.5, saturn: 299.5 }, { mars: 1, mercury: 0, jupiter: 2, venus: 0, saturn: -2 });
    // Mars fights Saturn (the last), and wins; Jupiter and Saturn are a degree apart, so out of each other's war.
    expect(sb.planets.mars.yuddha).toBeCloseTo(Math.abs(sb.planets.mars.total - sb.planets.saturn.total), 10);
    expect(sb.planets.jupiter.yuddha).toBeCloseTo(Math.abs(sb.planets.jupiter.total - sb.planets.mars.total), 10);
  });
});

describe('the Kala Bala around the day', () => {
  it('gives the lord of the third of the day or night its 60, and Jupiter always', () => {
    const third = (jdUt: number, night: boolean) => shadbala({ ...REF_0010, jdUt, night });
    const { sunrise, sunset } = REF_0010;
    const day = sunset - sunrise;
    expect(third(sunrise + day * 0.1, false).planets.mercury.tribhaga).toBe(60);
    expect(third(sunrise + day * 0.5, false).planets.sun.tribhaga).toBe(60);
    expect(third(sunrise + day * 0.9, false).planets.saturn.tribhaga).toBe(60);
    expect(third(sunset + 0.01, true).planets.moon.tribhaga).toBe(60);
    for (const t of [sunrise + 0.01, sunset + 0.01]) expect(third(t, t > sunset).planets.jupiter.tribhaga).toBe(60);
  });
  it('turns Paksha with the Moon: full Moon 60 to the benefics, new Moon 60 to the malefics', () => {
    const full = shadbala({ ...REF_0010, longitudes: { ...REF_0010.longitudes, moon: REF_0010.longitudes.sun + 180 } });
    const fresh = shadbala({ ...REF_0010, longitudes: { ...REF_0010.longitudes, moon: REF_0010.longitudes.sun } });
    expect(full.planets.jupiter.paksha).toBeCloseTo(60, 10);
    expect(full.planets.saturn.paksha).toBeCloseTo(0, 10);
    expect(fresh.planets.saturn.paksha).toBeCloseTo(60, 10);
    expect(fresh.planets.moon.paksha).toBeCloseTo(0, 10);
  });
  it('lets the Drik, and so the total, go below zero', () => {
    const sb = shadbala(REF_0010);
    const row = sb.planets.jupiter;
    expect(row.drik).toBeLessThan(0);
    expect(row.total).toBeCloseTo(row.sthana + row.dig + row.kala + row.cheshta + row.naisargika + row.drik, 10);
  });
});

describe('the five options, on REF 0010', () => {
  // PL9's printed totals for REF 0010 with each alternative set, Sun to Saturn.
  const PRINTED: [Partial<import('../src/index').ShadbalaOptions>, number[]][] = [
    [{ drekkana: 'horaRatnam' }, [601.04, 272.23, 381.04, 582.06, 324.78, 372.25, 511.4]],
    [{ digBala: 'kendras' }, [605.6, 282.67, 385.6, 567.06, 324.78, 352.69, 496.4]],
    [{ jupiterMercuryDrik: 'quarter' }, [563.38, 272.83, 372.13, 524.6, 359.59, 353.88, 467.15]],
    [{ mercuryPaksha: 'benefic' }, [601.04, 287.23, 381.04, 517.4, 324.78, 357.25, 496.4]],
    [{ mercuryDrik: 'benefic' }, [601.04, 287.23, 437.37, 567.06, 417.6, 357.25, 520.79]],
  ];
  for (const [options, totals] of PRINTED) {
    it(`gives PL9's totals with ${JSON.stringify(options)}`, () => {
      const sb = shadbala(REF_0010, options);
      P.forEach((p, i) => expect(Math.abs(sb.planets[p].total - totals[i]!), p).toBeLessThanOrEqual(0.005));
    });
  }
});

describe('the lords of the Kala Bala', () => {
  it('count one day less for a birth at night before local noon, and not by day', async () => {
    const { lords } = await import('../src/strengths/shadbala/kala');
    // Local time 2:24 (fraction 0.1 of the day from midnight), at night: the day before; by day: the day itself.
    const jdUt = 2449865.6 - REF_0010.longitudeEast / 360;
    const night = lords({ ...REF_0010, jdUt, night: true, sunrise: jdUt - 0.8 });
    const day = lords({ ...REF_0010, jdUt, night: false, sunrise: jdUt - 0.8 });
    const order = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
    expect((order.indexOf(day.day) - order.indexOf(night.day) + 7) % 7).toBe(1);
  });
});

describe('computeShadbala', () => {
  const input = { jdUt: 2451545, latitude: 20, longitudeEast: 30 };
  it('reads its options, and refuses where the Lagna is not defined', async () => {
    const { computeShadbala, InvalidOptionError, LagnaUndefinedError } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const sb = computeShadbala(fakeSky, input, {}, { fidelity: 'pl9' });
    expect(sb.options).toEqual({ drekkana: 'parashara', digBala: 'cusps', mercuryPaksha: 'withMalefics', mercuryDrik: 'withMalefics', jupiterMercuryDrik: 'full' });
    expect(Object.keys(sb.planets)).toEqual([...P]);
    expect(() => computeShadbala(fakeSky, input, { digBala: 'houses' as 'cusps' })).toThrow(InvalidOptionError);
    expect(() => computeShadbala(fakeSky, input, { other: 1 } as never)).toThrow(InvalidOptionError);
    expect(() => computeShadbala(fakeSky, { ...input, latitude: 89 })).toThrow(LagnaUndefinedError);
  });
  it("names the planets whose Cheshta falls outside PL9's series of cycles", async () => {
    const { computeShadbala } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    expect(computeShadbala(fakeSky, input, {}, { fidelity: 'pl9' }).cheshtaOutsideSeries).toEqual([]);
    expect(computeShadbala(fakeSky, { ...input, jdUt: 2370000 }, {}, { fidelity: 'pl9' }).cheshtaOutsideSeries).toEqual(['mars', 'mercury', 'jupiter', 'venus', 'saturn']);
    const late = computeShadbala(fakeSky, { ...input, jdUt: 2480000 }, {}, { fidelity: 'pl9' });
    expect(late.cheshtaOutsideSeries).toEqual(['mars', 'mercury', 'jupiter', 'venus', 'saturn']);
    // Not PL9's value there, but a number, and so are the totals and ranks built on it.
    for (const row of Object.values(late.planets)) for (const v of [row.cheshta, row.total, row.ratio, row.ishta]) expect(Number.isFinite(v)).toBe(true);
    expect(Object.values(late.planets).map((r) => r.rank).sort()).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });
  it('counts the day at high latitude from 60 degrees, as PL9 does past 65', async () => {
    const { shadbalaInputs } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const far = shadbalaInputs(fakeSky, { ...input, latitude: 66 }, { fidelity: 'pl9' });
    // PL9 takes 60 degrees north past 65, in the south too.
    const south = shadbalaInputs(fakeSky, { ...input, latitude: -66 }, { fidelity: 'pl9' });
    expect([south.sunrise, south.sunset]).toEqual([far.sunrise, far.sunset]);
    const sixty = shadbalaInputs(fakeSky, { ...input, latitude: 60 }, { fidelity: 'pl9' });
    expect(far.sunrise).toBe(sixty.sunrise);
    expect(far.sunset).toBe(sixty.sunset);
    expect(far.sunrise).toBeLessThan(input.jdUt);
  });
});

describe('corrections of the Shadbala', () => {
  it('correction: the Moon in the first three degrees of Taurus takes its relationship with Venus in the Saptavargaja', async () => {
    const { saptavargaja } = await import('../src/strengths/shadbala/sthana');
    const at = (moon: number) => ({ ...REF_0010.longitudes, moon });
    // PL9 gives the birth chart 0 there; the corrected mode gives Venus's points, never 0.
    const pl9 = saptavargaja('moon', at(31.5), 'pl9');
    const corrected = saptavargaja('moon', at(31.5), 'corrected');
    expect(corrected - pl9).toBeGreaterThan(0);
    expect([1.875, 3.75, 7.5, 15, 22.5]).toContain(corrected - pl9);
    // Past three degrees both give the moolatrikona.
    expect(saptavargaja('moon', at(34), 'corrected')).toBe(saptavargaja('moon', at(34), 'pl9'));
  });
  it('correction: the day of the Shadbala at the latitude of the place, past 65 degrees too', async () => {
    const { shadbalaInputs } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const input = { jdUt: 2451545, latitude: -66, longitudeEast: 30 };
    const pl9 = shadbalaInputs(fakeSky, input, { fidelity: 'pl9' });
    const corrected = shadbalaInputs(fakeSky, input, { fidelity: 'corrected' });
    const north = shadbalaInputs(fakeSky, { ...input, latitude: 60 }, { fidelity: 'pl9' });
    expect(pl9.sunrise).toBe(north.sunrise);
    expect(corrected.sunrise).not.toBe(pl9.sunrise);
    // In the south in January the day is long: sunset well over half a day after sunrise.
    expect(corrected.sunset - corrected.sunrise).toBeGreaterThan(0.6);
  });
  it("correction: the Cheshta past PL9's series, by the same series carried on", async () => {
    const { computeShadbala } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const input = { jdUt: 2480000, latitude: 20, longitudeEast: 30 };
    const pl9 = computeShadbala(fakeSky, input, {}, { fidelity: 'pl9' });
    const corrected = computeShadbala(fakeSky, input, {}, { fidelity: 'corrected' });
    expect(pl9.cheshtaOutsideSeries.length).toBe(5);
    expect(corrected.cheshtaOutsideSeries).toEqual([]);
    for (const p of ['mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const) {
      expect(pl9.planets[p].cheshta).toBe(0);
      expect(corrected.planets[p].cheshta).toBeGreaterThan(0);
      expect(corrected.planets[p].cheshta).toBeLessThanOrEqual(60);
    }
  });
});
