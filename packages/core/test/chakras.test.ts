import { describe, expect, it } from 'vitest';
import { kotaScore, sanghattaVedhas, sarvatobhadraVedhas } from '../src';

const NINE = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
type P = (typeof NINE)[number];
const body = (longitude: number, speed = 1) => ({ longitude, speed });

describe('the transit chakras', () => {
  it('score the Kota Chakra in tenths, from the planets on its inner places', () => {
    const transit = Object.fromEntries(NINE.map((p, i) => [p, body(180 + i * 0.1)])) as Record<P, { longitude: number; speed: number }>;
    const r = kotaScore({ moon: 0, lagna: 0 }, transit);
    expect(Object.values(r.places).every((p) => p === r.places.sun)).toBe(true);
    expect(Math.abs(r.score * 10 - Math.round(r.score * 10))).toBeLessThan(1e-9);
  });

  it('pierce a natal planet in the Sanghatta when the padas add up to 35 modulo 36, in another third', () => {
    const natal = Object.fromEntries(NINE.map((p) => [p, 350])) as Record<P, number>;
    natal.moon = 0; // pada 0
    const transit = Object.fromEntries(NINE.map((p) => [p, 200])) as Record<P, number>;
    transit.jupiter = 35 * (10 / 3) + 1; // pada 35, the same third as pada 0: no vedha
    expect(sanghattaVedhas(natal, transit).some((v) => v.transit === 'jupiter' && v.natal === 'moon')).toBe(false);
    transit.jupiter = 71 * (10 / 3) + 1; // pada 71: 71 + 0 = 35 mod 36, another third
    expect(sanghattaVedhas(natal, transit)).toContainEqual({ transit: 'jupiter', natal: 'moon', benefic: true });
  });

  it('draw the Sarvatobhadra vedhas by motion: straight at the mean pace, diagonals otherwise, the nodes always fast', () => {
    const transit = Object.fromEntries(NINE.map((p) => [p, body(100, 1)])) as Record<P, { longitude: number; speed: number }>;
    transit.mars = body(100, 0.6);
    transit.saturn = body(100, -0.05);
    const v = Object.fromEntries(sarvatobhadraVedhas(transit).map((x) => [x.planet, x]));
    expect(v.mars!.motion).toBe(2);
    expect(v.mars!.cells).toHaveLength(1);
    expect(v.saturn!.motion).toBe(3);
    expect(v.rahu!.motion).toBe(3);
    expect(v.sun!.motion).toBe(1);
    expect(v.saturn!.benefic).toBe(false);
  });
});
