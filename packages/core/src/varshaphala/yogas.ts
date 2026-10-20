import { dignity9, type Planet7 } from '../strengths/dignity';
import { norm360 } from '../zodiac';
import { panchavargeeyaBala } from './strengths';
import { DEEPTAMSA, TAJIKA_SPEED, tajikaAspect, type TajikaChart } from './tajika';

/** The sixteen Tajika yogas, in the order and with the names PL9 prints. */
export const TAJIKA_YOGAS = [
  'Iqabala', 'Induvara', 'Ithasala', 'Esharpha', 'Nakata', 'Yamaya', 'Manua', 'Kamboola', 'Gairi-Kamboola', 'Khallsara',
  'Rudda', 'Duphali-Kutta', 'Dutthotta-Daivira', 'Tambira', 'Kutta', 'Durupha',
] as const;
export type TajikaYogaName = (typeof TAJIKA_YOGAS)[number];

const SEVEN: readonly Planet7[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
const degreeOf = (longitude: number) => norm360(longitude) % 30;
/** The forward arc from a to b, 0 to 360. */
const ahead = (a: number, b: number) => norm360(b - a);

/** The rules of the yogas over a chart (read in PL9). Each takes the planets in the order the yoga names them. */
function rules(c: TajikaChart) {
  const sign = (p: Planet7) => signOf(c.longitude[p]);
  const deg = (p: Planet7) => degreeOf(c.longitude[p]);
  const house = (p: Planet7) => c.house[p] ?? 0;
  const aspect = (p: Planet7, q: Planet7) => tajikaAspect(sign(p), sign(q));
  const aspectFrom = (s: number, q: Planet7) => tajikaAspect(((s % 12) + 12) % 12, sign(q));
  const relationHouse = (r: Planet7, p: Planet7) => ((sign(r) - sign(p) + 12) % 12) + 1;
  const friendly = (r: Planet7, p: Planet7) => [3, 5, 9, 11].includes(relationHouse(r, p));
  const inimical = (r: Planet7, p: Planet7) => [1, 4, 7, 10].includes(relationHouse(r, p));
  const longitudes = c.longitude;
  const dignity = (p: Planet7) => dignity9(p, longitudes);
  const pancha = panchavargeeyaBala(c);
  const strength = (p: Planet7) => pancha[p].total;
  const orbs = (p: Planet7, q: Planet7) => (DEEPTAMSA[p] + DEEPTAMSA[q]) * 0.5;
  /** p faster than q, not retrograde, and behind it in the sign (unless across the sign's end). */
  const slower = (p: Planet7, q: Planet7, across = false) => TAJIKA_SPEED[p] < TAJIKA_SPEED[q] && (across || deg(p) < deg(q)) && !c.retrograde[p];
  /** q ahead of p, within half their orbs (q's degree counted 30 more across the sign's end). */
  const within = (p: Planet7, q: Planet7, across = false) => ahead(deg(p), deg(q) + (across ? 30 : 0)) < orbs(p, q);
  const ithasala = (p: Planet7, q: Planet7) => aspect(p, q) && slower(p, q) && within(p, q);
  const exact = (p: Planet7, q: Planet7) => aspect(p, q) && TAJIKA_SPEED[p] < TAJIKA_SPEED[q] && (ahead(deg(p), deg(q)) < 1 || ahead(deg(q), deg(p)) < 1);
  const nakataBase = (p: Planet7, q: Planet7, r: Planet7) => !aspect(p, q) && aspect(p, r) && aspect(q, r) && TAJIKA_SPEED[r] < TAJIKA_SPEED[p] && TAJIKA_SPEED[r] < TAJIKA_SPEED[q];
  /** The Moon without strength: not exalted or debilitated... as PL9 tests it, and aspected by no planet. */
  const unqualifiedMoon = () => {
    const d = dignity('moon');
    if (d === 1 || d === 9 || pancha.moon.hudda >= 29 || pancha.moon.drekkana >= 9 || pancha.moon.navamsha >= 5) return false;
    return SEVEN.every((r) => r === 'moon' || (!aspect(r, 'moon') && sign(r) !== sign('moon')));
  };
  const mars = 'mars' as const, saturn = 'saturn' as const, moon = 'moon' as const;
  const others = (...not: Planet7[]) => SEVEN.filter((r) => !not.includes(r));
  return {
    // Without a Lagna there are no houses: Iqabala, Induvara and Kutta are not formed.
    1: () => c.isDay !== null && SEVEN.every((p) => ![3, 6, 9, 12].includes(house(p))),
    2: () => c.isDay !== null && SEVEN.every((p) => [3, 6, 9, 12].includes(house(p))),
    3: (p: Planet7, q: Planet7) => ithasala(p, q) && !exact(p, q),
    4: (p: Planet7, q: Planet7) => deg(p) > 29 && aspectFrom(sign(p) + 1, q) && slower(p, q, true) && within(p, q, true),
    5: (p: Planet7, q: Planet7) => exact(p, q),
    6: (p: Planet7, q: Planet7) => sign(q) === (sign(p) + 1) % 12 && slower(p, q, true) && within(p, q, true),
    7: (p: Planet7, q: Planet7) => aspect(p, q) && TAJIKA_SPEED[p] < TAJIKA_SPEED[q] && (within(p, q) || within(q, p)) && ahead(deg(q), deg(p)) > 1 && ahead(deg(q), deg(p)) < 30,
    8: (p: Planet7, q: Planet7, r: Planet7) => nakataBase(p, q, r),
    9: (p: Planet7, q: Planet7, r: Planet7) => nakataBase(p, q, r) && within(r, p) && within(r, q),
    10: (p: Planet7, q: Planet7, r: Planet7) => nakataBase(p, q, r) && ((within(p, r) && within(r, q)) || (within(r, p) && within(q, r))),
    11: (p: Planet7, q: Planet7, r: Planet7) => nakataBase(p, q, r) && within(p, r) && within(q, r),
    12: (p: Planet7, q: Planet7, r: Planet7) => !aspect(p, q) && aspect(p, r) && aspect(q, r) && TAJIKA_SPEED[p] < TAJIKA_SPEED[r] && TAJIKA_SPEED[q] < TAJIKA_SPEED[r]
      && (within(p, r) || within(r, p)) && (within(q, r) || within(r, q)),
    13: (p: Planet7, q: Planet7) => {
      if (!ithasala(p, q)) return false;
      if (aspect(mars, p) || aspect(saturn, p)) return true;
      if (sign(mars) === sign(p) && p !== mars) return true;
      return sign(saturn) === sign(p) && p !== saturn;
    },
    14: (p: Planet7, q: Planet7) => ithasala(p, q) && p !== moon && (ithasala(moon, p) || ithasala(moon, q)),
    15: (p: Planet7, q: Planet7) => ithasala(p, q) && p !== moon && q !== moon && unqualifiedMoon() && deg(moon) > 29
      && aspectFrom(sign(moon) + 1, p) && aspectFrom(sign(moon) + 1, q) && within(moon, p, true) && within(moon, q, true)
      && others(moon, p, q).some((r) => strength(r) >= 15 && aspectFrom(sign(moon) + 1, r) && within(moon, r, true)),
    16: (p: Planet7, q: Planet7) => ithasala(p, q) && p !== moon && q !== moon && unqualifiedMoon() && !ithasala(moon, p) && !ithasala(moon, q)
      && sign(moon) !== sign(p) && sign(q) !== sign(moon),
    17: (p: Planet7, q: Planet7) => {
      if (!ithasala(p, q)) return false;
      // Either planet afflicted: combust, debilitated, in the 6th, 8th or 12th, or with Mars or Saturn in aspect.
      if (c.combust[p] || c.combust[q] || dignity(p) === 9 || dignity(q) === 9) return true;
      if ([6, 8, 12].includes(house(p)) || [6, 8, 12].includes(house(q))) return true;
      if (aspect(mars, p) || aspect(mars, q) || aspect(saturn, p) || aspect(saturn, q)) return true;
      if (!((p === mars || sign(mars) !== sign(p)) && (q === mars || sign(mars) !== sign(q)) && (sign(p) !== sign(saturn) || p === saturn))) return true;
      return sign(q) === sign(saturn) && q !== saturn;
    },
    18: (p: Planet7, q: Planet7) => ithasala(p, q) && (dignity(q) < 4 || strength(q) >= 15) && dignity(p) > 3 && strength(p) < 5 && !c.combust[p],
    19: (p: Planet7, q: Planet7) => strength(p) < 5 && strength(q) < 5 && others(p, q).some((r) => strength(r) >= 15 && dignity(r) < 4),
    20: (p: Planet7, q: Planet7) => !aspect(p, q) && deg(p) > 29 && aspectFrom(sign(p) + 1, q) && slower(p, q, true) && within(p, q, true),
    21: (p: Planet7, q: Planet7) => {
      if (c.isDay === null || [3, 6, 9, 12].includes(house(p)) || [3, 6, 9, 12].includes(house(q)) || p === q) return false;
      const rest = others(p, q);
      return rest.some((r) => friendly(r, p) || friendly(r, q)) && !rest.some((r) => inimical(r, p) || inimical(r, q));
    },
    22: (p: Planet7, q: Planet7) => [6, 8, 12].includes(house(p)) && [6, 8, 12].includes(house(q)) && !!c.retrograde[p] && !!c.retrograde[q] && !!c.combust[p] && !!c.combust[q],
  } as const;
}

/** The rules over a chart, by number (for checking which make each printed yoga). */
export function tajikaRules(c: TajikaChart): Record<number, (...p: Planet7[]) => boolean> {
  return rules(c) as Record<number, (...p: Planet7[]) => boolean>;
}

/** Which of PL9's rules make each printed yoga (the rules' numbers). */
const OF_YOGA: Record<TajikaYogaName, readonly number[]> = {
  // Nakata and Yamaya: PL9's rules (8 to 12) form them in many charts, but its report never shows either (0 in 600
  // printed reports); what leaves them out is not in its code (docs/spec/correcoes.md, not corrected).
  Iqabala: [1], Induvara: [2], Ithasala: [3, 4, 5, 6], Esharpha: [7], Nakata: [], Yamaya: [], Manua: [13], Kamboola: [14],
  'Gairi-Kamboola': [15], Khallsara: [16], Rudda: [17], 'Duphali-Kutta': [18], 'Dutthotta-Daivira': [19], Tambira: [20], Kutta: [21], Durupha: [22],
};

export interface TajikaYoga {
  name: TajikaYogaName;
  present: boolean;
  /** The pairs (or triples) of planets that make it, as PL9 names them. */
  planets: Planet7[][];
}

/**
 * The sixteen Tajika yogas of a chart: the rules read in PL9, over every ordered pair (or triple) of the seven
 * planets; Tambira and Kutta over the Lagna lord and the Karyesh given. See docs/spec/tempo/varshaphala.md.
 */
export function tajikaYogas(c: TajikaChart, lords: { lagnesh?: Planet7; karyesh?: Planet7 } = {}): TajikaYoga[] {
  const r = rules(c) as Record<number, (...a: Planet7[]) => boolean>;
  return TAJIKA_YOGAS.map((name) => {
    const planets: Planet7[][] = [];
    let present = false;
    for (const id of OF_YOGA[name]) {
      const rule = r[id]!;
      if (rule.length === 0) { if (rule()) present = true; continue; }
      if (id === 20 || id === 21) {
        if (lords.lagnesh && lords.karyesh && rule(lords.lagnesh, lords.karyesh)) present = true;
        continue;
      }
      // But for the Ithasala, PL9 never takes Jupiter as the first planet of a pair (from the printouts: Jupiter and
      // Saturn are listed in Ithasala 25 times, and never in the yogas built on it).
      for (const p of SEVEN) for (const q of SEVEN) {
        if (p === q || (p === 'jupiter' && name !== 'Ithasala')) continue;
        const add = (pq: Planet7[]) => { if (!planets.some((x) => x.join() === pq.join())) planets.push(pq); };
        if (rule.length === 3) {
          for (const x of SEVEN) if (x !== p && x !== q && rule(p, q, x)) add([p, q, x]);
        } else if (rule(p, q)) add([p, q]);
      }
    }
    return { name, present: present || planets.length > 0, planets };
  });
}
