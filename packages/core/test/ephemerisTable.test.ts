import { describe, expect, it } from 'vitest';
import { computePositions, ephemerisTable, EPHEMERIS_MAX_ROWS, InvalidInputError } from '../src';
import { fakeSky } from './fakeSky';

const from = { jdUt: 2451545, latitude: 26.9, longitudeEast: 75.8, utcOffsetHours: 5.5 };

describe('the ephemeris table', () => {
  it('gives a chart\'s positions at each step, the last one included', () => {
    const t = ephemerisTable(fakeSky, { from, toJdUt: from.jdUt + 3, stepDays: 1 });
    expect(t.rows.map((r) => r.jdUt)).toEqual([2451545, 2451546, 2451547, 2451548]);
    expect(t.points).toContain('pluto');
    expect(t.rows[2]!.points.moon).toEqual(computePositions(fakeSky, { ...from, jdUt: 2451547 }).points.moon);
  });
  it('gives only the points asked, the Lagna among them', () => {
    const t = ephemerisTable(fakeSky, { from, toJdUt: from.jdUt, stepDays: 1, points: ['sun', 'lagna'] });
    expect(Object.keys(t.rows[0]!.points).sort()).toEqual(['lagna', 'sun']);
  });
  it('lists a point not defined at the place as missing', () => {
    const polar = { ...from, latitude: 89 };
    const t = ephemerisTable(fakeSky, { from: polar, toJdUt: polar.jdUt, stepDays: 1, points: ['sun', 'lagna'] });
    expect(t.rows[0]!.points.lagna).toBeUndefined();
    expect(t.rows[0]!.missing.map((m) => m.what)).toEqual(['lagna']);
  });
  it('refuses a range backwards, a step under a minute, too many rows and an unknown point', () => {
    expect(() => ephemerisTable(fakeSky, { from, toJdUt: from.jdUt - 1, stepDays: 1 })).toThrow(InvalidInputError);
    expect(() => ephemerisTable(fakeSky, { from, toJdUt: from.jdUt + 1, stepDays: 1 / 2000 })).toThrow(InvalidInputError);
    expect(() => ephemerisTable(fakeSky, { from, toJdUt: from.jdUt + EPHEMERIS_MAX_ROWS, stepDays: 1 })).toThrow(/rows/);
    expect(() => ephemerisTable(fakeSky, { from, toJdUt: from.jdUt, stepDays: 1, points: ['vulcan' as never] })).toThrow(/unknown/);
  });
});
