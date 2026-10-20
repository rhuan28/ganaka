import { describe, expect, it } from 'vitest';
import { KARANAS, TITHIS, YOGAS, karanaName, karanaOf, tithiOf, yogaOf } from '../src/index';

// REF 0010 at birth (27 May 1995 23:15:57 UT): the Sun at 12°23'58" Taurus, the Moon at 26°53'22" Aries.
const SUN = 42.3994397, MOON = 26.88931393;

describe('the elements of the panchanga', () => {
  it('give REF 0010 at birth as PL9 prints it: Krishna Chaturdashi, Atiganda, Shakuni', () => {
    expect(TITHIS[tithiOf(SUN, MOON) - 1]).toBe('Krishna Chaturdashi');
    expect(YOGAS[yogaOf(SUN, MOON) - 1]).toBe('Atiganda');
    expect(karanaName(karanaOf(SUN, MOON))).toBe('Shakuni');
  });
  it('count the tithi in 12° of the Moon from the Sun, the karana in 6°, the yoga in 13°20 of their sum', () => {
    expect(tithiOf(10, 10)).toBe(1);
    expect(tithiOf(10, 22)).toBe(2);
    expect(tithiOf(10, 21.999)).toBe(1);
    expect(tithiOf(10, 189.999)).toBe(15);
    expect(tithiOf(10, 190)).toBe(16);
    expect(tithiOf(10, 9.999)).toBe(30);
    expect(karanaOf(10, 16)).toBe(2);
    expect(yogaOf(10, 3.34)).toBe(2);
    expect(yogaOf(350, 9.999)).toBe(27);
  });
  it('name the 60 half-tithis: Kimstughna first, then eight rounds of the seven movable karanas, then Shakuni, Chatushpada, Naga', () => {
    expect(KARANAS.length).toBe(11);
    expect(karanaName(1)).toBe('Kimstughna');
    expect([2, 3, 4, 5, 6, 7, 8, 9].map(karanaName)).toEqual(['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti', 'Bava']);
    expect(karanaName(57)).toBe('Vishti');
    expect([58, 59, 60].map(karanaName)).toEqual(['Shakuni', 'Chatushpada', 'Naga']);
  });
  it('have the names PL9 prints, Poornima and Amavasya closing each half', () => {
    expect(TITHIS.length).toBe(30);
    expect([TITHIS[0], TITHIS[14], TITHIS[15], TITHIS[29]]).toEqual(['Shukla Pratipada', 'Shukla Poornima', 'Krishna Pratipada', 'Krishna Amavasya']);
    expect(YOGAS.length).toBe(27);
    expect([YOGAS[0], YOGAS[26]]).toEqual(['Vishkumbha', 'Vaidhriti']);
  });
});

describe('the printed forms of the panchanga', () => {
  it('writes ghatis, vighatis and palas each truncated, the ghatis past 60 kept: REF 0010 yoga ends 62:14:45 ghatis after sunrise', async () => {
    const { ghatis } = await import('../src/index');
    expect(ghatis((62 + 14 / 60 + 45.5 / 3600) / 60)).toBe('62:14:45');
    expect(ghatis((1 + 7 / 60 + 25 / 3600) / 60)).toBe('1:7:25');
  });
  it('writes the clock time of an instant to the nearest second, in the clock of the place', async () => {
    const { clockTime } = await import('../src/index');
    expect(clockTime(2449866.5 + (6 * 3600 + 59 * 60 + 3.6) / 86400)).toBe('06:59:04');
    expect(clockTime(2449866.5, 5.5)).toBe('05:30:00');
  });
});

