import { describe, expect, it } from 'vitest';
import { dms, formatJson, formatTable, signDms } from '../src/format';
import { sampleChart } from './sampleChart';

describe('dms', () => {
  it('writes degrees within the sign, minutes and seconds', () => {
    expect(dms(45.5)).toBe('15°30\'00" Tau');
    expect(dms(0)).toBe('00°00\'00" Ari');
  });
  it('never shows 60 seconds or 30 degrees', () => {
    expect(dms(29.99999999)).toBe('29°59\'59" Ari');
    expect(dms(359.9999999)).toBe('29°59\'59" Pis');
  });
});

describe('formatTable', () => {
  const lines = formatTable(sampleChart).split('\n');
  it('has one line per point after the header, and a line per house system', () => {
    expect(lines.filter((l) => /^(sun|moon|lagna|gulika) /.test(l))).toHaveLength(4);
    expect(lines.some((l) => l.startsWith('sripati'))).toBe(true);
  });
  it('names the mode on the first line', () => {
    expect(formatTable(sampleChart).split('\n')[0]).toBe(`mode: ${sampleChart.fidelity}`);
  });
  it('shows a dash for an absent point and says what is missing and why', () => {
    const { lagna: _lagna, gulika: _gulika, pranaPada: _pranaPada, ...steady } = sampleChart.points;
    const polar = {
      ...sampleChart, points: steady, houses: undefined, pointHouses: undefined,
      missing: [{ what: 'lagna', reason: 'beyondPolarCircle' }, { what: 'houses', reason: 'beyondPolarCircle' }],
    } as typeof sampleChart;
    const text = formatTable(polar);
    expect(text).toMatch(/^lagna +—/m);
    expect(text).toMatch(/missing: lagna \(beyond the polar circle\)/);
    expect(text).toMatch(/missing: houses \(beyond the polar circle\)/);
    expect(text).not.toMatch(/^sripati/m);
    expect(text).not.toMatch(/undefined|NaN/);
  });
  it('marks retrograde points and says when the result is not verified', () => {
    expect(lines.find((l) => l.startsWith('saturn'))).toMatch(/ R /);
    expect(formatTable({ ...sampleChart, verified: false })).toMatch(/outside the dates and latitudes/);
    expect(formatTable({ ...sampleChart, fidelity: 'corrected' })).toMatch(/known defects repaired/);
    expect(formatTable({ ...sampleChart, fidelity: 'pl9' })).not.toMatch(/known defects repaired/);
  });
});

describe('formatJson', () => {
  it('is the chart itself, with full precision', () => {
    expect(JSON.parse(formatJson(sampleChart))).toEqual(sampleChart);
  });
});

describe('signDms', () => {
  it('rounds to the second over the whole longitude, so the last half second of a sign shows as 0 of the next', () => {
    expect(signDms(29.99999)).toBe('Taurus 00:00:00');
    expect(signDms(359.99999)).toBe('Aries 00:00:00');
    expect(signDms(45.5)).toBe('Taurus 15:30:00');
  });
});
