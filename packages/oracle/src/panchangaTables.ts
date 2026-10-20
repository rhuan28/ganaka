// The panchanga read from the TEMPO printouts by read-panchanga.py (stage 5B): the birth pages and the
// Tithi Pravesh instants; and the Print -> Panchang printouts read by read-panchang.py.
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/** The keys of the birth fields, as read-panchanga.py writes them. */
export const BIRTH_FIELDS = [
  'lagnaSign', 'moonSign', 'birthNakshatra', 'charana', 'firstSyllable', 'rashiPaya', 'nakshatraPaya', 'varna', 'vashya', 'nadi', 'yoni',
  'gana', 'birthTithi', 'birthYoga', 'birthKarana', 'westernWeekday', 'astrologicalWeekday', 'ghatMonth', 'ghatTithi', 'ghatDay',
  'ghatNakshatra', 'ghatYoga', 'ghatKarana', 'ghatPrahar', 'ghatChandra', 'ishtkaal', 'lmtCorrection', 'lmt', 'siderealTime',
  'westernSunSign', 'rashish', 'varga', 'yunja', 'tatva', 'naamakshar', 'tamilYear', 'tamilMonth', 'tamilWeekday', 'tamilDate',
  'samvatChaitradi', 'monthChaitradi', 'samvatKartikadi', 'monthKartikadi', 'saka', 'ayana', 'season', 'paksha', 'hinduWeekday',
  'tithiAtSunrise', 'tithiEnd', 'tithiEndGhatis', 'tithiAtBirth', 'nakAtSunrise', 'nakEnd', 'nakEndGhatis', 'nakAtBirth',
  'yogaAtSunrise', 'yogaEnd', 'yogaEndGhatis', 'yogaAtBirth', 'karanaAtSunrise', 'karanaEnd', 'karanaEndGhatis', 'karanaAtBirth',
  'sunrise', 'sunriseDegree', 'sunset', 'sunsetDegree', 'nextSunrise', 'moonNakEntry', 'moonNakExit', 'bhayat', 'bhabhog',
] as const;
export type BirthField = (typeof BIRTH_FIELDS)[number];

export interface PanchangaShown {
  chart: string;
  birth: Partial<Record<BirthField, string>>;
  /** The instants in the titles of the Tithi Pravesh worksheets, at the birth place and at the local place. */
  tithiPravesh: Partial<Record<'natal' | 'local', string>>;
}

export function parsePanchanga(text: string): PanchangaShown {
  const out: PanchangaShown = { chart: '', birth: {}, tithiPravesh: {} };
  text.split('\n').forEach((line, i) => {
    if (!line.trim()) return;
    const f = line.split('\t');
    const fail = (): never => { throw new Error(`line ${i + 1}: "${line}" is not a panchanga line`); };
    if (f[0] === 'chart') out.chart = f[1] ?? fail();
    else if (f[0] === 'pcbirth' && (BIRTH_FIELDS as readonly string[]).includes(f[1]!) && f.length === 3) out.birth[f[1] as BirthField] = f[2]!;
    else if (f[0] === 'pctp' && (f[1] === 'natal' || f[1] === 'local') && /^\d{1,2} \w{3} \d{4} \d\d:\d\d(:\d\d)?$/.test(f[2] ?? '')) out.tithiPravesh[f[1]] = f[2]!;
    else fail();
  });
  return out;
}

export interface PanchangaFixture {
  id: string;
  pl9: Omit<PanchangaShown, 'chart'>;
  provenance: { program: string; method: string; charts: string; extractedOn: string };
}

export function loadPanchangaFixtures(dir: string): PanchangaFixture[] {
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as PanchangaFixture);
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const secs = (hms: string) => { const [h, m, s] = hms.split(':').map(Number); return h! * 3600 + m! * 60 + s!; };
const palas = (g: string) => { const [a, b, c] = g.split(':').map(Number); return (a! * 60 + b!) * 60 + c!; };

