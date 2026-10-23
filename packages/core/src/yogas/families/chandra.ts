import type { Planet9 } from '../../jaimini';
import { aspectedBy, dayBirth, houseOf, ofNature, type MissingYoga, type Yoga, type YogaChart, type YogaResult } from '../chart';
import { aspectsFully, conjunct, inGroup, lordOf, signOfHouse } from '../primitives';

/**
 * The Moon's yogas (docs/spec/yogas.md, family 2): Gaja-Kesari, Chandra Adhi, Sunapha, Anapha, Durudhara, Kemadruma
 * and its cancellations, Vasumati, Dhanadhana, Shakata and Amala, each variant PL9 lists apart a yoga of its own.
 */

/** The planets other than the luminaries and the nodes. */
const TARA: Planet9[] = ['mars', 'mercury', 'jupiter', 'venus', 'saturn'];
const SEVEN: Planet9[] = ['sun', 'moon', ...TARA];
const NAME: Partial<Record<Planet9, string>> = { mars: 'Mars', mercury: 'Mercury', jupiter: 'Jupiter', venus: 'Venus', saturn: 'Saturn' };
/** The Durudhara pairs PL9 lists in a male and a female form. */
const BY_SEX = new Set(['marsMercury', 'marsVenus', 'marsSaturn']);

