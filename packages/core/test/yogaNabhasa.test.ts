import { describe, expect, it } from 'vitest';
import { nabhasa } from '../src/yogas/families/nabhasa';
import { yogaChartFrom } from '../src/yogas/chart';
import type { Planet9 } from '../src/jaimini';

type Lons = Record<Planet9, number> & { lagna?: number };
const STRONG = { sun: 1, moon: 1, mars: 1, mercury: 1, jupiter: 1, venus: 1, saturn: 1 };
const ids = (lons: Lons) => nabhasa(yogaChartFrom(lons, STRONG)).yogas.filter((y) => y.present).map((y) => y.id);
// Lagna in Aries; the seven in Aries, Cancer, Libra and Capricorn (the angles, the movable signs), each occupied.
const ANGLES: Lons = { lagna: 10, sun: 15, moon: 100, mars: 190, mercury: 280, jupiter: 20, venus: 105, saturn: 200, rahu: 50, ketu: 230 };

describe('the Nabhasa yogas', () => {
  it('see the seven in the angles: Kamala, Chatussagara, Ashraya Rajju and Rajju', () => {
    expect(ids(ANGLES)).toEqual(expect.arrayContaining(['akritiKamala', 'chatussagara', 'ashrayaRajju', 'rajju']));
  });
  it('count the signs the seven occupy, PL9 forming only Gola, Yuga, Shula and Pasha', () => {
    expect(ids(ANGLES)).not.toContain('sankhyaKedara');
    // Five signs: Pasha.
    expect(ids({ ...ANGLES, jupiter: 50 })).toContain('sankhyaPasha');
  });
  it('compute the sign-based ones without a Lagna, and report the others missing', () => {
    const { lagna: _, ...noLagna } = ANGLES;
    const r = nabhasa(yogaChartFrom(noLagna, STRONG));
    expect(r.yogas.filter((y) => y.present).map((y) => y.id)).toEqual(expect.arrayContaining(['ashrayaRajju', 'chatussagara']));
    expect(r.missing.map((m) => m.id)).toContain('akritiKamala');
    // Not in the four movable signs: the angle form could still hold, so Chatussagara cannot be told.
    const other = nabhasa(yogaChartFrom({ ...noLagna, jupiter: 50 }, STRONG));
    expect(other.yogas.map((y) => y.id)).not.toContain('chatussagara');
    expect(other.missing).toContainEqual({ id: 'chatussagara', reason: 'needs the Lagna' });
  });
  it('follow PL9\'s Danda, which leaves the 2nd and the 4th free', () => {
    // The 10th, 11th, 12th and 1st occupied, one planet in the 2nd and one in the 4th.
    const danda: Lons = { ...ANGLES, sun: 280, moon: 310, mars: 340, mercury: 15, jupiter: 40, venus: 100, saturn: 290 };
    expect(ids(danda)).toContain('akritiDanda');
  });
});
