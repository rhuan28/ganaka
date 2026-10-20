import { describe, expect, it } from 'vitest';
import { ALL_POINTS, arudhaPadas, charaKarakas, computeChart, induLagna, jaiminiAspects, rashiAspects, specialLagnas, upapada, vargaSign, ayanamshaFrame, type Planet7 } from '../src/index';
import { fakeSky } from './fakeSky';

describe('rashiAspects', () => {
  it('lets a movable sign aspect the fixed signs but the next one, a fixed sign the movable ones but the one before, and the duals each other', () => {
    expect(rashiAspects(0)).toEqual([4, 7, 10]);
    expect(rashiAspects(1)).toEqual([3, 6, 9]);
    expect(rashiAspects(2)).toEqual([5, 8, 11]);
    for (let a = 0; a < 12; a++) for (const b of rashiAspects(a)) expect(rashiAspects(b), `${a} ${b}`).toContain(a);
  });
});

describe('jaiminiAspects', () => {
  it('pairs the planets in movable signs with those in fixed signs they aspect, and lists the planets in dual signs', () => {
    // REF 0010: Sun and Mercury in Taurus, Moon, Venus and Ketu in Aries, Mars in Leo, Jupiter in Scorpio,
    // Saturn in Aquarius, Rahu in Libra.
    const a = jaiminiAspects({ sun: 1, moon: 0, mars: 4, mercury: 1, jupiter: 7, venus: 0, saturn: 10, rahu: 6, ketu: 0 });
    expect(a.movableFixed.map(([x, y]) => `${x}-${y}`).sort()).toEqual([
      'ketu-jupiter', 'ketu-mars', 'ketu-saturn', 'moon-jupiter', 'moon-mars', 'moon-saturn', 'rahu-mars', 'rahu-mercury',
      'rahu-saturn', 'rahu-sun', 'venus-jupiter', 'venus-mars', 'venus-saturn',
    ]);
    expect(a.dual).toEqual([]);
  });
  it('lists the planets in dual signs when there are two or more, even in the same sign', () => {
    expect(jaiminiAspects({ sun: 2, moon: 2, mars: 0, mercury: 1, jupiter: 1, venus: 1, saturn: 1, rahu: 1, ketu: 7 }).dual).toEqual(['sun', 'moon']);
    expect(jaiminiAspects({ sun: 2, moon: 0, mars: 0, mercury: 1, jupiter: 1, venus: 1, saturn: 1, rahu: 1, ketu: 7 }).dual).toEqual([]);
  });
});

describe('computeChart', () => {
  const input = { jdUt: 2451545.3, latitude: 20, longitudeEast: 30 };
  const c = computeChart(fakeSky, input, { fidelity: 'pl9' });
  const sign = (p: string) => Math.floor(c.points[p as keyof typeof c.points]!.longitude / 30);
  const signOf = (p: Planet7) => sign(p);

  it('carries the Jaimini section, consistent with the functions that compute it', () => {
    const lon = Object.fromEntries(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'].map((p) => [p, c.points[p as 'sun']!.longitude]));
    expect(c.jaimini.karakas.seven).toEqual(charaKarakas(lon as never, 7));
    expect(c.jaimini.karakas.eight).toEqual(charaKarakas(lon as never, 8));
    expect(c.jaimini.karakamsha).toBe(vargaSign(c.points[c.jaimini.karakas.seven[0]!.planet]!.longitude, 'D9', 'pl9'));
    expect(c.jaimini.arudhaPadas!.D1).toEqual(arudhaPadas(sign('lagna'), signOf, 'parashara'));
    expect(c.jaimini.arudhaLagna).toBe(arudhaPadas(sign('lagna'), signOf, 'none')[0]);
    expect(c.jaimini.upapada).toBe(upapada(sign('lagna'), signOf));
    expect(c.jaimini.induLagna).toBe(induLagna(sign('lagna'), sign('moon')));
    expect(c.jaimini.specialLagnas).toEqual(specialLagnas(fakeSky, input.jdUt, 20, 30, ayanamshaFrame(fakeSky, 'lahiri', 0, 'pl9')));
  });
  it('gives the padas of the Navamsha and the Dashamsha from the signs of those vargas', () => {
    const inVarga = (v: 'D9' | 'D10') => (p: Planet7) => vargaSign(c.points[p]!.longitude, v, 'pl9');
    expect(c.jaimini.arudhaPadas!.D9).toEqual(arudhaPadas(vargaSign(c.points.lagna!.longitude, 'D9', 'pl9'), inVarga('D9'), 'parashara'));
    expect(c.jaimini.arudhaPadas!.D10).toEqual(arudhaPadas(vargaSign(c.points.lagna!.longitude, 'D10', 'pl9'), inVarga('D10'), 'parashara'));
  });
  it('takes the Karakamsha from the AK of eight karakas when asked', () => {
    const e = computeChart(fakeSky, input, { fidelity: 'pl9', karakas: 'eight' });
    expect(e.jaimini.karakamsha).toBe(vargaSign(e.points[e.jaimini.karakas.eight[0]!.planet]!.longitude, 'D9', 'pl9'));
  });
  it('counts the house of every point from the Moon and from the Sun', () => {
    for (const p of ALL_POINTS) {
      expect(c.fromMoon[p], p).toBe(((sign(p) - sign('moon') + 12) % 12) + 1);
      expect(c.fromSun[p], p).toBe(((sign(p) - sign('sun') + 12) % 12) + 1);
    }
  });
  it('beyond the polar circle keeps the karakas and the aspects, and lists what needs the Lagna or the sunrise', () => {
    const polar = computeChart(fakeSky, { ...input, latitude: 70 }, { fidelity: 'pl9' });
    expect(polar.jaimini.karakas.seven).toHaveLength(7);
    expect(polar.jaimini.aspects).toBeDefined();
    expect(polar.jaimini.arudhaPadas).toBeUndefined();
    expect(polar.jaimini.upapada).toBeUndefined();
    expect(polar.jaimini.specialLagnas).toBeUndefined();
    expect(polar.missing.map((m) => m.what)).toEqual(expect.arrayContaining(['arudhas', 'specialLagnas']));
    expect(polar.fromMoon.lagna).toBeUndefined();
  });
});
