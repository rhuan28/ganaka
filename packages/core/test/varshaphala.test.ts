import { describe, expect, it } from 'vitest';
import { ageAt, completedYears, computePositions, computeVarshaphala, dailyReturn, monthlyReturn, solarReturn } from '../src/index';
import { fakeSky } from './fakeSky';

const o = { fidelity: 'pl9' } as const;
// REF 0010's birth (27 May 1995 23:15:57 UT, 44N14'16, 150E40'28).
const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: 150.6744444 };
const sunAt = (jd: number) => computePositions(fakeSky, { jdUt: jd, latitude: 0, longitudeEast: 0 }, o).points.sun.longitude;
const gap = (a: number, b: number) => Math.abs((((a - b) % 360) + 540) % 360 - 180);

describe('the year of age', () => {
  it('counts whole mean sidereal years of 365.25636 days, not calendar birthdays, and 0 before the birth', () => {
    const year = 365.25636342592594;
    expect(completedYears(natal.jdUt, natal.jdUt + 35 * year - 1e-6)).toBe(34);
    expect(completedYears(natal.jdUt, natal.jdUt + 35 * year + 1e-6)).toBe(35);
    expect(completedYears(natal.jdUt, natal.jdUt - 10)).toBe(0);
    // Born on 29 February 2000: a year later is not yet one completed year on 28 February 2001.
    const leap = Date.UTC(2000, 1, 29, 12) / 86400000 + 2440587.5;
    expect(completedYears(leap, Date.UTC(2001, 1, 28, 12) / 86400000 + 2440587.5)).toBe(0);
    expect(completedYears(leap, Date.UTC(2001, 2, 1, 12) / 86400000 + 2440587.5)).toBe(1);
  });
  it('gives the months and days of the monthly and daily returns from the year\'s fraction, twelfths and 360ths', () => {
    const year = 365.25636342592594;
    expect(ageAt(natal.jdUt, natal.jdUt + 31 * year + 4 * year / 12 + 19 * year / 360 + 1e-6)).toEqual({ years: 31, months: 4, days: 19 });
    expect(ageAt(natal.jdUt, natal.jdUt + 31 * year + 4 * year / 12 + 19 * year / 360 - 1e-6)).toEqual({ years: 31, months: 4, days: 18 });
    expect(ageAt(natal.jdUt, natal.jdUt + 35 * year - 1e-6)).toEqual({ years: 34, months: 11, days: 29 });
    expect(ageAt(natal.jdUt, natal.jdUt - 10)).toEqual({ years: 0, months: 0, days: 0 });
  });
});

describe('the solar return', () => {
  it('puts the Sun back on its natal longitude, about 35 years of 365.2422 days after the birth', () => {
    const t = solarReturn(fakeSky, natal, 35, 'true', o);
    expect(gap(sunAt(t), sunAt(natal.jdUt))).toBeLessThan(1e-4);
    expect(Math.abs(t - (natal.jdUt + 35 * 365.2422))).toBeLessThan(2);
  });
  it('in the mean mode is the birth plus 365.25636 days a year, 30.43803 a month and 1.01460 a day', () => {
    expect(solarReturn(fakeSky, natal, 35, 'mean', o)).toBeCloseTo(natal.jdUt + 35 * 365.25636342592594, 9);
    expect(monthlyReturn(fakeSky, natal, 35, 4, 'mean', o)).toBeCloseTo(natal.jdUt + 35 * 365.25636342592594 + 4 * 30.4380302855, 9);
    expect(dailyReturn(fakeSky, natal, 35, 4, 20, 'mean', o)).toBeCloseTo(natal.jdUt + 35 * 365.25636342592594 + 4 * 30.4380302855 + 20 * 1.0146010095166667, 9);
  });
  it('puts the Sun 30 degrees a month and a degree a day past its natal longitude in the monthly and daily returns', () => {
    const m = monthlyReturn(fakeSky, natal, 35, 4, 'true', o);
    expect(gap(sunAt(m), sunAt(natal.jdUt) + 120)).toBeLessThan(1e-4);
    const d = dailyReturn(fakeSky, natal, 35, 4, 20, 'true', o);
    expect(gap(sunAt(d), sunAt(natal.jdUt) + 140)).toBeLessThan(1e-4);
  });
  it('of year 0 is the birth itself, in both modes (as PL9 prints it)', () => {
    expect(solarReturn(fakeSky, natal, 0, 'true', o)).toBe(natal.jdUt);
    expect(solarReturn(fakeSky, natal, 0, 'mean', o)).toBe(natal.jdUt);
  });
});

