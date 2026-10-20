import { describe, expect, it } from 'vitest';
import { baladiAvastha, MUHURTA_ACTIVITIES, panchangThermometer, thermometerYoga } from '../src/index';

const lon = (sign: number, d: number, m: number, s: number) => sign * 30 + d + m / 60 + s / 3600;

describe('the Avastha', () => {
  it("gives each planet's Avastha as PL9 does (REF 0010's Muhurta in 2030 and in 2000)", () => {
    // Taurus 1, Scorpio 7, Libra 6, Aries 0, Sagittarius 8, Aquarius 10, Cancer 3, Capricorn 9.
    expect(baladiAvastha(lon(1, 29, 42, 26))).toBe('infant');
    expect(baladiAvastha(lon(7, 18, 59, 16))).toBe('youth');
    expect(baladiAvastha(lon(1, 7, 27, 54))).toBe('old');
    expect(baladiAvastha(lon(6, 24, 48, 17))).toBe('dead');
    expect(baladiAvastha(lon(8, 16, 16, 56))).toBe('adolescent');
    expect(baladiAvastha(lon(8, 7, 40, 47))).toBe('youth');
    expect(baladiAvastha(lon(10, 3, 55, 57))).toBe('infant');
    expect(baladiAvastha(lon(3, 10, 6, 47))).toBe('old');
  });
  it('takes the bands of 6 degrees in the order infant, youth, adolescent, old, dead in odd signs, reversed in even ones', () => {
    expect([0, 5.999, 6, 12, 18, 24, 29.999].map((d) => baladiAvastha(d))).toEqual(['infant', 'infant', 'youth', 'adolescent', 'old', 'dead', 'dead']);
    expect([0, 6, 12, 18, 24].map((d) => baladiAvastha(30 + d))).toEqual(['dead', 'old', 'adolescent', 'youth', 'infant']);
  });
});

describe('the panchang thermometer', () => {
  it('names the three activities in the order PL9 numbers them', () => {
    expect(MUHURTA_ACTIVITIES).toEqual(['general', 'travelling', 'marriage']);
  });
  it('draws the thermometer at PL9\'s level: REF 0010 in 2030, travelling (the level printed 0.3345)', () => {
    // Tarabala Vadha (7), Chandrabala 8, karana 29 (Vishti), the thermometer's yoga 6, the Moon in Jyeshtha (18),
    // a Saturday (7), the full Moon (tithi 15): every mark the lowest, 4.5 of 13.5.
    const t = panchangThermometer({ tarabala: 7, chandrabala: 8, karana: 29, yoga: 6, nakshatra: 18, weekday: 7, tithi: 15 }, 'travelling');
    expect(t.score).toBe(4.5);
    expect(t.level).toBeCloseTo(4.5 / 13.5, 12);
  });
  it('adds a mark of 3 for each good element: in 2000 (tithi 26, karana 51, yoga 18, Swati, Saturday), Tarabala Kshema and Chandrabala 9', () => {
    const t = panchangThermometer({ tarabala: 4, chandrabala: 9, karana: 51, yoga: 18, nakshatra: 15, weekday: 7, tithi: 26 }, 'travelling');
    // Tarabala 3, karana 3 × 0.5, yoga 3 × 0.5, Chandrabala 3 × 0.5, Swati 1, Saturday 1 × 0.5, tithi 26: 3 × 0.5.
    expect(t.score).toBe(3 + 1.5 + 1.5 + 1.5 + 1 + 0.5 + 1.5);
  });
  it('takes the yoga from the Yogi point: the tropical Sun and Moon plus 93°20′, in parts of 13°20′', () => {
    // Sidereal Sun and Moon summing 288.695°, the ayanamsha 24.2825°: tropical 337.26°, plus 93.33°: 70.59°, the 6th part.
    expect(thermometerYoga(59.7, 228.995, 24.2825)).toBe(6);
  });
});

