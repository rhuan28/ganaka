import { describe, expect, it } from 'vitest';
import { chandrabala, computeMuhurta, computePositions, computeTransits, kaksha, tarabala, transitKakshas, type AvSigns } from '../src/index';
import { fakeSky } from './fakeSky';

// REF 0010 (refset/xml-tempo): the natal signs of the Ashtakavarga (0 = Aries) and the natal Moon (26°53' Aries,
// Krittika).
const NATAL_SIGNS: AvSigns = { sun: 1, moon: 0, mars: 4, mercury: 1, jupiter: 7, venus: 0, saturn: 10, lagna: 3 };
const NATAL_MOON = 26.889;
// The Muhurta page of REF 0010, 15 June 2030 06:00 at Jaipur: the transit longitudes PL9 printed.
const dms = (sign: number, d: number, m: number, s: number) => sign * 30 + d + m / 60 + s / 3600;
const MUHURTA_2030 = {
  sun: dms(1, 29, 42, 26), moon: dms(7, 18, 59, 16), mars: dms(1, 24, 21, 35), mercury: dms(1, 18, 39, 15),
  jupiter: dms(6, 24, 48, 17), venus: dms(0, 26, 48, 9), saturn: dms(1, 7, 27, 54),
};

describe('the kaksha of a longitude', () => {
  it('is one of eight parts of 3°45 in the sign, ruled by Saturn, Jupiter, Mars, the Sun, Venus, Mercury, the Moon, the Ascendant', () => {
    expect(kaksha(dms(1, 29, 42, 26))).toEqual({ kaksha: 8, lord: 'lagna' });
    expect(kaksha(dms(1, 7, 27, 54))).toEqual({ kaksha: 2, lord: 'jupiter' });
    expect(kaksha(dms(7, 18, 59, 16))).toEqual({ kaksha: 6, lord: 'mercury' });
  });
  it('puts a longitude at exactly a multiple of 3°45 in the next part, and the start of a sign in the first', () => {
    expect(kaksha(33.75)).toEqual({ kaksha: 2, lord: 'jupiter' });
    expect(kaksha(30)).toEqual({ kaksha: 1, lord: 'saturn' });
    expect(kaksha(59.999999)).toEqual({ kaksha: 8, lord: 'lagna' });
  });
});

describe('the kakshas of the transits over a natal chart', () => {
  it('give the bindu of the kaksha lord in the natal chart of the planet, and its bindus and the Sarva in the transit sign, as PL9 prints them', () => {
    const k = transitKakshas(NATAL_SIGNS, MUHURTA_2030);
    // PL9: "a in Tau 1 (`) 4 31", "b in Sco 1 (d) 3 22", "c in Tau 0 (b) 3 31", "d in Tau 1 (f) 6 31",
    // "e in Lib 1 (b) 3 29", "f in Ari 0 (`) 5 27", "g in Tau 0 (e) 3 31".
    expect(k).toEqual({
      sun: { sign: 1, kaksha: 8, lord: 'lagna', bindu: 1, ash: 4, sarva: 31 },
      moon: { sign: 7, kaksha: 6, lord: 'mercury', bindu: 1, ash: 3, sarva: 22 },
      mars: { sign: 1, kaksha: 7, lord: 'moon', bindu: 0, ash: 3, sarva: 31 },
      mercury: { sign: 1, kaksha: 5, lord: 'venus', bindu: 1, ash: 6, sarva: 31 },
      jupiter: { sign: 6, kaksha: 7, lord: 'moon', bindu: 1, ash: 3, sarva: 29 },
      venus: { sign: 0, kaksha: 8, lord: 'lagna', bindu: 0, ash: 5, sarva: 27 },
      saturn: { sign: 1, kaksha: 2, lord: 'jupiter', bindu: 0, ash: 3, sarva: 31 },
    });
  });
});