describe('the birth panchanga', () => {
  it('fills every field PL9 prints, from the tables of its printouts', async () => {
    const { computeBirthPanchanga } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const p = computeBirthPanchanga(fakeSky, { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: 150.6744444 }, { fidelity: 'pl9' });
    expect(p.sunrise).toBeLessThan(2449865.4694097);
    expect(p.sunset).toBeGreaterThan(p.sunrise!);
    expect(p.nextSunrise! - p.sunrise!).toBeGreaterThan(0.9);
    for (const k of ['tithi', 'karana', 'yoga', 'nakshatra'] as const) expect(p.atSunrise![k].endJdUt).toBeGreaterThan(p.sunrise!);
    expect(p.moonNakEntry).toBeLessThan(2449865.4694097);
    expect(p.moonNakExit).toBeGreaterThan(2449865.4694097);
    expect(Object.values(p.ghat).every((v) => typeof v === 'string')).toBe(true);
    expect(p.saka).toBe(p.chaitradi.samvat - 135);
    expect(p.lmtCorrectionHours).toBeCloseTo(150.6744444 / 15, 9);
  });
  it('turns the Vashya of Sagittarius and Capricorn at 15 degrees', async () => {
    const { computeBirthPanchanga } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    // Find two instants with the Moon in the first and second halves of Sagittarius on the fake sky's steady Moon.
    const { computePositions } = await import('../src/index');
    const moonAt = (jd: number) => computePositions(fakeSky, { jdUt: jd, latitude: 20, longitudeEast: 30 }, { fidelity: 'pl9' }).points.moon.longitude;
    let jd = 2451545; while (Math.abs(moonAt(jd) - 245) > 0.2) jd += 0.01;
    const first = computeBirthPanchanga(fakeSky, { jdUt: jd, latitude: 20, longitudeEast: 30 }, { fidelity: 'pl9' });
    const second = computeBirthPanchanga(fakeSky, { jdUt: jd + 1, latitude: 20, longitudeEast: 30 }, { fidelity: 'pl9' });
    expect([first.avakhada.vashya, second.avakhada.vashya]).toEqual(['Manava', 'Chatushpada']);
  });
});

describe('the lunar month', () => {
  it('is intercalary in the dark fortnight of an amanta month with no sankranti, whatever the mode; Krishnadi 1/2 calls it "First"', async () => {
    const { lunarDate, newMoon, computePositions } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const sign = (jd: number) => Math.floor(computePositions(fakeSky, { jdUt: jd, latitude: 0, longitudeEast: 0 }, { fidelity: 'pl9' }).points.sun.longitude / 30);
    // The first amanta month after 2026 whose two new Moons have the Sun in one sign, and the next ordinary one.
    let a = newMoon(fakeSky, 2461000, 1, { fidelity: 'pl9' }), b = newMoon(fakeSky, a + 1, 1, { fidelity: 'pl9' });
    while (sign(a) !== sign(b)) { a = b; b = newMoon(fakeSky, a + 1, 1, { fidelity: 'pl9' }); }
    const dark = b - 3;
    for (const mode of ['krishnadi', 'shukladi'] as const) {
      const d = lunarDate(fakeSky, dark, mode, { fidelity: 'pl9' });
      expect([mode, d.paksha, d.adhika, d.name.startsWith('Adhik ')]).toEqual([mode, 'krishna', true, true]);
    }
    expect(lunarDate(fakeSky, dark, 'krishnadiHalf', { fidelity: 'pl9' }).name).toMatch(/^First /);
    // The dark fortnight of the month after it is ordinary.
    const c = newMoon(fakeSky, b + 1, 1, { fidelity: 'pl9' });
    expect(lunarDate(fakeSky, c - 3, 'krishnadi', { fidelity: 'pl9' }).adhika).toBe(false);
  });
});

describe('the Panchang printout', () => {
  it('gives a row for each civil day: its weekday, a sunrise inside it, the elements at the sunrise ending after it', async () => {
    const { computePanchangTable } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const t = computePanchangTable(fakeSky, { year: 2026, month: 6, day: 14 }, 14, { latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 }, 'krishnadi', { fidelity: 'pl9' });
    expect(t.rows.map((r) => `${r.day}/${r.month} ${r.vara}`).slice(0, 3)).toEqual(['14/6 0', '15/6 1', '16/6 2']);
    expect(t.rows).toHaveLength(14);
    for (const r of t.rows) {
      const midnight = Date.UTC(r.year, r.month - 1, r.day) / 86400000 + 2440587.5 - 5.5 / 24;
      expect(r.sunrise).toBeGreaterThan(midnight);
      expect(r.sunrise).toBeLessThan(r.sunset);
      expect(r.sunset).toBeLessThan(r.nextSunrise);
      for (const k of ['tithi', 'karana', 'yoga', 'nakshatra'] as const) expect(r.atSunrise[k].endJdUt).toBeGreaterThan(r.sunrise);
      // A tithi wholly inside the day follows the one at the sunrise and ends before the next sunrise.
      if (r.extraTithi) {
        expect(r.extraTithi.index).toBe((r.atSunrise.tithi.index % 30) + 1);
        expect(r.extraTithi.endJdUt).toBeGreaterThan(r.atSunrise.tithi.endJdUt);
        expect(r.extraTithi.endJdUt).toBeLessThan(r.nextSunrise);
      }
    }
  });
  it('heads the table with the month of the first sunrise in the calendar mode, the Kartikadi year for Shukladi, and Saka from the Chaitradi year', async () => {
    const { computePanchangTable, lunarDate } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const place = { latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 };
    // June: Chaitradi year 2026 + 57, Kartikadi 2026 + 56, Saka 2083 - 135.
    const k = computePanchangTable(fakeSky, { year: 2026, month: 6, day: 14 }, 1, place, 'krishnadi', { fidelity: 'pl9' });
    const s = computePanchangTable(fakeSky, { year: 2026, month: 6, day: 14 }, 1, place, 'shukladi', { fidelity: 'pl9' });
    expect([k.vikram, k.saka, s.vikram, s.saka]).toEqual([2083, 1948, 2082, 1948]);
    expect(k.month).toEqual(lunarDate(fakeSky, k.rows[0]!.sunrise, 'krishnadi', { fidelity: 'pl9' }));
    expect(s.month).toEqual(lunarDate(fakeSky, s.rows[0]!.sunrise, 'shukladi', { fidelity: 'pl9' }));
  });
});

