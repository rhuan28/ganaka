import type { Fidelity } from '../fidelity';
import type { Planet9 } from '../jaimini';
import { baladiAvastha, type Avastha } from '../muhurta/avastha';
import { ashtakavarga, type AvSigns } from '../strengths/ashtakavarga';
import { dignity9, NATURAL, SEVEN, type Planet7 } from '../strengths/dignity';
import { SIGN_LORDS } from '../specialLagnas';
import { vargaSign, type VargaName } from '../vargas';
import { functionalNatures } from '../yogas/natures';

export type Jagradadi = 'awake' | 'dreaming' | 'sleeping';
export type FunctionalNature = 'benefic' | 'malefic' | 'neutral';

export interface VargaRow {
  /** Degrees in the sign of the varga. */
  degree: number;
  sign: number;
  /** PL9's dignity in nine steps (1 exalted … 9 debilitated), in the varga. */
  dignity: number;
  /** The planet's bindus in the varga's own Ashtakavarga; Rahu the Lagna's, Ketu none. */
  bindus: number | null;
  jagradadi: Jagradadi;
  baladi: Avastha;
  /** By the varga's Lagna, the nodes by their place in the varga (docs/spec/yogas.md). */
  functional: FunctionalNature;
  /** The house from the varga's Lagna, Moon and Sun. */
  houses: [number, number, number];
}

const PLANETS: readonly Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

/**
 * The table PL9 prints under a varga of a chart ("Animated Transits - Vargas"): for each planet its degree, sign and
 * dignity in the varga; its bindus in the Ashtakavarga cast from the varga's signs (Rahu the Lagna's chart, Ketu
 * none); the Jagradadi Avastha (awake in exaltation, moolatrikona or own sign, asleep in debility or in the sign of a
 * natural enemy, dreaming else, the nodes by dignity alone); the Baladi Avastha on the varga's degree; the functional
 * nature by the varga's Lagna; and the houses from the varga's Lagna, Moon and Sun. All from the printouts:
 * see docs/spec/time/transits.md. Null without the Lagna.
 */
export function vargaTable(longitudes: Partial<Record<'lagna' | Planet9, number>>, varga: VargaName, fidelity: Fidelity): Record<Planet9, VargaRow> | null {
  if (longitudes.lagna === undefined) return null;
  const parts = Number(varga.slice(1));
  const inVarga = (l: number) => vargaSign(l, varga, fidelity) * 30 + (((l * parts) % 30) + 30) % 30;
  const v = Object.fromEntries((['lagna', ...PLANETS] as const).map((k) => [k, inVarga(longitudes[k]!)])) as Record<'lagna' | Planet9, number>;
  const sign = (k: 'lagna' | Planet9) => Math.floor(v[k] / 30);
  const av = ashtakavarga(Object.fromEntries((['lagna', ...SEVEN] as const).map((k) => [k, sign(k)])) as AvSigns, {}, fidelity);
  const functional = functionalNatures(v)!;
  const house = (from: number, to: number) => ((to - from + 12) % 12) + 1;
  return Object.fromEntries(PLANETS.map((p) => {
    const s = sign(p);
    const dignity = dignity9(p, v);
    const lord = SIGN_LORDS[s]! as Planet7;
    const natural = p === 'rahu' || p === 'ketu' ? 1 : lord === p ? 2 : NATURAL[p as Planet7][SEVEN.indexOf(lord)]!;
    const row: VargaRow = {
      degree: v[p] % 30, sign: s, dignity,
      bindus: p === 'ketu' ? null : av.bhinna[p === 'rahu' ? 'lagna' : (p as Planet7)][s]!,
      jagradadi: dignity <= 3 ? 'awake' : dignity === 9 || natural === 0 ? 'sleeping' : 'dreaming',
      baladi: baladiAvastha(v[p]),
      functional: functional[p],
      houses: [house(sign('lagna'), s), house(sign('moon'), s), house(sign('sun'), s)],
    };
    return [p, row];
  })) as Record<Planet9, VargaRow>;
}
