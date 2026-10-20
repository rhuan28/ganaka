import { norm360 } from '../../zodiac';
import { aspectBetween } from '../aspects';
import { SEVEN, type Planet7 } from '../dignity';
import { ayana, lords, mercuryWithMalefics, nathonnatha, paksha, tribhaga } from './kala';
import { drekkana, kendradi, ojhayugma, saptavargaja, uchcha, DEBILITY } from './sthana';
import { DEFAULT_SHADBALA_OPTIONS, type Shadbala, type ShadbalaInputs, type ShadbalaOptions, type ShadbalaRow } from './types';

export * from './types';
export { DEBILITY, temporal } from './sthana';
export type { CheshtaPlanet } from './cheshta';

/** The Shadbala as PL9 computes it, from its inputs. See docs/spec/forcas/shadbala.md. */

const distance = (a: number, b: number) => { const d = norm360(a - b); return d > 180 ? 360 - d : d; };
const fold = (a: number) => { const d = norm360(a); return d > 180 ? 360 - d : d; };

const MINIMUM: Record<Planet7, number> = { sun: 390, moon: 360, mars: 300, mercury: 420, jupiter: 390, venus: 330, saturn: 300 };
const NAISARGIKA: Record<Planet7, number> = { sun: 1, moon: 0.857, mars: 0.286, mercury: 0.429, jupiter: 0.571, venus: 0.714, saturn: 0.143 };
/** The minimums each of five balas must reach to count as strong: Sun, Jupiter, Mercury; Moon, Venus; Mars, Saturn. */
const STRONG: Record<'sthana' | 'dig' | 'kala' | 'ayana' | 'cheshta', [number, number, number]> = {
  sthana: [165, 133, 96], dig: [35, 50, 30], kala: [112, 100, 67], ayana: [30, 40, 20], cheshta: [50, 30, 40],
};
const group = (p: Planet7) => (p === 'sun' || p === 'jupiter' || p === 'mercury' ? 0 : p === 'moon' || p === 'venus' ? 1 : 2);

/** Dig Bala: the distance from the point where the planet is weakest, a third. */
function dig(p: Planet7, x: ShadbalaInputs, mode: ShadbalaOptions['digBala']): number {
  const [first, , , fourth, , , seventh, , , tenth] = x.cusps as [number, number, number, number, number, number, number, number, number, number];
  const weak = p === 'sun' || p === 'mars' ? (mode === 'cusps' ? fourth : x.lagna + 90)
    : p === 'moon' || p === 'venus' ? (mode === 'cusps' ? tenth : x.lagna - 90)
      : p === 'mercury' || p === 'jupiter' ? seventh : first;
  return distance(x.longitudes[p], weak) / 3;
}

/**
 * The aspects of the seven planets on a point, the benefics adding and the malefics taking away, a quarter of each,
 * Jupiter's and Mercury's whole (or a quarter too, by the option). The Moon is a benefic while waxing, Mercury unless
 * with malefics (by the option). `except` leaves one planet out: the Drik Bala of a planet leaves out its own.
 */
export function aspectsOn(point: number, x: ShadbalaInputs, o: ShadbalaOptions, except?: Planet7): number {
  const waxing = norm360(x.longitudes.moon - x.longitudes.sun) < 180;
  const mercuryBenefic = o.mercuryDrik === 'benefic' || !mercuryWithMalefics(x.longitudes);
  let total = 0;
  for (const q of SEVEN) {
    if (q === except) continue;
    const benefic = q === 'jupiter' || q === 'venus' || (q === 'moon' && waxing) || (q === 'mercury' && mercuryBenefic);
    const weight = (q === 'jupiter' || q === 'mercury') && o.jupiterMercuryDrik === 'full' ? 1 : 0.25;
    total += (benefic ? 1 : -1) * weight * aspectBetween(q, x.longitudes[q], point);
  }
  return total;
}

/** Drik Bala: the aspects of the other six on the planet. */
const drik = (p: Planet7, x: ShadbalaInputs, o: ShadbalaOptions) => aspectsOn(x.longitudes[p], x, o, p);