describe('the Tithi Pravesh', () => {
  it('finds, in the year of age at the date given, the Moon back at its natal angle from the Sun after the Sun enters its natal sign', async () => {
    const { tithiPravesh, computePositions } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const natal = { jdUt: 2449865.4694097, latitude: 44.24, longitudeEast: 150.67 };
    const at = (jd: number) => computePositions(fakeSky, { jdUt: jd, latitude: 0, longitudeEast: 0 }, { fidelity: 'pl9' }).points;
    const t = tithiPravesh(fakeSky, natal, 2461330.5, { fidelity: 'pl9' });
    const n = at(natal.jdUt), p = at(t);
    const angle = (x: { sun: { longitude: number }; moon: { longitude: number } }) => (((x.moon.longitude - x.sun.longitude) % 360) + 360) % 360;
    expect(angle(p)).toBeCloseTo(angle(n), 3);
    expect(Math.floor(p.sun.longitude / 30)).toBe(Math.floor(n.sun.longitude / 30));
    expect(t).toBeGreaterThan(2461330.5 - 366);
  });
  it('takes a date before the birth as age 0: the return near the birth, which can come before it', async () => {
    const { tithiPravesh } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const natal = { jdUt: 2463197.07, latitude: 10, longitudeEast: 20 };
    const before = tithiPravesh(fakeSky, natal, 2461330.5, { fidelity: 'pl9' });
    expect(before).toBe(tithiPravesh(fakeSky, natal, natal.jdUt + 10, { fidelity: 'pl9' }));
    expect(Math.abs(before - natal.jdUt)).toBeLessThan(40);
  });
});

