import { describe, expect, it } from 'vitest';
import { computeBirthPanchanga, computeChart, computeSunriseChart } from '../src/index';
import { fakeSky } from './fakeSky';

const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: 150.6744444 };
const o = { fidelity: 'pl9' } as const;

describe('the sunrise chart', () => {
  it('is the chart at the sunrise that begins the birth\'s day, at the birth place', () => {
    const s = computeSunriseChart(fakeSky, natal, o)!;
    const sunrise = computeBirthPanchanga(fakeSky, natal, o).sunrise!;
    expect(s.jdUt).toBe(sunrise);
    expect(s.jdUt).toBeLessThanOrEqual(natal.jdUt);
    expect(s.chart).toEqual(computeChart(fakeSky, { ...natal, jdUt: sunrise }, o));
  });
  it('is null where the birth\'s day has no sunrise', () => {
    expect(computeSunriseChart(fakeSky, { ...natal, latitude: 89.5, jdUt: 2449890.5 }, o)).toBeNull();
  });
});
