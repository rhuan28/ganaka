import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
// The yogas PL9 printed on the YOG print model (stage Motor 2A), read by read-yogas.py: per chart, the numbers of the
// yogas present. PL9 prints only the yogas present, so a number missing from a chart is a yoga PL9 does not find there.

/** The PL9 numbers the engine covers: the classical families (docs/spec/yogas.md). */
export const ENGINE_YOGAS = { first: 1, last: 348 } as const;
export const YOGA_SECTIONS = ['benefic', 'malefic', 'mixed'] as const;
export type YogaSection = (typeof YOGA_SECTIONS)[number];

export interface YogaShown { number: number; section: YogaSection }

export interface YogaFixture {
  id: string;
  /** The yogas present in the chart, by PL9 number, within ENGINE_YOGAS. */
  pl9: { present: YogaShown[] };
  provenance: { program: string; method: string; charts: string; extractedOn: string };
}

/** The raw lines of read-yogas.py, by chart ("REF NNNN"); a chart with no applicable yoga has an empty list. */
export function parseYogas(raw: string): Map<string, YogaShown[]> {
  const out = new Map<string, YogaShown[]>();
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue;
    const f = line.split('\t');
    if (f[0] === 'none' && f.length === 2) { out.set(f[1]!, out.get(f[1]!) ?? []); continue; }
    const number = Number(f[2]);
    if (f[0] !== 'yoga' || f.length !== 4 || !Number.isInteger(number) || number < 1 || !(YOGA_SECTIONS as readonly string[]).includes(f[3]!)) {
      throw new Error(`not a yoga line: ${line}`);
    }
    const list = out.get(f[1]!) ?? [];
    if (list.some((y) => y.number === number)) throw new Error(`${f[1]}: yoga ${number} twice`);
    list.push({ number, section: f[3] as YogaSection });
    out.set(f[1]!, list);
  }
  return out;
}

export function loadYogaFixtures(dir: string): YogaFixture[] {
  const out = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as YogaFixture);
  if (out.length === 0) throw new Error(`no yoga fixtures in ${dir}`);
  return out;
}

/**
 * Yoga by yoga, over the numbers checked: the ones PL9 finds and the engine does not, and the reverse. A count alone
 * would hide one yoga missed and another found by mistake.
 */
export function verifyYogas(shown: YogaShown[], found: ReadonlySet<number>, checked: readonly number[]): string[] {
  const pl9 = new Set(shown.map((y) => y.number));
  const failures: string[] = [];
  for (const n of checked) {
    if (pl9.has(n) && !found.has(n)) failures.push(`${n}: PL9 finds it, the engine does not`);
    if (!pl9.has(n) && found.has(n)) failures.push(`${n}: the engine finds it, PL9 does not`);
  }
  return failures;
}

