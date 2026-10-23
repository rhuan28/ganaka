import type { Planet9 } from '../../jaimini';
import type { Planet7 } from '../../strengths/dignity';
import { aspectedBy, dayBirth, ofNature, type MissingYoga, type Yoga, type YogaChart, type YogaResult } from '../chart';
import { aspectsFully, houseFrom, houseLord, inGroup, lordOf, type HouseGroup } from '../primitives';

/**
 * The other named yogas of PL9's classical list (docs/spec/yogas.md, family 10), each a yoga of its own. Those whose
 * definition PL9's evaluator cannot read never form, as in PL9.
 */

const NINE: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
const SEVEN: Planet9[] = NINE.slice(0, 7);
/** PL9's definitions that its own evaluator cannot read: these never form. */
const NEVER = ['chamaraBenefics', 'chamaraHouse1', 'dhenu', 'shaurya', 'jaladhi', 'chhattra', 'astra', 'kama', 'kukarmakuccasura', 'bhagya',
  'khyati', 'parijata', 'musalaHouse', 'saraswati', 'vanchanaChoraGulikaLords', 'amshavatara'];
const NEEDS_LAGNA = ['parvata', 'parvataLords', 'kahala', 'kahalaFourthLord', 'chamaraLagnaLord', 'ava', 'nissva', 'mriti', 'kuhu', 'pamara',
  'dushkriti', 'nirbhagya', 'duryoga', 'daridraEleventhLord', 'shankha', 'shankhaMovable', 'bheriEmpty', 'bheri', 'bheriKendras', 'khadga',
  'lakshmi', 'mahaBhagyaMale', 'mahaBhagyaFemale', 'daridriLagnaLord', 'daridriTenthLord', 'karmasiddhi', 'hathaHanta', 'mridanga', 'shrinatha',
  'sharada', 'sharadaMoon', 'matsya', 'matsyaMalefics', 'kurma', 'kurmaBenefics', 'kusuma', 'kusumaPlacements', 'kalanidhi', 'kalanidhiSigns',
  'hariHaraBrahma2', 'hariHaraBrahma7', 'hariHaraBrahmaPlanets', 'hariHaraBrahma1', 'hariHaraBrahmaPlanets1', 'pushkala', 'pushkalaStrong',
  'bhaskara', 'indra', 'indu', 'indraExchange', 'akhandaSamrajya', 'marud', 'buddha', 'simhasana', 'dhvaja', 'hamsaHouses', 'karika',
  'amaraMalefics', 'amaraBenefics', 'mahapataka', 'rajaLakshana', 'vanchanaChoraGulika', 'vanchanaChoraLagnaLord', 'gauri', 'madanaGopala',
  'madanaGopalaVenus', 'bharathi2', 'bharathi5', 'bharathi11', 'chapa', 'brihatjataka', 'mahaRaja', 'chandraMangala'];

