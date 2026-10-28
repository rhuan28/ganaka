import type { Planet9 } from '../jaimini';
import { InvalidOptionError } from '../errors';
import { norm360 } from '../zodiac';

/**
 * The benefic or malefic nature of the nine planets, natural and functional, as PL9 sets it when it builds a chart
 * with its default options. The yogas take one of the two (docs/spec/yogas.md, "Benefics and malefics").
 */

export type Nature = 'benefic' | 'malefic' | 'neutral';
export interface YogaNatureOptions {
  /** PL9's "Use functional mal/ben": the functional nature replaces the natural one in the yogas. */
  functionalNature?: boolean;
}

/**
 * What PL9's "Nature of planets" editor can set for a planet. Beside the three natures, two rules for the Moon's
 * natural nature ('waning', malefic when waning; 'lessThanThirdFull', malefic when less than a third full) and two for
 * Mercury ('withMalefics', malefic with a malefic in its sign; in the functional table also 'withNaturalMalefics', the
 * same counting the natural natures).
 */
export type NatureCode = Nature | 'waning' | 'lessThanThirdFull' | 'withMalefics' | 'withNaturalMalefics';
/** The natural table (nine codes) and the functional one (one row per sign of the Lagna, Aries first). */
export interface NatureTable {
  natural: Record<Planet9, NatureCode>;
  functional: Record<Planet9, NatureCode>[];
}

export const LAGNA_SIGN_NAMES = ['aries', 'taurus', 'gemini', 'cancer', 'leo', 'virgo', 'libra', 'scorpio', 'sagittarius', 'capricorn', 'aquarius', 'pisces'] as const;
export type LagnaSignName = (typeof LAGNA_SIGN_NAMES)[number];

/** A change to the defaults: the planets' natural codes, and the functional rows by the Lagna's sign name. */
export interface NatureOptions {
  natural?: Partial<Record<Planet9, NatureCode>>;
  functional?: Partial<Record<LagnaSignName, Partial<Record<Planet9, NatureCode>>>>;
}

const NINE: readonly Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
const SEVEN = NINE.slice(0, 7);
const CODE: Record<string, Nature> = { B: 'benefic', M: 'malefic', N: 'neutral' };
const NATURES: readonly NatureCode[] = ['benefic', 'malefic', 'neutral'];

/**
 * By the Lagna's sign from Aries, the Sun to Saturn: Parashara's lists as PL9 prints them (B benefic, M malefic,
 * N neutral). The nodes are not in it: they follow their place (functionalNatures).
 */
export const FUNCTIONAL_BY_LAGNA = ['BNBMBMM', 'BMNBMMB', 'MNMNMBB', 'NBBMBMN', 'BNBMBMM', 'NMMBMBM', 'MNMBMNB', 'NBNMBMM', 'BNBMNMM', 'NMMBMBN', 'NMMNMBB', 'MBBMBMM'];

/** PL9's defaults: the Moon malefic when waning, Mercury malefic with malefics, the nodes malefic. */
export const DEFAULT_NATURES: NatureTable = Object.freeze({
  natural: { sun: 'malefic', moon: 'waning', mars: 'malefic', mercury: 'withMalefics', jupiter: 'benefic', venus: 'benefic', saturn: 'malefic', rahu: 'malefic', ketu: 'malefic' },
  functional: FUNCTIONAL_BY_LAGNA.map((row) => ({ ...Object.fromEntries(SEVEN.map((p, i) => [p, CODE[row[i]!]!])), rahu: 'malefic', ketu: 'malefic' }) as Record<Planet9, NatureCode>),
}) as NatureTable;

