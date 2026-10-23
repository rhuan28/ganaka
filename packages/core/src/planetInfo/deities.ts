import type { ClassicalVargaName } from '../vargas';
import { norm360 } from '../zodiac';

/**
 * The deities of the sixteen classical vargas, as PL9's "Planetary deities" page gives them (docs/spec/natal-tables.md),
 * and the Shashtiamsha's number and nature. The names are the classical ones (BPHS), as ids.
 */

const NAKSHATRA_DEITIES = [
  'ashwiniKumara', 'yama', 'vahni', 'brahma', 'chandra', 'isa', 'aditi', 'jiva', 'ahi', 'pitar', 'bhaga', 'aryamana', 'surya',
  'tvashta', 'marut', 'shakragni', 'mitra', 'vasava', 'rakshasa', 'varuna', 'vishwadeva', 'govinda', 'vasu', 'varuna',
  'ajaikapada', 'ahirbudhanya', 'pusha',
];
const D20_ODD = ['kali', 'gauri', 'jaya', 'lakshmi', 'vijaya', 'vimala', 'sati', 'tara', 'jvalamukhi', 'sveta', 'lalita', 'bagalamukhi',
  'pratyangira', 'shachi', 'raudri', 'bhavani', 'varada', 'jaya', 'tripura', 'sumukhi'];
const D20_EVEN = ['daya', 'medha', 'chinnasi', 'pisachini', 'dhumavati', 'matangi', 'bala', 'bhadra', 'aruna', 'anala', 'pingala',
  'chuchchuka', 'ghora', 'varahi', 'vaishnavi', 'sita', 'bhuvaneshwari', 'bhairavi', 'mangala', 'aparajita'];
export const SHASHTIAMSHA_DEITIES = [
  'ghora', 'rakshasa', 'deva', 'kubera', 'yaksha', 'kinnara', 'bhrashta', 'kulaghna', 'garala', 'agni', 'maya', 'purishaka',
  'apampati', 'marutwan', 'kaala', 'ahi', 'amrita', 'chandra', 'mridu', 'komala', 'heramba', 'brahma', 'vishnu', 'maheshwara',
  'deva', 'ardra', 'kalinasha', 'kshiteesha', 'kamalakar', 'gulik', 'mrityu', 'kaala', 'davagni', 'ghora', 'yama', 'kantaka',
  'sudha', 'amrita', 'purnachandra', 'vishadagdha', 'kulaghna', 'vanshakshaya', 'utpaata', 'kaala', 'saumya', 'komala', 'sheetala',
  'dranshtakarala', 'chandramukhi', 'praveena', 'kaalapavak', 'dandaYudha', 'nirmala', 'saumya', 'krura', 'atisheetala', 'sudha',
  'payodhi', 'bhraman', 'chandrarekha',
];
/** The benefic Shashtiamshas by number, 1 to 60; the others are malefic. */
const BENEFIC_SHASHTIAMSHA = new Set([3, 4, 5, 6, 13, 14, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 37, 38, 39, 45, 46, 47, 49, 50, 53, 54, 56, 57, 58, 60]);