describe('the annual chart', () => {
  it('is cast at the birth place unless another is given, with the Muntha a sign a year from the natal Lagna', () => {
    const natalLagna = Math.floor(computePositions(fakeSky, natal, o).points.lagna!.longitude / 30);
    for (const years of [0, 1, 11, 12, 13, 35]) {
      const v = computeVarshaphala(fakeSky, natal, years, o);
      expect(v.muntha).toBe((natalLagna + years) % 12);
      expect(v.place).toEqual({ latitude: natal.latitude, longitudeEast: natal.longitudeEast });
      expect(v.chart.points.lagna).toBeDefined();
    }
    const there = computeVarshaphala(fakeSky, natal, 35, { ...o, place: { latitude: 26.9166667, longitudeEast: 75.8277778 } });
    expect(there.place.latitude).toBe(26.9166667);
    expect(there.jdUt).toBe(computeVarshaphala(fakeSky, natal, 35, o).jdUt);
  });
  it('computes the age asked above 120 (correction 25: PL9 prints a chart near the birth)', () => {
    const v = computeVarshaphala(fakeSky, natal, 130, o);
    expect(v.years).toBe(130);
    expect(v.jdUt - natal.jdUt).toBeGreaterThan(130 * 365.2422 - 2);
    expect(v.jdUt - natal.jdUt).toBeLessThan(130 * 365.2422 + 2);
  });
  it('moves the Muntha 30 degrees for each mean sidereal year from the birth to the return (from the printouts)', () => {
    const natalLagna = computePositions(fakeSky, natal, o).points.lagna!.longitude;
    const v = computeVarshaphala(fakeSky, natal, 35, o);
    expect(v.munthaLongitude).toBeCloseTo((natalLagna + 30 * (v.jdUt - natal.jdUt) / 365.25636342592594) % 360, 9);
  });
  it('takes a return instant given instead of searching one (a printed instant)', () => {
    const v = computeVarshaphala(fakeSky, natal, 35, { ...o, returnJdUt: 2462649.4 });
    expect(v.jdUt).toBe(2462649.4);
    expect(v.years).toBe(35);
  });
  it('says whether it is a day chart: the Sun above the horizon at the return', () => {
    const v = computeVarshaphala(fakeSky, natal, 35, o);
    const sun = v.chart.points.sun.longitude, lagna = v.chart.points.lagna!.longitude;
    expect(v.isDayChart).toBe((((sun - lagna) % 360) + 360) % 360 > 180);
  });
});

describe('Tajika relations and aspects', () => {
  it('counts the sign of one planet from the other: aspect from 1, 3, 4, 5, 7, 9, 10, 11; friend 3/5/9/11, enemy 1/4/7/10, neutral 2/6/8/12', async () => {
    const { tajikaAspect, tajikaRelation } = await import('../src/index');
    const from = (d: number) => [(4 + d - 1) % 12, 4] as const; // a sign d houses from Leo
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((d) => tajikaAspect(...from(d)))).toEqual([true, false, true, true, true, false, true, false, true, true, true, false]);
    expect([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((d) => tajikaRelation(...from(d)))).toEqual([-1, 0, 1, -1, 1, 0, -1, 0, 1, -1, 1, 0]);
  });
  it('finds Ithasala when the faster planet, not retrograde, is behind the slower in the sign by less than half their orbs', async () => {
    const { ithasala } = await import('../src/index');
    const chart = (moonDeg: number, venusDeg: number, moonRetro = false) => ({
      longitude: { sun: 40, moon: 120 + moonDeg, mars: 10, mercury: 70, jupiter: 200, venus: 240 + venusDeg, saturn: 300, rahu: 0, ketu: 180 },
      retrograde: { sun: false, moon: moonRetro, mars: false, mercury: false, jupiter: false, venus: false, saturn: false, rahu: true, ketu: true },
      combust: {}, lagna: 0, house: {}, isDay: true,
    });
    // Moon (orb 12) in Leo, Venus (orb 7) in Sagittarius, trine: Ithasala when Venus is ahead by less than 9.5 degrees.
    expect(ithasala(chart(10, 19.4), 'moon', 'venus')).toBe(true);
    expect(ithasala(chart(10, 19.6), 'moon', 'venus')).toBe(false);
    expect(ithasala(chart(10, 9), 'moon', 'venus')).toBe(false); // the faster ahead: Esharpha, not Ithasala
    expect(ithasala(chart(10, 19.4, true), 'moon', 'venus')).toBe(false);
    expect(ithasala(chart(10, 19.4), 'venus', 'moon')).toBe(false); // the slower first
  });
});