describe('computeMuhurta', () => {
  const o = { fidelity: 'pl9' } as const;
  // REF 0010's birth; the Muhurta at Jaipur on 15 June 2030, 06:00 Jaipur time.
  const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: 150.6744444 };
  const at = { jdUt: 2462667.5 + 0.5 / 24, latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 };
  const load = async () => ({ ...(await import('../src/index')), ...(await import('./fakeSky')) });

  it('gives the chart, the strengths, the kakshas, the Gochara data, the dashas and the thermometer of an instant', async () => {
    const { computeMuhurta, fakeSky } = await load();
    const m = computeMuhurta(fakeSky, natal, at, { ...o, activity: 'travelling' });
    expect(Object.keys(m.planets)).toHaveLength(9);
    expect(m.planets.sun.avastha).toEqual(expect.any(String));
    expect(Object.keys(m.vargas).sort()).toEqual(['D10', 'D16', 'D24', 'D60', 'D9']);
    expect(m.kakshas).not.toBeNull();
    expect(m.gochara.dashas!.vimshottari).toMatch(/^[A-Z][a-z](-[A-Z][a-z]){4}$/);
    expect(m.muhurtaDasha[0]!.start).toBeLessThanOrEqual(at.jdUt);
    expect(m.thermometer.activity).toBe('travelling');
    expect(m.missing).toEqual([]);
  });
  it('beyond the polar circle gives what needs no Lagna and says the rest is missing, never NaN', async () => {
    const { computeMuhurta, fakeSky } = await load();
    const m = computeMuhurta(fakeSky, natal, { ...at, latitude: 85, longitudeEast: 0 }, o);
    const numbers: number[] = [];
    JSON.stringify(m, (_k, v) => { if (typeof v === 'number') numbers.push(v); return v; });
    expect(numbers.length).toBeGreaterThan(100);
    expect(numbers.filter((x) => !Number.isFinite(x))).toEqual([]);
    expect(m.missing.map((x) => x.what)).toEqual(expect.arrayContaining(['lagna', 'shadbala', 'bhava bala']));
    expect(m.gochara.tarabala.count).toBeGreaterThan(0);
    // The kakshas read the native's Ashtakavarga: they need the natal Lagna, not the Muhurta's.
    expect(m.kakshas).not.toBeNull();
  });
  it('before the native\'s birth gives the dashas PL9 prints there, as for the transits (48 printouts of 2000)', async () => {
    const { computeMuhurta, dashasAt, fakeSky } = await load();
    const jd = natal.jdUt - 10;
    const m = computeMuhurta(fakeSky, natal, { ...at, jdUt: jd }, o);
    expect(m.gochara.dashas).toEqual(dashasAt(fakeSky, natal, jd, o));
    expect(m.missing).toEqual([]);
  });
  it('a few seconds before a tithi ends gives the tithi that ends, and a few seconds after it the next', async () => {
    const { computeMuhurta, computePositions, tithiOf, fakeSky } = await load();
    // The end found here by bisection on the elongation, apart from the panchanga's own search.
    const tithiAt = (jd: number) => { const p = computePositions(fakeSky, { ...at, jdUt: jd }, o).points; return tithiOf(p.sun.longitude, p.moon.longitude); };
    const first = tithiAt(at.jdUt);
    let lo = at.jdUt, hi = at.jdUt + 1.5;
    expect(tithiAt(hi)).not.toBe(first);
    while (hi - lo > 1 / 86400) { const mid = (lo + hi) / 2; if (tithiAt(mid) === first) lo = mid; else hi = mid; }
    expect(computeMuhurta(fakeSky, natal, { ...at, jdUt: lo - 20 / 86400 }, o).gochara.tithi.index).toBe(first);
    expect(computeMuhurta(fakeSky, natal, { ...at, jdUt: hi + 20 / 86400 }, o).gochara.tithi.index).not.toBe(first);
  });
  it('with each activity changes only the thermometer', async () => {
    const { computeMuhurta, MUHURTA_ACTIVITIES, fakeSky } = await load();
    const [a, b, c] = MUHURTA_ACTIVITIES.map((activity) => computeMuhurta(fakeSky, natal, at, { ...o, activity }));
    const rest = (m: typeof a) => JSON.stringify({ ...m, thermometer: null });
    expect(rest(b!)).toBe(rest(a!));
    expect(rest(c!)).toBe(rest(a!));
    expect(new Set([a!, b!, c!].map((m) => m.thermometer.activity)).size).toBe(3);
  });
});

describe('combustion', () => {
  it('within the orbs of the Varshaphala printouts, smaller for retrograde Mercury and Venus; never the Moon or the nodes', async () => {
    const { combustOf } = await import('../src/index');
    expect(combustOf('mercury', 73, 60, 1)).toBe(true);
    expect(combustOf('mercury', 73, 60, -1)).toBe(false);
    expect(combustOf('mars', 76, 60, 1)).toBe(true);
    expect(combustOf('mars', 78, 60, 1)).toBe(false);
    expect([combustOf('moon', 61, 60, 1), combustOf('rahu', 61, 60, -1)]).toEqual([false, false]);
  });
});
