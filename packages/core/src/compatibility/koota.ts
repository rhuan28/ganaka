/**
 * The tables both koota systems read (docs/spec/compatibility.md): nakshatras 1 (Ashwini) to 27 (Revati), signs 1
 * (Aries) to 12 (Pisces). The values are the classical ones as PL9 scores them.
 */

export type Sign = number; // 1..12
export type Nakshatra = number; // 1..27

/** The lord of each sign, Aries first: Su 0, Mo 1, Ma 2, Me 3, Ju 4, Ve 5, Sa 6. */
const LORD = [2, 5, 3, 1, 0, 3, 5, 2, 4, 6, 6, 4];
export const signLord = (s: Sign) => LORD[s - 1]!;

/** Varna by sign: water Brahmin (4), fire Kshatriya (3), earth Vaishya (2), air Shudra (1). */
export function varna(s: Sign, swapEarthAir = false): number {
  const v = [3, 2, 1, 4][(s - 1) % 4]!; // fire, earth, air, water
  return swapEarthAir && (v === 1 || v === 2) ? 3 - v : v;
}

export type VashyaGroup = 'chatushpada' | 'manava' | 'jalachara' | 'vanachara' | 'keeta';
/** Vashya by sign, Sagittarius and Capricorn split at 15°. */
export function vashya(s: Sign, degree: number): VashyaGroup {
  if (s === 9) return degree <= 15 ? 'manava' : 'chatushpada';
  if (s === 10) return degree <= 15 ? 'chatushpada' : 'jalachara';
  return (['chatushpada', 'chatushpada', 'manava', 'jalachara', 'vanachara', 'manava', 'manava', 'keeta', null, null, 'manava', 'jalachara'] as const)[s - 1]!;
}
const VASHYA_ORDER: VashyaGroup[] = ['chatushpada', 'manava', 'jalachara', 'vanachara', 'keeta'];
const VASHYA_SCORE = [
  [2, 1, 1, 0.5, 1],
  [1, 2, 0.5, 0, 1],
  [1, 0.5, 2, 1, 1],
  [0, 0, 0, 2, 0],
  [1, 1, 1, 0, 2],
];
export const vashyaScore = (bride: VashyaGroup, groom: VashyaGroup) => VASHYA_SCORE[VASHYA_ORDER.indexOf(bride)]![VASHYA_ORDER.indexOf(groom)]!;

/** The count from the bride's nakshatra to the groom's on the cycle of nine, 1 to 9. */
export const taraCount = (bride: Nakshatra, groom: Nakshatra) => ((((groom - bride) % 9) + 9) % 9) + 1;