describe('the Tajika strengths', () => {
  const base = { sun: 42.4, moon: 355.34, mars: 41.76, mercury: 18.23, jupiter: 206.68, venus: 5.47, saturn: 35.18, rahu: 232.09, ketu: 52.09 };
  const chart = { longitude: base, retrograde: { sun: false, moon: false, mars: false, mercury: false, jupiter: true, venus: false, saturn: false, rahu: true, ketu: true }, combust: {}, lagna: 99.17, house: {}, isDay: false };
  it('gives REF 0010 in 2030 the Panchavargeeya PL9 prints (Graha, Uchcha, Hudda, Drekkana, Navamsha, total)', async () => {
    const { panchavargeeyaBala } = await import('../src/index');
    const p = panchavargeeyaBala(chart);
    const r = (x: number) => Number(x.toFixed(2));
    expect([p.sun.graha, r(p.sun.uchcha), p.sun.hudda, p.sun.drekkana, p.sun.navamsha, r(p.sun.total)]).toEqual([15, 16.4, 7.5, 7.5, 1.25, 11.91]);
    expect([p.jupiter.graha, r(p.jupiter.uchcha), p.jupiter.hudda, p.jupiter.drekkana, p.jupiter.navamsha, r(p.jupiter.total)]).toEqual([7.5, 7.59, 3.75, 10, 1.25, 7.52]);
    expect([p.venus.graha, r(p.venus.uchcha), p.venus.hudda, p.venus.drekkana, p.venus.navamsha, r(p.venus.total)]).toEqual([15, 19.06, 3.75, 5, 5, 11.95]);
  });
  it('gives 5 for each Harsha condition: the planet\'s own house, exaltation or own sign, the female or male houses, night or day', async () => {
    const { harshaBala } = await import('../src/index');
    const h = harshaBala({ ...chart, house: { sun: 9, moon: 3, mars: 1, mercury: 2, jupiter: 4, venus: 5, saturn: 12 } })!;
    expect([h.sun.first, h.moon.first, h.mars.first, h.venus.first, h.saturn.first]).toEqual([5, 5, 0, 5, 5]);
    expect(h.venus.second).toBe(0); // Venus in Aries: neither exalted nor own
    expect([h.moon.third, h.mars.third, h.jupiter.third]).toEqual([5, 0, 5]); // the Moon (female) in the 3rd; Mars (male) in the 1st, no; Jupiter (male) in the 4th
    expect([h.moon.fourth, h.sun.fourth]).toEqual([5, 0]); // a night chart: the female Moon gets it, the male Sun not
    expect(h.sun.total).toBe(h.sun.first + h.sun.second + h.sun.third + h.sun.fourth);
  });
});