type Rule = { list: string[]; even?: string[] | 'reversed'; cycle?: boolean; bySignType?: boolean };
/** The parts of each varga within a sign and the list each takes; the D1 and the D30 are apart. */
const RULES: Partial<Record<ClassicalVargaName, Rule & { parts: number }>> = {
  D2: { parts: 2, list: ['deva', 'pitar'], even: 'reversed' },
  D3: { parts: 3, list: ['narada', 'agastya', 'durvasa'] },
  D4: { parts: 4, list: ['sanaka', 'sananda', 'sanatKumara', 'sanatana'] },
  D7: { parts: 7, list: ['kshaara', 'ksheera', 'dadhi', 'ghritha', 'ikshuRasa', 'madhu', 'shuddhaJala'], even: 'reversed' },
  D9: { parts: 9, list: ['deva', 'manushya', 'rakshasa'], cycle: true, bySignType: true },
  D10: { parts: 10, list: ['indra', 'agni', 'yama', 'rakshasa', 'varuna', 'vayu', 'kubera', 'ishan', 'brahma', 'ananta'], even: 'reversed' },
  D12: { parts: 12, list: ['ganesha', 'ashwiniKumara', 'yama', 'ahi'], cycle: true },
  D16: { parts: 16, list: ['brahma', 'vishnu', 'shiva', 'surya'], even: 'reversed', cycle: true },
  D20: { parts: 20, list: D20_ODD, even: D20_EVEN },
  D24: { parts: 24, list: ['skanda', 'parshudhara', 'anala', 'vishwakarma', 'bhaga', 'mitra', 'maya', 'antaka', 'vrishadhwaja', 'govinda', 'madan', 'bhima'], even: 'reversed', cycle: true },
  D27: { parts: 27, list: NAKSHATRA_DEITIES },
  D40: { parts: 40, list: ['vishnu', 'chandra', 'marichi', 'tvashta', 'dhata', 'shiva', 'ravi', 'yama', 'yaksha', 'gandharva', 'kaala', 'varuna'], cycle: true },
  D45: { parts: 45, list: ['brahma', 'shiva', 'vishnu'], cycle: true, bySignType: true },
};
const D30 = ['agni', 'vayu', 'indra', 'kubera', 'varuna'];
/** PL9 cuts the Trimshamsha's deities at the odd signs' limits in every sign (its D30 sign itself uses each side's). */
const D30_ENDS = [5, 10, 18, 25];

/** The deity of a point in a varga. */
export function vargaDeity(longitude: number, varga: ClassicalVargaName): string {
  const lon = norm360(longitude);
  const sign = Math.floor(lon / 30); // 0 Aries
  const d = lon % 30;
  const odd = sign % 2 === 0;
  if (varga === 'D1') return NAKSHATRA_DEITIES[Math.trunc(lon / (360 / 27))]!;
  if (varga === 'D30') {
    const i = D30_ENDS.findIndex((e) => d <= e);
    const part = i < 0 ? 4 : i;
    return (odd ? D30 : [...D30].reverse())[part]!;
  }
  if (varga === 'D60') return SHASHTIAMSHA_DEITIES[shashtiamsha(lon).number - 1]!;
  const rule = RULES[varga]!;
  const i = Math.trunc((rule.parts * d) / 30);
  let list = rule.list;
  if (!odd && rule.even) list = rule.even === 'reversed' ? [...rule.list].reverse() : rule.even;
  // By sign type: movable signs start the cycle at the first, fixed at the second, dual at the third.
  const start = rule.bySignType ? sign % 3 : 0;
  const at = rule.cycle ? (i + start) % list.length : i;
  return list[at]!;
}

/**
 * The degree of a point within a varga of equal parts: the degree in the sign times the parts, less the whole signs (N × d
 * mod 30), as PL9's charts with degrees place it. The Trimshamsha, whose parts are unequal, has none here.
 */
export function vargaDegree(longitude: number, varga: ClassicalVargaName): number | null {
  if (varga === 'D30') return null;
  const parts = Number(varga.slice(1));
  return (((norm360(longitude) % 30) * parts) % 30 + 30) % 30;
}

/** The Shashtiamsha's number, 1 to 60 (counted backwards in even signs), and its nature. */
export function shashtiamsha(longitude: number): { number: number; nature: 'benefic' | 'malefic' } {
  const lon = norm360(longitude);
  const d = lon % 30;
  const odd = Math.floor(lon / 30) % 2 === 0;
  const number = odd ? Math.trunc(2 * d) + 1 : 60 - Math.trunc(2 * d);
  return { number, nature: BENEFIC_SHASHTIAMSHA.has(number) ? 'benefic' : 'malefic' };
}
