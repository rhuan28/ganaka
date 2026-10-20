import { describe, expect, it } from 'vitest';
import { kpLords } from '../src/index';

const lon = (sign: number, d: number, m: number, s: number) => sign * 30 + d + m / 60 + s / 3600;

describe('the KP lords of a longitude', () => {
  it('give the pada, the lord of the nakshatra, the sub and the sub-sub, as PL9 printed for REF 0010 (17 Oct 2026)', () => {
    // Lagna 03°51'58" Virgo: "3,Su/Sa/Ve"; Sun 29°22'10" Virgo: "2,Ma/Sa/Ma"; Moon 10°46'47" Sagittarius: "4,Ke/Sa/Ma".
    expect(kpLords(lon(5, 3, 51, 58))).toEqual({ pada: 3, star: 'sun', sub: 'saturn', subSub: 'venus' });
    expect(kpLords(lon(5, 29, 22, 10))).toEqual({ pada: 2, star: 'mars', sub: 'saturn', subSub: 'mars' });
    expect(kpLords(lon(8, 10, 46, 47))).toEqual({ pada: 4, star: 'ketu', sub: 'saturn', subSub: 'mars' });
  });
  it('start each sub at the end of the one before: Ketu\'s 7 years of Ashwini end at 0°46\'40"', () => {
    expect(kpLords(7 / 9 - 1e-7).sub).toBe('ketu');
    expect(kpLords(7 / 9 + 1e-7).sub).toBe('venus');
    expect(kpLords(7 / 9 + 1e-7).subSub).toBe('venus');
  });
  it('take any longitude, reduced to the circle', () => {
    expect(kpLords(-0.5)).toEqual(kpLords(359.5));
    expect(kpLords(360.2)).toEqual(kpLords(0.2));
  });
});