describe('the year lord', () => {
  it('names the five office bearers; Trirashi and Dina-Ratri Pati follow day and night', async () => {
    const { panchadhikaris } = await import('../src/index');
    const c = { longitude: { sun: 40, moon: 200, mars: 10, mercury: 70, jupiter: 100, venus: 160, saturn: 300, rahu: 0, ketu: 180 }, retrograde: {}, combust: {}, lagna: 5, house: {}, isDay: true } as never;
    // Annual Lagna in Aries: Trirashi Pati the Sun by day, Jupiter by night; Dina-Ratri Pati the Sun's sign lord by day (Venus), the Moon's by night (Venus, Libra).
    expect(panchadhikaris(c, 2, 10)).toEqual({ munthaPati: 'saturn', natalLagnaPati: 'mercury', annualLagnaPati: 'mars', trirashiPati: 'sun', dinaRatriPati: 'venus' });
    expect(panchadhikaris({ ...(c as object), isDay: false } as never, 2, 10)!.trirashiPati).toBe('jupiter');
    expect(panchadhikaris({ ...(c as object), isDay: null } as never, 2, 10)).toBeNull();
  });
  it('takes the strongest office bearer that aspects the annual Lagna if its strength is 5 or more, else the Muntha Pati', async () => {
    const { yearLord } = await import('../src/index');
    const lords = { munthaPati: 'saturn', natalLagnaPati: 'moon', annualLagnaPati: 'mars', trirashiPati: 'sun', dinaRatriPati: 'venus' } as const;
    const strong = { sun: 9, moon: 20, mars: 12, mercury: 1, jupiter: 1, venus: 6, saturn: 3 };
    const aspects = (p: string) => p !== 'mars';
    expect(yearLord(lords, strong, aspects)).toBe('sun');
    expect(yearLord(lords, { ...strong, sun: 4, venus: 4.9 }, aspects)).toBe('saturn');
    expect(yearLord(lords, strong, () => false)).toBe('saturn');
  });
  it('gives the Muntha Pati when only the Moon, an office bearer, aspects the Lagna (its Ithasala only narrated)', async () => {
    const { yearLord } = await import('../src/index');
    const lords = { munthaPati: 'saturn', natalLagnaPati: 'moon', annualLagnaPati: 'mars', trirashiPati: 'sun', dinaRatriPati: 'venus' } as const;
    expect(yearLord(lords, { sun: 9, moon: 20, mars: 12, mercury: 1, jupiter: 1, venus: 6, saturn: 3 }, (p) => p === 'moon')).toBe('saturn');
  });
  it("correction: the year lord the Moon's Ithasala names", async () => {
    const { yearLord } = await import('../src/index');
    const lords = { munthaPati: 'mars', natalLagnaPati: 'moon', annualLagnaPati: 'mars', trirashiPati: 'mars', dinaRatriPati: 'mars' } as const;
    const strength = { sun: 9, moon: 13, mars: 12, mercury: 6, jupiter: 14, venus: 11, saturn: 3 };
    const onlyMoon = (p: string) => p === 'moon';
    expect(yearLord(lords, strength, onlyMoon)).toBe('mars');
    expect(yearLord(lords, strength, onlyMoon, { inIthasala: ['sun', 'venus'], signLord: 'saturn' })).toBe('venus');
    expect(yearLord(lords, strength, onlyMoon, { inIthasala: [], signLord: 'saturn' })).toBe('saturn');
    // The Moon not stronger than every other office bearer: the Muntha Pati, as in PL9.
    expect(yearLord(lords, { ...strength, moon: 12 }, onlyMoon, { inIthasala: ['venus'], signLord: 'saturn' })).toBe('mars');
    // On a tie the first found in the order Sun to Saturn.
    expect(yearLord(lords, { ...strength, sun: 11 }, onlyMoon, { inIthasala: ['sun', 'venus'], signLord: 'saturn' })).toBe('sun');
  });
});

