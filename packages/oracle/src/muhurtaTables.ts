// The Muhurta read from the TEMPO printouts by read-muhurta.py (stage 5D): pages "127. Muhurta",
// "128. Muhurta - dashas and balas" and "129. Muhurta vargas".
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Ephemeris } from '@reverse/ephemeris';
import { BY_PADA_NAAMAKSHAR, computeDashas, computeMuhurta, computePositions, type ChartInput, type DashaPeriod, type MuhurtaActivity } from '@reverse/core';

export const MUHURTA_PARTS = ['muchart', 'muplanet', 'mukaksha', 'mugochara', 'mudasha', 'mubala', 'muthermo'] as const;
export type MuhurtaPart = (typeof MUHURTA_PARTS)[number];

const POINT = '(?:lagna|sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu)';
const PLANET9 = '(?:sun|moon|mars|mercury|jupiter|venus|saturn|rahu|ketu)';
const PLANET7 = '(?:sun|moon|mars|mercury|jupiter|venus|saturn)';
const SIGN = '(?:Ari|Tau|Gem|Can|Leo|Vir|Lib|Sco|Sag|Cap|Aqu|Pis)';
const GLYPH = '[`a-i]';
const any = /^.+$/;

/** For each part, the keys it may hold, each with the form of its value. */
const RULES: Record<MuhurtaPart, [RegExp, RegExp][]> = {
  muchart: [[new RegExp(`^(D1|D9|D10|D16|D24|D60)\\.(?:${POINT.slice(3, -1)}|mandi|bp|em)$`), new RegExp(`^${SIGN}$`)]],
  muplanet: [
    [new RegExp(`^${POINT}\\.degree$`), /^\d\d:\d\d:\d\d$/], [new RegExp(`^${POINT}\\.sign$`), new RegExp(`^${SIGN}$`)],
    [new RegExp(`^${POINT}\\.rc$`), /^(R|c|Rc|cR)$/], [new RegExp(`^${POINT}\\.(nakshatra|syllable)$`), any],
    [new RegExp(`^${PLANET9}\\.(dignity|avastha)$`), /^[A-Z][A-Za-z.]+$/], [new RegExp(`^${PLANET9}\\.sbRatio$`), /^\d+\.\d\d$/],
    [new RegExp(`^${PLANET9}\\.(sbCount|vb)$`), /^\d+$/],
  ],
  mukaksha: [
    [new RegExp(`^${PLANET7}\\.sign$`), new RegExp(`^${SIGN}$`)], [new RegExp(`^${PLANET7}\\.(kaksha|ash|sarva)$`), /^\d+$/],
    [new RegExp(`^${PLANET7}\\.lord$`), new RegExp(`^${POINT}$`)],
  ],
  mugochara: [
    [/^date$/, /^[A-Z][a-z]{2} \d{1,2} [A-Z][a-z]{2} \d{4} {1,2}\d\d:\d\d:\d\d$/],
    [/^(tarabala|chandrabala|tithi|karana|yoga)$/, any], [/^(vimshottari|narayana|yogini|ashtottari)$/, /^[A-Z][a-z](-[A-Z][a-z])*$/],
  ],
  mudasha: [
    [/^(muhurta2|native4|muhurta4)\.\d+\.chain$/, new RegExp(`^${GLYPH}(-${GLYPH})*$`)],
    [/^(muhurta2|native4|muhurta4)\.\d+\.day$/, /^(Sun|Mon|Tue|Wed|Thu|Fri|Sat)$/], [/^(muhurta2|native4|muhurta4)\.\d+\.date$/, /^\d\d-\d\d-\d{4}$/],
  ],
  mubala: [[new RegExp(`^house\\.${SIGN}$`), /^\d+\.\d\d$/], [new RegExp(`^vimshopaka\\.${PLANET7}$`), /^\d+\.\d$/]],
  muthermo: [[/^activity$/, /^[A-Za-z][A-Za-z ]+$/], [/^level$/, /^(0\.\d{4}|1\.0000)$/]],
};

export interface MuhurtaShown {
  chart: string;
  parts: Record<MuhurtaPart, Record<string, string>>;
}