export function chandra(ch: YogaChart): YogaResult {
  const yogas: Yoga[] = [];
  const missing: MissingYoga[] = [];
  const lagna = ch.lagnaSign !== null;
  // The functional natures need the Lagna: without them a yoga that reads the benefics cannot be told.
  const natures = ch.natures !== null;
  const benefics = ofNature(ch, 'benefic');
  const fromMoon = (p: Planet9) => houseOf(ch, p, 'moon')!;
  const fromLagna = (p: Planet9) => houseOf(ch, p);
  const add = (id: string, present: boolean, planets: Planet9[] = []) => {
    const uniq = [...new Set(present ? planets : [])];
    yogas.push({ id, family: 'chandra', present, planets: uniq, houses: lagna ? uniq.map((p) => fromLagna(p)!) : [] });
  };
  const needs = (id: string, ok: boolean, reason: string, decide: () => [boolean, Planet9[]]) => {
    if (!ok) { missing.push({ id, reason }); return; }
    const [present, planets] = decide();
    add(id, present, planets);
  };
  const inFromMoon = (set: Planet9[], h: number) => set.filter((p) => fromMoon(p) === h);
  const withBenefic = (p: Planet9, how: (b: Planet9) => boolean) => benefics.filter((b) => b !== p && how(b));

  // Gaja-Kesari.
  add('gajaKesari', inGroup(fromMoon('jupiter'), 'kendra'), ['jupiter', 'moon']);
  add('gajaKesariConjunct', conjunct(ch.signs, 'jupiter', 'moon'), ['jupiter', 'moon']);
  for (const h of [4, 7, 10]) add(`gajaKesariJupiter${h}th`, fromMoon('jupiter') === h, ['jupiter', 'moon']);
  for (const h of [1, 4, 7, 9, 10]) {
    needs(`gajaKesariConjunctIn${h === 1 ? '1st' : `${h}th`}`, lagna, 'needs the Lagna',
      () => [conjunct(ch.signs, 'jupiter', 'moon') && fromLagna('moon') === h, ['jupiter', 'moon']]);
  }

  // Chandra Adhi: benefics in the 6th, the 7th and the 8th from the Moon.
  {
    const by = [6, 7, 8].map((h) => inFromMoon(benefics, h));
    needs('chandraAdhi', natures, 'needs the natures', () => [by.every((l) => l.length > 0), by.flat()]);
  }

  // Sunapha, Anapha, Durudhara, Kemadruma: the five in the 2nd and the 12th from the Moon.
  const second = inFromMoon(TARA, 2), twelfth = inFromMoon(TARA, 12);
  add('sunapha', second.length > 0 && twelfth.length === 0, second);
  for (const p of TARA) add(`sunapha${NAME[p]}`, fromMoon(p) === 2 && twelfth.length === 0, [p]);
  add('anapha', twelfth.length > 0 && second.length === 0, twelfth);
  for (const p of TARA) add(`anapha${NAME[p]}`, fromMoon(p) === 12 && second.length === 0, [p]);
  add('durudhara', second.length > 0 && twelfth.length > 0, [...second, ...twelfth]);
  TARA.forEach((a, i) => TARA.slice(i + 1).forEach((b) => {
    const pair = `${a}${NAME[b]}`;
    const present = (fromMoon(a) === 2 && fromMoon(b) === 12) || (fromMoon(b) === 2 && fromMoon(a) === 12);
    if (!BY_SEX.has(pair)) { add(`durudhara${NAME[a]}${NAME[b]}`, present, [a, b]); return; }
    for (const sex of ['male', 'female'] as const) add(`durudhara${NAME[a]}${NAME[b]}${sex === 'male' ? 'Male' : 'Female'}`, present && ch.sex === sex, [a, b]);
  }));
  const kemadruma = second.length === 0 && twelfth.length === 0;
  add('kemadruma', kemadruma, ['moon']);
  needs('kalpadruma', lagna, 'needs the Lagna', () => [kemadruma && SEVEN.some((p) => inGroup(fromLagna(p)!, 'kendra')), ['moon']]);

  // The cancellations of Kemadruma, each on the seven (the Sun included) absent from the 2nd and the 12th.
  const alone = inFromMoon(SEVEN, 2).length === 0 && inFromMoon(SEVEN, 12).length === 0;
  add('kemadrumaBhangaKendraFromMoon', alone && SEVEN.some((p) => inGroup(fromMoon(p), 'kendra')), ['moon']);
  add('kemadrumaBhangaAspectedByFive', alone && TARA.every((p) => aspectedBy(ch, 'moon', p)), ['moon', ...TARA]);
  needs('kemadrumaBhangaJupiterAspect', lagna, 'needs the Lagna', () => {
    const moon = inGroup(fromLagna('moon')!, 'kendra') && aspectedBy(ch, 'moon', 'jupiter');
    const venus = inGroup(fromLagna('venus')!, 'kendra') && aspectedBy(ch, 'venus', 'jupiter');
    return [alone && (moon || venus), moon ? ['moon', 'jupiter'] : ['venus', 'jupiter']];
  });
  needs('kemadrumaBhangaStrongMoon', lagna && ch.shadbalaRatio !== null && ch.natures !== null, 'needs the Lagna and the Shadbala', () => {
    const mates = withBenefic('moon', (b) => conjunct(ch.signs, 'moon', b) || aspectedBy(ch, 'moon', b));
    return [alone && inGroup(fromLagna('moon')!, 'kendra') && ch.shadbalaRatio!.moon >= 1 && mates.length > 0, ['moon', ...mates]];
  });
  {
    const mates = withBenefic('moon', (b) => aspectedBy(ch, 'moon', b) || conjunct(ch.signs, 'moon', b) || lordOf(ch.signs.moon) === b);
    const jupiter = aspectedBy(ch, 'moon', 'jupiter');
    needs('kemadrumaBhangaBeneficRelation', natures, 'needs the natures',
      () => [alone && (mates.length > 0 || jupiter), ['moon', ...mates, ...(jupiter ? ['jupiter' as Planet9] : [])]]);
  }
  add('kemadrumaBhangaNavamsa', alone && ch.navamsa.dignity.moon <= 3 && aspectedBy(ch.navamsa, 'moon', 'jupiter'), ['moon', 'jupiter']);
  needs('kemadrumaBhangaFullMoonInLagna', lagna, 'needs the Lagna', () => {
    const mates = withBenefic('moon', (b) => aspectedBy(ch, 'moon', b));
    return [alone && fromMoon('sun') === 7 && fromLagna('moon') === 1 && mates.length > 0, ['moon', ...mates]];
  });
  needs('kemadrumaBhangaExaltedMoonIn10th', lagna, 'needs the Lagna', () => {
    const mates = withBenefic('moon', (b) => conjunct(ch.signs, 'moon', b) || aspectedBy(ch, 'moon', b));
    return [alone && ch.dignity.moon === 1 && fromLagna('moon') === 10 && mates.length > 0, ['moon', ...mates]];
  });
  add('kemadrumaBhangaPlacements', alone && ch.signs.moon === 0 && ch.signs.mars === 6 && ch.signs.jupiter === 6 && ch.signs.sun === 5,
    ['moon', 'mars', 'jupiter', 'sun']);

  // Vasumati: the benefics in upachayas, from the Moon and from the Lagna.
  add('vasumatiFromMoon', (['mercury', 'jupiter', 'venus'] as const).every((p) => inGroup(fromMoon(p), 'upachaya')), ['mercury', 'jupiter', 'venus']);
  needs('vasumatiFromLagna', lagna, 'needs the Lagna',
    () => [(['moon', 'mercury', 'jupiter', 'venus'] as const).every((p) => inGroup(fromLagna(p)!, 'upachaya')), ['moon', 'mercury', 'jupiter', 'venus']]);

  // Dhanadhana: PL9's day form cannot be read by its own evaluator and never forms; the night form as PL9 has it.
  add('dhanadhanaDay', false);
  needs('dhanadhanaNight', lagna, 'needs the Lagna', () => {
    const marsJupiter = conjunct(ch.signs, 'mars', 'jupiter') || aspectedBy(ch, 'mars', 'jupiter');
    const d = ch.navamsa.dignity.moon;
    return [dayBirth(ch) === false && aspectedBy(ch.navamsa, 'moon', 'venus') && marsJupiter && (d === 2 || d === 3 || d === 4), ['moon', 'venus']];
  });

  // Shakata: Jupiter in the 6th, 8th or 12th from the Moon and not in an angle from the Lagna; its cancellation.
  for (const h of [6, 8, 12]) {
    needs(`shakata${h}th`, lagna, 'needs the Lagna', () => [fromMoon('jupiter') === h && !inGroup(fromLagna('jupiter')!, 'kendra'), ['jupiter', 'moon']]);
  }
  needs('shakataBhanga', lagna, 'needs the Lagna', () => [fromMoon('jupiter') === 12 && !inGroup(fromLagna('jupiter')!, 'kendra')
    && aspectsFully('jupiter', ch.signs.jupiter, signOfHouse(ch.lagnaSign!, 6)), ['jupiter', 'moon']]);

  // Amala: a benefic in the 10th, from the Lagna and from the Moon.
  needs('amala', lagna, 'needs the Lagna', () => { const b = benefics.filter((p) => fromLagna(p) === 10); return [b.length > 0, b]; });
  needs('amalaFromMoon', natures, 'needs the natures', () => { const b = inFromMoon(benefics, 10); return [b.length > 0, b]; });

  return { yogas, missing };
}