describe('the Tajika yogas', () => {
  const at = (lon: Record<string, number>, extra: object = {}) => ({
    longitude: { sun: 40, moon: 125, mars: 10, mercury: 70, jupiter: 200, venus: 250, saturn: 300, rahu: 0, ketu: 180, ...lon },
    retrograde: {}, combust: {}, lagna: 0, house: {}, isDay: true, ...extra,
  }) as never;
  it('lists the pairs in Ithasala, the faster first', async () => {
    const { tajikaYogas } = await import('../src/index');
    // Moon at 5 Leo, Venus at 10 Sagittarius: trine, the Moon 5 degrees behind (orbs 12 and 7: within 9.5).
    const y = tajikaYogas(at({ moon: 125, venus: 250 }));
    expect(y.find((x) => x.name === 'Ithasala')!.planets).toContainEqual(['moon', 'venus']);
    expect(y.find((x) => x.name === 'Ithasala')!.present).toBe(true);
  });
  it('lists each pair once, even when two of the Ithasala rules hold (the faster in its last degree, the slower in the next sign)', async () => {
    const { tajikaYogas } = await import('../src/index');
    // Moon at 29.5 Aries, Venus at 2 Taurus: rules 4 (last degree) and 6 (across the sign) both hold.
    const pairs = tajikaYogas(at({ moon: 29.5, venus: 32 })).find((x) => x.name === 'Ithasala')!.planets.map((p) => p.join('-'));
    expect(pairs.filter((p) => p === 'moon-venus')).toHaveLength(1);
  });
  it('never shows Nakata or Yamaya, in either mode, though their rules (with the full orbs) are formed', async () => {
    const { tajikaYogas, tajikaRules } = await import('../src/index');
    // Mercury 10 Aries and Venus 12 Taurus (no aspect), Saturn 15 Leo aspecting both, slower than both and within the
    // orbs of each (Mercury and Saturn 8, Venus and Saturn 8): PL9's Yamaya rule holds.
    const lon = { mercury: 10, venus: 42, saturn: 135 };
    expect(tajikaRules(at(lon))[12]!('mercury', 'venus', 'saturn')).toBe(true);
    for (const f of ['pl9', 'corrected'] as const) {
      expect(tajikaYogas(at(lon, { fidelity: f })).filter((y) => y.name === 'Nakata' || y.name === 'Yamaya').some((y) => y.present)).toBe(false);
    }
  });
  it('lists the pairs in Esharpha: the faster ahead by more than a degree, within the orbs', async () => {
    const { tajikaYogas } = await import('../src/index');
    const y = tajikaYogas(at({ moon: 135, venus: 250 }));
    expect(y.find((x) => x.name === 'Esharpha')!.planets).toContainEqual(['moon', 'venus']);
    expect(y.find((x) => x.name === 'Ithasala')!.planets).not.toContainEqual(['moon', 'venus']);
  });
  it('gives a retrograde faster planet behind the slower one neither Ithasala nor Esharpha, as PL9 does', async () => {
    const { tajikaYogas } = await import('../src/index');
    const y = tajikaYogas(at({ moon: 125, venus: 250 }, { retrograde: { moon: true } }));
    expect(y.find((x) => x.name === 'Ithasala')!.planets).not.toContainEqual(['moon', 'venus']);
    expect(y.find((x) => x.name === 'Esharpha')!.planets).not.toContainEqual(['moon', 'venus']);
    // The same pair direct is in Ithasala: only the retrogression takes it out.
    expect(tajikaYogas(at({ moon: 125, venus: 250 })).find((x) => x.name === 'Ithasala')!.planets).toContainEqual(['moon', 'venus']);
  });
  it('finds Iqabala when every planet is in a kendra or panaphara, Induvara when every one is in an apoklima', async () => {
    const { tajikaYogas } = await import('../src/index');
    const all = (h: number) => ({ sun: h, moon: h, mars: h, mercury: h, jupiter: h, venus: h, saturn: h });
    expect(tajikaYogas(at({}, { house: all(1) })).find((x) => x.name === 'Iqabala')!.present).toBe(true);
    expect(tajikaYogas(at({}, { house: all(3) })).find((x) => x.name === 'Induvara')!.present).toBe(true);
    expect(tajikaYogas(at({}, { house: all(3) })).find((x) => x.name === 'Iqabala')!.present).toBe(false);
  });
  it('never shows Nakata or Yamaya, as PL9 (their orbs come from a table PL9 leaves mostly empty)', async () => {
    const { tajikaYogas } = await import('../src/index');
    // Mercury and Jupiter in no aspect (2nd), the Moon (faster) aspecting both and applying to each.
    const y = tajikaYogas(at({ mercury: 65, jupiter: 95, moon: 61 }));
    expect([y.find((x) => x.name === 'Nakata')!.present, y.find((x) => x.name === 'Yamaya')!.present]).toEqual([false, false]);
  });
  it('tests Tambira and Kutta on the annual Lagna lord with the Karyesh given, or with each other planet', async () => {
    const { tajikaYogas } = await import('../src/index');
    const kendras = { sun: 1, moon: 4, mars: 7, mercury: 10, jupiter: 1, venus: 4, saturn: 7 };
    const kutta = () => tajikaYogas(at({}, { house: kendras })).find((x) => x.name === 'Kutta')!.present;
    // All in kendras: some pair with the Lagna lord makes it, as PL9's report tests them all.
    expect(kutta()).toBe(true);
  });
  it('names the sixteen yogas in the order PL9 prints them', async () => {
    const { TAJIKA_YOGAS } = await import('../src/index');
    expect(TAJIKA_YOGAS).toHaveLength(16);
    expect([TAJIKA_YOGAS[0], TAJIKA_YOGAS[2], TAJIKA_YOGAS[15]]).toEqual(['Iqabala', 'Ithasala', 'Durupha']);
  });
});

