import type { Planet9 } from '../../jaimini';
import { aspectedBy, houseOf, type MissingYoga, type Yoga, type YogaChart, type YogaResult } from '../chart';
import { inGroup, lordOf } from '../primitives';

/**
 * Neecha Bhanga Raja (docs/spec/yogas.md, family 8): a debilitated planet whose debilitation is cancelled, by each
 * cancellation PL9 lists apart, for the planets PL9 writes it for.
 */

/** The lord of the sign of exaltation of each planet, and of its sign of debilitation. */
const EXALTATION_LORD: Partial<Record<Planet9, Planet9>> = { sun: 'mars', moon: 'venus', mars: 'saturn', mercury: 'mercury', jupiter: 'moon', venus: 'jupiter', saturn: 'venus' };
const DEBILITATION_LORD: Partial<Record<Planet9, Planet9>> = { sun: 'venus', moon: 'mars', mars: 'moon', mercury: 'jupiter', jupiter: 'saturn', venus: 'mercury', saturn: 'mars' };
const NINE: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

export function neechaBhanga(ch: YogaChart): YogaResult {
  const yogas: Yoga[] = [];
  const missing: MissingYoga[] = [];
  const lagna = ch.lagnaSign !== null;
  const add = (id: string, present: boolean, planets: Planet9[] = []) => {
    const uniq = [...new Set(present ? planets : [])];
    yogas.push({ id, family: 'neechaBhanga', present, planets: uniq, houses: lagna ? uniq.map((p) => houseOf(ch, p)!) : [] });
  };
  const debilitated = (p: Planet9) => ch.dignity[p] === 9;
  const R = (a: Planet9, b: Planet9) => a !== b && (ch.signs[a] === ch.signs[b] || aspectedBy(ch, a, b));
  /** The debilitated planets of a list, each with its helper, that meet the test. */
  const each = (helpers: Partial<Record<Planet9, Planet9>>, planets: Planet9[], test: (p: Planet9, h: Planet9) => boolean) =>
    planets.filter((p) => debilitated(p) && test(p, helpers[p]!)).flatMap((p) => [p, helpers[p]!]);

  // PL9's first definition cannot be read by its own evaluator: it never forms.
  add('neechaBhangaGeneral', false);
  const all7: Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'];
  if (lagna) {
    const hit = each(EXALTATION_LORD, all7, (_, h) => inGroup(houseOf(ch, h)!, 'kendra'));
    add('neechaBhangaExaltationLordInKendra', hit.length > 0, hit);
  } else missing.push({ id: 'neechaBhangaExaltationLordInKendra', reason: 'needs the Lagna' });
  {
    // From the Moon; PL9 leaves Jupiter out of this one.
    const hit = each(EXALTATION_LORD, ['sun', 'moon', 'mars', 'mercury', 'venus', 'saturn'], (_, h) => inGroup(houseOf(ch, h, 'moon')!, 'kendra'));
    add('neechaBhangaExaltationLordKendraFromMoon', hit.length > 0, hit);
  }
  {
    const hit = each(DEBILITATION_LORD, ['sun', 'moon', 'mercury', 'jupiter', 'venus', 'saturn'], R);
    add('neechaBhangaDebilitationLordRelation', hit.length > 0, hit);
  }
  {
    const hit = each(EXALTATION_LORD, ['sun', 'moon', 'jupiter', 'venus', 'saturn'], R);
    add('neechaBhangaExaltationLordRelation', hit.length > 0, hit);
  }
  {
    const hit = each(DEBILITATION_LORD, ['sun', 'moon', 'mercury', 'jupiter', 'venus', 'saturn'],
      (p, h) => p !== h && lordOf(ch.signs[p]) === h && lordOf(ch.signs[h]) === p);
    add('neechaBhangaExchange', hit.length > 0, hit);
  }
  {
    const s = (p: Planet9, sign1: number) => ch.signs[p] === sign1 - 1;
    const pairs: [Planet9, Planet9][] = [];
    if (s('sun', 7) && s('saturn', 1)) pairs.push(['sun', 'saturn']);
    if (s('mars', 4) && s('jupiter', 10)) pairs.push(['mars', 'jupiter']);
    if (s('venus', 6) && s('mercury', 12)) pairs.push(['venus', 'mercury']);
    add('neechaBhangaMutualDebilitation', pairs.length > 0, pairs.flat());
  }
  {
    const hit = NINE.filter(debilitated).flatMap((p) => NINE.filter((q) => q !== p && ch.dignity[q] === 1 && ch.signs[q] === ch.signs[p]).map((q) => [p, q])).flat();
    add('neechaBhangaWithExalted', hit.length > 0, hit);
  }
  return { yogas, missing };
}
