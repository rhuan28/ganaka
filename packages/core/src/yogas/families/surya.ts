import type { Planet9 } from '../../jaimini';
import { houseOf, ofNature, type MissingYoga, type Yoga, type YogaChart, type YogaResult } from '../chart';
import { conjunct, inGroup } from '../primitives';

/**
 * The Sun's yogas (docs/spec/yogas.md, family 3): Uttamadi (the Moon's house from the Sun), Vesi, Vasi and
 * Ubhayachari (the planets in the 2nd and the 12th from the Sun), in general, by benefics, by malefics and per planet.
 */

const TARA: Planet9[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const NAME: Partial<Record<Planet9, string>> = { mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn' };

export function surya(ch: YogaChart): YogaResult {
  const yogas: Yoga[] = [];
  const missing: MissingYoga[] = [];
  const lagna = ch.lagnaSign !== null;
  const fromSun = (p: Planet9) => houseOf(ch, p, 'sun')!;
  const add = (id: string, present: boolean, planets: Planet9[] = []) => {
    const uniq = [...new Set(present ? planets : [])];
    yogas.push({ id, family: 'surya', present, planets: uniq, houses: lagna ? uniq.map((p) => houseOf(ch, p)!) : [] });
  };
  const benefics = ofNature(ch, 'benefic'), malefics = ofNature(ch, 'malefic');
  const inFromSun = (set: Planet9[], h: number) => set.filter((p) => fromSun(p) === h);

  // Uttamadi: the Moon in an angle, a succedent or a cadent house from the Sun.
  add('uttamadiKendra', inGroup(fromSun('moon'), 'kendra'), ['moon', 'sun']);
  add('uttamadiPanaphara', inGroup(fromSun('moon'), 'panaphara'), ['moon', 'sun']);
  add('uttamadiApoklima', inGroup(fromSun('moon'), 'apoklima'), ['moon', 'sun']);

  // Vesi (the 2nd from the Sun) and Vasi (the 12th): each with none of the five on the other side.
  for (const [name, own, other] of [['veshi', 2, 12], ['voshi', 12, 2]] as const) {
    const here = inFromSun(TARA, own), there = inFromSun(TARA, other);
    add(name, here.length > 0 && there.length === 0, here);
    // By benefics: a benefic there (the Moon not there), or the Moon there with a benefic; and no malefic there.
    const moonThere = fromSun('moon') === own;
    const good = moonThere ? benefics.filter((b) => conjunct(ch.signs, 'moon', b)) : inFromSun(benefics, own);
    // The functional natures need the Lagna: without them the yogas of benefics and malefics cannot be told.
    if (!ch.natures) {
      missing.push({ id: `${name}Benefics`, reason: 'needs the natures' }, { id: `${name}Malefics`, reason: 'needs the natures' });
    } else {
      add(`${name}Benefics`, good.length > 0 && there.length === 0 && inFromSun(malefics, own).length === 0, moonThere ? ['moon', ...good] : good);
      // By malefics: a malefic there and no benefic.
      const bad = inFromSun(malefics, own);
      add(`${name}Malefics`, bad.length > 0 && there.length === 0 && inFromSun(benefics, own).length === 0, bad);
    }
    for (const p of TARA) {
      const present = fromSun(p) === own && there.length === 0;
      if (name === 'voshi' && p === 'saturn') {
        for (const sex of ['male', 'female'] as const) add(`voshiSaturn${sex === 'male' ? 'Male' : 'Female'}`, present && ch.sex === sex, [p]);
      } else add(`${name}${NAME[p]}`, present, [p]);
    }
  }
  add('ubhayachari', inFromSun(TARA, 2).length > 0 && inFromSun(TARA, 12).length > 0, [...inFromSun(TARA, 2), ...inFromSun(TARA, 12)]);
  return { yogas, missing };
}
