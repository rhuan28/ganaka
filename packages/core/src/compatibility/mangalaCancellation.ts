import type { Planet9 } from '../jaimini';
import { combustion } from '../planetInfo/avasthas';
import type { Positions } from '../positions';
import { dignity9 } from '../strengths/dignity';
import { vargaSign } from '../vargas';
import type { Fidelity } from '../fidelity';

/**
 * The reasons PL9 gives for the Mangala Dosha between two charts to be cancelled or eased, in the order its report
 * lists them (docs/spec/compatibility.md, "Cancellation of the Mangala Dosha"). Read from its printed reports: its
 * template is not in the program. The engine names the reasons; the words are the client's.
 */

export const MANGALA_CANCELLATIONS = [
  'noDosha', 'doshaBoth', 'marsSaturn', 'maleficCount', 'bhakootGana', 'marsWeakened', 'brideJupiter', 'movableSign',
  'fourthSeventhSigns', 'marsWithMoonJupiterMercury', 'exaltedOrOwn', 'twelfthSigns', 'leoCancerSigns', 'marsJupiter',
  'fourthSigns', 'eighthSigns', 'dispositor', 'marsMercury', 'marsMoon', 'moonKendra', 'fivePlacements',
  'fivePlacementsVariant', 'strongBenefics',
] as const;
export type MangalaCancellationId = (typeof MANGALA_CANCELLATIONS)[number];
export interface MangalaCancellation {
  id: MangalaCancellationId;
  /** The chart the reason is found in, or 'pair' for one of the two together. For 'marsSaturn', the chart with Mars. */
  chart: 'native' | 'partner' | 'pair';
}

const NINE: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
const DOSHA_HOUSES = [1, 2, 4, 7, 8, 12];
const STRICT_HOUSES = [1, 4, 7, 8, 12];
// Signs from 0 (Aries).
const [ARI, TAU, GEM, CAN, LEO, VIR, LIB, SCO, SAG, CAP, AQU, PIS] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const LORD: Planet9[] = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter'];
/** The full sign aspects beyond the 7th, by the count of signs from the planet. */
const FULL: Partial<Record<Planet9, number[]>> = { mars: [4, 8], jupiter: [5, 9], saturn: [3, 10] };

interface Facts {
  sign: Record<Planet9, number>;
  house: Record<Planet9, number>;
  dosha: boolean;
  marsD9: number;
  marsCombust: boolean;
  marsRetrograde: boolean;
  dignity: Record<Planet9, number>;
}

function facts(pos: Positions, fidelity: Fidelity): Facts | null {
  const lagna = pos.points.lagna;
  // Without the Lagna, or Mars's motion (combustion and two reasons read it), there is nothing to decide.
  if (!lagna || pos.points.mars.retrograde === undefined) return null;
  const lon = Object.fromEntries(NINE.map((p) => [p, pos.points[p].longitude])) as Record<Planet9, number>;
  const first = Math.floor(lagna.longitude / 30);
  const sign = Object.fromEntries(NINE.map((p) => [p, Math.floor(lon[p] / 30)])) as Record<Planet9, number>;
  const house = Object.fromEntries(NINE.map((p) => [p, ((sign[p] - first + 12) % 12) + 1])) as Record<Planet9, number>;
  return {
    sign, house, dosha: DOSHA_HOUSES.includes(house.mars), marsD9: vargaSign(lon.mars, 'D9', fidelity),
    marsCombust: combustion('mars', lon, pos.points.mars.retrograde).combust, marsRetrograde: pos.points.mars.retrograde,
    dignity: Object.fromEntries(NINE.map((p) => [p, dignity9(p, lon)])) as Record<Planet9, number>,
  };
}

/** Whether `from` is with `to` in its sign, or casts a full sign aspect on it (the 7th, and its own special ones). */
function joinsOrAspects(f: Facts, from: Planet9, to: Planet9): boolean {
  const count = ((f.sign[to] - f.sign[from] + 12) % 12) + 1;
  return count === 1 || count === 7 || (FULL[from] ?? []).includes(count);
}