/** The engine's yogas by PL9's number, for the families written (docs/spec/yogas.md). */
export const YOGA_NUMBERS: Record<string, number> = {
  ruchaka: 50, ruchakaWithLuminary: 51, ruchakaWeakLuminaries: 52,
  bhadra: 53, bhadraWithLuminary: 54, bhadraWeakLuminaries: 55,
  hamsa: 56, hamsaWithLuminary: 57, hamsaWeakLuminaries: 58,
  malavya: 59, malavyaWithLuminary: 60, malavyaWeakLuminaries: 61,
  shasha: 62, shashaWithLuminary: 63, shashaWeakLuminaries: 64,
  gajaKesari: 65, gajaKesariConjunct: 66, gajaKesariJupiter4th: 67, gajaKesariJupiter7th: 68, gajaKesariJupiter10th: 69,
  gajaKesariConjunctIn1st: 70, gajaKesariConjunctIn4th: 71, gajaKesariConjunctIn7th: 72, gajaKesariConjunctIn9th: 73, gajaKesariConjunctIn10th: 74,
  chandraAdhi: 75,
  sunapha: 76, sunaphaMars: 77, sunaphaMercury: 78, sunaphaJupiter: 79, sunaphaVenus: 80, sunaphaSaturn: 81,
  anapha: 82, anaphaMars: 83, anaphaMercury: 84, anaphaJupiter: 85, anaphaVenus: 86, anaphaSaturn: 87,
  durudhara: 88, durudharaMarsMercuryFemale: 89, durudharaMarsMercuryMale: 90, durudharaMarsJupiter: 91,
  durudharaMarsVenusFemale: 92, durudharaMarsVenusMale: 93, durudharaMarsSaturnFemale: 94, durudharaMarsSaturnMale: 95,
  durudharaMercuryJupiter: 96, durudharaMercuryVenus: 97, durudharaMercurySaturn: 98, durudharaJupiterVenus: 99,
  durudharaJupiterSaturn: 100, durudharaVenusSaturn: 101,
  kemadruma: 102, kalpadruma: 103, kemadrumaBhangaKendraFromMoon: 104, kemadrumaBhangaAspectedByFive: 105,
  kemadrumaBhangaJupiterAspect: 106, kemadrumaBhangaStrongMoon: 107, kemadrumaBhangaBeneficRelation: 108,
  kemadrumaBhangaNavamsa: 109, kemadrumaBhangaFullMoonInLagna: 110, kemadrumaBhangaExaltedMoonIn10th: 111,
  kemadrumaBhangaPlacements: 112, vasumatiFromMoon: 113, vasumatiFromLagna: 114, dhanadhanaDay: 118, dhanadhanaNight: 119,
  shakata6th: 120, shakata8th: 121, shakata12th: 122, shakataBhanga: 123, amala: 142, amalaFromMoon: 143,
  uttamadiKendra: 115, uttamadiPanaphara: 116, uttamadiApoklima: 117,
  veshi: 124, veshiBenefics: 125, veshiMalefics: 126, veshiMars: 127, veshiMercury: 128, veshiJupiter: 129, veshiVenus: 130, veshiSaturn: 131,
  voshi: 132, voshiBenefics: 133, voshiMalefics: 134, voshiMars: 135, voshiMercury: 136, voshiJupiter: 137, voshiVenus: 138,
  voshiSaturnMale: 139, voshiSaturnFemale: 140, ubhayachari: 141,
  subhaKartari: 144, papaKartari: 145, lagnaAdhi: 146,
  rajaLagnaLord: 257, rajaFourthLord: 258, rajaFifthLord: 259, rajaSeventhNinthLords: 260, rajaNinthTenthLords: 261, rajaFifthNinthLords: 262, rajaFourthTenthExchange: 263, rajaKendraTrikonaConjunct: 264, rajaFifthLordRelation: 265, rajaBeneficsInKendras: 266, rajaDusthanaLordDebilitated: 267, rajaDebilitatedInUpachaya: 268, rajaJupiterInNinth: 269, rajaVenusInLagna: 270, rajaVenusInKarakamsha: 271, rajaTenthLordInLagna: 272, rajaRahu: 273, rajaKetu: 274, rajaMercuryExalted: 278, rajaExaltedInKendra: 279, rajaPiscesJupiter: 280, rajaPiscesPlacements: 281, rajaCapricorn: 282, rajaLibraSunMoon: 283, rajaLibraConjunctions: 284, mahaRajaCancer: 285, rajaAries: 286, rajaDebilitatedInChaturthamsha: 287, rajaMoonFromSun: 288, rajaPlacements: 289, rajaDebilitationDispositor: 290, rajaMoonAspectedByJupiter: 291, rajaExaltedInNavamsa: 292, rajaJupiterMercuryNinthEleventh: 293, rajaJupiterMercuryFirstNinth: 294, rajaSaturnExalted: 295, rajaMoonMars: 296, rajaTenthLordNavamsa: 297, rajaJupiterFifth: 298, rajaMoonNavamshaDispositor: 299, rajaNavamshaDispositorOfDebilitated: 300, rajaLagnaLordDebilitated: 301, rajaJupiterLordOfWealth: 302, rajaFriendInNinth: 303, rajaTaurus: 304, rajaDeepExaltation: 305, jaiminiRajaNinthLord: 306, jaiminiRajaHouses: 307, jaiminiRajaMoonVenus: 308, jaiminiRajaMoonAspected: 309, rajaBhanga: 310,
  dhanaGemini: 311, dhanaFifthVenus: 312, dhanaFifthMercury: 313, dhanaFifthSun: 314, dhanaFifthSaturn: 315, dhanaFifthJupiter: 316, dhanaFifthMars: 317, dhanaFifthMoon: 318, dhanaLagnaSun: 319, dhanaLagnaMoon: 320, dhanaLagnaMars: 321, dhanaLagnaMercury: 322, dhanaLagnaJupiter: 323, dhanaLagnaVenus: 324, dhanaLagnaSaturn: 325, dhanaFifthNinthLords: 326, dhanaLagnaLord: 327, dhanaSecondLord: 328, dhanaFifthLord: 329, dhanaNinthEleventhLords: 330, danExaltedNinthLord: 331, danNinthLordState: 332, danNinthLordInLagna: 333, danNinthLordTenthLordState: 334, danPlacements: 335, danMercuryExalted: 336, bahudravyarjanaDhana: 337, svaveeryaddhanaStrongLagnaLord: 338, svaveeryaddhana: 339, anthyaVayasiDhana: 340, balyaDhana: 341, bhratrumulaladdhana: 342, bhratrumulaladdhanaState: 343, matrumulaladdhana: 344, putramulaladdhana: 345, satrumuladdhana: 346, kalatramuladdhana: 347, ayatnadhanalabha: 348,
  viparitaHarsha: 275, viparitaSarala: 276, viparitaVimala: 277,
  neechaBhangaGeneral: 202, neechaBhangaExaltationLordInKendra: 203, neechaBhangaExaltationLordKendraFromMoon: 204,
  neechaBhangaDebilitationLordRelation: 205, neechaBhangaExaltationLordRelation: 206, neechaBhangaExchange: 207,
  neechaBhangaMutualDebilitation: 208, neechaBhangaWithExalted: 209,
  ashrayaRajju: 1, rajju: 2, ashrayaMusala: 3, musala: 4, ashrayaNala: 5, nala: 6, dalaMala: 7, dalaSarpa: 8, akritiGada: 9, akritiShankha: 10, akritiVibhuka: 11, akritiDhvaja: 12, akritiShakata: 13, akritiPakshi: 14, akritiVajra: 15, akritiYava: 16, akritiKamala: 17, akritiVapi: 18, akritiVapiPanaphara: 19, akritiVapiApoklima: 20, akritiShringataka: 21, akritiHala2: 22, akritiHala3: 23, akritiHala4: 24, akritiYupa: 25, akritiShara: 26, akritiShakti: 27, akritiDanda: 28, akritiNauka: 29, akritiKuta: 30, akritiChhatra: 31, akritiDhanush: 32, akritiArdhaChandra2: 33, akritiArdhaChandra5: 34, akritiArdhaChandra8: 35, akritiArdhaChandra11: 36, akritiArdhaChandra3: 37, akritiArdhaChandra6: 38, akritiArdhaChandra9: 39, akritiArdhaChandra12: 40, akritiChakra: 41, akritiSamudra: 42, sankhyaGola: 43, sankhyaYuga: 44, sankhyaShula: 45, sankhyaKedara: 46, sankhyaPasha: 47, sankhyaDama: 48, sankhyaVina: 49, malika1: 187, malika2: 188, malika3: 189, malika4: 190, malika5: 191, malika6: 192, malika7: 193, malika8: 194, malika9: 195, malika10: 196, malika11: 197, malika12: 198, chatussagara: 199,
  parvata: 147, parvataLords: 148, kahala: 149, kahalaFourthLord: 150, chamaraLagnaLord: 151, chamaraBenefics: 152, chamaraHouse1: 153, dhenu: 154, shaurya: 155, jaladhi: 156, chhattra: 157, astra: 158, kama: 159, kukarmakuccasura: 160, bhagya: 161, khyati: 162, parijata: 163, musalaHouse: 164, ava: 165, nissva: 166, mriti: 167, kuhu: 168, pamara: 169, dushkriti: 170, nirbhagya: 171, duryoga: 172, daridraEleventhLord: 173, shankha: 174, shankhaMovable: 175, bheriEmpty: 176, bheri: 177, bheriKendras: 178, khadga: 179, lakshmi: 180, mahaBhagyaMale: 181, mahaBhagyaFemale: 182, daridriLagnaLord: 183, daridriTenthLord: 184, karmasiddhi: 185, chandraMangala: 186, saraswati: 200, hathaHanta: 201, mridanga: 210, shrinatha: 211, sharada: 212, sharadaMoon: 213, matsya: 214, matsyaMalefics: 215, kurma: 216, kurmaBenefics: 217, kusuma: 218, kusumaPlacements: 219, kalanidhi: 220, kalanidhiSigns: 221, hariHaraBrahma2: 222, hariHaraBrahma7: 223, hariHaraBrahmaPlanets: 224, hariHaraBrahma1: 225, hariHaraBrahmaPlanets1: 226, pushkala: 227, pushkalaStrong: 228, bhaskara: 229, indra: 230, indu: 231, indraExchange: 232, akhandaSamrajya: 233, marud: 234, buddha: 235, simhasana: 236, dhvaja: 237, hamsaHouses: 238, karika: 239, amaraMalefics: 240, amaraBenefics: 241, mahapataka: 242, rajaLakshana: 243, vanchanaChoraGulika: 244, vanchanaChoraGulikaLords: 245, vanchanaChoraLagnaLord: 246, gauri: 247, madanaGopala: 248, madanaGopalaVenus: 249, bharathi2: 250, bharathi5: 251, bharathi11: 252, chapa: 253, amshavatara: 254, brihatjataka: 255, mahaRaja: 256,
};
