import type { Planet9 } from '../../jaimini';
import type { MissingYoga, Yoga, YogaChart, YogaResult } from '../chart';
import { conjunct, exalted, houseFrom, inGroup, ownSign } from '../primitives';

/**
 * Pancha Mahapurusha (docs/spec/yogas.md): Mars, Mercury, Jupiter, Venus or Saturn in an angle from the Lagna, in its
 * own sign (or moolatrikona) or exaltation. PL9 lists apart two weakened forms: the planet with the Sun or the Moon in
 * its sign, and the Sun and the Moon both below their required Shadbala.
 */
const FIVE: [Planet9, string][] = [['mars', 'ruchaka'], ['mercury', 'bhadra'], ['jupiter', 'hamsa'], ['venus', 'malavya'], ['saturn', 'shasha']];

export function mahapurusha(ch: YogaChart): YogaResult {
  const yogas: Yoga[] = [];
  const missing: MissingYoga[] = [];
  const yoga = (id: string, present: boolean, planets: Planet9[], houses: number[]): Yoga =>
    ({ id, family: 'mahapurusha', present, planets: present ? planets : [], houses: present ? houses : [] });
  for (const [planet, id] of FIVE) {
    const forms = [id, `${id}WithLuminary`, `${id}WeakLuminaries`];
    if (ch.lagnaSign === null) { missing.push(...forms.map((f) => ({ id: f, reason: 'needs the Lagna' }))); continue; }
    const house = houseFrom(ch.lagnaSign, ch.signs[planet]);
    const base = inGroup(house, 'kendra') && (ownSign(ch.dignity[planet]) || exalted(ch.dignity[planet]));
    yogas.push(yoga(id, base, [planet], [house]));
    const luminaries = (['sun', 'moon'] as const).filter((l) => conjunct(ch.signs, planet, l));
    yogas.push(yoga(forms[1]!, base && luminaries.length > 0, [planet, ...luminaries], [house]));
    if (!ch.shadbalaRatio) { missing.push({ id: forms[2]!, reason: 'needs the Shadbala' }); continue; }
    yogas.push(yoga(forms[2]!, base && ch.shadbalaRatio.sun < 1 && ch.shadbalaRatio.moon < 1, [planet, 'sun', 'moon'], [house]));
  }
  return { yogas, missing };
}