describe('Tarabala and Chandrabala', () => {
  it('count the nakshatras from the natal Moon to the transit Moon in nines, good at 2, 4, 6, 8 and 9', () => {
    expect(tarabala(NATAL_MOON, MUHURTA_2030.moon)).toEqual({ count: 7, name: 'Vadha', good: false }); // Jyeshtha
    expect(tarabala(NATAL_MOON, dms(8, 10, 46, 47))).toEqual({ count: 8, name: 'Mitra', good: true }); // Moola
    expect(tarabala(NATAL_MOON, NATAL_MOON)).toEqual({ count: 1, name: 'Janma', good: false });
    expect([2, 3, 4, 5, 6, 8, 9].map((n) => tarabala(NATAL_MOON, NATAL_MOON + 13.34 * (n - 1)).name))
      .toEqual(['Sampat', 'Vipat', 'Kshema', 'Pratyak', 'Sadhaka', 'Mitra', 'Atimitra']);
  });
  it('count the signs from the natal Moon to the transit Moon, bad at 6, 8 and 12', () => {
    expect(chandrabala(NATAL_MOON, MUHURTA_2030.moon)).toEqual({ house: 8, good: false });
    expect(chandrabala(NATAL_MOON, dms(8, 10, 46, 47))).toEqual({ house: 9, good: true });
    expect(Array.from({ length: 12 }, (_, h) => chandrabala(5, h * 30 + 5).good))
      .toEqual([true, true, true, true, true, false, true, false, true, true, true, false]);
  });
});