describe('the Sahams', () => {
  const input = (lon: Record<string, number>, isDay: boolean | null) => ({
    longitude: { lagna: 70, sun: 40, moon: 100, mars: 200, mercury: 50, jupiter: 260, venus: 20, saturn: 300, rahu: 0, ketu: 180, ...lon },
    middles: [70, 100, 130, 160, 190, 220, 250, 280, 310, 340, 10, 40],
    isDay,
  });
  it('counts Punya by day as Moon - Sun + Lagna, adding 30 degrees when the Lagna is not between the Sun and the Moon', async () => {
    const { computeSahams } = await import('../src/index');
    expect(computeSahams(input({}, true))!.find((s) => s.name === 'Punya')!.longitude).toBeCloseTo(130, 9);
    expect(computeSahams(input({ lagna: 10 }, true))!.find((s) => s.name === 'Punya')!.longitude).toBeCloseTo(100, 9);
  });
  it('swaps the two points by night where PL9 does (Punya), not where it does not (Bhratru)', async () => {
    const { computeSahams } = await import('../src/index');
    const night = computeSahams(input({}, false))!;
    expect(night.find((s) => s.name === 'Punya')!.longitude).toBeCloseTo(40, 9); // Sun - Moon + Lagna + 30
    const day = computeSahams(input({}, true))!;
    expect(night.find((s) => s.name === 'Bhratru')!.longitude).toBeCloseTo(day.find((s) => s.name === 'Bhratru')!.longitude, 9);
  });
  it('gives the 37 Sahams PL9 prints with their sign lords, and none without day or night', async () => {
    const { computeSahams, SAHAMS } = await import('../src/index');
    const s = computeSahams(input({}, true))!;
    expect(s).toHaveLength(37);
    expect(SAHAMS.map((x) => x.name).slice(0, 3)).toEqual(['Punya', 'Vidya', 'Yasa']);
    expect(s[0]!.lord).toBe('sun'); // Punya at 130: Leo
    expect(computeSahams(input({}, null))).toBeNull();
  });
});