export function parseMuhurta(text: string): MuhurtaShown {
  const out: MuhurtaShown = { chart: '', parts: Object.fromEntries(MUHURTA_PARTS.map((p) => [p, {}])) as MuhurtaShown['parts'] };
  text.split(/\r?\n/).forEach((line, i) => {
    if (!line.trim()) return;
    const f = line.split('\t');
    const fail = (): never => { throw new Error(`line ${i + 1}: "${line}" is not a Muhurta line`); };
    if (f[0] === 'chart' && f.length === 2) { out.chart = f[1]!; return; }
    if (f.length !== 3 || !(MUHURTA_PARTS as readonly string[]).includes(f[0]!)) fail();
    const part = f[0] as MuhurtaPart;
    const rule = RULES[part].find(([k]) => k.test(f[1]!));
    if (!rule || !rule[1].test(f[2]!)) fail();
    out.parts[part][f[1]!] = f[2]!;
  });
  return out;
}

/** The reference date of the Muhurta event, or the thermometer's activity of an option printout. */
export type MuhurtaSet = '2000' | '2030' | `activity-${string}`;

export interface MuhurtaFixture {
  id: string;
  set: MuhurtaSet;
  pl9: MuhurtaShown['parts'];
  provenance: { program: string; method: string; charts: string; extractedOn: string };
}

export function loadMuhurtaFixtures(dir: string): MuhurtaFixture[] {
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as MuhurtaFixture);
}

// ---- The check: what the core computes for one printout, and its comparison ----

const GLYPH_OF: Record<string, string> = { '`': 'lagna', a: 'sun', b: 'moon', c: 'mars', d: 'mercury', e: 'jupiter', f: 'venus', g: 'saturn', h: 'rahu', i: 'ketu' };
const POINT_NAMES = new Set(Object.values(GLYPH_OF));
const SIGNS3 = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
const DIGNITY = ['', 'Exalt.', 'Moolt.', 'Own', 'Grt.Fr.', 'Frnd.', 'Neutr.', 'Enemy', 'Grt.En.', 'Debil.'];
const AVASTHA: Record<string, string> = { infant: 'Infant', youth: 'Youth.', adolescent: 'Adoles.', old: 'Old', dead: 'Dead' };
const ACTIVITY: Record<string, MuhurtaActivity> = { 'General Auspicious Events': 'general', General: 'general', Travelling: 'travelling', Marriage: 'marriage', marriage: 'marriage' };
const PLANETS9 = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
const NAKSHATRA_PREFIX = ['ashw', 'bhar', 'krit', 'rohi', 'mrig', 'ardr', 'puna', 'push', 'ashl', 'magh', 'p.ph', 'u.ph', 'hast', 'chit', 'swat', 'vish', 'anur', 'jyes', 'mool', 'p.sh', 'u.sh', 'shra', 'dhan', 'shat', 'p.bh', 'u.bh', 'reva'];

/** The differences known in every printout: none since the nodes' VB is rated as PL9's time pages rate it. */
export const KNOWN_MUHURTA_PENDING: readonly string[] = [];

/**
 * The Muhurta event of the print jobs, at Jaipur: the TEMPO jobs at the reference dates, 12:00 (2000) or 06:00 (2030)
 * Jaipur time; the thermometer's activities on 2 July 2030, 12:00, a day when the three activities' marks differ.
 */
export const MUHURTA_AT: Record<MuhurtaInstant, ChartInput> = {
  2000: { jdUt: 2451544.5 + 6.5 / 24, latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 },
  2030: { jdUt: 2462667.5 + 0.5 / 24, latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 },
  '2030-07-02': { jdUt: 2462684.5 + 6.5 / 24, latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 },
};
export type MuhurtaInstant = '2000' | '2030' | '2030-07-02';