export function named(ch: YogaChart): YogaResult {
  const yogas: Yoga[] = [];
  const add = (id: string, present: boolean, planets: Planet9[] = []) => {
    const uniq = [...new Set(present ? planets : [])];
    yogas.push({ id, family: 'named', present, planets: uniq, houses: ch.lagnaSign === null ? [] : uniq.map((p) => houseFrom(ch.lagnaSign!, ch.signs[p])) });
  };
  for (const id of NEVER) add(id, false);
  if (ch.lagnaSign === null) return { yogas, missing: NEEDS_LAGNA.map((id): MissingYoga => ({ id, reason: 'needs the Lagna' })) };
  const lagna = ch.lagnaSign;
  const benefics = ofNature(ch, 'benefic'), malefics = ofNature(ch, 'malefic');
  const L = (n: number, from = lagna): Planet9 => houseLord(from, n);
  /** The house of a planet from the Lagna, or from another planet's sign. */
  const H = (p: Planet9, from?: Planet9) => houseFrom(from === undefined ? lagna : ch.signs[from], ch.signs[p]);
  const In = (p: Planet9, houses: HouseGroup | number[], from?: Planet9) =>
    (Array.isArray(houses) ? houses.includes(H(p, from)) : inGroup(H(p, from), houses));
  const any = (set: Planet9[], houses: HouseGroup | number[], from?: Planet9) => set.some((p) => In(p, houses, from));
  const Y = (a: Planet9, b: Planet9) => a !== b && ch.signs[a] === ch.signs[b];
  const D = (a: Planet9, b: Planet9) => aspectedBy(ch, a, b);
  const R = (a: Planet9, b: Planet9) => Y(a, b) || D(a, b);
  const dig = (p: Planet9) => ch.dignity[p];
  const own = (p: Planet9) => dig(p) === 2 || dig(p) === 3;
  const strong = (p: Planet9) => !!ch.shadbalaRatio && SEVEN.includes(p) && ch.shadbalaRatio[p as Planet7] >= 1;
  const weak = (p: Planet9) => !!ch.shadbalaRatio && SEVEN.includes(p) && ch.shadbalaRatio[p as Planet7] < 1;
  const sign1 = (p: Planet9) => ch.signs[p] + 1;
  const MOVABLE = [1, 4, 7, 10], FIXED = [2, 5, 8, 11];
  const disp = (p: Planet9) => lordOf(ch.signs[p]) as Planet9;
  const navDisp = (p: Planet9) => lordOf(ch.navamsa.signs[p]) as Planet9;
  const only = (set: Planet9[], houses: number[]) => set.every((p) => houses.includes(H(p)));
  const none = (set: Planet9[], houses: number[]) => !set.some((p) => houses.includes(H(p)));
  const lagnaAspectedBy = (p: Planet9) => aspectsFully(p, ch.signs[p], lagna);
  const deepExaltation: Partial<Record<Planet9, number>> = { venus: 357 };
  const deep = (p: Planet9) => { const d = Math.abs(((ch.longitudes[p] - deepExaltation[p]! + 540) % 360) - 180); return d < 1; };

  add('parvata', any(benefics, 'kendra') && none(malefics, [6, 8]), benefics);
  add('parvataLords', In(L(1), 'kendra', L(12)) && benefics.some((b) => D(L(1), b)) && benefics.some((b) => D(L(12), b)), [L(1), L(12)]);
  add('kahala', In(L(4), 'kendra', L(9)) && strong(L(1)), [L(4), L(9), L(1)]);
  add('kahalaFourthLord', (dig(L(4)) === 1 || own(L(4))) && (Y(L(4), L(10)) || D(L(4), L(10))), [L(4), L(10)]);
  add('chamaraLagnaLord', dig(L(1)) === 1 && In(L(1), 'kendra') && D(L(1), 'jupiter'), [L(1)]);
  for (const [id, n] of [['ava', 1], ['nissva', 2], ['mriti', 3], ['kuhu', 4], ['pamara', 5], ['dushkriti', 7], ['nirbhagya', 9], ['duryoga', 10],
    ['daridraEleventhLord', 11]] as const) add(id, In(L(n), 'dusthana'), [L(n)]);
  add('shankha', In(L(5), 'kendra', L(6)) && strong(L(1)), [L(5), L(6), L(1)]);
  add('shankhaMovable', MOVABLE.includes(sign1(L(1))) && MOVABLE.includes(sign1(L(10))) && strong(L(9)), [L(1), L(10), L(9)]);
  add('bheriEmpty', strong(L(9)) && none(SEVEN, [3, 4, 5, 6, 8, 9, 10, 11]), [L(9)]);
  add('bheri', In('venus', 'kendra') && In(L(1), 'kendra') && In('jupiter', 'kendra') && strong(L(9)), ['venus', L(1), 'jupiter', L(9)]);
  // The lord of the 1st counted from Jupiter is Jupiter's dispositor.
  add('bheriKendras', In('venus', 'kendra', L(1)) && In(disp('jupiter'), 'kendra', 'jupiter') && In('jupiter', 'kendra', 'venus') && strong(L(9))
    && !In(L(9), 'dusthana'), ['venus', 'jupiter', L(1), L(9)]);
  add('khadga', H(L(2)) === 9 && H(L(9)) === 2 && (In(L(1), 'kendra') || In(L(1), 'trikona')), [L(2), L(9), L(1)]);
  add('lakshmi', strong(L(1)) && dig(L(9)) <= 3 && (In(L(9), 'kendra') || In(L(9), 'trikona')), [L(1), L(9)]);
  {
    const day = dayBirth(ch)!;
    const odd = (s: number) => s % 2 === 0;
    const allOdd = odd(ch.signs.sun) && odd(ch.signs.moon) && odd(lagna);
    const allEven = !odd(ch.signs.sun) && !odd(ch.signs.moon) && !odd(lagna);
    add('mahaBhagyaMale', ch.sex === 'male' && day && allOdd, ['sun', 'moon']);
    add('mahaBhagyaFemale', ch.sex === 'female' && !day && allEven, ['sun', 'moon']);
  }
  add('daridriLagnaLord', dig(L(1)) === 9 && Y('moon', 'saturn') && H('moon') === 9, [L(1), 'moon', 'saturn']);
  add('daridriTenthLord', (weak(L(10)) || dig(L(10)) === 9 || ch.combust[L(10)]) && Y(L(10), L(3)), [L(10), L(3)]);
  add('karmasiddhi', benefics.some((b) => Y(L(10), b)) && In(L(10), 'kendra'), [L(10)]);
  add('chandraMangala', Y('moon', 'mars') || (D('moon', 'mars') && D('mars', 'moon')), ['moon', 'mars']);
  add('hathaHanta', H('moon') === 11 && sign1('sun') === 4, ['moon', 'sun']);
  {
    const good = NINE.filter((p) => dig(p) <= 3).length;
    add('mridanga', strong(L(1)) && good >= 5 && none(SEVEN, [2, 3, 6, 8, 11, 12]), [L(1)]);
  }
  add('shrinatha', H(L(7)) === 10 && dig(L(7)) === 1 && Y(L(10), L(9)), [L(7), L(10), L(9)]);
  add('sharada', H(L(10)) === 5 && ((strong('mercury') && own('mercury') && In('mercury', 'kendra')) || (strong('sun') && own('sun') && In('sun', 'kendra'))),
    [L(10)]);
  add('sharadaMoon', In('jupiter', 'trikona', 'moon') && In('mercury', 'trikona', 'moon') && H('mars') === 11, ['jupiter', 'mercury', 'mars']);
  const inB = (h: number) => any(benefics, [h]), inM = (h: number) => any(malefics, [h]);
  add('matsya', inB(1) && inB(9) && !inM(1) && !inM(9) && inM(5) && inB(5) && inM(4) && inM(8) && !inB(4) && !inB(8));
  add('matsyaMalefics', inM(1) && inM(9) && inM(5) && inB(5) && inM(4) && inM(8) && !inB(4) && !inB(8));
  {
    // Benefics in a dignity from exaltation to friend in the given houses; PL9's malefic conditions reduce to one
    // malefic with such a dignity.
    const bu = (h: number) => benefics.some((b) => dig(b) <= 5 && H(b) === h);
    const mu = malefics.some((m) => dig(m) <= 5);
    add('kurma', bu(5) && bu(6) && bu(7) && mu);
    add('kurmaBenefics', bu(1) && bu(3) && bu(11));
  }
  add('kusuma', In('venus', 'kendra') && FIXED.includes(sign1('venus')) && benefics.some((b) => D('moon', b)) && H('saturn') === 10
    && [5, 9].includes(H('moon')), ['venus', 'moon', 'saturn']);
  add('kusumaPlacements', H('jupiter') === 1 && H('moon') === 7 && H('sun', 'moon') === 8, ['jupiter', 'moon', 'sun']);
  add('kalanidhi', R('jupiter', 'mercury') && R('jupiter', 'venus') && [2, 5].includes(H('jupiter')), ['jupiter']);
  add('kalanidhiSigns', [2, 5].includes(H('jupiter')) && [2, 3, 6, 7].includes(sign1('jupiter')), ['jupiter']);
  const fromLord = (set: Planet9[], hs: number[], n: number) => hs.every((h) => set.some((p) => H(p, L(n)) === h));
  add('hariHaraBrahma2', fromLord(benefics, [2, 8, 12], 2), [L(2)]);
  add('hariHaraBrahma7', fromLord(benefics, [4, 9, 8], 7), [L(7)]);
  add('hariHaraBrahmaPlanets', H('jupiter', L(7)) === 4 && H('moon', L(7)) === 9 && H('mercury', L(7)) === 8, [L(7), 'jupiter', 'moon', 'mercury']);
  add('hariHaraBrahma1', fromLord(benefics, [2, 10, 11], 1), [L(1)]);
  add('hariHaraBrahmaPlanets1', H('sun', L(1)) === 2 && H('venus', L(1)) === 10 && H('mars', L(1)) === 11, [L(1), 'sun', 'venus', 'mars']);
  {
    const strongs = SEVEN.filter(strong);
    const dm = disp('moon');
    add('pushkala', strongs.some(lagnaAspectedBy) && Y(dm, L(1)) && In(L(1), 'kendra') && dig(L(1)) === 5 && FIXED.includes(sign1(dm)), [L(1), dm]);
    add('pushkalaStrong', strongs.some((p) => H(p) === 1) && Y(L(1), dm) && lagnaAspectedBy(dm) && (In(dm, 'kendra') || dig(dm) === 5 || dig(dm) === 4), [L(1), dm]);
  }
  add('bhaskara', H('mercury', 'sun') === 2 && H('moon', 'mercury') === 11 && In('jupiter', 'trikona', 'moon'), ['sun', 'mercury', 'moon', 'jupiter']);
  add('indra', H('mars', 'moon') === 3 && H('saturn', 'mars') === 7 && H('venus', 'saturn') === 7 && H('jupiter', 'venus') === 7, ['moon', 'mars', 'saturn', 'venus', 'jupiter']);
  add('indu', H('mars', 'moon') === 3 && H('saturn', 'mars') === 12 && H('venus', 'saturn') === 7 && H('jupiter', 'venus') === 7, ['moon', 'mars', 'saturn', 'venus', 'jupiter']);
  add('indraExchange', H(L(5)) === 11 && H(L(11)) === 5 && H('moon') === 5, [L(5), L(11), 'moon']);
  {
    // The lords of the 11th and the 9th from the Moon in an angle from it; PL9's third alternative, written without
    // its opening parenthesis, counts the lord of the 2nd and the angle from the Lagna.
    const moon = ch.signs.moon;
    const placed = [11, 9].some((n) => In(houseLord(moon, n), 'kendra', 'moon')) || In(L(2), 'kendra');
    add('akhandaSamrajya', placed && [2, 5, 11].some((n) => L(n) === 'jupiter'), ['jupiter']);
  }
  add('marud', In('jupiter', 'trikona', 'venus') && H('moon', 'jupiter') === 5 && In('sun', 'kendra', 'moon'), ['jupiter', 'venus', 'moon', 'sun']);
  add('buddha', H('jupiter') === 1 && In('moon', 'kendra') && H('rahu', 'moon') === 2 && H('sun') === 3 && H('mars') === 3, ['jupiter', 'moon', 'rahu', 'sun', 'mars']);
  add('simhasana', [2, 6, 8, 12].every((h) => any(SEVEN, [h])) && none(SEVEN, [1, 4, 7, 10, 3, 5, 9, 11]), SEVEN);
  add('dhvaja', none(malefics, [1, 4, 7, 10, 3, 6, 9, 12, 2, 5, 11]) && none(benefics, [3, 6, 9, 12, 2, 5, 8, 11, 10, 7, 4]));
  add('hamsaHouses', only(SEVEN, [1, 5, 7, 9]));
  add('karika', only(SEVEN, [7, 10, 11]));
  add('amaraMalefics', only(malefics, [1, 4, 7, 10]));
  add('amaraBenefics', only(benefics, [1, 4, 7, 10]));
  add('mahapataka', Y('moon', 'rahu') && D('moon', 'jupiter') && malefics.some((m) => Y('jupiter', m)), ['moon', 'rahu', 'jupiter']);
  add('rajaLakshana', (['jupiter', 'venus', 'mercury', 'moon'] as const).every((p) => In(p, 'kendra')), ['jupiter', 'venus', 'mercury', 'moon']);
  add('vanchanaChoraGulika', any(malefics, [1]) && ch.gulikaSign !== null && [5, 9].includes(houseFrom(lagna, ch.gulikaSign)), malefics.filter((m) => H(m) === 1));
  add('vanchanaChoraLagnaLord', Y(L(1), 'rahu') || Y(L(1), 'saturn') || Y(L(1), 'ketu'), [L(1)]);
  {
    const g = lordOf(ch.navamsa.signs[L(10)]) as Planet9;
    add('gauri', H(g) === 10 && dig(g) === 1 && Y(g, L(1)), [g, L(1)]);
  }
  {
    const swap = L(1) !== L(7) && disp(L(1)) === L(7) && disp(L(7)) === L(1);
    add('madanaGopala', swap && (Y(L(1), 'venus') || Y(L(7), 'venus')), [L(1), L(7)]);
  }
  add('madanaGopalaVenus', deep('venus') && H('venus') === 7 && (R('venus', L(7)) || R(L(7), 'venus')), ['venus']);
  for (const [id, n] of [['bharathi2', 2], ['bharathi5', 5], ['bharathi11', 11]] as const) {
    const d = navDisp(L(n));
    add(id, (dig(d) === 1 && Y(L(9), d)) || L(9) === d, [d, L(9)]);
  }
  add('chapa', dig(L(1)) === 1 && H(L(4)) === 10 && H(L(10)) === 4, [L(1), L(4), L(10)]);
  add('brihatjataka', lagna === 11 && H('saturn') === 3 && H('mars') === 11, ['saturn', 'mars']);
  {
    // The Atmakaraka and the karaka of rank six in the Karakamsha or the 5th from it, or in their dignity and aspected
    // by a benefic, with the lords of the 1st and the 5th exchanging signs.
    const swap = L(1) !== L(5) && disp(L(1)) === L(5) && disp(L(5)) === L(1);
    const k = (p: Planet9) => ch.signs[p] === ch.karakamsha || houseFrom(ch.karakamsha, ch.signs[p]) === 5
      || (dig(p) <= 3 && benefics.some((b) => D(p, b)));
    const ak = ch.atmakaraka, pk = ch.karakas[5]!;
    const navGood = (p: Planet9) => ch.navamsa.dignity[p] <= 3 && benefics.some((b) => aspectedBy(ch.navamsa, p, b));
    const pkAlone = houseFrom(ch.karakamsha, ch.signs[pk]) === 5 || (dig(pk) <= 3 && benefics.some((b) => D(pk, b))) || navGood(pk);
    add('mahaRaja', swap && (k(ak) || (navGood(ak) && ch.signs[pk] === ch.karakamsha) || pkAlone), [L(1), L(5), ak, pk]);
  }
  return { yogas, missing: [] };
}
