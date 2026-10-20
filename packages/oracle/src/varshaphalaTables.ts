// The Varshaphala read from the TEMPO printouts by read-varshaphala.py (stage 5C): the 72 returns, the
// monthly returns, the year's page and chart, the Tajika strengths and lords, the yogas, the Tripataki Chakra, the
// Sahams and the four annual dashas.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Ephemeris } from '@reverse/ephemeris';
import { computePositions, computeShadbala, computeVarshaphala, computeVarshaphalaReport, dignity9, SIGN_LORDS, tajikaChart, varshaphalaLords, type ChartInput } from '@reverse/core';

export const VARSHAPHALA_PARTS = ['vsreturn', 'vsmonth', 'vsyear', 'vsplanet', 'vsharsha', 'vspancha', 'vslords', 'vsyoga', 'vstripataki', 'vssaham', 'vsdasha'] as const;
export type VarshaphalaPart = (typeof VARSHAPHALA_PARTS)[number];

const POINT = '(?:lagna|sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu)';
const PLANET7 = '(?:sun|moon|mars|mercury|jupiter|venus|saturn)';
const PLANET = '(?:sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu|lagna)';
const DEG = '\\d\\d:\\d\\d(?::\\d\\d)?';
const SIGN3_RE = '(?:Ari|Tau|Gem|Can|Leo|Vir|Lib|Sco|Sag|Cap|Aqu|Pis)';
const any = '.+';

/** For each part, the keys it may hold, each with the form of its value. */
const RULES: Record<VarshaphalaPart, [RegExp, RegExp][]> = {
  vsreturn: [
    [/^\d+\.date$/, /^\d{1,2} [A-Z][a-z]+ \d{4}$/], [/^\d+\.time$/, /^\d\d:\d\d$/],
    [new RegExp(`^\\d+\\.${POINT}$`), new RegExp(`^${DEG}$`)], [/^\d+\.yearLord$/, new RegExp(`^${PLANET7}$`)],
    [/^\d+\.muntha$/, new RegExp(`^${SIGN3_RE} ${DEG}$`)],
  ],
  vsmonth: [
    [/^\d+\.date$/, /^\d{1,2} [A-Z][a-z]+ \d{4}$/], [/^\d+\.time$/, /^\d\d:\d\d$/],
    [new RegExp(`^\\d+\\.${POINT}$`), new RegExp(`^${DEG}$`)], [/^\d+\.monthLord$/, new RegExp(`^${PLANET7}$`)],
    [/^\d+\.muntha$/, new RegExp(`^${SIGN3_RE} ${DEG}$`)],
  ],
  vsyear: [[/^(passed|running|pada)$/, /^\d+$/], [/^(lagnesh|rashish|nakLord)$/, new RegExp(`^${PLANET}$`)],
    [/^(date|weekday|time|ayanamsha|lagna|rashi|nakshatra|yoga|tithi|karana|varna|vashya|yoni|gana|nadi|varga|naamakshar|payaRashi|payaNakshatra|sunsign)$/, new RegExp(any)]],
  vsplanet: [[new RegExp(`^${POINT}\\.(signLord|nakLord)$`), new RegExp(`^${PLANET}$`)], [new RegExp(`^${POINT}\\.(degree|speed)$`), new RegExp(`^-?${DEG}$`)],
    [new RegExp(`^${POINT}\\.(rc|sign|nakshatra|pada|status|sb)$`), new RegExp(any)]],
  vsharsha: [[new RegExp(`^${PLANET7}\\.(1|2|3|4|total)$`), /^\d+$/]],
  vspancha: [[new RegExp(`^${PLANET7}\\.(graha|uchcha|hudda|drekkana|navamsha|total)$`), /^\d+\.\d\d$/]],
  vslords: [[/^(munthaPati|janmaLagnaPati|varshaLagnaPati|trirashiPati|dinaRatriPati)\.planet$/, new RegExp(`^${PLANET7}$`)],
    [/^(munthaPati|janmaLagnaPati|varshaLagnaPati|trirashiPati|dinaRatriPati)\.strength$/, /^\d+\.\d\d$/],
    [/^(yearLord|munthaLord)$/, new RegExp(`^${PLANET7}$`)], [/^munthaSign$/, new RegExp(`^${SIGN3_RE} ${DEG}$`)], [/^(munthaHouse|munthaLordHouse)$/, /^\d{1,2}$/]],
  vsyoga: [[/^([1-9]|1[0-6])\.present$/, /^[01]$/], [/^([1-9]|1[0-6])\.planets$/, new RegExp(`^(${PLANET}(-${PLANET})+(,${PLANET}(-${PLANET})+)*)?$`)]],
  vstripataki: [[new RegExp(`^cell\\.${POINT}$`), /^([1-9]|1[0-2])$/], [new RegExp(`^vedha\\.${POINT}$`), new RegExp(`^(${POINT}( ${POINT})*)?$`)]],
  vssaham: [[/^[A-Z][a-z]+\.sign$/, /^[A-Z][a-z]+$/], [/^[A-Z][a-z]+\.degree$/, new RegExp(`^${DEG}$`)], [/^[A-Z][a-z]+\.lord$/, new RegExp(`^${PLANET7}$`)]],
  vsdasha: [[new RegExp(`^(muddaBirth|muddaVarsha|muddaNone|patyayini)\\.\\d+(\\.\\d+)?\\.lord$`), new RegExp(`^${PLANET}$`)],
    [/^(muddaBirth|muddaVarsha|muddaNone|patyayini)\.\d+\.(begin|end)$/, /^\d\d-\d\d-\d{4}$/],
    [/^(muddaBirth|muddaVarsha|muddaNone|patyayini)\.\d+\.\d+\.(start|end)$/, /^\d\d-\d\d-\d{4} \d\d:\d\d$/]],
};