interface Period { chain: string; start: number }
export interface MuhurtaComputed {
  at: ChartInput;
  /** Longitudes of the Lagna and the nine planets, and the Lagna's motion in seconds of arc per second of time. */
  points: Record<string, number>;
  lagnaSpeed: number;
  planets: Record<string, { rc: string; dignity: number; sbRatio: number | null; sbStrong: number | null; vimshopaka: number; avastha: string }>;
  /** The sign (Aries 0) of each point in each chart drawn. */
  charts: Record<string, Record<string, number>>;
  kakshas: Record<string, { sign: number; bindu: number; lord: string; ash: number; sarva: number }> | null;
  gochara: { tarabala: string; chandrabala: number; chandrabalaGood: boolean; tithi: string; karana: string; yoga: string; dashas: Record<string, string | null> | null };
  /** The level-2 and level-4 periods of the Muhurta's Vimshottari, and the native's level-4 periods. */
  dashas: { muhurta2: Period[]; muhurta4: Period[]; native4: Period[] };
  /** The clocks the lists are printed in: the Muhurta's, and the native's (hours ahead of UT). */
  clocks: { muhurta: number; native: number };
  bhava: Record<string, number>;
  thermometer: { activity: MuhurtaActivity; level: number };
}

const flatten = (periods: readonly DashaPeriod[], level: number, chain = ''): Period[] =>
  periods.flatMap((p) => {
    const c = chain ? `${chain}-${String(p.lord)}` : String(p.lord);
    return p.level === level ? [{ chain: c, start: p.start }] : flatten(p.sub ?? [], level, c);
  });

/** What the core gives for one printout: the Muhurta at the set's instant for the native, with the activity printed. */
export function computeMuhurtaInputs(eph: Ephemeris, natal: ChartInput, set: MuhurtaInstant, activity: MuhurtaActivity): MuhurtaComputed {
  const o = { fidelity: 'pl9' } as const;
  const at = MUHURTA_AT[set];
  const m = computeMuhurta(eph, natal, at, { ...o, activity });
  const after = computePositions(eph, { ...at, jdUt: at.jdUt + 1 / 86400 }, o).points.lagna?.longitude;
  const sign = (l: number) => Math.floor((((l % 360) + 360) % 360) / 30);
  const native = computeDashas(eph, natal, { system: 'vimshottari', levels: 4, cycles: 2 }, o).periods;
  const own = m.muhurtaDasha;
  return {
    at,
    points: Object.fromEntries(Object.entries(m.points).map(([k, p]) => [k, p!.longitude])),
    lagnaSpeed: m.points.lagna && after !== undefined ? Math.abs(((after - m.points.lagna.longitude + 540) % 360) - 180) * 3600 : 0,
    planets: Object.fromEntries(PLANETS9.map((p) => [p, {
      rc: `${m.planets[p].retrograde && p !== 'rahu' && p !== 'ketu' ? 'R' : ''}${m.planets[p].combust ? 'c' : ''}`, dignity: m.planets[p].dignity,
      sbRatio: m.planets[p].shadbalaRatio, sbStrong: m.planets[p].shadbalaStrong, vimshopaka: m.planets[p].vimshopaka.shadvarga, avastha: m.planets[p].avastha,
    }])),
    charts: {
      D1: Object.fromEntries(Object.entries(m.points).map(([k, p]) => [k, sign(p!.longitude)])),
      ...Object.fromEntries(Object.entries(m.vargas).map(([v, s]) => [v, s as Record<string, number>])),
    },
    kakshas: m.kakshas && Object.fromEntries(Object.entries(m.kakshas).map(([k, r]) => [k, { sign: r.sign, bindu: r.bindu, lord: String(r.lord), ash: r.ash, sarva: r.sarva }])),
    gochara: {
      tarabala: m.gochara.tarabala.name, chandrabala: m.gochara.chandrabala.house, chandrabalaGood: m.gochara.chandrabala.good,
      tithi: m.gochara.tithi.name, karana: m.gochara.karana.name, yoga: m.gochara.yoga.name, dashas: m.gochara.dashas,
    },
    dashas: { muhurta2: flatten(own, 2), muhurta4: flatten(own, 4), native4: flatten(native, 4) },
    clocks: { muhurta: at.utcOffsetHours ?? 0, native: natal.utcOffsetHours ?? 0 },
    bhava: Object.fromEntries((m.bhavaBala ?? []).map((h) => [SIGNS3[h.sign]!, h.total])),
    thermometer: { activity, level: m.thermometer.level },
  };
}

/**
 * A printed date "dd-mm-yyyy" against an instant in a clock (hours ahead of UT); a start within 15 seconds of midnight
 * may be printed on either day (REF 0012: 10 s before midnight, printed the next day).
 */