describe('the annual dashas', () => {
  const v = () => computeVarshaphala(fakeSky, natal, 35, o);
  const Y = 365.2422;
  it('runs the Vimshottari order over a year of 365.2422 days in the Mudda without balance, from the lord of the natal nakshatra plus the years', async () => {
    const { annualDashas } = await import('../src/index');
    const d = annualDashas(fakeSky, v(), natal, 'muddaWithoutBalance', o);
    const moonNak = Math.floor(computePositions(fakeSky, natal, o).points.moon.longitude / (40 / 3));
    const LORDS = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
    expect(d[0]!.lord).toBe(LORDS[(moonNak + 35) % 9]);
    expect(d[0]!.startJdUt).toBeCloseTo(v().jdUt, 9);
    const YEARS: Record<string, number> = { ketu: 7, venus: 20, sun: 6, moon: 10, mars: 7, rahu: 18, jupiter: 16, saturn: 19, mercury: 17 };
    expect(d[0]!.endJdUt - d[0]!.startJdUt).toBeCloseTo((Y * YEARS[d[0]!.lord]!) / 120, 9);
    expect(d[8]!.endJdUt - d[0]!.startJdUt).toBeCloseTo(Y, 6);
    expect(d[0]!.sub[1]!.lord).toBe(LORDS[(LORDS.indexOf(d[0]!.lord) + 1) % 9]);
  });
  it('starts the first period before the return by the part of its nakshatra the natal Moon had run (Mudda)', async () => {
    const { annualDashas } = await import('../src/index');
    const full = annualDashas(fakeSky, v(), natal, 'muddaWithoutBalance', o);
    const bal = annualDashas(fakeSky, v(), natal, 'mudda', o);
    const run = (computePositions(fakeSky, natal, o).points.moon.longitude % (40 / 3)) / (40 / 3);
    const first = full[0]!.endJdUt - full[0]!.startJdUt;
    expect(bal[0]!.startJdUt).toBeCloseTo(v().jdUt - first * run, 9);
    expect(bal[0]!.endJdUt).toBeCloseTo(v().jdUt + first * (1 - run), 9);
    expect(bal[0]!.sub[0]!.endJdUt - bal[0]!.sub[0]!.startJdUt).toBeCloseTo(full[0]!.sub[0]!.endJdUt - full[0]!.sub[0]!.startJdUt, 9);
  });
  it('lists the period that starts as the year ends (Mudda without balance)', async () => {
    const { annualDashas } = await import('../src/index');
    const d = annualDashas(fakeSky, v(), natal, 'muddaWithoutBalance', o);
    expect(d).toHaveLength(10);
    expect(d[9]!.startJdUt).toBeCloseTo(v().jdUt + Y, 6);
  });
  it('orders Patyayini by degree in the sign, the Lagna among the planets, each period its lead over the one before as a share of the greatest', async () => {
    const { annualDashas } = await import('../src/index');
    const d = annualDashas(fakeSky, v(), natal, 'patyayini', o);
    expect(d).toHaveLength(8);
    expect(d.map((p) => p.lord)).toContain('lagna');
    expect(d.at(-1)!.endJdUt - d[0]!.startJdUt).toBeCloseTo(Y, 6);
    expect(d[0]!.sub[0]!.lord).toBe(d[0]!.lord);
  });
  // A year whose points sit at these degrees in their signs: the share of the one 0.09° past the other is 0.003, and
  // its own part of its own period lasts 4.77 minutes.
  const at = (deg: Record<string, number>) => ({ jdUt: 2462600.5, years: 35, chart: { points: Object.fromEntries(Object.entries(deg).map(([k, d], i) => [k, { longitude: i * 30 + d }])) } }) as never;
  const lords = (p: { sub: { lord: string }[] }) => p.sub.map((s) => s.lord).join(' ');
  it('prints the Patyayini as PL9 does: a part shorter than five minutes left out, the rows moving on, eight to a period', async () => {
    const { annualDashas } = await import('../src/index');
    const year = at({ sun: 3, moon: 6, mars: 6.09, mercury: 12, jupiter: 18, venus: 22, saturn: 26, lagna: 29.9 });
    const pl9 = annualDashas(fakeSky, year, natal, 'patyayini', o);
    const corrected = annualDashas(fakeSky, year, natal, 'patyayini', { fidelity: 'corrected' });
    expect(lords(corrected[2]!)).toBe('mars mercury jupiter venus saturn lagna sun moon');
    expect(pl9.map((p) => p.lord)).toEqual(corrected.map((p) => p.lord));
    expect(lords(pl9[1]!)).toBe(lords(corrected[1]!));
    expect(lords(pl9[2]!)).toBe('mercury jupiter venus saturn lagna sun moon mercury');
    expect(pl9[2]!.sub.at(-1)!.endJdUt).toBeCloseTo(corrected[3]!.sub[0]!.endJdUt, 9);
    // The last row is the first of the next cycle, a year on.
    expect(lords(pl9[7]!)).toBe('sun moon mars mercury jupiter venus saturn sun');
    expect(pl9[7]!.sub.at(-1)!.endJdUt).toBeCloseTo(corrected[0]!.sub[0]!.endJdUt + Y, 6);
  });
  it('prints eight rows to each period however many parts are left out', async () => {
    const { annualDashas } = await import('../src/index');
    // Seven points within 0.007° of the greatest: all but a few rows of each cycle are under five minutes.
    const year = at({ lagna: 29.9, sun: 29.901, moon: 29.902, mars: 29.903, mercury: 29.904, jupiter: 29.905, venus: 29.906, saturn: 29.907 });
    const pl9 = annualDashas(fakeSky, year, natal, 'patyayini', o);
    expect(pl9).toHaveLength(8);
    expect(pl9.every((p) => p.sub.length === 8)).toBe(true);
  });
  it('leaves out the whole first period when its first part is shorter than five minutes, as PL9 prints it', async () => {
    const { annualDashas } = await import('../src/index');
    const year = at({ lagna: 0.09, sun: 3, moon: 6, mars: 9, mercury: 12, jupiter: 18, venus: 22, saturn: 29.9 });
    const pl9 = annualDashas(fakeSky, year, natal, 'patyayini', o);
    const corrected = annualDashas(fakeSky, year, natal, 'patyayini', { fidelity: 'corrected' });
    expect(corrected[0]!.lord).toBe('lagna');
    expect(pl9.map((p) => p.lord)).toEqual(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'lagna']);
    expect(lords(pl9[0]!)).toBe(lords(corrected[1]!));
    expect(pl9[0]!.startJdUt).toBeCloseTo(corrected[1]!.startJdUt, 9);
    expect(lords(pl9[7]!)).toBe('sun moon mars mercury jupiter venus saturn sun');
    expect(pl9[7]!.startJdUt).toBeCloseTo(corrected[0]!.sub[1]!.startJdUt + Y, 6);
  });
});

