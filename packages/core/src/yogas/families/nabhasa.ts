import type { Planet9 } from '../../jaimini';
import { houseOf, ofNature, type MissingYoga, type Yoga, type YogaChart, type YogaResult } from '../chart';
import { inGroup, type HouseGroup } from '../primitives';

/**
 * Nabhasa yogas and the distributions of the seven (docs/spec/yogas.md, family 9): Ashraya, Dala, Akriti and
 * Sankhya by the signs and houses the Sun to Saturn occupy, the Malika chains and Chatussagara.
 */

const SEVEN: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const MOVABLE = [0, 3, 6, 9], FIXED = [1, 4, 7, 10], DUAL = [2, 5, 8, 11];
const range = (from: number, n: number) => Array.from({ length: n }, (_, i) => ((from - 1 + i) % 12) + 1);

export function nabhasa(ch: YogaChart): YogaResult {
  const yogas: Yoga[] = [];
  const missing: MissingYoga[] = [];
  const lagna = ch.lagnaSign !== null;
  const add = (id: string, present: boolean, planets: Planet9[] = SEVEN) => {
    const uniq = [...new Set(present ? planets : [])];
    yogas.push({ id, family: 'nabhasa', present, planets: uniq, houses: lagna ? uniq.map((p) => houseOf(ch, p)!) : [] });
  };
  const signs = SEVEN.map((p) => ch.signs[p]);
  const inSigns = (set: number[]) => signs.some((s) => set.includes(s));

  // Ashraya: all seven in movable, fixed or dual signs. These need no Lagna.
  add('ashrayaRajju', !inSigns(FIXED) && !inSigns(DUAL));
  add('ashrayaMusala', !inSigns(MOVABLE) && !inSigns(DUAL));
  add('ashrayaNala', !inSigns(MOVABLE) && !inSigns(FIXED));

  // Sankhya: the number of signs the seven occupy. PL9 forms only Gola, Yuga, Shula and Pasha.
  const occupied = new Set(signs).size;
  for (const [id, n] of [['sankhyaGola', 1], ['sankhyaYuga', 2], ['sankhyaShula', 3], ['sankhyaKedara', 4], ['sankhyaPasha', 5], ['sankhyaDama', 6], ['sankhyaVina', 7]] as const) {
    add(id, ['sankhyaKedara', 'sankhyaDama', 'sankhyaVina'].includes(id) ? false : occupied === n);
  }

  // Chatussagara: the four angles occupied and nothing elsewhere, or the four movable signs and nothing else.
  const bySign = MOVABLE.every((s) => signs.includes(s)) && !inSigns(FIXED) && !inSigns(DUAL);

  const ids = ['rajju', 'musala', 'nala', 'dalaMala', 'dalaSarpa', 'akritiGada', 'akritiShankha', 'akritiVibhuka', 'akritiDhvaja', 'akritiShakata',
    'akritiPakshi', 'akritiVajra', 'akritiYava', 'akritiKamala', 'akritiVapi', 'akritiVapiPanaphara', 'akritiVapiApoklima', 'akritiShringataka',
    'akritiHala2', 'akritiHala3', 'akritiHala4', 'akritiYupa', 'akritiShara', 'akritiShakti', 'akritiDanda', 'akritiNauka', 'akritiKuta', 'akritiChhatra',
    'akritiDhanush', ...[2, 5, 8, 11, 3, 6, 9, 12].map((h) => `akritiArdhaChandra${h}`), 'akritiChakra', 'akritiSamudra',
    ...range(1, 12).map((h) => `malika${h}`)];
  if (!lagna) {
    missing.push(...ids.map((id): MissingYoga => ({ id, reason: 'needs the Lagna' })));
    // The sign form decides it when it holds; otherwise the angle form, which needs houses, cannot be told.
    if (bySign) add('chatussagara', true);
    else missing.push({ id: 'chatussagara', reason: 'needs the Lagna' });
    return { yogas, missing };
  }
  const lagnaSign = ch.lagnaSign!;
  const house = (p: Planet9) => houseOf(ch, p)!;
  const houses = SEVEN.map(house);
  const occ = (h: number) => houses.includes(h);
  const only = (allowed: number[]) => houses.every((h) => allowed.includes(h));
  const inG = (set: Planet9[], g: HouseGroup) => set.some((p) => inGroup(house(p), g));
  const inH = (set: Planet9[], h: number) => set.some((p) => house(p) === h);
  const benefics = ofNature(ch, 'benefic'), malefics = ofNature(ch, 'malefic');

  // Ashraya's Lagna forms: the Lagna in a movable (fixed, dual) sign and one of the seven in such a sign.
  add('rajju', MOVABLE.includes(lagnaSign) && inSigns(MOVABLE));
  add('musala', FIXED.includes(lagnaSign) && inSigns(FIXED));
  add('nala', DUAL.includes(lagnaSign) && inSigns(DUAL));
  // Dala: the benefics only in angles and no malefic in one; the reverse.
  const notKendra = [2, 3, 5, 6, 8, 9, 11, 12];
  add('dalaMala', !notKendra.some((h) => inH(benefics, h)) && !inG(malefics, 'kendra'), benefics);
  add('dalaSarpa', !notKendra.some((h) => inH(malefics, h)) && !inG(benefics, 'kendra'), malefics);
  // Akriti: the seven in two angles, both occupied (Gada, Shankha, Vibhuka, Dhvaja), or only in two (Shakata, Pakshi).
  for (const [id, a, b] of [['akritiGada', 1, 4], ['akritiShankha', 4, 7], ['akritiVibhuka', 7, 10], ['akritiDhvaja', 10, 1]] as const) {
    add(id, only([a, b]) && occ(a) && occ(b));
  }
  add('akritiShakata', only([1, 7]));
  add('akritiPakshi', only([4, 10]));
  add('akritiVajra', inH(benefics, 1) && inH(benefics, 7) && inH(malefics, 4) && inH(malefics, 10) && only([1, 4, 7, 10]));
  add('akritiYava', inH(malefics, 1) && inH(malefics, 7) && inH(benefics, 4) && inH(benefics, 10) && only([1, 4, 7, 10]));
  add('akritiKamala', only([1, 4, 7, 10]));
  add('akritiVapi', !houses.some((h) => inGroup(h, 'kendra')));
  add('akritiVapiPanaphara', only([2, 5, 8, 11]));
  add('akritiVapiApoklima', only([3, 6, 9, 12]));
  add('akritiShringataka', only([1, 5, 9]));
  for (const [id, set] of [['akritiHala2', [2, 6, 10]], ['akritiHala3', [3, 7, 11]], ['akritiHala4', [4, 8, 12]]] as const) {
    add(id, only([...set]) && set.every(occ));
  }
  // Four consecutive houses, each occupied and nothing elsewhere.
  for (const [id, from] of [['akritiYupa', 1], ['akritiShara', 4], ['akritiShakti', 7]] as const) {
    const four = range(from, 4);
    add(id, only(four) && four.every(occ));
  }
  // PL9's Danda: none in the 3rd and the 5th to the 9th, and the 10th to the 1st each occupied (its definition
  // leaves the 2nd and the 4th free).
  add('akritiDanda', ![3, 5, 6, 7, 8, 9].some(occ) && [10, 11, 12, 1].every(occ));
  // Seven consecutive houses each occupied: Nauka, Kuta, Chhatra, Dhanush, the Ardha-Chandras and the Malikas.
  for (const [id, from] of [['akritiNauka', 1], ['akritiKuta', 4], ['akritiChhatra', 7], ['akritiDhanush', 10]] as const) add(id, range(from, 7).every(occ));
  for (const h of [2, 5, 8, 11, 3, 6, 9, 12]) add(`akritiArdhaChandra${h}`, range(h, 7).every(occ));
  add('akritiChakra', [1, 3, 5, 7, 9, 11].every(occ) && only([1, 3, 5, 7, 9, 11]));
  add('akritiSamudra', [2, 4, 6, 8, 10, 12].every(occ) && only([2, 4, 6, 8, 10, 12]));
  for (const h of range(1, 12)) add(`malika${h}`, range(h, 7).every(occ));
  add('chatussagara', ([1, 4, 7, 10].every(occ) && only([1, 4, 7, 10])) || bySign);
  return { yogas, missing };
}