/** The Shadbala of the seven planets. */
/** The options with the defaults filled in. */
export const withDefaults = (options: Partial<ShadbalaOptions>) =>
  ({ ...DEFAULT_SHADBALA_OPTIONS, ...Object.fromEntries(Object.entries(options).filter(([, v]) => v !== undefined)) }) as ShadbalaOptions;

export function shadbala(x: ShadbalaInputs, options: Partial<ShadbalaOptions> = {}): Shadbala {
  const o = withDefaults(options);
  const l = lords(x);
  const rows = {} as Record<Planet7, ShadbalaRow>;
  for (const p of SEVEN) {
    const sth = { uchcha: uchcha(p, x.longitudes), saptavargaja: saptavargaja(p, x.longitudes, x.fidelity), ojhayugma: ojhayugma(p, x.longitudes, x.fidelity), kendradi: kendradi(p, x.longitudes, x.lagna), drekkana: drekkana(p, x.longitudes, o.drekkana) };
    const sthana = sth.uchcha + sth.saptavargaja + sth.ojhayugma + sth.kendradi + sth.drekkana;
    const kal = {
      nathonnatha: nathonnatha(p, x), paksha: paksha(p, x.longitudes, o.mercuryPaksha), tribhaga: tribhaga(p, x),
      varsha: l.year === p ? 15 : 0, masa: l.month === p ? 30 : 0, vara: l.day === p ? 45 : 0, hora: l.hour === p ? 60 : 0,
      ayana: ayana(p, x.declinations[p]), yuddha: 0,
    };
    // The Yuddha is printed with the Kala but not added to it.
    const kala = kal.nathonnatha + kal.paksha + kal.tribhaga + kal.varsha + kal.masa + kal.vara + kal.hora + kal.ayana;
    const cheshta = p === 'sun' ? kal.ayana : p === 'moon' ? kal.paksha : x.cheshta[p] ?? NaN;
    const naisargika = 60 * NAISARGIKA[p];
    const dg = dig(p, x, o.digBala);
    const dk = drik(p, x, o);
    const total = sthana + dg + kala + cheshta + naisargika + dk;
    // Ishta: the distance from debility and the kendra of motion, each up to 180, added and a sixth.
    const motion = p === 'sun' ? fold(x.sunTropical + 90) : p === 'moon' ? distance(x.longitudes.moon, x.longitudes.sun) : fold(3 * cheshta);
    const ishta = (distance(x.longitudes[p], DEBILITY[p]) + motion) / 6;
    const g = group(p);
    const strong = [sthana >= STRONG.sthana[g], dg >= STRONG.dig[g], kala >= STRONG.kala[g], kal.ayana >= STRONG.ayana[g], cheshta >= STRONG.cheshta[g]].filter(Boolean).length;
    rows[p] = { ...sth, sthana, dig: dg, ...kal, kala, cheshta, naisargika, drik: dk, total, rupas: total / 60, minimum: MINIMUM[p], ratio: total / MINIMUM[p], rank: 0, ishta, kashta: 60 - ishta, strong };
  }
  [...SEVEN].sort((a, b) => rows[b].ratio - rows[a].ratio).forEach((p, i) => { rows[p].rank = i + 1; });
  return { planets: rows, war: war(x, rows) };
}

/**
 * Planetary war, PL9's way: for each of Mars to Saturn, the last other of them within a degree of it is its opponent.
 * It wins when it is Venus or stands further north (greater latitude), unless the opponent is Venus. The Yuddha is the
 * difference of their totals, won by the winner and lost by the other.
 */
function war(x: ShadbalaInputs, rows: Record<Planet7, ShadbalaRow>): Shadbala['war'] {
  const fighters: Planet7[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  const out: Shadbala['war'] = [];
  for (const p of fighters) {
    let opponent: Planet7 | undefined;
    let wins = false;
    for (const q of fighters) {
      if (q === p || distance(x.longitudes[q], x.longitudes[p]) >= 1) continue;
      opponent = q;
      wins = (p === 'venus' || x.latitudes[q]! < x.latitudes[p]!) && q !== 'venus';
    }
    if (!opponent) continue;
    const difference = Math.abs(rows[p].total - rows[opponent].total);
    rows[p].yuddha = wins ? difference : -difference;
    if (wins) out.push({ planets: [p, opponent], winner: p });
  }
  return out;
}