/** The table with the changes applied; a code the editor does not offer for that planet is refused. */
export function resolveNatures(changes: NatureOptions = {}): NatureTable {
  const plain = (v: unknown) => typeof v === 'object' && v !== null && !Array.isArray(v);
  const object = (v: unknown, where: string) => { if (v !== undefined && !plain(v)) throw new InvalidOptionError('natures', `${where} must be an object`); };
  object(changes, 'the natures');
  object(changes.natural, 'natural');
  object(changes.functional, 'functional');
  for (const [k, row] of Object.entries(changes.functional ?? {})) object(row, `functional ${k}`);
  const allowed = (p: Planet9, functional: boolean): readonly NatureCode[] =>
    p === 'moon' && !functional ? [...NATURES, 'waning', 'lessThanThirdFull']
      : p === 'mercury' ? [...NATURES, 'withMalefics', ...(functional ? ['withNaturalMalefics' as const] : [])] : NATURES;
  const apply = (row: Record<Planet9, NatureCode>, given: Partial<Record<Planet9, NatureCode>> | undefined, where: string, functional: boolean) => {
    const out = { ...row };
    for (const [p, code] of Object.entries(given ?? {})) {
      if (!NINE.includes(p as Planet9)) throw new InvalidOptionError('natures', `${where}: unknown planet "${p}"`);
      // PL9 rewrites the nodes' functional nature from their place, whatever its table holds.
      if (functional && (p === 'rahu' || p === 'ketu')) throw new InvalidOptionError('natures', `${where}: the functional nature of the nodes follows their place`);
      if (!allowed(p as Planet9, functional).includes(code as NatureCode)) throw new InvalidOptionError('natures', `${where}: "${String(code)}" is not a nature of ${p}`);
      out[p as Planet9] = code as NatureCode;
    }
    return out;
  };
  for (const k of Object.keys(changes.functional ?? {})) if (!LAGNA_SIGN_NAMES.includes(k as LagnaSignName)) throw new InvalidOptionError('natures', `unknown sign "${k}"`);
  return {
    natural: apply(DEFAULT_NATURES.natural, changes.natural, 'natural', false),
    functional: DEFAULT_NATURES.functional.map((row, i) => apply(row, changes.functional?.[LAGNA_SIGN_NAMES[i]!], `functional ${LAGNA_SIGN_NAMES[i]}`, true)),
  };
}

const signOf = (longitude: number) => Math.floor(norm360(longitude) / 30);
const arc = (a: number, b: number) => { const d = Math.abs(norm360(a) - norm360(b)); return Math.min(d, 360 - d); };
const fixed = (code: NatureCode): Nature | null => (NATURES.includes(code) ? (code as Nature) : null);

/**
 * The natural nature, by the table (PL9's defaults when none). A planet with a nature keeps it. The Moon by its rule,
 * on its elongation from the Sun, e = Moon - Sun round the zodiac: 'waning' is benefic when 0° < e <= 180°,
 * 'lessThanThirdFull' when 60° <= e <= 300°, malefic otherwise. Mercury by its rule, after the Moon: benefic unless a
 * malefic shares its sign; then the planets just before and after it in longitude (the nine, round the zodiac)
 * decide, when they share its sign: both benefic make it benefic, both malefic malefic, one of each neutral, or
 * benefic when the one after it is the Moon; a neutral one leaves it as it was. When only one of the two shares its
 * sign, PL9 looks at the one before it: Mercury is malefic if that planet is.
 */