const sameDay = (shown: string, jdUt: number, h: number) => [-15, 0, 15].some((sec) => {
  const d = new Date(Math.floor((jdUt + sec / 86400 - 2440587.5 + h / 24) * 86400) * 1000);
  return shown === `${String(d.getUTCDate()).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${d.getUTCFullYear()}`;
});

/**
 * One Muhurta printout against the core: names, signs and whole numbers exactly; degrees to the second shown (the
 * Lagna within its motion in 1.5 seconds of time); Shadbala ratios, Vimshopaka and the Bhava Bala to the decimals
 * shown, the VB column to the unit; the thermometer's filled share to 0.003; period starts on the day shown. `known`
 * lists the differences already known for this printout. Not compared: Mandi, "BP" and "eM" in the drawings, and the
 * texts.
 */
export function verifyMuhurta(pl9: MuhurtaShown['parts'], c: MuhurtaComputed, known: readonly string[], opts: { someLists?: boolean } = {}): { values: number; failures: string[]; pending: string[] } {
  const failures: string[] = [], pending: string[] = [];
  let values = 0;
  const check = (what: string, ok: boolean, shown: unknown, core: unknown) => {
    values++;
    if (ok) return;
    (known.some((k) => what === k || what.startsWith(k + ' ')) ? pending : failures).push(`${what}: PL9 ${String(shown)}, core ${String(core)}`);
  };
  const secs = (s: string) => s.split(':').map(Number).reduce((t, v) => t * 60 + v, 0);
  for (const [key, shown] of Object.entries(pl9.muplanet)) {
    const [p, f] = key.split('.') as [string, string];
    const lon = c.points[p];
    const q = c.planets[p];
    if (f === 'degree') {
      const d = lon === undefined ? NaN : (((lon % 30) + 30) % 30) * 3600;
      const tol = p === 'lagna' ? 1 + c.lagnaSpeed * 1.5 : 1;
      check(`planet ${p} degree`, Math.abs(Math.floor(d + 1e-6) - secs(shown)) <= tol, shown, d / 3600);
    } else if (f === 'sign') check(`planet ${p} sign`, lon !== undefined && SIGNS3[Math.floor(lon / 30)] === shown, shown, lon);
    else if (f === 'nakshatra') check(`planet ${p} nakshatra`, lon !== undefined && NAKSHATRA_PREFIX[Math.floor(lon / (40 / 3))] === shown.slice(0, 4).toLowerCase(), shown, lon);
    else if (f === 'syllable') {
      const s = lon === undefined ? undefined : BY_PADA_NAAMAKSHAR[Math.floor(lon / (10 / 3))];
      if (s) check(`planet ${p} syllable`, s === shown, shown, s);
    } else if (f === 'rc') check(`planet ${p} R/C`, q?.rc === shown, shown, q?.rc);
    else if (f === 'dignity') check(`planet ${p} dignity`, DIGNITY[q!.dignity] === shown, shown, DIGNITY[q!.dignity]);
    else if (f === 'sbRatio') check(`planet ${p} SB%`, q!.sbRatio !== null && Math.abs(q!.sbRatio - Number(shown)) <= 0.0051, shown, q!.sbRatio);
    else if (f === 'sbCount') check(`planet ${p} SB#`, q!.sbStrong === Number(shown), shown, q!.sbStrong);
    else if (f === 'vb') check(`vb ${p}`, Math.abs(q!.vimshopaka - Number(shown)) <= 0.5001, shown, q!.vimshopaka);
    else if (f === 'avastha') check(`planet ${p} avastha`, AVASTHA[q!.avastha] === shown, shown, q!.avastha);
  }
  // A planet with no R/C printed is one the core finds neither retrograde nor combust.
  for (const p of PLANETS9) if (pl9.muplanet[`${p}.rc`] === undefined && pl9.muplanet[`${p}.degree`] !== undefined) check(`planet ${p} R/C`, !c.planets[p]!.rc, '', c.planets[p]!.rc);
  for (const [key, shown] of Object.entries(pl9.muchart)) {
    const [v, p] = key.split('.') as [string, string];
    if (!POINT_NAMES.has(p)) continue;
    const s = c.charts[v]?.[p];
    check(`chart ${v} ${p}`, s !== undefined && SIGNS3[s] === shown, shown, s === undefined ? 'none' : SIGNS3[s]);
  }
  for (const [key, shown] of Object.entries(pl9.mukaksha)) {
    const [p, f] = key.split('.') as [string, string];
    const k = c.kakshas?.[p];
    const core = k === undefined ? undefined : f === 'sign' ? SIGNS3[k.sign] : f === 'kaksha' ? String(k.bindu) : String(k[f as 'lord' | 'ash' | 'sarva']);
    check(`kaksha ${p} ${f}`, core === shown, shown, core);
  }
  const g = pl9.mugochara;
  const first = (s: string | undefined) => (s ?? '').split(/[: (]/)[0]!.replace('Visthi', 'Vishti');
  check('gochara tarabala', first(g.tarabala) === c.gochara.tarabala, g.tarabala, c.gochara.tarabala);
  check('gochara chandrabala', g.chandrabala === `${c.gochara.chandrabala} ${c.gochara.chandrabalaGood ? 'Auspicious' : 'Inauspicious'}`, g.chandrabala, c.gochara.chandrabala);
  check('gochara tithi', g.tithi === c.gochara.tithi, g.tithi, c.gochara.tithi);
  check('gochara karana', first(g.karana) === c.gochara.karana, g.karana, c.gochara.karana);
  check('gochara yoga', first(g.yoga) === c.gochara.yoga, g.yoga, c.gochara.yoga);
  for (const s of ['vimshottari', 'narayana', 'yogini', 'ashtottari'] as const) check(`gochara ${s}`, g[s] === c.gochara.dashas?.[s], g[s], c.gochara.dashas?.[s]);
  // The lists start at the period running at the print job's clock (or the first, if it starts later): from the first row.
  for (const list of ['muhurta2', 'muhurta4', 'native4'] as const) {
    const rows = Object.keys(pl9.mudasha).filter((k) => k.startsWith(`${list}.`) && k.endsWith('.chain')).length;
    // The TEMPO printouts give the three lists; the Muhurta worksheet printed alone (`someLists`) only some.
    if (!rows) { if (!opts.someLists) check(`dasha ${list}`, false, 'none', 'a list'); continue; }
    const chainOf = (i: number) => pl9.mudasha[`${list}.${i}.chain`]!.split('-').map((x) => GLYPH_OF[x]).join('-');
    const core = c.dashas[list];
    // The Muhurta's lists in the Muhurta's clock, the native's in the native's (from the printouts).
    const clock = list === 'native4' ? c.clocks.native : c.clocks.muhurta;
    const from = core.findIndex((p) => p.chain === chainOf(1) && sameDay(pl9.mudasha[`${list}.1.date`]!, p.start, clock));
    for (let i = 1; i <= rows; i++) {
      const p = from < 0 ? undefined : core[from + i - 1];
      const date = pl9.mudasha[`${list}.${i}.date`]!;
      check(`dasha ${list} ${i}`, p !== undefined && p.chain === chainOf(i) && sameDay(date, p.start, clock), `${chainOf(i)} ${date}`, p && `${p.chain} ${p.start}`);
    }
  }
  for (const [key, shown] of Object.entries(pl9.mubala)) {
    const [kind, name] = key.split('.') as [string, string];
    if (kind === 'house') check(`bhava ${name}`, c.bhava[name] !== undefined && Math.abs(c.bhava[name] - Number(shown)) <= 0.0051, shown, c.bhava[name]);
    else check(`vimshopaka ${name}`, Math.abs(c.planets[name]!.vimshopaka - Number(shown)) <= 0.0501, shown, c.planets[name]!.vimshopaka);
  }
  check('thermometer activity', ACTIVITY[pl9.muthermo.activity!] === c.thermometer.activity, pl9.muthermo.activity, c.thermometer.activity);
  check('thermometer level', Math.abs(Number(pl9.muthermo.level) - c.thermometer.level) <= 0.003, pl9.muthermo.level, c.thermometer.level.toFixed(4));
  return { values, failures, pending };
}