/**
 * The birth values known to differ from PL9's, by chart: the Vedic weekday (PL9's rule not found; the core's gives 118
 * of 135), the Chaitradi month next to a full Moon or a sign change (PL9's new and full Moons are approximate), and
 * the sunsets and next sunrise where PL9's search lands on another crossing (docs/spec/time/panchanga.md).
 */
const WEEKDAY: readonly BirthField[] = ['hinduWeekday', 'astrologicalWeekday'];
export const KNOWN_BIRTH_PENDING: Readonly<Record<string, readonly BirthField[]>> = {
  'ref-0009': ['monthChaitradi'], 'ref-0010': WEEKDAY, 'ref-0013': [...WEEKDAY, 'sunset'], 'ref-0038': WEEKDAY, 'ref-0040': WEEKDAY,
  'ref-0041': WEEKDAY, 'ref-0042': WEEKDAY, 'ref-0043': WEEKDAY, 'ref-0051': WEEKDAY, 'ref-0058': WEEKDAY, 'ref-0061': WEEKDAY,
  'ref-0075': WEEKDAY, 'ref-0082': WEEKDAY, 'ref-0124': ['nextSunrise'], 'ref-0151': WEEKDAY, 'ref-0208': ['sunset'],
  'ref-0273': ['monthChaitradi'], 'ref-0274': [...WEEKDAY, 'monthChaitradi'], 'ref-0286': WEEKDAY, 'ref-0288': WEEKDAY,
  'ref-0289': ['sunset'], 'ref-0291': WEEKDAY, 'ref-0377': ['monthChaitradi'],
};

/** What the birth check needs of the core's birth panchanga (structurally typed, so the oracle keeps its own types). */
export interface BirthPanchangaLike {
  sunrise: number; sunset: number; nextSunrise: number; vara: number; paksha: string;
  now: Record<'tithi' | 'karana' | 'yoga' | 'nakshatra', { name: string }>;
  atSunrise: Record<'tithi' | 'karana' | 'yoga' | 'nakshatra', { name: string; endJdUt: number }>;
  ishtkaalDays: number; moonNakEntry: number; moonNakExit: number; lmtCorrectionHours: number; lmtHours: number; siderealTimeHours: number;
  season: string; ayana: string; gola: string; chaitradi: { name: string; samvat: number }; kartikadi: { name: string; samvat: number }; saka: number;
  avakhada: Record<string, string | null>; ghat: Record<string, string | null>;
}

/**
 * The birth pages against the core: the names and numbers exactly; the sunrise to the second; the sunset, the next
 * sunrise and the ends of the elements to a second either way (PL9's searches stop short of the exact moment); the
 * ghatis to three palas (about a second). The Tamil calendar is not compared (PL9 reads it from a table of its own).
 */
