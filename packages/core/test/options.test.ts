import { describe, expect, it } from 'vitest';
import { DEFAULT_OPTIONS, InvalidOptionError, NotImplementedOptionError, resolveOptions } from '../src/index';

describe('resolveOptions', () => {
  it('returns the observed PL9 configuration when nothing is given', () => {
    expect(resolveOptions()).toEqual({ ayanamsha: 'lahiri', ayanamshaOffsetDegrees: 0, node: 'true', sunrise: 'centre', gulika: 'end', karakas: 'seven', bhavapada: 'parashara', fidelity: 'corrected', natures: {} });
    expect(resolveOptions()).toEqual(DEFAULT_OPTIONS);
  });
  it('overrides only what is given', () => {
    expect(resolveOptions({ ayanamsha: 'raman' })).toEqual({ ...DEFAULT_OPTIONS, ayanamsha: 'raman' });
  });
  it('does not hand out the shared default object', () => {
    expect(resolveOptions()).not.toBe(DEFAULT_OPTIONS);
  });
  it('takes Gulika by the beginning of the portion and refuses an unknown method', () => {
    expect(resolveOptions({ gulika: 'beginning' }).gulika).toBe('beginning');
    expect(() => resolveOptions({ gulika: 'middle' as never })).toThrow(InvalidOptionError);
  });
  it('refuses the alternatives that are declared but not reproduced', () => {
    expect(() => resolveOptions({ node: 'mean' })).toThrow(NotImplementedOptionError);
    expect(() => resolveOptions({ sunrise: 'edge' })).toThrow(NotImplementedOptionError);
    try {
      resolveOptions({ node: 'mean' });
    } catch (e) {
      expect((e as NotImplementedOptionError).option).toBe('node');
      expect((e as NotImplementedOptionError).value).toBe('mean');
    }
  });
  it('refuses an offset that is not a finite number', () => {
    expect(() => resolveOptions({ ayanamshaOffsetDegrees: Number.NaN })).toThrow(InvalidOptionError);
    expect(() => resolveOptions({ ayanamshaOffsetDegrees: Number.POSITIVE_INFINITY })).toThrow(InvalidOptionError);
  });
});