export interface VarshaphalaShown {
  chart: string;
  parts: Record<VarshaphalaPart, Record<string, string>>;
}

export function parseVarshaphala(text: string): VarshaphalaShown {
  const out: VarshaphalaShown = { chart: '', parts: Object.fromEntries(VARSHAPHALA_PARTS.map((p) => [p, {}])) as VarshaphalaShown['parts'] };
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const f = line.split('\t');
    const fail = (): never => { throw new Error(`line ${i + 1}: "${line}" is not a Varshaphala line`); };
    if (f[0] === 'chart' && f.length === 2) { out.chart = f[1]!; return; }
    if (f.length !== 3 || !(VARSHAPHALA_PARTS as readonly string[]).includes(f[0]!)) fail();
    const part = f[0] as VarshaphalaPart;
    const rule = RULES[part].find(([k]) => k.test(f[1]!));
    if (!rule || !rule[1].test(f[2]!)) fail();
    out.parts[part][f[1]!] = f[2]!;
  });
  return out;
}

export type VarshaphalaDate = '2000' | '2030' | 'mean';

export interface VarshaphalaFixture {
  id: string;
  /** The reference date whose age the reports answered, or 'mean' for the mean solar return printouts (2030). */
  date: VarshaphalaDate;
  pl9: VarshaphalaShown['parts'];
  provenance: { program: string; method: string; charts: string; extractedOn: string };
}

export function loadVarshaphalaFixtures(dir: string): VarshaphalaFixture[] {
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as VarshaphalaFixture);
}

// ---- The check: what the core computes for one report, and its comparison with the printout ----

/**
 * The differences known for each report ("ref-nnnn 2030"), kept apart in the bench: pairs some yogas' lists leave out,
 * the Patyayini of three reports its print rule does not explain, and a few Sahams (docs/spec/tempo/varshaphala.md).
 */