export const YONIS = ['ashwa', 'gaja', 'mesha', 'sarpa', 'shwana', 'marjara', 'mushaka', 'gau', 'mahisha', 'vyaghra', 'mriga', 'vanara', 'nakula', 'simha'] as const;
export type Yoni = (typeof YONIS)[number];
/** The yoni of each nakshatra, Ashwini first. */
const YONI_OF: Yoni[] = [
  'ashwa', 'gaja', 'mesha', 'sarpa', 'sarpa', 'shwana', 'marjara', 'mesha', 'marjara', 'mushaka', 'mushaka', 'gau', 'mahisha', 'vyaghra',
  'mahisha', 'vyaghra', 'mriga', 'mriga', 'shwana', 'vanara', 'nakula', 'vanara', 'simha', 'ashwa', 'simha', 'gau', 'gaja',
];
export const yoniOf = (n: Nakshatra) => YONI_OF[n - 1]!;
const YONI_SCORE = [
  [4, 2, 3, 2, 2, 3, 3, 2, 0, 1, 3, 2, 2, 1],
  [2, 4, 3, 2, 2, 3, 2, 3, 3, 1, 3, 2, 2, 0],
  [3, 3, 4, 2, 2, 3, 2, 3, 3, 1, 3, 0, 2, 1],
  [2, 2, 2, 4, 2, 1, 1, 2, 2, 2, 2, 1, 0, 2],
  [2, 2, 2, 2, 4, 1, 1, 2, 2, 2, 0, 2, 2, 2],
  [3, 3, 3, 1, 1, 4, 0, 3, 3, 2, 3, 2, 2, 2],
  [3, 2, 2, 1, 1, 0, 4, 3, 3, 2, 3, 2, 1, 2],
  [2, 3, 3, 2, 2, 3, 3, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 2, 2, 3, 3, 3, 4, 1, 3, 2, 2, 1],
  [1, 1, 1, 2, 2, 2, 2, 0, 1, 4, 1, 2, 2, 3],
  [3, 3, 3, 2, 0, 3, 3, 3, 3, 1, 4, 2, 2, 1],
  [2, 2, 0, 1, 2, 2, 2, 2, 2, 2, 2, 4, 2, 2],
  [2, 2, 2, 0, 2, 2, 1, 2, 2, 2, 2, 2, 4, 2],
  [1, 0, 1, 2, 2, 2, 2, 1, 1, 3, 1, 2, 2, 4],
];
export const yoniScore = (a: Yoni, b: Yoni) => YONI_SCORE[YONIS.indexOf(a)]![YONIS.indexOf(b)]!;

/** Graha Maitri by the two Moon signs' lords, Sun to Saturn (symmetric; the same lord 5). */
const MAITRI: number[][] = [
  [5, 5, 5, 4, 5, 0, 0],
  [5, 5, 4, 1, 4, 0.5, 0.5],
  [5, 4, 5, 0.5, 5, 1, 0.5],
  [4, 1, 0.5, 5, 0.5, 5, 4],
  [5, 4, 5, 0.5, 5, 0.5, 1],
  [0, 0.5, 1, 5, 0.5, 5, 5],
  [0, 0.5, 0.5, 4, 1, 5, 5],
];
export const maitri = (a: Sign, b: Sign) => MAITRI[signLord(a)]![signLord(b)]!;

export type Gana = 'deva' | 'manushya' | 'rakshasa';
const GANA_OF = 'DMRMDMDDRRMMDRDRDRRMMDRRMMD'; // Ashwini to Revati
export const ganaOf = (n: Nakshatra): Gana => ({ D: 'deva', M: 'manushya', R: 'rakshasa' } as const)[GANA_OF[n - 1] as 'D' | 'M' | 'R'];
const GANA_SCORE: Record<Gana, Record<Gana, number>> = {
  deva: { deva: 6, manushya: 5, rakshasa: 1 },
  manushya: { deva: 6, manushya: 6, rakshasa: 0 },
  rakshasa: { deva: 0, manushya: 0, rakshasa: 6 },
};
export const ganaScore = (bride: Gana, groom: Gana) => GANA_SCORE[bride][groom];

export type Nadi = 'adi' | 'madhya' | 'antya';
const NADI_OF = 'AMNNMAAMNNMAAMNNMAAMNNMAAMN'; // A adi, M madhya, N antya
export const nadiOf = (n: Nakshatra): Nadi => ({ A: 'adi', M: 'madhya', N: 'antya' } as const)[NADI_OF[n - 1] as 'A' | 'M' | 'N'];

/** The count of signs from the bride's to the groom's, 0 to 11 (0 the same sign). */
export const signGap = (bride: Sign, groom: Sign) => (((groom - bride) % 12) + 12) % 12;

/** The two Moon signs' lords natural friends both ways (Sun to Saturn's classical relations). */
const FRIENDS: number[][] = [[1, 2, 4], [0, 3], [0, 1, 4], [0, 5], [0, 1, 2], [3, 6], [3, 5]];
export const mutualFriends = (a: Sign, b: Sign) => FRIENDS[signLord(a)]!.includes(signLord(b)) && FRIENDS[signLord(b)]!.includes(signLord(a));
