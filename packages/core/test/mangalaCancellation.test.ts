import { describe, expect, it } from 'vitest';
import { mangalaCancellations } from '../src/compatibility/mangalaCancellation';
import type { Positions } from '../src';

type Lons = Record<'lagna' | 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu', number>;
const pos = (l: Lons, retrograde: string[] = []): Positions => ({
  verified: true, fidelity: 'pl9', ayanamshaDegrees: 23, missing: [],
  points: Object.fromEntries(Object.entries(l).map(([k, v]) => [k, { longitude: v, sign: Math.floor(v / 30), nakshatra: 0, pada: 1, retrograde: retrograde.includes(k) }])) as never,
});
const kootas = { bhakoot: 0, gana: 0, total: 10 };
// The Lagna in Aries; Mars in the 5th (no dosha); everything apart.
const BASE: Lons = { lagna: 5, sun: 40, moon: 75, mars: 125, mercury: 70, jupiter: 160, venus: 280, saturn: 190, rahu: 100, ketu: 280 };

describe('the cancellations of the Mangala Dosha', () => {
  it('say only that there is no dosha when neither chart has it', () => {
    expect(mangalaCancellations(pos(BASE), pos(BASE), 'partner', kootas, 'pl9')).toEqual([{ id: 'noDosha', chart: 'pair' }]);
  });
  it('need both Lagnas', () => {
    const { lagna: _, ...rest } = BASE;
    expect(mangalaCancellations(pos(rest as Lons), pos(BASE), 'partner', kootas, 'pl9')).toBeNull();
  });
  it('find the pair\'s reasons first, then each chart\'s, the native before the partner', () => {
    // Native: Mars in the 2nd (Taurus), Saturn in the 7th. Partner: Mars in the 4th in Cancer, the Moon with it.
    const native = pos({ ...BASE, mars: 40, sun: 10, saturn: 190 });
    const partner = pos({ ...BASE, mars: 100, moon: 105, rahu: 200, ketu: 20 });
    const ids = mangalaCancellations(native, partner, 'partner', kootas, 'pl9')!.map((c) => `${c.id}:${c.chart}`);
    expect(ids.slice(0, 3)).toEqual(['doshaBoth:pair', 'marsSaturn:native', 'marsSaturn:partner']);
    expect(ids).toContain('marsMoon:partner');
    expect(ids).toContain('exaltedOrOwn:partner');
    expect(ids).not.toContain('marsMoon:native');
    expect(ids.indexOf('exaltedOrOwn:partner')).toBeLessThan(ids.indexOf('marsMoon:partner'));
  });
  it('look for a chart\'s reasons only where that chart has the dosha', () => {
    // Native without the dosha but with the Moon in a kendra; partner with Mars in the 1st.
    const native = pos({ ...BASE, moon: 95 });
    const partner = pos({ ...BASE, mars: 10 });
    const ids = mangalaCancellations(native, partner, 'partner', kootas, 'pl9')!.map((c) => `${c.id}:${c.chart}`);
    expect(ids).not.toContain('moonKendra:native');
    expect(ids).toContain('fivePlacements:partner');
  });
  it('take the Bhakoot, the Gana and a total of 27 or more together', () => {
    const native = pos({ ...BASE, mars: 10 });
    const yes = mangalaCancellations(native, pos(BASE), 'partner', { bhakoot: 7, gana: 6, total: 27 }, 'pl9')!;
    const no = mangalaCancellations(native, pos(BASE), 'partner', { bhakoot: 7, gana: 6, total: 26 }, 'pl9')!;
    expect(yes.some((c) => c.id === 'bhakootGana')).toBe(true);
    expect(no.some((c) => c.id === 'bhakootGana')).toBe(false);
  });
});
