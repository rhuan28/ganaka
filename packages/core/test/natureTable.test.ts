import { describe, expect, it } from 'vitest';
import { computeYogaContext, InvalidOptionError, resolveOptions } from '../src';
import { DEFAULT_NATURES, functionalNatures, naturalNatures, resolveNatures } from '../src/yogas/natures';
import type { Planet9 } from '../src/jaimini';
import { fakeSky } from './fakeSky';

type Lons = Record<'lagna' | Planet9, number>;
// Every planet alone in its sign; the Lagna in Aries. In longitude: Sun, Rahu, Moon, Mars, Mercury, Jupiter, Ketu,
// Venus, Saturn.
const BASE: Lons = { lagna: 5, sun: 40, moon: 100, mars: 160, mercury: 200, jupiter: 235, venus: 280, saturn: 310, rahu: 70, ketu: 250 };
const chart = (over: Partial<Lons>): Lons => ({ ...BASE, ...over });

describe('the nature table', () => {
  it('is PL9\'s defaults with no change, and keeps them in the other places', () => {
    expect(resolveNatures()).toEqual(DEFAULT_NATURES);
    const t = resolveNatures({ natural: { jupiter: 'neutral' }, functional: { leo: { sun: 'malefic' } } });
    expect(t.natural.jupiter).toBe('neutral');
    expect(t.natural.venus).toBe('benefic');
    expect(t.functional[4]!.sun).toBe('malefic');
    expect(t.functional[0]).toEqual(DEFAULT_NATURES.functional[0]);
  });

  it('refuses what PL9\'s editor does not offer', () => {
    expect(() => resolveNatures({ natural: { sun: 'waning' } })).toThrow(InvalidOptionError);
    expect(() => resolveNatures({ natural: { mercury: 'withNaturalMalefics' } })).toThrow(InvalidOptionError);
    expect(() => resolveNatures({ functional: { aries: { moon: 'waning' } } })).toThrow(InvalidOptionError);
    expect(() => resolveNatures({ functional: { aries: { rahu: 'benefic' } } })).toThrow(/follows their place/);
    expect(() => resolveNatures({ functional: { ophiuchus: {} } as never })).toThrow(/unknown sign/);
    expect(() => resolveNatures({ natural: { pluto: 'benefic' } as never })).toThrow(/unknown planet/);
    expect(() => resolveOptions({ natures: { natural: { sun: 'waning' } } })).toThrow(InvalidOptionError);
  });
});

describe('the natural nature by the table', () => {
  it('reads the Moon "less than a third full" as benefic from 60° to 300° past the Sun', () => {
    const t = resolveNatures({ natural: { moon: 'lessThanThirdFull' } });
    expect(naturalNatures(chart({ sun: 40, moon: 99 }), t).moon).toBe('malefic');
    expect(naturalNatures(chart({ sun: 40, moon: 100 }), t).moon).toBe('benefic');
    // Waning but more than a third full: malefic by default, benefic by this rule.
    expect(naturalNatures(chart({ sun: 40, moon: 280 })).moon).toBe('malefic');
    expect(naturalNatures(chart({ sun: 40, moon: 280 }), t).moon).toBe('benefic');
    expect(naturalNatures(chart({ sun: 40, moon: 341 }), t).moon).toBe('malefic');
  });

  it('keeps a fixed nature for the Moon and Mercury', () => {
    const t = resolveNatures({ natural: { moon: 'neutral', mercury: 'benefic' } });
    // Mercury with Mars, a malefic: malefic by its rule, benefic when fixed.
    const lons = chart({ mars: 205, mercury: 210 });
    expect(naturalNatures(lons).mercury).toBe('malefic');
    expect(naturalNatures(lons, t).mercury).toBe('benefic');
    expect(naturalNatures(lons, t).moon).toBe('neutral');
  });

  it('lets a neutral neighbour leave Mercury as its sign made it', () => {
    // Mars before Mercury and Jupiter after it, all in Libra; Jupiter neutral: Mercury stays malefic (with Mars).
    const t = resolveNatures({ natural: { jupiter: 'neutral' } });
    const lons = chart({ mars: 201, mercury: 205, jupiter: 209 });
    expect(naturalNatures(lons).mercury).toBe('neutral');
    expect(naturalNatures(lons, t).mercury).toBe('malefic');
  });
});

describe('the functional nature by the table', () => {
  it('reads Mercury "with malefics" by the row\'s codes, the nodes before their rewrite', () => {
    // Lagna in Aries: Mercury malefic in the row. With its rule, Mercury alone is benefic; with Rahu (malefic in the
    // table) it is malefic, though Rahu's own nature comes from its place.
    const t = resolveNatures({ functional: { aries: { mercury: 'withMalefics' } } });
    expect(functionalNatures(chart({}))!.mercury).toBe('malefic');
    expect(functionalNatures(chart({}), t)!.mercury).toBe('benefic');
    expect(functionalNatures(chart({ rahu: 205 }), t)!.mercury).toBe('malefic');
  });

  it('reads Mercury "with natural malefics" by the natural natures', () => {
    // Lagna in Aries, where the Sun is functionally benefic but naturally malefic.
    const withMalefics = resolveNatures({ functional: { aries: { mercury: 'withMalefics' } } });
    const withNatural = resolveNatures({ functional: { aries: { mercury: 'withNaturalMalefics' } } });
    const lons = chart({ sun: 195, mercury: 200, moon: 300 });
    expect(functionalNatures(lons, withMalefics)!.mercury).toBe('benefic');
    expect(functionalNatures(lons, withNatural)!.mercury).toBe('malefic');
  });
});

describe('the natures in the yoga context', () => {
  it('follow the option', () => {
    const birth = { jdUt: 2451545, latitude: 26.9, longitudeEast: 75.8, utcOffsetHours: 5.5 };
    const a = computeYogaContext(fakeSky, birth, {});
    const b = computeYogaContext(fakeSky, birth, { natures: { natural: { jupiter: 'malefic' } } });
    expect(a.natures.natural.jupiter).toBe('benefic');
    expect(b.natures.natural.jupiter).toBe('malefic');
  });
});

describe('the natures option\'s shape', () => {
  it('refuses what is not an object, as an option error', () => {
    for (const bad of [null, 5, 'x', []]) expect(() => resolveOptions({ natures: bad as never })).toThrow(InvalidOptionError);
    expect(() => resolveNatures({ natural: 'moon' as never })).toThrow(/must be an object/);
    expect(() => resolveNatures({ functional: { aries: [] as never } })).toThrow(/must be an object/);
  });
});