export const KNOWN_VARSHAPHALA_PENDING: Readonly<Record<string, readonly string[]>> = {
  'ref-0018 2030': ['yoga Manua planets'],
  'ref-0039 2030': ['yoga Manua planets', 'saham Mahatmya', 'saham Paradesa', 'saham Artha', 'saham Bandhana', 'saham Apamrityu', 'saham Labha'],
  'ref-0044 2030': ['yoga Kamboola planets'],
  'ref-0061 2030': ['yoga Kamboola'],
  'ref-0063 2030': ['saham Karyasiddhi', 'saham Karyasiddhi lord'],
  'ref-0090 2030': ['saham Karyasiddhi', 'saham Karyasiddhi lord'],
  'ref-0091 2030': ['yoga Manua planets'],
  'ref-0095 2030': ['yoga Kamboola planets'],
  'ref-0096 2030': ['yoga Manua planets'],
  'ref-0126 2030': ['saham Karyasiddhi', 'saham Karyasiddhi lord'],
  'ref-0165 2030': ['yoga Manua planets'],
  'ref-0182 2030': ['yoga Manua planets'],
  'ref-0225 2030': ['yoga Manua planets'],
  'ref-0263 2030': ['yoga Manua planets', 'saham Mahatmya', 'saham Paradesa', 'saham Artha', 'saham Bandhana', 'saham Apamrityu', 'saham Labha'],
  'ref-0264 2030': ['yoga Manua planets', 'saham Paradesa', 'saham Artha', 'saham Labha'],
  'ref-0269 2030': ['yoga Manua planets'],
  'ref-0270 2030': ['yoga Manua planets'],
  'ref-0277 2030': ['yoga Kamboola planets'],
  'ref-0278 2030': ['yoga Kamboola planets'],
  'ref-0352 2030': ['saham Yasa', 'saham Paradesa', 'saham Artha', 'saham Labha'],
  'ref-0003 2000': ['patyayini'],
  'ref-0014 2000': ['yoga Kamboola'],
  'ref-0039 2000': ['saham Yasa', 'saham Paradesa', 'saham Artha', 'saham Labha'],
  'ref-0090 2000': ['saham Karyasiddhi', 'saham Karyasiddhi lord'],
  'ref-0095 2000': ['yoga Manua planets'],
  'ref-0143 2000': ['yoga Kamboola planets', 'saham Yasa', 'saham Paradesa', 'saham Artha', 'saham Labha'],
  'ref-0157 2000': ['yoga Manua planets', 'saham Karyasiddhi', 'saham Karyasiddhi lord'],
  'ref-0165 2000': ['yoga Manua planets'],
  'ref-0169 2000': ['yoga Ithasala planets'],
  'ref-0225 2000': ['yoga Manua planets'],
  'ref-0263 2000': ['saham Yasa'],
  'ref-0264 2000': ['saham Paradesa', 'saham Artha', 'saham Labha'],
  'ref-0268 2000': ['patyayini'],
  'ref-0272 2000': ['patyayini'],
  'ref-0282 2000': ['saham Karyasiddhi', 'saham Karyasiddhi lord'],
  'ref-0290 2000': ['saham Karyasiddhi', 'saham Karyasiddhi lord'],
  'ref-0018 mean': ['yoga Manua planets', 'saham Karyasiddhi', 'saham Karyasiddhi lord'],
  'ref-0027 mean': ['saham Karyasiddhi', 'saham Karyasiddhi lord'],
};

/** The reports listed in `known` that the bench never saw: their entries can no longer be checked, and are stale. */
export function pendingWithoutReport(known: Readonly<Record<string, readonly string[]>>, seen: ReadonlySet<string>): string[] {
  return Object.keys(known).filter((k) => !seen.has(k));
}

const SIGN3 = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
const SIGN_FULL = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
/** The nakshatras as the annual chart's page spells them. */
const NAK_PRINTED = ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigasira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha', 'Poorva Phalg.', 'Uttara Phalg.', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Poorvashadha', 'Uttarashadha', 'Shravana', 'Dhanishta', 'Shatabhishak', 'Poorvabhadra', 'Uttarabhadra', 'Revati'];
const NAK_LORDS = ['ketu', 'venus', 'sun', 'moon', 'mars', 'rahu', 'jupiter', 'saturn', 'mercury'];
const STATUS = ['', 'Exalt.', 'Moolt.', 'Own', 'Grt.Fr.', 'Frnd.', 'Neutr.', 'Enemy', 'Grt.En.', 'Debil.'];
const POINTS9 = ['lagna', 'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu'] as const;
const SEVEN = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'] as const;
const OFFICE_KEYS = { munthaPati: 'munthaPati', janmaLagnaPati: 'natalLagnaPati', varshaLagnaPati: 'annualLagnaPati', trirashiPati: 'trirashiPati', dinaRatriPati: 'dinaRatriPati' } as const;
const DASHA_KEYS = { muddaBirth: 'mudda', muddaVarsha: 'muddaKalidasa', muddaNone: 'muddaWithoutBalance', patyayini: 'patyayini' } as const;

