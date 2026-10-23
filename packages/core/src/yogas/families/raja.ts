import type { Planet9 } from '../../jaimini';
import { aspectValue } from '../../strengths/aspects';
import { NATURAL, SEVEN as SEVEN7, type Planet7 } from '../../strengths/dignity';
import { norm360 } from '../../zodiac';
import { aspectedBy, houseOf, ofNature, type MissingYoga, type Yoga, type YogaChart, type YogaResult, type YogaVarga } from '../chart';
import { aspectsFully, houseFrom, houseLord, inGroup, lordOf, signOfHouse, type HouseGroup } from '../primitives';

/**
 * The Raja yogas (docs/spec/yogas.md, family 5): the associations of the lords of angles and trines, and the other
 * Raja yogas PL9 lists, the Jaimini ones and the Raja-Bhanga, each a yoga of its own. Every one needs the Lagna.
 */

const NINE: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
const SEVEN: Planet9[] = NINE.slice(0, 7);
/** The planet exalted in each sign, where one is (Aries first). */
const EXALTED_IN: (Planet9 | null)[] = ['sun', 'moon', null, 'jupiter', null, 'mercury', 'saturn', null, null, 'mars', null, 'venus'];

export function raja(ch: YogaChart): YogaResult {
  const IDS = [
    'rajaLagnaLord', 'rajaFourthLord', 'rajaFifthLord', 'rajaSeventhNinthLords', 'rajaNinthTenthLords', 'rajaFifthNinthLords',
    'rajaFourthTenthExchange', 'rajaKendraTrikonaConjunct', 'rajaFifthLordRelation', 'rajaBeneficsInKendras', 'rajaDusthanaLordDebilitated',
    'rajaDebilitatedInUpachaya', 'rajaJupiterInNinth', 'rajaVenusInLagna', 'rajaVenusInKarakamsha', 'rajaTenthLordInLagna', 'rajaRahu',
    'rajaKetu', 'rajaMercuryExalted', 'rajaExaltedInKendra', 'rajaPiscesJupiter', 'rajaPiscesPlacements', 'rajaCapricorn', 'rajaLibraSunMoon',
    'rajaLibraConjunctions', 'mahaRajaCancer', 'rajaAries', 'rajaDebilitatedInChaturthamsha', 'rajaMoonFromSun', 'rajaPlacements',
    'rajaDebilitationDispositor', 'rajaMoonAspectedByJupiter', 'rajaExaltedInNavamsa', 'rajaJupiterMercuryNinthEleventh',
    'rajaJupiterMercuryFirstNinth', 'rajaSaturnExalted', 'rajaMoonMars', 'rajaTenthLordNavamsa', 'rajaJupiterFifth', 'rajaMoonNavamshaDispositor',
    'rajaNavamshaDispositorOfDebilitated', 'rajaLagnaLordDebilitated', 'rajaJupiterLordOfWealth', 'rajaFriendInNinth', 'rajaTaurus',
    'rajaDeepExaltation', 'jaiminiRajaNinthLord', 'jaiminiRajaHouses', 'jaiminiRajaMoonVenus', 'jaiminiRajaMoonAspected', 'rajaBhanga',
  ];
  if (ch.lagnaSign === null) return { yogas: [], missing: IDS.map((id): MissingYoga => ({ id, reason: 'needs the Lagna' })) };
  const lagna = ch.lagnaSign;
  const yogas: Yoga[] = [];
  const add = (id: string, present: boolean, planets: Planet9[] = []) => {
    const uniq = [...new Set(present ? planets : [])];
    yogas.push({ id, family: 'raja', present, planets: uniq, houses: uniq.map((p) => houseOf(ch, p)!) });
  };
  const benefics = ofNature(ch, 'benefic'), malefics = ofNature(ch, 'malefic');
  const L = (n: number, from = lagna): Planet9 => houseLord(from, n);
  const house = (p: Planet9, from: 'lagna' | Planet9 = 'lagna') => houseOf(ch, p, from)!;
  const inHouses = (p: Planet9, group: HouseGroup | number[], from: 'lagna' | Planet9 = 'lagna') =>
    (Array.isArray(group) ? group.includes(house(p, from)) : inGroup(house(p, from), group));
  // The connectors: R conjunction or a full aspect of the second on the first; A that, or the first in a sign of
  // the second; Y conjunction; D the first aspected by the second. Two names for one planet are never connected.
  const Y = (a: Planet9, b: Planet9, v: YogaVarga = ch) => a !== b && v.signs[a] === v.signs[b];
  const D = (a: Planet9, b: Planet9, v: YogaVarga = ch) => aspectedBy(v, a, b);
  const R = (a: Planet9, b: Planet9, v: YogaVarga = ch) => Y(a, b, v) || D(a, b, v);
  const A = (a: Planet9, b: Planet9) => R(a, b) || (a !== b && lordOf(ch.signs[a]) === b);
  const mutualR = (a: Planet9, b: Planet9) => R(a, b) && R(b, a);
  const dig = (p: Planet9, v: YogaVarga = ch) => v.dignity[p];
  const own = (p: Planet9, v: YogaVarga = ch) => dig(p, v) === 2 || dig(p, v) === 3;
  const debilitated = NINE.filter((p) => dig(p) === 9);
  const kendraLords = [...new Set([1, 4, 7, 10].map((n) => L(n)))];
  const trikonaLords = [...new Set([5, 9].map((n) => L(n)))];
  const strong = (p: Planet9) => !!ch.shadbalaRatio && (SEVEN7 as readonly string[]).includes(p) && ch.shadbalaRatio[p as Planet7] >= 1;
  const signIs = (p: Planet9, sign1: number) => ch.signs[p] === sign1 - 1;
  const lagnaIs = (sign1: number) => lagna === sign1 - 1;
  const MOVABLE = [0, 3, 6, 9], FIXED = [1, 4, 7, 10];

  // The pairs of lords of angles and trines, each in conjunction or mutual full aspect.
  const pairs = (pp: [number, number][]) => pp.filter(([a, b]) => mutualR(L(a), L(b)));
  const pairYoga = (id: string, pp: [number, number][]) => { const ok = pairs(pp); add(id, ok.length > 0, ok.flatMap(([a, b]) => [L(a), L(b)])); };
  pairYoga('rajaLagnaLord', [[1, 4], [1, 5], [1, 7], [1, 9], [1, 10]]);
  pairYoga('rajaFourthLord', [[4, 5], [4, 9]]);
  pairYoga('rajaFifthLord', [[5, 7], [5, 10]]);
  pairYoga('rajaSeventhNinthLords', [[7, 9]]);
  pairYoga('rajaNinthTenthLords', [[9, 10]]);
  add('rajaFifthNinthLords', Y(L(5), L(9)) || (D(L(5), L(9)) && D(L(9), L(5))), [L(5), L(9)]);
  {
    const swap = house(L(4)) === 10 && house(L(10)) === 4;
    const tie = [[5, 5], [9, 9], [5, 9], [9, 5]].some(([a, b]) => R(L(4), L(a!)) && R(L(10), L(b!)));
    add('rajaFourthTenthExchange', swap && tie, [L(4), L(10)]);
  }
  {
    const c = [[4, 5], [4, 9], [10, 5], [10, 9]].filter(([a, b]) => Y(L(a!), L(b!)));
    add('rajaKendraTrikonaConjunct', c.length > 0, c.flatMap(([a, b]) => [L(a!), L(b!)]));
  }
  add('rajaFifthLordRelation', (A(L(5), L(1)) || A(L(5), L(9))) && [1, 4, 10].includes(house(L(5))), [L(5)]);
  add('rajaBeneficsInKendras', benefics.some((b) => inHouses(b, 'kendra')) && !benefics.some((b) => inHouses(b, 'panaphara') || inHouses(b, 'apoklima'))
    && !malefics.some((m) => inHouses(m, [1, 4, 7, 10, 2, 5, 8, 9, 12])), benefics);
  const lagnaLordGood = (dig(L(1)) === 1 && ch.signs[L(1)] === lagna) || own(L(1));
  {
    const d = [6, 8, 12].map((n) => L(n)).filter((p) => dig(p) === 9);
    add('rajaDusthanaLordDebilitated', d.length > 0 && lagnaLordGood, [...d, L(1)]);
  }
  {
    const d = debilitated.filter((p) => [3, 6, 8, 11].includes(house(p)));
    add('rajaDebilitatedInUpachaya', d.length > 0 && lagnaLordGood, [...d, L(1)]);
  }
  add('rajaJupiterInNinth', own('jupiter') && house('jupiter') === 9 && (Y('jupiter', 'venus') || Y('jupiter', L(5))), ['jupiter']);
  add('rajaVenusInLagna', (house('venus') === 1 && R('venus', 'moon')) || R('venus', 'jupiter'), ['venus']);
  add('rajaVenusInKarakamsha', ch.signs.venus === ch.karakamsha
    && (R('venus', 'moon') || R('venus', 'jupiter') || R('venus', 'moon', ch.navamsa) || R('venus', 'jupiter', ch.navamsa)), ['venus']);
  add('rajaTenthLordInLagna', ch.signs[L(10)] === lagna && benefics.some((b) => inHouses(b, 'kendra')) && (own(L(10)) || dig(L(10)) === 1), [L(10)]);
  for (const [id, node] of [['rajaRahu', 'rahu'], ['rajaKetu', 'ketu']] as const) {
    const mates = [...kendraLords, ...trikonaLords].filter((l) => Y(node, l));
    add(id, (inHouses(node, 'kendra') || inHouses(node, 'trikona')) && mates.length > 0, [node, ...mates]);
  }
  add('rajaMercuryExalted', dig('mercury') === 1 && inHouses('mercury', 'kendra'), ['mercury']);
  {
    const waxing = norm360(ch.longitudes.moon - ch.longitudes.sun) <= 180;
    const e = (['jupiter', 'venus'] as const).filter((p) => dig(p) === 1 && inHouses(p, 'kendra'));
    const moon = waxing && dig('moon') === 1 && inHouses('moon', 'kendra');
    add('rajaExaltedInKendra', e.length > 0 || moon, [...e, ...(moon ? ['moon' as Planet9] : [])]);
  }
  add('rajaPiscesJupiter', lagnaIs(12) && house('jupiter') === 10 && !signIs('moon', 2), ['jupiter']);
  add('rajaPiscesPlacements', lagnaIs(12) && signIs('moon', 2) && signIs('sun', 5) && signIs('mercury', 6) && signIs('saturn', 7) && signIs('jupiter', 9),
    ['moon', 'sun', 'mercury', 'saturn', 'jupiter']);
  add('rajaCapricorn', lagnaIs(10) && house('mars') === 1 && signIs('moon', 4), ['mars', 'moon']);
  add('rajaLibraSunMoon', lagnaIs(7) && Y('sun', 'moon'), ['sun', 'moon']);
  add('rajaLibraConjunctions', lagnaIs(7) && (['sun', 'mercury', 'saturn'] as const).every((p) => Y(p, 'moon') || Y(p, 'mars')), ['sun', 'mercury', 'saturn']);
  add('mahaRajaCancer', lagnaIs(4) && house('mercury') === 11 && house('venus') === 11 && house('moon') === 11 && house('jupiter') === 1 && house('sun') === 10,
    ['mercury', 'venus', 'moon', 'jupiter', 'sun']);
  add('rajaAries', lagnaIs(1) && house('sun') === 1 && signIs('moon', 4), ['sun', 'moon']);
  {
    // A debilitated planet related in the Chaturthamsha to a benefic: a strong aspect (over 50 virupas), a
    // conjunction or an exchange of signs there; and no debilitated planet in a dusthana.
    const d4 = ch.d4;
    const related = (a: Planet9, b: Planet9) => {
      if (a === b) return false;
      const strongAspect = Math.round(aspectValue(b, norm360(d4.longitudes[a] - d4.longitudes[b]))) > 50;
      return strongAspect || d4.signs[a] === d4.signs[b] || (lordOf(d4.signs[a]) === b && lordOf(d4.signs[b]) === a);
    };
    const hit = debilitated.filter((p) => benefics.some((b) => related(p, b)));
    add('rajaDebilitatedInChaturthamsha', hit.length > 0 && !debilitated.some((p) => inHouses(p, 'dusthana')), hit);
  }
  {
    const from = [6, 7, 8].includes(house('moon', 'sun'));
    const good = SEVEN.filter((p) => p !== 'moon' && dig(p) <= 3 && D('moon', p));
    add('rajaMoonFromSun', from && good.length > 0, ['moon', ...good]);
  }
  add('rajaPlacements', house('moon') === 1 && house('jupiter') === 4 && house('venus') === 10 && dig('saturn') <= 3, ['moon', 'jupiter', 'venus', 'saturn']);
  {
    // The dispositor of a debilitated planet, or the planet exalted in its sign, in an angle from the Lagna or the Moon.
    const helpers = debilitated.flatMap((p) => [lordOf(ch.signs[p]) as Planet9, EXALTED_IN[ch.signs[p]]].filter((x): x is Planet9 => x !== null));
    const hit = helpers.filter((h) => inHouses(h, 'kendra') || inHouses(h, 'kendra', 'moon'));
    add('rajaDebilitationDispositor', hit.length > 0, hit);
  }
  add('rajaMoonAspectedByJupiter', inHouses('moon', [4, 7, 10]) && D('moon', 'jupiter') && strong('moon'), ['moon', 'jupiter']);
  {
    const hit = SEVEN.filter((p) => dig(p) === 9 && dig(p === 'mars' ? 'moon' : p, ch.navamsa) === 1);
    add('rajaExaltedInNavamsa', hit.length > 0, hit);
  }
  add('rajaJupiterMercuryNinthEleventh', house('jupiter') === 1 && inHouses('mercury', 'kendra') && D('jupiter', L(9)) && D('mercury', L(11)), ['jupiter', 'mercury']);
  add('rajaJupiterMercuryFirstNinth', house('jupiter') === 1 && inHouses('mercury', 'kendra') && D('jupiter', L(1)) && D('mercury', L(9)), ['jupiter', 'mercury']);
  add('rajaSaturnExalted', (dig('saturn') === 1 || dig('saturn') === 2) && (inHouses('saturn', 'kendra') || inHouses('saturn', 'trikona')) && D('saturn', L(10)), ['saturn']);
  add('rajaMoonMars', Y('moon', 'mars') && house('rahu') === 5 && inHouses('moon', [2, 3]), ['moon', 'mars', 'rahu']);
  // PL9's definition of this one cannot be read by its own evaluator: it never forms.
  add('rajaTenthLordNavamsa', false);
  add('rajaJupiterFifth', house('jupiter') === 5 && inHouses('jupiter', 'kendra', 'moon') && house(L(1)) === 10 && FIXED.includes(lagna), ['jupiter', L(1)]);
  {
    const disp = lordOf(ch.navamsa.signs.moon) as Planet9;
    const ok = inHouses(disp, 'kendra') || inHouses(disp, 'trikona') || inHouses(disp, 'kendra', 'mercury') || inHouses(disp, 'trikona', 'mercury');
    add('rajaMoonNavamshaDispositor', ok, [disp]);
  }
  {
    const disp = debilitated.map((p) => lordOf(ch.navamsa.signs[p]) as Planet9).filter((h) => inHouses(h, 'kendra'));
    add('rajaNavamshaDispositorOfDebilitated', disp.length > 0 && MOVABLE.includes(lagna) && MOVABLE.includes(ch.signs[L(1)]), disp);
  }
  add('rajaLagnaLordDebilitated', debilitated.some((p) => Y(L(1), p)) && house('rahu') === 10 && house('saturn') === 10
    && aspectsFully(L(9), ch.signs[L(9)], signOfHouse(lagna, 10)), [L(1), 'rahu', 'saturn']);
  {
    // The lord of the 11th, the 9th or the 2nd from the Moon in an angle from it (the lords inside a count from the
    // Moon are counted from the Moon too); and Jupiter the lord of the 2nd, the 5th or the 11th from the Lagna.
    const moon = ch.signs.moon;
    const placed = [11, 9, 2].some((n) => inHouses(houseLord(moon, n), 'kendra', 'moon'));
    add('rajaJupiterLordOfWealth', placed && [2, 5, 11].some((n) => L(n) === 'jupiter'), ['jupiter']);
  }
  {
    const friendsOf = (p: Planet9) => SEVEN.filter((q) => q !== p && NATURAL[p as Planet7]?.[SEVEN7.indexOf(q as Planet7)] === 2);
    const hit = (['jupiter', 'mercury', 'venus', 'moon'] as const).filter((p) => !ch.combust[p] && house(p) === 9 && friendsOf(p).some((f) => A(p, f)));
    add('rajaFriendInNinth', hit.length > 0, hit);
  }
  add('rajaTaurus', lagnaIs(2) && house('moon') === 1 && house('saturn') === 10 && house('sun') === 4 && house('jupiter') === 7,
    ['moon', 'saturn', 'sun', 'jupiter']);
  add('rajaDeepExaltation', deepExalted(ch, 'sun') && deepExalted(ch, 'moon'), ['sun', 'moon']);
  {
    const ak = ch.atmakaraka;
    add('jaiminiRajaNinthLord', Y(L(9), ak) && benefics.some((b) => D(L(9), b)) && [1, 5, 7].includes(house(L(9))), [L(9), ak]);
    const houses = (from: number) => [2, 4, 5].every((h) => benefics.some((b) => houseFrom(from, ch.signs[b]) === h))
      && [3, 6].every((h) => malefics.some((m) => houseFrom(from, ch.signs[m]) === h));
    add('jaiminiRajaHouses', houses(lagna) || houses(ch.signs[ak]), [ak]);
  }
  add('jaiminiRajaMoonVenus', Y('moon', 'venus') || D('moon', 'venus'), ['moon', 'venus']);
  add('jaiminiRajaMoonAspected', NINE.filter((p) => D('moon', p)).length > 3, ['moon']);
  add('rajaBhanga', signIs('moon', 8) && ch.navamsa.signs.moon === 3, ['moon']);
  return { yogas, missing: [] };
}

/** Within 1° of the planet's point of exaltation. */
const EXALTATION_POINT: Partial<Record<Planet9, number>> = { sun: 10, moon: 33, mars: 298, mercury: 165, jupiter: 95, venus: 357, saturn: 200 };
function deepExalted(ch: YogaChart, p: Planet9): boolean {
  const point = EXALTATION_POINT[p];
  if (point === undefined) return false;
  const d = Math.abs(norm360(ch.longitudes[p] - point));
  return Math.min(d, 360 - d) < 1;
}
