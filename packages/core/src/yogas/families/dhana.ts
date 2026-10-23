import type { Planet9 } from '../../jaimini';
import type { Planet7 } from '../../strengths/dignity';
import { aspectedBy, houseOf, ofNature, type MissingYoga, type Yoga, type YogaChart, type YogaResult } from '../chart';
import { aspectsFully, houseLord, inGroup, lordOf, signOfHouse } from '../primitives';

/**
 * The Dhana yogas (docs/spec/yogas.md, family 6): the planets of the 5th and the 11th, the planet in its own sign in
 * the Lagna with its friends, the associations of the lords of wealth, and the named Dhana yogas PL9 lists. Every one
 * needs the Lagna. The ones that test a planet's Shayanadi-like state are reported missing until that state is read.
 */

const SEVEN: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const NAME: Record<string, string> = { sun: 'Sun', moon: 'Moon', mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn' };
/** The planet in its own sign in the 5th, and the planets in the 11th with it. */
const FIFTH: [Planet9, Planet9[]][] = [
  ['venus', ['mars']], ['mercury', ['moon', 'mars', 'jupiter']], ['sun', ['moon', 'jupiter', 'saturn']], ['saturn', ['moon', 'sun']],
  ['jupiter', ['mercury']], ['mars', ['venus']], ['moon', ['saturn']],
];
/** The planet in its own sign in the Lagna, and the planets it must be joined with or aspected by. */
const FIRST: [Planet9, Planet9[]][] = [
  ['sun', ['mars', 'jupiter']], ['moon', ['mercury', 'jupiter']], ['mars', ['mercury', 'venus', 'saturn']], ['mercury', ['jupiter', 'saturn']],
  ['jupiter', ['mercury', 'mars']], ['venus', ['mercury', 'saturn']], ['saturn', ['mars', 'jupiter']],
];
const BY_STATE = ['danNinthLordState', 'danNinthLordTenthLordState', 'svaveeryaddhanaStrongLagnaLord', 'bhratrumulaladdhanaState',
  'matrumulaladdhana', 'putramulaladdhana', 'satrumuladdhana'];

export function dhana(ch: YogaChart): YogaResult {
  const ids = ['dhanaGemini', ...FIFTH.map(([p]) => `dhanaFifth${NAME[p]}`), ...FIRST.map(([p]) => `dhanaLagna${NAME[p]}`), 'dhanaFifthNinthLords',
    'dhanaLagnaLord', 'dhanaSecondLord', 'dhanaFifthLord', 'dhanaNinthEleventhLords', 'danExaltedNinthLord', 'danNinthLordInLagna', 'danPlacements',
    'danMercuryExalted', 'bahudravyarjanaDhana', 'svaveeryaddhana', 'anthyaVayasiDhana', 'balyaDhana', 'bhratrumulaladdhana', 'kalatramuladdhana',
    'ayatnadhanalabha'];
  if (ch.lagnaSign === null) return { yogas: [], missing: [...ids, ...BY_STATE].map((id): MissingYoga => ({ id, reason: 'needs the Lagna' })) };
  const lagna = ch.lagnaSign;
  const yogas: Yoga[] = [];
  const add = (id: string, present: boolean, planets: Planet9[] = []) => {
    const uniq = [...new Set(present ? planets : [])];
    yogas.push({ id, family: 'dhana', present, planets: uniq, houses: uniq.map((p) => houseOf(ch, p)!) });
  };
  const benefics = ofNature(ch, 'benefic');
  const L = (n: number): Planet9 => houseLord(lagna, n);
  const house = (p: Planet9, from: 'lagna' | Planet9 = 'lagna') => houseOf(ch, p, from)!;
  const Y = (a: Planet9, b: Planet9) => a !== b && ch.signs[a] === ch.signs[b];
  const D = (a: Planet9, b: Planet9) => aspectedBy(ch, a, b);
  const R = (a: Planet9, b: Planet9) => Y(a, b) || D(a, b);
  const own = (p: Planet9) => ch.dignity[p] === 2 || ch.dignity[p] === 3;
  const exalted = (p: Planet9) => ch.dignity[p] === 1;
  const strong = (p: Planet9) => !!ch.shadbalaRatio && SEVEN.includes(p) && ch.shadbalaRatio[p as Planet7] >= 1;
  /** A benefic in the house, or casting a full aspect on it. */
  const houseWithBenefic = (h: number) => benefics.some((b) => house(b) === h || aspectsFully(b, ch.signs[b], signOfHouse(lagna, h)));

  add('dhanaGemini', lagna === 2 && house('mars') === 11 && house('moon') === 11 && house('saturn') === 9, ['mars', 'moon', 'saturn']);
  for (const [p, eleventh] of FIFTH) add(`dhanaFifth${NAME[p]}`, own(p) && house(p) === 5 && eleventh.every((q) => house(q) === 11), [p, ...eleventh]);
  for (const [p, friends] of FIRST) add(`dhanaLagna${NAME[p]}`, own(p) && house(p) === 1 && friends.every((q) => R(p, q)), [p, ...friends]);
  add('dhanaFifthNinthLords', Y(L(9), L(5)), [L(9), L(5)]);
  const pairs = (a: number, others: number[]) => others.filter((b) => R(L(a), L(b)));
  for (const [id, a, others] of [['dhanaLagnaLord', 1, [2, 5, 9, 11]], ['dhanaSecondLord', 2, [5, 9, 11]], ['dhanaFifthLord', 5, [9, 11]],
    ['dhanaNinthEleventhLords', 9, [11]]] as const) {
    const hit = pairs(a, [...others]);
    add(id, hit.length > 0, [L(a), ...hit.map((b) => L(b))]);
  }
  add('danExaltedNinthLord', exalted(L(9)) && benefics.some((b) => R(L(9), b)) && houseWithBenefic(9), [L(9)]);
  add('danNinthLordInLagna', (ch.signs[L(9)] === lagna || R(L(1), L(9))) && (inGroup(house(L(9)), 'kendra') || inGroup(house(L(9)), 'trikona')), [L(9)]);
  add('danPlacements', house(L(9)) === 4 && inGroup(house(L(10)), 'kendra') && R(L(12), 'jupiter'), [L(9), L(10), L(12)]);
  add('danMercuryExalted', exalted('mercury') && R('mercury', L(9)) && inGroup(house(L(11)), 'kendra'), ['mercury', L(9), L(11)]);
  add('bahudravyarjanaDhana', house(L(1)) === 2 && house(L(2)) === 11 && house(L(11)) === 1, [L(1), L(2), L(11)]);
  {
    // The lord of the 2nd in an angle or trine from the lord of the 1st; or the lord of the 2nd a benefic and
    // exalted; or the lord of the 2nd conjunct a planet.
    const fromL1 = house(L(2), L(1));
    const a = inGroup(fromL1, 'kendra') || inGroup(fromL1, 'trikona');
    const b = benefics.includes(L(2)) && exalted(L(2));
    const c = SEVEN.some((p) => Y(L(2), p));
    add('svaveeryaddhana', a || b || c, [L(2), L(1)]);
  }
  {
    const d1 = lordOf(ch.signs[L(1)]) as Planet9, d2 = lordOf(ch.signs[L(2)]) as Planet9;
    add('anthyaVayasiDhana', house(d1) === 1 && house(d2) === 1 && benefics.some((b) => Y(L(1), b)) && benefics.some((b) => Y(L(2), b)), [L(1), L(2), d1, d2]);
  }
  add('balyaDhana', Y(L(2), L(10)) && inGroup(house(L(2)), 'kendra') && D(L(2), lordOf(ch.navamsa.signs[L(1)]) as Planet9), [L(2), L(10)]);
  add('bhratrumulaladdhana', Y(L(1), L(2)) && house(L(1)) === 3 && benefics.some((b) => D(L(1), b)), [L(1), L(2)]);
  add('kalatramuladdhana', strong(L(1)) && strong(L(2)) && R(L(2), L(7)) && R(L(2), 'venus'), [L(1), L(2), L(7)]);
  add('ayatnadhanalabha', L(1) !== L(2) && lordOf(ch.signs[L(1)]) === L(2) && lordOf(ch.signs[L(2)]) === L(1), [L(1), L(2)]);
  const missing = BY_STATE.map((id): MissingYoga => ({ id, reason: 'needs a planetary state PL9 computes and the engine does not yet' }));
  return { yogas, missing };
}
