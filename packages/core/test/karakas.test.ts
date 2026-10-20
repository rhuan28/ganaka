import { describe, expect, it } from 'vitest';
import { InvalidOptionError, arudhaPada, arudhaPadas, charaKarakas, resolveOptions, upapada, type Planet7 } from '../src/index';

// Degrees within the sign decide; the sign does not.
const LON = { sun: 42.399, moon: 26.889, mars: 127.25, mercury: 54.087, jupiter: 227.293, venus: 19.544, saturn: 329.694, rahu: 191.654 };

describe('charaKarakas', () => {
  it('ranks the seven planets by their degrees within the sign, highest first', () => {
    expect(charaKarakas(LON, 7)).toEqual([
      { name: 'AK', planet: 'saturn' }, { name: 'AmK', planet: 'moon' }, { name: 'BK', planet: 'mercury' }, { name: 'MK', planet: 'venus' },
      { name: 'PiK', planet: 'jupiter' }, { name: 'GK', planet: 'sun' }, { name: 'DK', planet: 'mars' },
    ]);
  });
  it('with eight, counts Rahu backwards: thirty degrees less its degrees', () => {
    // Rahu at 11.654 degrees of Libra counts as 18.346: between Venus (19.544) and Jupiter (17.293).
    expect(charaKarakas(LON, 8).map((k) => `${k.name}:${k.planet}`)).toEqual([
      'AK:saturn', 'AmK:moon', 'BK:mercury', 'MK:venus', 'PiK:rahu', 'PuK:jupiter', 'GK:sun', 'DK:mars',
    ]);
  });
  it('gives Rahu at exactly 0 degrees of a sign the full thirty, and keeps a tie in the order of the planets', () => {
    const k = charaKarakas({ ...LON, rahu: 180, venus: 30 + 26.889 }, 8);
    expect(k[0]).toEqual({ name: 'AK', planet: 'rahu' });
    // Venus has the Moon's degrees: the Moon, earlier in the order of the planets, ranks first.
    expect(k.map((x) => x.planet).slice(2, 4)).toEqual(['moon', 'venus']);
  });
});

describe('arudhaPada', () => {
  it('counts from the house to its lord and as far again from the lord', () => {
    // House in Cancer, lord in Virgo: two signs on, and two more from Virgo is Scorpio.
    expect(arudhaPada(3, 5, 'parashara')).toBe(7);
  });
  it('takes the tenth from the result when it falls in the house itself or in its seventh', () => {
    // Lord in the house: the pada falls in the house; the tenth from Cancer is Aries.
    expect(arudhaPada(3, 3, 'parashara')).toBe(0);
    // Lord in Aries, the tenth from Cancer: the pada falls in Capricorn, the seventh of Cancer, so its tenth: Libra.
    expect(arudhaPada(3, 0, 'parashara')).toBe(6);
    expect(arudhaPada(3, 0, 'none')).toBe(9);
  });
});

describe('arudhaPadas and upapada', () => {
  const at = (signs: Partial<Record<Planet7, number>>) => (p: Planet7) => signs[p] ?? 0;
  it('give the pada of the twelve houses from the Lagna, with the lord of each sign', () => {
    const signOf = at({ moon: 0, sun: 4, mercury: 2, venus: 6, mars: 7, jupiter: 8, saturn: 9 });
    const padas = arudhaPadas(3, signOf, 'parashara');
    expect(padas).toHaveLength(12);
    // House 1 in Cancer, Moon in Aries: Capricorn, the seventh of Cancer, so its tenth, Libra.
    expect(padas[0]).toBe(6);
    // Scorpio (house 5) is Mars's: Mars in Scorpio, the pada falls in the house, so the tenth: Leo.
    expect(padas[4]).toBe(4);
  });
  it('count the twelfth house of the Upapada backwards from an even Lagna', () => {
    const signOf = at({ mercury: 5, venus: 9, mars: 3, jupiter: 11, saturn: 2, moon: 7, sun: 1 });
    // Odd Lagna, Aries: the twelfth is Pisces, Jupiter in Pisces: the pada falls in the house, so the tenth: Sagittarius.
    expect(upapada(0, signOf)).toBe(8);
    // Even Lagna, Taurus: the twelfth is Gemini, Mercury in Virgo: three on and three more: Sagittarius, the seventh
    // of Gemini, so its tenth: Virgo.
    expect(upapada(1, signOf)).toBe(5);
  });
});

describe('the options of karakas and padas', () => {
  it('default to seven karakas and the padas of Parashara, as observed in PL9', () => {
    expect(resolveOptions().karakas).toBe('seven');
    expect(resolveOptions().bhavapada).toBe('parashara');
    expect(resolveOptions({ karakas: 'eight' }).karakas).toBe('eight');
  });
  it('refuses unknown values', () => {
    expect(() => resolveOptions({ karakas: 'nine' as never })).toThrow(InvalidOptionError);
    expect(() => resolveOptions({ bhavapada: 'other' as never })).toThrow(InvalidOptionError);
  });
});

describe('the padas of K.N.Rao', () => {
  it('as PL9 gives them, keep the count without the exception of Parashara', () => {
    expect(arudhaPada(3, 3, 'knrao')).toBe(3);
    expect(arudhaPada(3, 0, 'knrao')).toBe(9);
    expect(arudhaPada(3, 5, 'knrao')).toBe(7);
    expect(resolveOptions({ bhavapada: 'knrao' }).bhavapada).toBe('knrao');
  });
});