describe('the panchanga at the edges', () => {
  it('names the month of an instant minutes before a new Moon by that new Moon, in a dark fortnight', async () => {
    const { lunarDate, newMoon, computePositions } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const o = { fidelity: 'pl9' } as const;
    const nm = newMoon(fakeSky, 2461000, 1, o);
    const sign = Math.floor(computePositions(fakeSky, { jdUt: nm, latitude: 0, longitudeEast: 0 }, o).points.sun.longitude / 30);
    const d = lunarDate(fakeSky, nm - 10 / 1440, 'krishnadi', o);
    expect([d.paksha, d.month]).toEqual(['krishna', (sign + 1) % 12]);
  });

  it('finds the end of a nakshatra across 0 degrees and of a tithi across 360', async () => {
    const { elementEnd, elementStart, computePositions } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const o = { fidelity: 'pl9' } as const;
    const at = (jd: number) => computePositions(fakeSky, { jdUt: jd, latitude: 0, longitudeEast: 0 }, o).points;
    // An instant with the Moon in Revati (the last nakshatra): its end is the Moon at 0 degrees.
    let t = 2461000;
    while (at(t).moon.longitude < 350) t += 0.1;
    const end = elementEnd(fakeSky, 'nakshatra', t, o);
    expect(at(end).moon.longitude < 1e-4 || at(end).moon.longitude > 360 - 1e-4).toBe(true);
    expect(end).toBeGreaterThan(t);
    expect(elementStart(fakeSky, 'nakshatra', t, o)).toBeLessThan(t);
    // An instant in Amavasya: the tithi ends at the new Moon.
    let u = 2461000;
    const elong = (jd: number) => (((at(jd).moon.longitude - at(jd).sun.longitude) % 360) + 360) % 360;
    while (elong(u) < 350) u += 0.05;
    const e = elongation360(elong(elementEnd(fakeSky, 'tithi', u, o)));
    expect(e).toBeLessThan(1e-4);
  });

  it('counts the Vikram year at its turns: Chaitra dark and bright, January to May before Chaitra, Kartika in the amanta way', async () => {
    const { vikramSamvat } = await import('../src/index');
    const m = (month: number, adhika = false) => ({ month, adhika, name: '', paksha: 'shukla' as const });
    expect(vikramSamvat(2026, 3, m(0), 20, 'chaitradi')).toBe(2082); // Chaitra, dark fortnight: the old year
    expect(vikramSamvat(2026, 3, m(0), 2, 'chaitradi')).toBe(2083); // Chaitra, bright fortnight: the new year
    expect(vikramSamvat(2026, 2, m(11), 5, 'chaitradi')).toBe(2082); // Phalguna in February
    expect(vikramSamvat(2026, 6, m(2, true), 20, 'chaitradi')).toBe(2083); // Adhik Jyeshtha in June
    expect(vikramSamvat(2026, 6, m(2), 20, 'kartikadi')).toBe(2082);
    expect(vikramSamvat(2026, 11, m(7), 3, 'kartikadi')).toBe(2083); // Kartika in November
    expect(vikramSamvat(2026, 10, m(6), 3, 'kartikadi')).toBe(2082); // Ashvin in October
  });

  it('gives a birth before sunrise the weekday and the Ishtkaal of the sunrise before it', async () => {
    const { computeBirthPanchanga } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    // 2026-06-15 03:00 in Jaipur (UT+5:30), before that day's sunrise: a Monday, whose Vedic day is still Sunday's.
    const jdUt = Date.UTC(2026, 5, 15, 3, 0) / 86400000 + 2440587.5 - 5.5 / 24;
    const p = computeBirthPanchanga(fakeSky, { jdUt, latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 }, { fidelity: 'pl9' });
    expect(p.vara).toBe(0);
    expect(p.sunrise).toBeLessThan(jdUt);
    expect(p.ishtkaalDays).toBeGreaterThan(0.8);
    expect(p.ishtkaalDays).toBeLessThan(1);
  });

  it('gives, beyond the polar circle, what does not need a sunrise and says what is missing', async () => {
    const { computeBirthPanchanga } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const p = computeBirthPanchanga(fakeSky, { jdUt: 2449865.4694097, latitude: 78.2, longitudeEast: 15.6 }, { fidelity: 'pl9' });
    expect([p.sunrise, p.sunset, p.nextSunrise, p.atSunrise, p.vara, p.ishtkaalDays, p.avakhada.rashiPaya]).toEqual([null, null, null, null, null, null, null]);
    expect(p.missing).toEqual([{ what: 'sunrise', reason: 'beyondPolarCircle' }]);
    expect(p.now.tithi.name).toMatch(/^(Shukla|Krishna) /);
    expect(p.chaitradi.samvat).toBe(2052);
    expect(p.avakhada.gana).toEqual(expect.any(String));
  });

  it('in the corrected mode takes the exact sunrise, sunset and next sunrise (corrections 1 and 2)', async () => {
    const { panchangaDay, dayFrame, ayanamshaFrame } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    const place = { latitude: -64.98, longitudeEast: -170.87 };
    const jdUt = 2449865.4694097;
    const p = panchangaDay(fakeSky, jdUt, place.latitude, place.longitudeEast, { fidelity: 'corrected' });
    const exact = dayFrame(fakeSky, jdUt, place.latitude, place.longitudeEast, ayanamshaFrame(fakeSky, 'lahiri', 0, 'corrected'));
    expect([p.sunrise, p.sunset, p.nextSunrise]).toEqual([exact.sunrise, exact.sunset, exact.nextSunrise]);
  });

  it('puts a tithi that begins and ends between two sunrises on its own line of the Panchang table', async () => {
    const { computePanchangTable } = await import('../src/index');
    const { fakeSky } = await import('./fakeSky');
    // With mean motions a tithi lasts under a day, so in sixty days some day holds two tithi ends.
    const t = computePanchangTable(fakeSky, { year: 2026, month: 1, day: 1 }, 60, { latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 }, 'krishnadi', { fidelity: 'pl9' });
    const extra = t.rows.filter((r) => r.extraTithi);
    expect(extra.length).toBeGreaterThan(0);
    for (const r of extra) expect(r.atSunrise.tithi.endJdUt < r.extraTithi!.endJdUt && r.extraTithi!.endJdUt < r.nextSunrise).toBe(true);
  });
});

const elongation360 = (e: number) => Math.min(e, 360 - e);
