import { describe, expect, it } from 'vitest';
import { vargaTable } from '../src/index';

// REF 0010's transit of 17 Oct 2026 04:36:16 Jaipur, sidereal longitudes (pl9) to the second.
const lon = (sign: number, d: number, m: number, s: number) => sign * 30 + d + m / 60 + s / 3600;
const points = {
  lagna: lon(5, 3, 51, 58), sun: lon(5, 29, 22, 10), moon: lon(8, 10, 46, 47), mars: lon(3, 16, 28, 52), mercury: lon(6, 23, 47, 34),
  jupiter: lon(3, 28, 1, 5), venus: lon(6, 10, 38, 58), saturn: lon(11, 16, 6, 11), rahu: lon(10, 3, 50, 19), ketu: lon(4, 3, 50, 19),
};

describe('the table of a varga', () => {
  it('gives each planet\'s degree, sign, dignity, bindus, the two avasthas, functional nature and houses, as PL9 printed REF 0010\'s D9', () => {
    const t = vargaTable(points, 'D9', 'pl9')!;
    expect(t.sun).toMatchObject({ sign: 5, dignity: 7, bindus: 5, jagradadi: 'dreaming', baladi: 'infant', functional: 'neutral', houses: [8, 3, 1] });
    expect(Math.floor(t.sun.degree * 60)).toBe(24 * 60 + 19);
    expect(t.saturn).toMatchObject({ sign: 7, dignity: 8, bindus: 2, jagradadi: 'sleeping', functional: 'benefic', houses: [10, 5, 3] });
    // Rahu takes the Lagna's bindus; Ketu has none. The nodes' functional nature by their place: Rahu alone in the
    // 9th from the D9's Lagna, Ketu alone in the 3rd.
    expect(t.rahu).toMatchObject({ sign: 7, dignity: 9, bindus: 5, jagradadi: 'sleeping', functional: 'benefic' });
    expect(t.ketu).toMatchObject({ bindus: null, functional: 'neutral' });
  });
  it('and its D10', () => {
    const t = vargaTable(points, 'D10', 'pl9')!;
    expect(t.sun).toMatchObject({ sign: 10, dignity: 6, bindus: 4, jagradadi: 'sleeping', baladi: 'old', functional: 'malefic', houses: [9, 12, 1] });
  });
  it('is null without a Lagna', () => {
    const { lagna: _l, ...rest } = points;
    expect(vargaTable(rest, 'D9', 'pl9')).toBeNull();
  });
});
