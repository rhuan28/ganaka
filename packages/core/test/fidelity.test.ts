import { describe, expect, it } from 'vitest';
import { DEFAULT_OPTIONS, FIDELITIES, InvalidOptionError, ayanamshaFrame, computeChart, computePositions, resolveOptions } from '../src/index';
import { fakeSky } from './fakeSky';

const input = { jdUt: 2451545.4, latitude: 20, longitudeEast: 30 };

describe('the fidelity option', () => {
  it('has two values and defaults to the corrected mode', () => {
    expect(FIDELITIES).toEqual(['pl9', 'corrected']);
    expect(DEFAULT_OPTIONS.fidelity).toBe('corrected');
    expect(resolveOptions({}).fidelity).toBe('corrected');
    expect(resolveOptions({ fidelity: 'pl9' }).fidelity).toBe('pl9');
  });
  it('rejects any other value with a typed error', () => {
    for (const bad of ['PL9', 'exact', '', 'toString']) expect(() => resolveOptions({ fidelity: bad as never })).toThrow(InvalidOptionError);
  });
  it('is reported by the result, so that a number can be traced to its mode', () => {
    expect(computePositions(fakeSky, input).fidelity).toBe('corrected');
    expect(computePositions(fakeSky, input, { fidelity: 'pl9' }).fidelity).toBe('pl9');
    expect(computeChart(fakeSky, input, { fidelity: 'pl9' }).fidelity).toBe('pl9');
  });
  it('travels in the ayanamsha frame; the low-level default is the PL9 reproduction', () => {
    expect(ayanamshaFrame(fakeSky, 'lahiri').fidelity).toBe('pl9');
    expect(ayanamshaFrame(fakeSky, 'lahiri', 0, 'corrected').fidelity).toBe('corrected');
  });
});