describe('the Tripataki Chakra', () => {
  // REF 0010 in 2030: 35 years; natal signs (Aries 0) Sun Taurus, Moon Aries, Mars Leo, Mercury Taurus, Jupiter Scorpio,
  // Venus Aries, Saturn Aquarius, Rahu Libra, Ketu Aries; natal and annual Lagna Cancer.
  const signs = { lagna: 3, sun: 1, moon: 0, mars: 4, mercury: 1, jupiter: 7, venus: 0, saturn: 10, rahu: 6, ketu: 0 };
  it('places each point in the Tripataki as PL9 does', async () => {
    const { tripatakiChakra } = await import('../src/index');
    const t = tripatakiChakra(signs, 3, 35);
    expect(t.cell).toEqual({ lagna: 4, sun: 5, moon: 9, mars: 10, mercury: 5, jupiter: 11, venus: 4, saturn: 2, rahu: 2, ketu: 8 });
    expect(t.vedha).toEqual({
      lagna: ['mars', 'venus'], sun: ['moon', 'mercury'], moon: ['saturn', 'rahu', 'ketu'], mars: ['venus'], mercury: ['sun', 'moon'],
      jupiter: [], venus: ['mars'], saturn: ['moon', 'rahu', 'ketu'],
    });
  });
  it('in the year 0 places each point in its natal sign, the nodes too', async () => {
    const { tripatakiChakra } = await import('../src/index');
    const t = tripatakiChakra(signs, 3, 0);
    expect(t.cell).toEqual({ lagna: 4, sun: 2, moon: 1, mars: 5, mercury: 2, jupiter: 8, venus: 1, saturn: 11, rahu: 7, ketu: 1 });
  });
  it('is not cast without a Lagna, and is said missing', async () => {
    const { computeVarshaphalaReport, tripataki } = await import('../src/index');
    const r = computeVarshaphalaReport(fakeSky, natal, 35, { ...o, place: { latitude: 85, longitudeEast: 0 } });
    expect(r.tripataki).toBeNull();
    expect(r.missing.map((m) => m.what)).toContain('tripataki');
    const v = computeVarshaphalaReport(fakeSky, natal, 35, o);
    expect(v.tripataki).toEqual(tripataki(fakeSky, natal, v.varshaphala, o));
    expect(Object.values(v.tripataki!.cell).every((x) => Number.isInteger(x) && x >= 1 && x <= 12)).toBe(true);
  });
});

describe('the Varshaphala report', () => {
  it('gathers the year: the chart, the lords, the strengths, yogas, Sahams, the four dashas and the twelve months with their lords', async () => {
    const { computeVarshaphalaReport, monthlyReturn } = await import('../src/index');
    const r = computeVarshaphalaReport(fakeSky, natal, 35, o);
    expect(r.varshaphala.years).toBe(35);
    expect(r.lords?.yearLord).toEqual(expect.any(String));
    expect(Object.keys(r.panchavargeeya)).toHaveLength(7);
    expect(r.yogas).toHaveLength(16);
    expect(r.sahams).toHaveLength(37);
    expect(Object.keys(r.dashas).sort()).toEqual(['mudda', 'muddaKalidasa', 'muddaWithoutBalance', 'patyayini']);
    expect(r.months).toHaveLength(12);
    expect(r.months[3]!.jdUt).toBeCloseTo(monthlyReturn(fakeSky, natal, 35, 3, 'true', o), 9);
    expect(r.months[0]!.jdUt).toBeCloseTo(r.varshaphala.jdUt, 9);
    expect(r.months[3]!.monthLord).toEqual(expect.any(String));
  });
});

describe('the Varshaphala where the Lagna is not defined', () => {
  it('cast beyond the polar circle: no houses, so no Harsha, Iqabala, lords, Sahams or Patyayini, each said missing', async () => {
    const { computeVarshaphalaReport } = await import('../src/index');
    const r = computeVarshaphalaReport(fakeSky, natal, 35, { ...o, place: { latitude: 85, longitudeEast: 0 } });
    expect(r.varshaphala.chart.points.lagna).toBeUndefined();
    expect(r.harsha).toBeNull();
    expect(r.yogas.find((y) => y.name === 'Iqabala')!.present).toBe(false);
    expect([r.lords, r.sahams]).toEqual([null, null]);
    expect(r.dashas.patyayini).toEqual([]);
    expect(r.missing.map((m) => m.what)).toEqual(expect.arrayContaining(['lagna', 'harsha', 'year lord', 'sahams', 'patyayini']));
    expect(r.varshaphala.munthaLongitude).toEqual(expect.any(Number));
  });
  it('for a birth beyond the polar circle: no Muntha, said missing', async () => {
    const { computeVarshaphala } = await import('../src/index');
    const v = computeVarshaphala(fakeSky, { ...natal, latitude: 85 }, 35, o);
    expect([v.muntha, v.munthaLongitude]).toEqual([null, null]);
    expect(v.missing.map((m) => m.what)).toContain('muntha');
  });
});

describe('combustion in the worksheet tables', () => {
  it('marks the Moon within 12° of the Sun, as the worksheets print it (the reports never do)', async () => {
    const { combustInTable, combustOf } = await import('../src/index');
    expect(combustInTable('moon', 108.9, 100, 13)).toBe(true);
    expect(combustInTable('moon', 112.95, 100, 13)).toBe(false);
    expect(combustOf('moon', 108.9, 100, 13)).toBe(false);
    expect(combustInTable('venus', 109, 100, 1)).toBe(combustOf('venus', 109, 100, 1));
  });
});