describe('computeTransits', () => {
  const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: -150.6744444 };
  const at = { jdUt: 2462667.5208333, latitude: 26.9166667, longitudeEast: 75.8277778 };
  it('takes the transit positions at the instant and the place of the transit, the Lagna there and not at birth', () => {
    const t = computeTransits(fakeSky, natal, at, { fidelity: 'pl9' });
    const there = computePositions(fakeSky, at, { fidelity: 'pl9' });
    expect(t.points.lagna!.longitude).toBe(there.points.lagna!.longitude);
    expect(t.points.lagna!.longitude).not.toBe(computePositions(fakeSky, { ...natal, jdUt: at.jdUt }, { fidelity: 'pl9' }).points.lagna!.longitude);
    expect(t.points.saturn.longitude).toBe(there.points.saturn.longitude);
    expect(t.at).toEqual(at);
  });
  it('joins the kakshas, Tarabala and Chandrabala of the natal chart and the Shadbala ratio of the transit chart', () => {
    const t = computeTransits(fakeSky, natal, at, { fidelity: 'pl9' });
    expect(Object.keys(t.kakshas!)).toEqual(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']);
    expect(Object.keys(t.shadbalaRatio!)).toEqual(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']);
    expect(t.tarabala.count).toBeGreaterThanOrEqual(1);
    expect(t.fidelity).toBe('pl9');
  });
  it('gives the transit chart\'s strong Shadbala components and Shadvarga Vimshopaka, as the Muhurta\'s', () => {
    const t = computeTransits(fakeSky, natal, at, { fidelity: 'pl9' });
    const m = computeMuhurta(fakeSky, natal, at, { fidelity: 'pl9' });
    expect(t.shadbalaStrong).toEqual(Object.fromEntries(Object.keys(t.shadbalaRatio!).map((p) => [p, m.planets[p as 'sun'].shadbalaStrong])));
    expect(t.vimshopaka).toEqual(Object.fromEntries(Object.entries(m.planets).map(([p, x]) => [p, x.vimshopaka.shadvarga])));
    expect(computeTransits(fakeSky, natal, { ...at, latitude: 85 }, { fidelity: 'pl9' }).shadbalaStrong).toBeNull();
  });
  it('works for a natal chart born after the instant', () => {
    expect(() => computeTransits(fakeSky, { ...natal, jdUt: at.jdUt + 3000 }, at)).not.toThrow();
  });
  it('beyond the polar circle gives the planets, kakshas, Tarabala and Chandrabala, and says the Lagna and the Shadbala are missing', () => {
    const t = computeTransits(fakeSky, natal, { ...at, latitude: 85 }, { fidelity: 'pl9' });
    expect(t.points.lagna).toBeUndefined();
    expect(t.shadbalaRatio).toBeNull();
    expect(Object.keys(t.kakshas!)).toHaveLength(7);
    expect(t.missing.map((m) => m.what)).toEqual(['lagna', 'shadbala']);
    const n = computeTransits(fakeSky, { ...natal, latitude: 85 }, at, { fidelity: 'pl9' });
    expect(n.kakshas).toBeNull();
    expect(n.missing.map((m) => m.what)).toEqual(['kakshas']);
  });
});

describe('the dashas at a transit instant', () => {
  const p = (lord: string, start: number, end: number, sub?: object[]) => ({ lord, start, end, level: 1, sub }) as never;
  const periods = [
    p('rahu', 100, 200, [p('rahu', 100, 130, [p('rahu', 100, 105), p('jupiter', 105, 130)]), p('mercury', 130, 200, [p('mercury', 130, 160), p('venus', 160, 200)])]),
    p('jupiter', 200, 300, [p('jupiter', 200, 300)]),
  ];
  it('name the lord running at each level with PL9 two letters, joined by "-"', async () => {
    const { dashaChain } = await import('../src/index');
    expect(dashaChain(periods, 170)).toBe('Ra-Me-Ve');
    expect(dashaChain(periods, 250)).toBe('Ju-Ju');
  });
  it('take the first period of each level for an instant before birth, the first lord over and over', async () => {
    const { dashaChain } = await import('../src/index');
    expect(dashaChain(periods, 50)).toBe('Ra-Ra-Ra');
  });
  it('give the Yoginis by their planets', async () => {
    const { dashaChain } = await import('../src/index');
    expect(dashaChain([p('sankata', 0, 10, [p('ulka', 0, 10)])], 5)).toBe('Ra-Sa');
  });
  it('are five levels of Vimshottari, Yogini and Ashtottari', async () => {
    const { dashasAt } = await import('../src/index');
    const d = dashasAt(fakeSky, { jdUt: 2449865.47, latitude: 44.24, longitudeEast: -150.67 }, 2462667.52, { fidelity: 'pl9' });
    for (const s of [d.vimshottari, d.yogini, d.ashtottari]) expect(s).toMatch(/^[A-Z][a-z](-[A-Z][a-z]){4}$/);
  });
  it('and five levels of Narayana, by sign, as the chain of the core', async () => {
    const { dashasAt, narayanaChainAt, computePositions } = await import('../src/index');
    const natal = { jdUt: 2449865.47, latitude: 44.24, longitudeEast: -150.67 };
    const d = dashasAt(fakeSky, natal, 2462667.52, { fidelity: 'pl9' });
    const pos = computePositions(fakeSky, natal, { fidelity: 'pl9' });
    const chart = { lagna: pos.points.lagna!.longitude, longitudes: Object.fromEntries(Object.entries(pos.points).map(([k, v]) => [k, v!.longitude])) as never };
    const ABBR = ['Ar', 'Ta', 'Ge', 'Ca', 'Le', 'Vi', 'Li', 'Sc', 'Sa', 'Cp', 'Aq', 'Pi'];
    expect(d.narayana).toBe(narayanaChainAt(chart, natal.jdUt, 2462667.52, 365.2421875, 'pl9').map((s) => ABBR[s]).join('-'));
    const { rashiChainAt } = await import('../src/index');
    expect(d.chara).toBe(rashiChainAt('chara', chart, natal.jdUt, 2462667.52, 365.2421875, 'pl9').map((s) => ABBR[s]).join('-'));
  });
});

describe('the crossings of sign and kaksha boundaries', () => {
  it('place each crossing by a straight line between half-day samples, the part entered and the direction', async () => {
    const { crossings, signIngresses } = await import('../src/index');
    // The fake sky moves the planets at constant speed, so the straight line is exact for the tropical longitude;
    // the sidereal one moves with the ayanamsha too.
    const c = crossings(fakeSky, 2451545, 2451545 + 60, 30, { fidelity: 'pl9' }, ['sun']);
    expect(c.length).toBe(2);
    expect(c.every((x) => x.planet === 'sun' && !x.retrograde)).toBe(true);
    expect(c[1]!.part).toBe((c[0]!.part + 1) % 12);
    expect(c[1]!.jdUt - c[0]!.jdUt).toBeCloseTo(30 / 0.9856474, 0);
    expect(signIngresses(fakeSky, 2451545, 2451545 + 60, { fidelity: 'pl9' }, ['sun']).map((x) => x.sign)).toEqual(c.map((x) => x.part));
    const nodes = crossings(fakeSky, 2451545, 2451545 + 400, 30, { fidelity: 'pl9' }, ['rahu']);
    expect(nodes.every((x) => x.retrograde)).toBe(true);
  });
});

describe('the kaksha calendar of a month', () => {
  it('starts each planet at the month start and follows it through every kaksha it enters', async () => {
    const { kakshaCalendar } = await import('../src/index');
    const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: -150.6744444 };
    const cal = kakshaCalendar(fakeSky, natal, 2461314.5, 2461345.5, { fidelity: 'pl9' });
    const sun = cal.filter((s) => s.planet === 'sun');
    expect(sun[0]!.jdUt).toBe(2461314.5);
    // About 3.8 days in each kaksha: eight or nine stretches in a month.
    expect(sun.length).toBeGreaterThanOrEqual(8);
    for (let i = 1; i < sun.length; i++) expect(sun[i]!.kaksha).toBe((sun[i - 1]!.kaksha % 8) + 1);
  });
  it('prints under each label the bindus of the sign the planet is in when it leaves the kaksha', async () => {
    const { kakshaCalendar } = await import('../src/index');
    const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: -150.6744444 };
    const sun = kakshaCalendar(fakeSky, natal, 2461314.5, 2461345.5, { fidelity: 'pl9' }).filter((s) => s.planet === 'sun');
    sun.slice(0, -1).forEach((s, i) => expect(s.shownAsh).toBe(sun[i + 1]!.ash));
    expect(sun.at(-1)!.shownAsh).toBe(sun.at(-1)!.ash);
  });
});