export function naturalNatures(longitudes: Record<Planet9, number>, table: NatureTable = DEFAULT_NATURES): Record<Planet9, Nature> {
  const out = Object.fromEntries(NINE.map((p) => [p, fixed(table.natural[p]) ?? 'benefic'])) as Record<Planet9, Nature>;
  const e = norm360(longitudes.moon - longitudes.sun);
  if (table.natural.moon === 'waning') out.moon = e > 0 && e <= 180 ? 'benefic' : 'malefic';
  if (table.natural.moon === 'lessThanThirdFull') out.moon = e >= 60 && e <= 300 ? 'benefic' : 'malefic';
  if (table.natural.mercury !== 'withMalefics') return out;
  const sign = signOf(longitudes.mercury);
  if (NINE.some((p) => p !== 'mercury' && signOf(longitudes[p]) === sign && out[p] === 'malefic')) out.mercury = 'malefic';
  // The nine in order of longitude; a stable sort keeps the planets' order on a tie, as PL9's does.
  const order = [...NINE].sort((a, b) => norm360(longitudes[a]) - norm360(longitudes[b]));
  const at = order.indexOf('mercury');
  const before = order[(at + 8) % 9]!, after = order[(at + 1) % 9]!;
  const withBefore = signOf(longitudes[before]) === sign, withAfter = signOf(longitudes[after]) === sign;
  if (withBefore && withAfter) {
    const b = out[before], a = out[after];
    if (b === 'benefic' && a === 'benefic') out.mercury = 'benefic';
    else if (b === 'malefic' && a === 'malefic') out.mercury = 'malefic';
    else if (b !== 'neutral' && a !== 'neutral') out.mercury = after === 'moon' ? 'benefic' : 'neutral';
  } else if (withBefore || withAfter) {
    if (out[before] === 'malefic') out.mercury = 'malefic';
  }
  return out;
}

/**
 * The functional nature, by the row of the Lagna's sign; null without a Lagna. Mercury by its rule: 'withMalefics' is
 * malefic when a planet in its sign has a malefic code in that row (the nodes by their codes, before the rewrite
 * below), 'withNaturalMalefics' when one is a natural malefic; benefic otherwise. A node alone in its sign is
 * benefic in the 1st, 5th or 9th house from the Lagna, malefic in the 6th, 8th or 12th and neutral elsewhere; with
 * planets in its sign, it takes the nature of the nearest of them in longitude (the first in the planets' order on a
 * tie).
 */
export function functionalNatures(longitudes: Partial<Record<'lagna' | Planet9, number>> & Record<Planet9, number>, table: NatureTable = DEFAULT_NATURES): Record<Planet9, Nature> | null {
  if (longitudes.lagna === undefined) return null;
  const lagna = signOf(longitudes.lagna);
  const row = table.functional[lagna]!;
  const out = Object.fromEntries(NINE.map((p) => [p, fixed(row[p]) ?? 'benefic'])) as Record<Planet9, Nature>;
  const mercurySign = signOf(longitudes.mercury);
  const withMercury = NINE.filter((p) => p !== 'mercury' && signOf(longitudes[p]) === mercurySign);
  if (row.mercury === 'withMalefics') out.mercury = withMercury.some((p) => row[p] === 'malefic') ? 'malefic' : 'benefic';
  if (row.mercury === 'withNaturalMalefics') {
    const natural = naturalNatures(longitudes, table);
    out.mercury = withMercury.some((p) => natural[p] === 'malefic') ? 'malefic' : 'benefic';
  }
  for (const node of ['rahu', 'ketu'] as const) {
    const sign = signOf(longitudes[node]);
    const mates = NINE.filter((p) => p !== node && signOf(longitudes[p]) === sign);
    if (mates.length === 0) {
      const house = ((sign - lagna + 12) % 12) + 1;
      out[node] = [1, 5, 9].includes(house) ? 'benefic' : [6, 8, 12].includes(house) ? 'malefic' : 'neutral';
      continue;
    }
    let nearest = mates[0]!;
    for (const p of mates) if (arc(longitudes[p], longitudes[node]) < arc(longitudes[nearest], longitudes[node])) nearest = p;
    out[node] = out[nearest];
  }
  return out;
}

/** The natures the yogas use: the natural ones, or the functional ones with the option (null without a Lagna). */
export function yogaNatures(longitudes: Partial<Record<'lagna' | Planet9, number>> & Record<Planet9, number>, options: YogaNatureOptions = {}, table: NatureTable = DEFAULT_NATURES): Record<Planet9, Nature> | null {
  return options.functionalNature ? functionalNatures(longitudes, table) : naturalNatures(longitudes, table);
}