export function verifyBirthPanchanga(b: Partial<Record<BirthField, string>>, p: BirthPanchangaLike, fmt: { clock: (jd: number) => string; ghatis: (days: number) => string; date: (jd: number) => string }, birthJdUt: number, birthWeekday: number, known: readonly BirthField[] = []): { values: number; failures: string[]; pending: string[]; stale: string[] } {
  const failures: string[] = [];
  const pending: string[] = [];
  let values = 0;
  const eq = (field: BirthField, core: string | number | null | undefined) => {
    values++;
    if (String(core) !== b[field]) failures.push(`${field}: PL9 ${b[field]}, core ${core}`);
  };
  const near = (field: BirthField, core: string, slack: number, parse: (x: string) => number, modulo: number) => {
    values++;
    const shown = b[field]!.replace(/^\w{3} /, '');
    let d = Math.abs(parse(shown) - parse(core));
    d = Math.min(d, modulo - d);
    if (!(d <= slack)) failures.push(`${field}: PL9 ${b[field]}, core ${core}`);
  };
  const dateSeconds = (x: string) => Date.parse(x.replace(/\s+/g, ' ') + ' UTC') / 1000;
  eq('sunrise', fmt.clock(p.sunrise));
  near('sunset', fmt.clock(p.sunset), 1, secs, 86400);
  near('nextSunrise', fmt.clock(p.nextSunrise), 1, secs, 86400);
  const rows = [['tithi', 'tithiAtSunrise', 'tithiEnd', 'tithiEndGhatis', 'tithiAtBirth'], ['karana', 'karanaAtSunrise', 'karanaEnd', 'karanaEndGhatis', 'karanaAtBirth'],
    ['yoga', 'yogaAtSunrise', 'yogaEnd', 'yogaEndGhatis', 'yogaAtBirth'], ['nakshatra', 'nakAtSunrise', 'nakEnd', 'nakEndGhatis', 'nakAtBirth']] as const;
  for (const [k, at, end, gh, now] of rows) {
    eq(at, p.atSunrise[k].name);
    near(end, fmt.clock(p.atSunrise[k].endJdUt), 1, secs, 86400);
    let g = p.atSunrise[k].endJdUt - p.sunrise;
    if (g < 0) g += 1;
    near(gh, fmt.ghatis(g), 3, palas, 1e9);
    eq(now, p.now[k].name);
  }
  eq('birthTithi', p.now.tithi.name); eq('birthYoga', p.now.yoga.name); eq('birthKarana', p.now.karana.name);
  near('ishtkaal', fmt.ghatis(p.ishtkaalDays), 3, palas, 1e9);
  near('moonNakEntry', fmt.date(p.moonNakEntry), 1, dateSeconds, 1e12);
  near('moonNakExit', fmt.date(p.moonNakExit), 1, dateSeconds, 1e12);
  near('bhayat', fmt.ghatis(birthJdUt - p.moonNakEntry), 3, palas, 1e9);
  near('bhabhog', fmt.ghatis(p.moonNakExit - p.moonNakEntry), 3, palas, 1e9);
  const hours = (h: number) => {
    const t = Math.round(Math.abs(h) * 3600);
    return `${h < 0 ? '-' : ''}${String(Math.floor(t / 3600)).padStart(2, '0')}:${String(Math.floor(t / 60) % 60).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  };
  const signedSecs = (x: string) => (x.startsWith('-') ? -secs(x.slice(1)) : secs(x));
  // PL9 loses the carry when the seconds round up to 60 at an exact minute (4.6 hours, 69 degrees of longitude, prints
  // "04:35:00"): a minute short, with ":00" printed, is the same value.
  const clockNear = (field: BirthField, core: string, modulo: number) => {
    values++;
    let d = Math.abs(signedSecs(b[field]!) - signedSecs(core));
    d = Math.min(d, modulo - d);
    if (!(d <= 1 || (d === 60 && b[field]!.endsWith(':00')))) failures.push(`${field}: PL9 ${b[field]}, core ${core}`);
  };
  clockNear('lmtCorrection', hours(p.lmtCorrectionHours), 1e9);
  clockNear('lmt', hours(p.lmtHours), 86400);
  clockNear('siderealTime', hours(p.siderealTimeHours), 1e9);
  eq('season', p.season); eq('ayana', `${p.ayana}/${p.gola}`); eq('paksha', p.paksha === 'shukla' ? 'Shukla' : 'Krishna');
  eq('hinduWeekday', WEEKDAYS[p.vara]); eq('westernWeekday', WEEKDAYS[birthWeekday]); eq('astrologicalWeekday', WEEKDAYS[p.vara]);
  eq('monthChaitradi', p.chaitradi.name); eq('samvatChaitradi', p.chaitradi.samvat); eq('monthKartikadi', p.kartikadi.name); eq('samvatKartikadi', p.kartikadi.samvat);
  eq('saka', p.saka);
  const avakhada = [['varna', 'varna'], ['vashya', 'vashya'], ['yoni', 'yoni'], ['gana', 'gana'], ['nadi', 'nadi'], ['yunja', 'yunja'], ['tatva', 'tatva'], ['rashish', 'rashish'],
    ['naamakshar', 'naamakshar'], ['varga', 'varga'], ['nakshatraPaya', 'nakshatraPaya'], ['rashiPaya', 'rashiPaya']] as const;
  for (const [field, key] of avakhada) {
    if (p.avakhada[key] === null) continue; // a pada no reference chart showed
    eq(field, p.avakhada[key]);
  }
  const ghat = [['ghatMonth', 'month'], ['ghatTithi', 'tithi'], ['ghatDay', 'day'], ['ghatNakshatra', 'nakshatra'], ['ghatYoga', 'yoga'], ['ghatKarana', 'karana'], ['ghatPrahar', 'prahar'], ['ghatChandra', 'chandra']] as const;
  for (const [field, key] of ghat) eq(field, p.ghat[key]);
  // Known differences of this chart (KNOWN_BIRTH_PENDING), kept apart; any other difference fails.
  for (let i = failures.length - 1; i >= 0; i--) {
    if (known.includes(failures[i]!.split(':')[0] as BirthField)) pending.push(...failures.splice(i, 1));
  }
  // A known difference that no longer happens: the bench fails it, to be taken out of the list.
  const stale = known.filter((k) => !pending.some((x) => x.split(':')[0] === k));
  return { values, failures, pending, stale };
}

/** A Print -> Panchang printout as read-panchang.py writes it. */
export interface PanchangPrintout {
  header: { month: string; paksha: string; vikram: number; saka: number; from: string; ratriman: string; ayanamsha: string };
  days: Record<'tithi' | 'tithiEnd' | 'vaar' | 'nakshatra' | 'nakEnd' | 'yoga' | 'yogaEnd' | 'karana' | 'karanaEnd' | 'dinman' | 'sunrise' | 'sunset' | 'moonrise' | 'moonset' | 'date' | 'transits' | 'ausp', string>[];
  extraTithis: { afterDate: string; tithi: string; tithiEnd: string }[];
  lagna: Record<string, string>[];
  provenance: { program: string; method: string; source: string; extractedOn: string };
}

export type PanchangMode = 'krishnadi' | 'shukladi' | 'krishnadiHalf';

/** The printouts of fixtures-panchanga/panchang/, named <yyyy-mm>-<calendar mode>.json. */
export function loadPanchangPrintouts(dir: string): { name: string; mode: PanchangMode; shown: PanchangPrintout }[] {
  return readdirSync(dir).filter((f) => f.endsWith('.json')).sort().map((f) => {
    const mode: PanchangMode = f.endsWith('-krishnadi-half.json') ? 'krishnadiHalf' : f.endsWith('-shukladi.json') ? 'shukladi' : 'krishnadi';
    return { name: f.replace(/\.json$/, ''), mode, shown: JSON.parse(readFileSync(join(dir, f), 'utf8')) as PanchangPrintout };
  });
}

/** What the printout check needs of the core's Panchang table (structurally typed). */
export interface PanchangTableLike {
  month: { name: string; paksha: string }; vikram: number; saka: number; ayanamshaDegrees: number;
  rows: { year: number; month: number; day: number; sunrise: number; sunset: number; nextSunrise: number; vara: number;
    atSunrise: Record<'tithi' | 'karana' | 'yoga' | 'nakshatra', { name: string; endJdUt: number }>;
    extraTithi: { name: string; endJdUt: number } | null }[];
}

/**
 * A Panchang printout against the core, row by row: the date, weekday and names exactly (the tithi without its
 * fortnight, printed only where it changes); the sunrise to the second; the sunset, the ends and the length of the day
 * to a second either way; an end past the next sunrise is printed "..."; the header's month, fortnight and years
 * exactly and the ayanamsha to a second of arc. Not compared: the Moon's rising and setting, the transits and the
 * auspicious mark, the length of the night and the Lagna table (docs/spec/time/panchanga.md).
 */
export function verifyPanchangPrintout(shown: PanchangPrintout, t: PanchangTableLike, utcOffsetHours: number): { values: number; failures: string[]; pending: string[] } {
  const failures: string[] = [];
  const pending: string[] = [];
  let values = 0;
  const check = (what: string, ok: boolean, pl9: string, core: string) => {
    values++;
    if (!ok) failures.push(`${what}: PL9 ${pl9}, core ${core}`);
  };
  const bare = (tithi: string) => tithi.replace(/^(Shukla|Krishna) /, '');
  const h = shown.header;
  check('month', h.month === t.month.name, h.month, t.month.name);
  check('paksha', h.paksha.toLowerCase() === t.month.paksha, h.paksha, t.month.paksha);
  check('vikram', h.vikram === t.vikram, String(h.vikram), String(t.vikram));
  check('saka', h.saka === t.saka, String(h.saka), String(t.saka));
  const [ad, am, as] = h.ayanamsha.split(' ')[1]!.replace(/^-/, '').split(':').map(Number);
  const ayanamsha = ad! + am! / 60 + as! / 3600;
  check('ayanamsha', Math.abs(ayanamsha - t.ayanamshaDegrees) * 3600 <= 1, h.ayanamsha, `${t.ayanamshaDegrees.toFixed(5)} degrees`);
  shown.days.forEach((d, i) => {
    const r = t.rows[i];
    const date = r ? `${String(r.day).padStart(2, '0')}-${String(r.month).padStart(2, '0')}-${r.year}` : 'none';
    check(`${d.date} date`, d.date === date, d.date, date);
    if (!r) return;
    const midnight = Date.UTC(r.year, r.month - 1, r.day) / 86400000 + 2440587.5 - utcOffsetHours / 24;
    const since = (jd: number) => Math.round((jd - midnight) * 86400);
    const near = (what: string, pl9: string, jd: number) => check(`${d.date} ${what}`, Math.abs(secs(pl9) - since(jd)) <= 1, pl9, `${since(jd)} s`);
    check(`${d.date} sunrise`, secs(d.sunrise) === since(r.sunrise), d.sunrise, `${since(r.sunrise)} s`);
    near('sunset', d.sunset, r.sunset);
    const length = since(r.sunset) - since(r.sunrise);
    check(`${d.date} dinman`, Math.abs(secs(d.dinman) - length) <= 1, d.dinman, `${length} s`);
    const weekday = WEEKDAYS[r.vara]!.slice(0, 3);
    check(`${d.date} vaar`, d.vaar === weekday, d.vaar, weekday);
    const names = { tithi: bare(r.atSunrise.tithi.name), nakshatra: r.atSunrise.nakshatra.name, yoga: r.atSunrise.yoga.name, karana: r.atSunrise.karana.name.replace('Vishti', 'Visthi') };
    for (const [k, end] of [['tithi', 'tithiEnd'], ['nakshatra', 'nakEnd'], ['yoga', 'yogaEnd'], ['karana', 'karanaEnd']] as const) {
      const pl9 = k === 'tithi' ? bare(d.tithi) : d[k];
      check(`${d.date} ${k}`, pl9 === names[k], pl9, names[k]);
      const at = r.atSunrise[k].endJdUt;
      if (d[end] === '...' || at >= r.nextSunrise) check(`${d.date} ${end}`, d[end] === '...' && at >= r.nextSunrise, d[end], at >= r.nextSunrise ? '...' : `${since(at)} s`);
      else near(end, d[end], at);
    }
    const extra = shown.extraTithis.find((x) => x.afterDate === d.date);
    check(`${d.date} extra tithi`, (extra ? bare(extra.tithi) : 'none') === (r.extraTithi ? bare(r.extraTithi.name) : 'none'), extra?.tithi ?? 'none', r.extraTithi?.name ?? 'none');
    if (extra && r.extraTithi) near('extra tithi end', extra.tithiEnd, r.extraTithi.endJdUt);
  });
  return { values, failures, pending };
}