describe('the time of a transit event', () => {
  const sunAt = (jd: number) => computePositions(fakeSky, { jdUt: jd, latitude: 0, longitudeEast: 0 }, { fidelity: 'pl9' }).points.sun.longitude;
  it('finds the first moment after a date the planet reaches the natal degree, its sign or nakshatra, or the orb of 45 degrees', async () => {
    const { timeOfTransit } = await import('../src/index');
    const after = 2451545, natal = 100.5;
    const hit = timeOfTransit(fakeSky, 'sun', 'transits', natal, after, { fidelity: 'pl9' })!;
    expect(hit.jdUt).toBeGreaterThan(after);
    expect(sunAt(hit.jdUt)).toBeCloseTo(natal, 3);
    expect(sunAt(timeOfTransit(fakeSky, 'sun', 'entersSign', natal, after, { fidelity: 'pl9' })!.jdUt)).toBeCloseTo(90, 3);
    expect(sunAt(timeOfTransit(fakeSky, 'sun', 'leavesSign', natal, after, { fidelity: 'pl9' })!.jdUt)).toBeCloseTo(120, 3);
    expect(sunAt(timeOfTransit(fakeSky, 'sun', 'entersNakshatra', natal, after, { fidelity: 'pl9' })!.jdUt)).toBeCloseTo(93 + 1 / 3, 3);
    expect(sunAt(timeOfTransit(fakeSky, 'sun', 'within45', natal, after, { fidelity: 'pl9' })!.jdUt)).toBeCloseTo(55.5, 3);
    expect(sunAt(timeOfTransit(fakeSky, 'sun', 'leaves45', natal, after, { fidelity: 'pl9' })!.jdUt)).toBeCloseTo(145.5, 3);
  });
  it('takes the full aspects: the seventh for all and the nodes, Mars also the fourth and eighth', async () => {
    const { timeOfTransit } = await import('../src/index');
    const after = 2451545, natal = 100.5;
    const marsAt = (jd: number) => computePositions(fakeSky, { jdUt: jd, latitude: 0, longitudeEast: 0 }, { fidelity: 'pl9' }).points.mars.longitude;
    const m = timeOfTransit(fakeSky, 'mars', 'fullyAspects', natal, after, { fidelity: 'pl9' })!;
    const gap = (((natal - marsAt(m.jdUt)) % 360) + 360) % 360;
    expect([90, 180, 210].some((g) => Math.abs(gap - g) < 1e-3)).toBe(true);
    const r = timeOfTransit(fakeSky, 'rahu', 'fullyAspects', natal, after, { fidelity: 'pl9' })!;
    expect(r.retrograde).toBe(true);
  });
});

describe('a fast planet crossing more than one boundary in a half day', () => {
  it('records every kaksha the Moon enters, in order, none skipped', async () => {
    const { kakshaCalendar, crossings } = await import('../src/index');
    const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: -150.6744444 };
    const moon = kakshaCalendar(fakeSky, natal, 2461314.5, 2461345.5, { fidelity: 'pl9' }).filter((s) => s.planet === 'moon');
    for (let i = 1; i < moon.length; i++) expect(moon[i]!.kaksha).toBe((moon[i - 1]!.kaksha % 8) + 1);
    // About 13.2 degrees a day: some 109 kakshas in a month.
    expect(moon.length).toBeGreaterThan(100);
    const c = crossings(fakeSky, 2461314.5, 2461315.5, 3.75, { fidelity: 'pl9' }, ['moon']);
    for (let i = 1; i < c.length; i++) expect(c[i]!.jdUt).toBeGreaterThan(c[i - 1]!.jdUt);
  });
});