interface ChartAt { jdUt: number; longitude: Record<string, number>; lagnaSpeed: number }
export interface VarshaphalaComputed {
  returns: (ChartAt & { years: number; yearLord: string | null; munthaLongitude: number | null })[];
  year: ChartAt & { speed: Record<string, number>; retrograde: Record<string, boolean>; combust: Record<string, boolean>; status: Record<string, number>; sb: Record<string, number> };
  harsha: Record<string, Record<string, number>>;
  pancha: Record<string, Record<string, number>>;
  lords: { offices: Record<string, string>; strength: Record<string, number>; yearLord: string; munthaLongitude: number; munthaHouse: number; munthaLordHouse: number } | null;
  yogas: { name: string; present: boolean; pairs: string[] }[];
  sahams: Record<string, { longitude: number; lord: string; lagnaBound: boolean }>;
  dashas: Record<string, { lord: string; startJdUt: number; endJdUt: number; sub: { lord: string; startJdUt: number; endJdUt: number }[] }[]>;
  months: (ChartAt & { monthLord: string | null; munthaLongitude: number | null })[];
  tripataki: { cell: Record<string, number>; vedha: Record<string, string[]> } | null;
  /** How far, in days, Patyayini dates move with the Lagna's motion in 1.5 seconds of time. */
  patyayiniSlack: number;
}

/** The Lagna's speed at an instant, degrees per day (PL9's own times are given to the second). */
export const lagnaSpeedAt = (eph: Ephemeris, input: ChartInput) => {
  const a = computePositions(eph, input, { fidelity: 'pl9' }).points.lagna?.longitude;
  const b = computePositions(eph, { ...input, jdUt: input.jdUt + 1 / 86400 }, { fidelity: 'pl9' }).points.lagna?.longitude;
  return a === undefined || b === undefined ? 0 : Math.abs(((b - a + 540) % 360) - 180) * 86400;
};
const chartAt = (eph: Ephemeris, input: ChartInput): ChartAt => {
  const p = computePositions(eph, input, { fidelity: 'pl9' }).points as Record<string, { longitude: number } | undefined>;
  return { jdUt: input.jdUt, longitude: Object.fromEntries(POINTS9.filter((k) => p[k]).map((k) => [k, p[k]!.longitude])), lagnaSpeed: lagnaSpeedAt(eph, input) };
};

