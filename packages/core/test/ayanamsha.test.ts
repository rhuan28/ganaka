import { describe, expect, it } from 'vitest';
import type { Ephemeris } from '@reverse/ephemeris';
import { ayanamshaPl9, type AyanamshaName } from '../src/index';

const REF: Record<string, number> = { lahiri: 23.85, faganBradley: 24.74, raman: 22.4, krishnamurti: 23.76, yukteshwar: 22.48, bhasin: 22.76, trueCitra: 23.84, krishnamurtiVp291: 23.75 };
const fake = {
  ayanamshaReference: (_jd: number, mode: string) => REF[mode] ?? 0,
  deltaTSeconds: () => 60,
  obliquityAndNutation: () => ({ trueObliquity: 23.44, meanObliquity: 23.44, nutationLongitude: -0.004, nutationObliquity: 0 }),
} as unknown as Ephemeris;
const ALL: AyanamshaName[] = ['lahiri', 'sayana', 'yukteshwar', 'raman', 'bhasin', 'fagan', 'krishnamurti', 'krishnamurtiNew', 'trueChitra'];

describe('ayanamshaPl9', () => {
  it('returns a finite angle for each of the nine names', () => {
    for (const n of ALL) expect(Number.isFinite(ayanamshaPl9(fake, 2451545, n))).toBe(true);
  });
  it('gives Lahiri as the library value minus 0.1382 arcsecond', () => {
    expect((23.85 - ayanamshaPl9(fake, 2451545, 'lahiri')) * 3600).toBeCloseTo(0.1382, 6);
  });
  it('applies the manual offset, including negative values and more than a full turn', () => {
    const base = ayanamshaPl9(fake, 2451545, 'lahiri');
    const sign = Math.sign(ayanamshaPl9(fake, 2451545, 'lahiri', 1) - base);
    expect(Math.abs(ayanamshaPl9(fake, 2451545, 'lahiri', 1) - base)).toBeCloseTo(1, 9);
    expect(ayanamshaPl9(fake, 2451545, 'lahiri', -2.5) - base).toBeCloseTo(-2.5 * sign, 9);
    expect(Number.isFinite(ayanamshaPl9(fake, 2451545, 'lahiri', 725))).toBe(true);
  });
  it('rejects an unknown name', () => {
    expect(() => ayanamshaPl9(fake, 2451545, 'nope' as AyanamshaName)).toThrow(/ayanamsha/);
  });
});

describe('ayanamshaPl9: the measured rules', () => {
  const shift = (name: AyanamshaName, mode: string) => (ayanamshaPl9(fake, 2451545, name) - REF[mode]!) * 3600;
  it('applies the constant measured for each ayanamsha', () => {
    expect(shift('yukteshwar', 'yukteshwar')).toBeCloseTo(0, 6);
    expect(shift('bhasin', 'bhasin')).toBeCloseTo(0, 6);
    expect(shift('raman', 'raman')).toBeCloseTo(0.828, 6);
    expect(shift('fagan', 'faganBradley')).toBeCloseTo(0.4021, 6);
    expect(shift('krishnamurti', 'krishnamurti')).toBeCloseTo(0.828, 6);
    expect(shift('trueChitra', 'trueCitra')).toBeCloseTo(0, 6);
  });
  it('puts Krishnamurti New 322 arcseconds above Krishnamurti', () => {
    expect((ayanamshaPl9(fake, 2451545, 'krishnamurtiNew') - ayanamshaPl9(fake, 2451545, 'krishnamurti')) * 3600).toBeCloseTo(322, 6);
  });
  it('turns "sayana" into minus the nutation, so that apparent tropical longitudes result', () => {
    expect(ayanamshaPl9(fake, 2451545, 'sayana')).toBeCloseTo(0.004, 12);
  });
  it('subtracts the manual offset: a positive offset lowers the ayanamsha', () => {
    expect(ayanamshaPl9(fake, 2451545, 'lahiri', 1) - ayanamshaPl9(fake, 2451545, 'lahiri')).toBeCloseTo(-1, 9);
  });
});
