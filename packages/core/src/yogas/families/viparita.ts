import type { Planet9 } from '../../jaimini';
import { houseOf, type MissingYoga, type Yoga, type YogaChart, type YogaResult } from '../chart';
import { houseLord, inGroup } from '../primitives';

/** Viparita Raja (docs/spec/yogas.md, family 7): the lord of the 6th, 8th or 12th in a dusthana. */
export function viparita(ch: YogaChart): YogaResult {
  const forms: [string, number][] = [['viparitaHarsha', 6], ['viparitaSarala', 8], ['viparitaVimala', 12]];
  if (ch.lagnaSign === null) return { yogas: [], missing: forms.map(([id]): MissingYoga => ({ id, reason: 'needs the Lagna' })) };
  const yogas: Yoga[] = forms.map(([id, n]) => {
    const lord: Planet9 = houseLord(ch.lagnaSign!, n);
    const house = houseOf(ch, lord)!;
    const present = inGroup(house, 'dusthana');
    return { id, family: 'viparita', present, planets: present ? [lord] : [], houses: present ? [house] : [] };
  });
  return { yogas, missing: [] };
}