/** What the core gives for one printed report (the 72 returns only when asked: they are in the 2030 set). */
export function computeVarshaphalaInputs(eph: Ephemeris, natal: ChartInput, years: number, mode: 'true' | 'mean', withReturns: boolean): VarshaphalaComputed {
  const o = { fidelity: 'pl9' } as const;
  const r = computeVarshaphalaReport(eph, natal, years, { ...o, solarReturn: mode });
  const v = r.varshaphala;
  const at = { ...natal, jdUt: v.jdUt, ...v.place };
  const c = tajikaChart(v);
  const sb = computeShadbala(eph, at, {}, o);
  const points = v.chart.points as Record<string, { longitude: number; longitudeSpeed?: number } | undefined>;
  const lagnaSign = Math.floor(c.lagna / 30);
  const lord = r.lords;
  return {
    returns: withReturns ? Array.from({ length: 72 }, (_, k) => {
      const y = k + 1;
      const vy = computeVarshaphala(eph, natal, y, o);
      return { ...chartAt(eph, { ...natal, jdUt: vy.jdUt }), years: y, yearLord: varshaphalaLords(eph, natal, vy, o)?.yearLord ?? null, munthaLongitude: vy.munthaLongitude };
    }) : [],
    year: {
      ...chartAt(eph, at),
      speed: Object.fromEntries(POINTS9.filter((k) => points[k]).map((k) => [k, points[k]!.longitudeSpeed ?? 0])),
      retrograde: c.retrograde as Record<string, boolean>, combust: c.combust as Record<string, boolean>,
      status: Object.fromEntries(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'].map((k) => [k, dignity9(k as never, c.longitude)])),
      sb: Object.fromEntries(SEVEN.map((k) => [k, sb.planets[k].ratio])),
    },
    harsha: (r.harsha ?? {}) as never,
    pancha: r.panchavargeeya as never,
    lords: lord ? {
      offices: lord.panchadhikaris as never, strength: Object.fromEntries(SEVEN.map((k) => [k, r.panchavargeeya[k].total])), yearLord: lord.yearLord,
      munthaLongitude: v.munthaLongitude!, munthaHouse: ((v.muntha! - lagnaSign + 12) % 12) + 1,
      munthaLordHouse: c.house[SIGN_LORDS[v.muntha!]!] ?? 0,
    } : null,
    yogas: r.yogas.map((y) => ({ name: y.name, present: y.present, pairs: y.planets.map((p) => p.join('-')) })),
    sahams: Object.fromEntries((r.sahams ?? []).map((s) => [s.name, { longitude: s.longitude, lord: s.lord, lagnaBound: !['Gaurava', 'Sastra', 'Jadya', 'Karyasiddhi'].includes(s.name) }])),
    dashas: Object.fromEntries(Object.entries(r.dashas).map(([k, d]) => [k, d.map((p) => ({ lord: p.lord, startJdUt: p.startJdUt, endJdUt: p.endJdUt, sub: p.sub.map((s) => ({ lord: s.lord, startJdUt: s.startJdUt, endJdUt: s.endJdUt })) }))])),
    months: r.months.map((m) => ({ ...chartAt(eph, { ...natal, jdUt: m.jdUt }), monthLord: m.monthLord, munthaLongitude: m.munthaLongitude })),
    tripataki: r.tripataki as never,
    patyayiniSlack: ((lagnaSpeedAt(eph, at) * 1.5) / 86400 / Math.max(...['lagna', ...SEVEN].map((k) => (points[k]?.longitude ?? 0) % 30))) * 365.2422,
  };
}

const two = (n: number) => String(n).padStart(2, '0');
const MONTHS_FULL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** Seconds from the Julian day epoch, and the minute PL9 prints them in. */
const secondsOf = (jd: number) => (jd - 2440587.5) * 86400;
const dayText = (jd: number) => { const d = new Date(Math.floor(secondsOf(jd)) * 1000); return `${d.getUTCDate()} ${MONTHS_FULL[d.getUTCMonth()]} ${d.getUTCFullYear()}`; };
const dashText = (jd: number) => { const d = new Date(Math.floor(secondsOf(jd) / 60) * 60000); return `${two(d.getUTCDate())}-${two(d.getUTCMonth() + 1)}-${d.getUTCFullYear()} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())}`; };
const arcSec = (a: number, b: number) => Math.abs(((a - b + 540) % 360) - 180) * 3600;
const hms = (x: string) => x.split(':').map(Number).reduce((t, v) => t * 60 + v, 0);

/**
 * One Varshaphala report against the core, at the resolution printed: names, signs and lords exactly; instants to the
 * second or minute shown, a minute either way where the core's instant is within 2 seconds of the change; degrees to
 * the second or minute shown, the Lagna (and what is counted from it) within its motion in 1.5 seconds of time; the
 * Muntha to 1″. `known` lists the differences already known for this report (keys "part" or "part name"); with
 * `returnsOnly`, only the 72 returns.
 * Not compared: Kutta and Tambira, and the annual chart's Shadbala (SB) (docs/spec/tempo/varshaphala.md).
 * The Tripataki: each cell the chakra prints, and each vedha list as a set.
 */
export function verifyVarshaphala(pl9: VarshaphalaShown['parts'], c: VarshaphalaComputed, known: readonly string[], opts: { returnsOnly?: boolean } = {}): { values: number; failures: string[]; pending: string[]; stale: string[] } {
  const failures: string[] = [], pending: string[] = [];
  let values = 0;
  const used = new Set<string>();
  const check = (what: string, ok: boolean, shown: unknown, core: unknown) => {
    values++;
    if (ok) return;
    const line = `${what}: PL9 ${shown}, core ${core}`;
    // A known difference named exactly is taken before one that names this by its start.
    const k = known.find((x) => what === x) ?? known.find((x) => what.startsWith(x + ' '));
    if (k) used.add(k);
    (k ? pending : failures).push(line);
  };
  const minuteNear = (shown: string, jd: number, text: (jd: number) => string) => text(jd) === shown || [-2, 2].some((s) => text(jd + s / 86400) === shown);
  const degNear = (shown: string, lon: number, lagnaSpeed: number, minutes: boolean) => {
    const [a, b, s = 0] = shown.split(':').map(Number);
    const deg = a! + b! / 60 + s / 3600;
    const d = Math.abs((((lon % 30) - deg + 45) % 30) - 15) * 3600;
    return d <= (minutes ? 60 : 1.5) + lagnaSpeed * 1.5 * 3600 + (minutes ? 0 : 0);
  };
  const signDeg = (shown: string, lon: number, tol: number) => {
    const [s, d] = shown.split(' ');
    const lonShown = (SIGN3.includes(s!) ? SIGN3.indexOf(s!) : SIGN_FULL.indexOf(s!)) * 30 + hms(d!) / 3600;
    return arcSec(lon, lonShown) <= tol;
  };
  // The 72 returns and the twelve months: date, time to the minute, degrees to the minute, lord, Muntha.
  const charts = (part: 'vsreturn' | 'vsmonth', list: (ChartAt & { yearLord?: string | null; monthLord?: string | null; munthaLongitude: number | null })[], lordKey: string) => {
    list.forEach((x, i) => {
      const n = i + 1, P = pl9[part];
      if (P[`${n}.date`] === undefined) return;
      check(`${part} ${n} date`, minuteNear(P[`${n}.date`]!, x.jdUt, dayText), P[`${n}.date`], dayText(x.jdUt));
      const hm = (jd: number) => { const d = new Date(Math.round(secondsOf(jd)) * 1000); return `${two(d.getUTCHours())}:${two(d.getUTCMinutes())}`; };
      check(`${part} ${n} time`, minuteNear(P[`${n}.time`]!, x.jdUt, hm), P[`${n}.time`], hm(x.jdUt));
      for (const k of POINTS9) if (P[`${n}.${k}`] && x.longitude[k] !== undefined) check(`${part} ${n} ${k}`, degNear(P[`${n}.${k}`]!, x.longitude[k]!, k === 'lagna' ? x.lagnaSpeed / 86400 : 0, true), P[`${n}.${k}`], x.longitude[k]);
      const lordValue = part === 'vsreturn' ? x.yearLord : x.monthLord;
      check(`${part} ${n} ${lordKey}`, P[`${n}.${lordKey}`] === lordValue, P[`${n}.${lordKey}`], lordValue);
      check(`${part} ${n} muntha`, x.munthaLongitude !== null && signDeg(P[`${n}.muntha`]!, x.munthaLongitude, 1.5), P[`${n}.muntha`], x.munthaLongitude);
    });
  };
  charts('vsreturn', c.returns, 'yearLord');
  // Above 120 years only the 72 returns (which depend on no date) are compared.
  const stale = () => known.filter((k) => !used.has(k));
  if (opts.returnsOnly) return { values, failures, pending, stale: stale() };
  charts('vsmonth', c.months, 'monthLord');
  // The year's return and chart.
  const Y = pl9.vsyear;
  check('year date', Y.date === dayText(c.year.jdUt), Y.date, dayText(c.year.jdUt));
  const t = secondsOf(c.year.jdUt) % 86400;
  check('year time', Math.abs(((hms(Y.time!) - t + 129600) % 86400) - 43200) <= 1.5, Y.time, t);
  const P = pl9.vsplanet;
  for (const k of [...POINTS9, 'ketu']) {
    const lon = k === 'ketu' ? (c.year.longitude.rahu! + 180) % 360 : c.year.longitude[k];
    if (lon === undefined || P[`${k}.sign`] === undefined) continue;
    check(`planet ${k} sign`, P[`${k}.sign`] === SIGN3[Math.floor(lon / 30)], P[`${k}.sign`], SIGN3[Math.floor(lon / 30)]);
    check(`planet ${k} degree`, degNear(P[`${k}.degree`]!, lon, k === 'lagna' ? c.year.lagnaSpeed / 86400 : 0, false), P[`${k}.degree`], lon % 30);
    const nak = Math.floor(lon / (40 / 3));
    check(`planet ${k} nakshatra`, P[`${k}.nakshatra`] === NAK_PRINTED[nak], P[`${k}.nakshatra`], NAK_PRINTED[nak]);
    check(`planet ${k} pada`, Number(P[`${k}.pada`]) === Math.floor(lon / (10 / 3)) % 4 + 1, P[`${k}.pada`], Math.floor(lon / (10 / 3)) % 4 + 1);
    check(`planet ${k} sign lord`, P[`${k}.signLord`] === SIGN_LORDS[Math.floor(lon / 30)], P[`${k}.signLord`], SIGN_LORDS[Math.floor(lon / 30)]);
    check(`planet ${k} nakshatra lord`, P[`${k}.nakLord`] === NAK_LORDS[nak % 9], P[`${k}.nakLord`], NAK_LORDS[nak % 9]);
    if (k === 'lagna') continue;
    const flags = `${c.year.retrograde[k] ? 'R' : ''}${c.year.combust[k] ? 'C' : ''}`;
    if (k !== 'rahu' && k !== 'ketu') check(`planet ${k} R/C`, (P[`${k}.rc`] ?? '') === flags, P[`${k}.rc`] ?? '', flags);
    if (c.year.status[k] !== undefined && P[`${k}.status`] !== undefined) check(`planet ${k} status`, P[`${k}.status`] === STATUS[c.year.status[k]!], P[`${k}.status`], STATUS[c.year.status[k]!]);
  }
  // The Tripataki: the cells the chakra prints (a point drawn over another is not printed), and each vedha list.
  for (const [key, shown] of Object.entries(pl9.vstripataki)) {
    const [kind, point] = key.split('.') as ['cell' | 'vedha', string];
    if (kind === 'cell') check(`tripataki cell ${point}`, Number(shown) === c.tripataki?.cell[point], shown, c.tripataki?.cell[point]);
    else {
      const core = c.tripataki?.vedha[point]?.join(' ');
      check(`tripataki vedha ${point}`, core !== undefined && [...shown.split(' ').filter(Boolean)].sort().join(' ') === core.split(' ').filter(Boolean).sort().join(' '), shown, core);
    }
  }
  // Harsha and Panchavargeeya.
  for (const p of SEVEN) {
    for (const [k, kk] of [['1', 'first'], ['2', 'second'], ['3', 'third'], ['4', 'fourth'], ['total', 'total']] as const) check(`harsha ${p} ${k}`, Number(pl9.vsharsha[`${p}.${k}`]) === c.harsha[p]?.[kk], pl9.vsharsha[`${p}.${k}`], c.harsha[p]?.[kk]);
    for (const k of ['graha', 'uchcha', 'hudda', 'drekkana', 'navamsha', 'total']) check(`pancha ${p} ${k}`, Math.abs(Number(pl9.vspancha[`${p}.${k}`]) - c.pancha[p]![k]!) <= 0.0051, pl9.vspancha[`${p}.${k}`], c.pancha[p]![k]!.toFixed(4));
  }
  // The office bearers, the year lord and the Muntha.
  const L = pl9.vslords;
  if (c.lords) {
    for (const [k, kk] of Object.entries(OFFICE_KEYS)) {
      check(`office ${k}`, L[`${k}.planet`] === c.lords.offices[kk], L[`${k}.planet`], c.lords.offices[kk]);
      check(`office ${k} strength`, Math.abs(Number(L[`${k}.strength`]) - c.lords.strength[c.lords.offices[kk]!]!) <= 0.0051, L[`${k}.strength`], c.lords.strength[c.lords.offices[kk]!]);
    }
    check('year lord', L.yearLord === c.lords.yearLord, L.yearLord, c.lords.yearLord);
    check('muntha', signDeg(L.munthaSign!, c.lords.munthaLongitude, 1.5), L.munthaSign, c.lords.munthaLongitude);
    check('muntha house', Number(L.munthaHouse) === c.lords.munthaHouse, L.munthaHouse, c.lords.munthaHouse);
    check('muntha lord', L.munthaLord === SIGN_LORDS[Math.floor(c.lords.munthaLongitude / 30)], L.munthaLord, SIGN_LORDS[Math.floor(c.lords.munthaLongitude / 30)]);
    check('muntha lord house', Number(L.munthaLordHouse) === c.lords.munthaLordHouse, L.munthaLordHouse, c.lords.munthaLordHouse);
  } else check('year lord', false, L.yearLord, 'none');
  // The yogas (not Kutta or Tambira).
  c.yogas.forEach((y, i) => {
    if (y.name === 'Kutta' || y.name === 'Tambira') return;
    const present = pl9.vsyoga[`${i + 1}.present`] === '1';
    check(`yoga ${y.name}`, present === y.present, present, y.present);
    const shown = new Set((pl9.vsyoga[`${i + 1}.planets`] ?? '').split(',').filter(Boolean));
    if (shown.size || y.pairs.length) check(`yoga ${y.name} planets`, shown.size === y.pairs.length && y.pairs.every((x) => shown.has(x)), [...shown].join(','), y.pairs.join(','));
  });
  // The Sahams.
  for (const name of Object.keys(pl9.vssaham).filter((k) => k.endsWith('.sign')).map((k) => k.slice(0, -5))) {
    const s = c.sahams[name];
    if (!s) { check(`saham ${name}`, false, pl9.vssaham[`${name}.sign`], 'none'); continue; }
    const tol = 1.5 + (s.lagnaBound ? c.year.lagnaSpeed * 1.5 * 3600 / 86400 : 0);
    check(`saham ${name}`, signDeg(`${pl9.vssaham[`${name}.sign`]} ${pl9.vssaham[`${name}.degree`]}`, s.longitude, tol), `${pl9.vssaham[`${name}.sign`]} ${pl9.vssaham[`${name}.degree`]}`, s.longitude);
    check(`saham ${name} lord`, pl9.vssaham[`${name}.lord`] === s.lord, pl9.vssaham[`${name}.lord`], s.lord);
  }
  // The four annual dashas: each period's lord, begin and end dates; each sub-period's lord and time (Mudda: when it
  // starts, or the return for the one running then; Patyayini: when it ends).
  const D = pl9.vsdasha;
  for (const [key, sys] of Object.entries(DASHA_KEYS)) {
    const periods = c.dashas[sys] ?? [];
    for (let i = 1; D[`${key}.${i}.lord`] !== undefined; i++) {
      const p = periods[i - 1];
      check(`${key} ${i} lord`, p?.lord === D[`${key}.${i}.lord`], D[`${key}.${i}.lord`], p?.lord);
      if (!p) continue;
      const startShown = Math.max(p.startJdUt, c.year.jdUt);
      if (D[`${key}.${i}.begin`]) check(`${key} ${i} begin`, minuteNear(D[`${key}.${i}.begin`]! + ' 00:00', startShown, (jd) => dashText(jd).slice(0, 10) + ' 00:00'), D[`${key}.${i}.begin`], dashText(startShown));
      if (D[`${key}.${i}.end`]) check(`${key} ${i} end`, minuteNear(D[`${key}.${i}.end`]! + ' 00:00', p.endJdUt, (jd) => dashText(jd).slice(0, 10) + ' 00:00'), D[`${key}.${i}.end`], dashText(p.endJdUt));
      for (let j = 1; D[`${key}.${i}.${j}.lord`] !== undefined; j++) {
        const s = p.sub[j - 1];
        check(`${key} ${i}.${j} lord`, s?.lord === D[`${key}.${i}.${j}.lord`], D[`${key}.${i}.${j}.lord`], s?.lord);
        const when = D[`${key}.${i}.${j}.start`] ?? D[`${key}.${i}.${j}.end`];
        if (!s || !when) continue;
        const at = key === 'patyayini' ? s.endJdUt : Math.max(s.startJdUt, c.year.jdUt);
        // Kalidasa's start hangs on the annual Moon, which runs 0.5″ a second: a minute either way.
        // Patyayini's dates move with the Lagna's degree: within its motion in 1.5 seconds of time.
        const near = key === 'muddaVarsha' ? [-60, 0, 60].some((d) => dashText(at + d / 86400) === when)
          : key === 'patyayini' ? Math.abs(secondsOf(at) - Date.parse(when.replace(/(\d\d)-(\d\d)-(\d{4}) /, '$3-$2-$1T') + ':00Z') / 1000) <= c.patyayiniSlack * 86400 + 60
          : minuteNear(when, at, dashText);
        check(`${key} ${i}.${j} time`, near, when, dashText(at));
      }
    }
  }
  return { values, failures, pending, stale: stale() };
}
