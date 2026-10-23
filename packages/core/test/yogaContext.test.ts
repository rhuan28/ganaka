import { describe, expect, it } from 'vitest';
import { computeChart, computeYogaChart, computeYogaContext, parseChartInput } from '../src/index';
import { fakeSky } from './fakeSky';

const birth = parseChartInput({ utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 });
const polar = parseChartInput({ utc: '1995-05-27T23:15:57Z', latitude: 89, longitudeEast: 0 });
const c = { fidelity: 'corrected' } as const;

describe('the yoga context', () => {
  it('holds the chart\'s facts a yoga reads, the same as the yoga chart', () => {
    const x = computeYogaContext(fakeSky, birth, c);
    const y = computeYogaChart(fakeSky, birth, {}, c);
    expect(x.lagna?.sign).toBe(y.lagnaSign);
    expect(x.planets.moon.sign).toBe(y.signs.moon);
    expect(x.planets.mars.dignity).toBe(y.dignity.mars);
    expect(x.vargas.D9.planets.venus.sign).toBe(y.navamsa.signs.venus);
    expect(x.vargas.D9.planets.venus.dignity).toBe(y.navamsa.dignity.venus);
    expect(x.vargas.D4.planets.sun.sign).toBe(y.d4.signs.sun);
    expect(x.natures.natural).toEqual(y.natures);
    expect(x.shadbalaRatio).toEqual(y.shadbalaRatio);
    expect(x.karakas.seven[0]).toBe(y.atmakaraka);
    expect(x.planets.mercury.combust).toBe(y.combust.mercury);
  });

  it('gives each varga\'s signs as the chart\'s vargas, and the graded aspects in each', () => {
    const x = computeYogaContext(fakeSky, birth, c);
    const chart = computeChart(fakeSky, birth, c);
    for (const v of ['D1', 'D3', 'D10', 'D60'] as const) {
      expect(x.vargas[v].planets.saturn.sign).toBe(chart.vargas[v].saturn);
      expect(x.vargas[v].lagnaSign).toBe(chart.vargas[v].lagna);
    }
    const a = x.vargas.D1.aspects.moon.jupiter;
    expect(a).toBeGreaterThanOrEqual(0);
    expect(a).toBeLessThanOrEqual(60);
    expect(x.vargas.D1.aspects.moon.moon).toBe(0);
  });

  it('gives the special points and the day, and leaves out what a chart without a Lagna lacks', () => {
    const x = computeYogaContext(fakeSky, birth, c);
    expect(x.pointSigns.gulika).toBeTypeOf('number');
    expect(x.pointSigns.horaLagna).toBeTypeOf('number');
    expect(typeof x.dayBirth).toBe('boolean');
    const p = computeYogaContext(fakeSky, polar, c);
    expect(p.lagna).toBeNull();
    expect(p.natures.functional).toBeNull();
    expect(p.dayBirth).toBeNull();
    expect(p.vargas.D9.lagnaSign).toBeNull();
  });
});