/** The reasons of one chart that has the dosha, in the report's order. */
function chartReasons(f: Facts, isBride: boolean): Set<MangalaCancellationId> {
  const out = new Set<MangalaCancellationId>();
  const m = f.house.mars, s = f.sign.mars;
  const with_ = (p: Planet9) => joinsOrAspects(f, p, 'mars');
  if (f.marsCombust || with_('jupiter') || with_('venus')) out.add('marsWeakened');
  if (isBride && [1, 4, 5, 7, 9, 10].includes(f.house.jupiter)) out.add('brideJupiter');
  if ([1, 2, 4, 8, 12].includes(m) && [ARI, CAN, LIB, CAP].includes(s)) out.add('movableSign');
  if ([4, 7].includes(m) && [ARI, CAN, SCO, CAP].includes(s)) out.add('fourthSeventhSigns');
  if (STRICT_HOUSES.includes(m) && (with_('moon') || with_('jupiter') || with_('mercury'))) out.add('marsWithMoonJupiterMercury');
  if ([CAP, ARI, SCO, CAN, LEO].includes(s) || [CAP, ARI, SCO].includes(f.marsD9)) out.add('exaltedOrOwn');
  if (m === 12 && [TAU, GEM, VIR, LIB].includes(s)) out.add('twelfthSigns');
  if (STRICT_HOUSES.includes(m) && [LEO, CAN, ARI, SCO, CAP].includes(s)) out.add('leoCancerSigns');
  if (f.sign.jupiter === s) out.add('marsJupiter');
  if (m === 4 && [ARI, SCO, TAU, LIB].includes(s)) out.add('fourthSigns');
  if (m === 8 && [SAG, PIS, CAN, CAP].includes(s)) out.add('eighthSigns');
  if ([1, 4, 5, 7, 9, 10].includes(f.house[LORD[s]!])) out.add('dispositor');
  if (with_('mercury')) out.add('marsMercury');
  if (f.sign.moon === s) out.add('marsMoon');
  if ([1, 4, 7, 10].includes(f.house.moon)) out.add('moonKendra');
  const at = (h: number, sign: number) => m === h && s === sign;
  if (at(1, ARI) || at(12, SAG) || at(4, SCO) || at(7, TAU) || at(8, AQU)) out.add('fivePlacements');
  if (at(1, ARI) || at(12, SAG) || at(4, SCO) || at(7, CAP) || at(8, CAN)) out.add('fivePlacementsVariant');
  // The best reading of the bench (18 of 19 charts): Jupiter or Venus exalted, moolatrikona or in its own sign outside
  // the 6th, 8th and 12th, or Mars retrograde or debilitated.
  const strong = (p: Planet9) => f.dignity[p] <= 3 && ![6, 8, 12].includes(f.house[p]);
  if (strong('jupiter') || strong('venus') || f.marsRetrograde || f.dignity.mars === 9) out.add('strongBenefics');
  return out;
}

/**
 * The cancellations of the Mangala Dosha between the native and the partner. The dosha is Mars in the 1st, 2nd, 4th,
 * 7th, 8th or 12th from the Lagna; a chart's own reasons are looked for only in a chart that has it, the native's
 * before the partner's. With no dosha in either chart, the only answer is 'noDosha'. Null without both Lagnas (or
 * without Mars's motion).
 */
export function mangalaCancellations(
  native: Positions, partner: Positions, bride: 'native' | 'partner',
  kootas: { bhakoot: number; gana: number; total: number }, fidelity: Fidelity,
): MangalaCancellation[] | null {
  const n = facts(native, fidelity), p = facts(partner, fidelity);
  if (!n || !p) return null;
  if (!n.dosha && !p.dosha) return [{ id: 'noDosha', chart: 'pair' }];
  const out: MangalaCancellation[] = [];
  if (n.dosha && p.dosha) out.push({ id: 'doshaBoth', chart: 'pair' });
  // Mars in a dosha house in one chart, Saturn in one in the other: the native's Mars first.
  if (n.dosha && DOSHA_HOUSES.includes(p.house.saturn)) out.push({ id: 'marsSaturn', chart: 'native' });
  if (p.dosha && DOSHA_HOUSES.includes(n.house.saturn)) out.push({ id: 'marsSaturn', chart: 'partner' });
  const groom = bride === 'native' ? p : n, wife = bride === 'native' ? n : p;
  const malefics = (f: Facts) => (['sun', 'mars', 'saturn', 'rahu', 'ketu'] as const).filter((q) => DOSHA_HOUSES.includes(f.house[q])).length;
  if (malefics(groom) > malefics(wife)) out.push({ id: 'maleficCount', chart: 'pair' });
  if (kootas.bhakoot === 7 && kootas.gana === 6 && kootas.total >= 27) out.push({ id: 'bhakootGana', chart: 'pair' });
  const reasons = { native: n.dosha ? chartReasons(n, bride === 'native') : new Set(), partner: p.dosha ? chartReasons(p, bride === 'partner') : new Set() };
  for (const id of MANGALA_CANCELLATIONS) for (const chart of ['native', 'partner'] as const) if (reasons[chart].has(id)) out.push({ id, chart });
  return out;
}
