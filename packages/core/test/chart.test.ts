import { describe, expect, it } from 'vitest';
import { ALL_POINTS, HOUSE_SYSTEMS, VARGAS, computeChart, computePositions, houseOf, vargaSign } from '../src/index';
import { fakeSky } from './fakeSky';

const input = { jdUt: 2451545.4, latitude: 20, longitudeEast: 30 };

describe('computeChart', () => {
  const c = computeChart(fakeSky, input);
  it('contains the positions computePositions gives', () => {
    const p = computePositions(fakeSky, input);
    expect(c.points).toEqual(p.points);
    expect(c.verified).toBe(p.verified);
    expect(c.ayanamshaDegrees).toBe(p.ayanamshaDegrees);
  });
  it('gives every point a sign in every varga, consistent with vargaSign', () => {
    for (const v of VARGAS) for (const p of ALL_POINTS) expect(c.vargas[v][p]).toBe(vargaSign(c.points[p]!.longitude, v, c.fidelity));
  });
  it('gives every point a house in every system, consistent with houseOf, and the Lagna house 1', () => {
    for (const system of HOUSE_SYSTEMS) {
      for (const p of ALL_POINTS) expect(c.pointHouses![system][p]).toBe(houseOf(c.points[p]!.longitude, c.houses![system]));
      expect(c.pointHouses![system].lagna).toBe(1);
    }
  });
  it('applies the options to houses and vargas too', () => {
    const shifted = computeChart(fakeSky, input, { ayanamshaOffsetDegrees: 10 });
    expect((shifted.midheaven - c.midheaven + 360) % 360).toBeCloseTo(10, 6);
    expect((shifted.houses!.equal.middles[3]! - c.houses!.equal.middles[3]! + 360) % 360).toBeCloseTo(10, 6);
  });
  it('serialises to JSON and back without loss', () => {
    expect(JSON.parse(JSON.stringify(c))).toEqual(c);
  });
});
