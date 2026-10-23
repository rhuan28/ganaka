import type { Planet9 } from '../../jaimini';
import { houseOf, ofNature, type MissingYoga, type Yoga, type YogaChart, type YogaResult } from '../chart';
import { aspectsFully, signOfHouse } from '../primitives';

/**
 * The Lagna's Kartari yogas and Lagna Adhi (docs/spec/yogas.md, family 4). A house is free of malefic influence when
 * no malefic is in it and none casts a full aspect on its sign.
 */
export function kartari(ch: YogaChart): YogaResult {
  const ids = ['subhaKartari', 'papaKartari', 'lagnaAdhi'];
  if (ch.lagnaSign === null) return { yogas: [], missing: ids.map((id): MissingYoga => ({ id, reason: 'needs the Lagna' })) };
  const lagna = ch.lagnaSign;
  const benefics = ofNature(ch, 'benefic'), malefics = ofNature(ch, 'malefic');
  const inHouse = (set: Planet9[], h: number) => set.filter((p) => houseOf(ch, p) === h);
  const touched = (h: number) => malefics.some((m) => houseOf(ch, m) === h || aspectsFully(m, ch.signs[m], signOfHouse(lagna, h)));
  const yogas: Yoga[] = [];
  const add = (id: string, present: boolean, planets: Planet9[]) => {
    const uniq = [...new Set(present ? planets : [])];
    yogas.push({ id, family: 'kartari', present, planets: uniq, houses: uniq.map((p) => houseOf(ch, p)!) });
  };
  add('subhaKartari', inHouse(benefics, 2).length > 0 && inHouse(benefics, 12).length > 0, [...inHouse(benefics, 2), ...inHouse(benefics, 12)]);
  add('papaKartari', inHouse(malefics, 2).length > 0 && inHouse(malefics, 12).length > 0, [...inHouse(malefics, 2), ...inHouse(malefics, 12)]);
  const adhi = [6, 7, 8].map((h) => inHouse(benefics, h));
  add('lagnaAdhi', adhi.every((l) => l.length > 0) && ![6, 7, 8].some(touched), adhi.flat());
  return { yogas, missing: [] };
}
