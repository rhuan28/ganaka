import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { computeAshtakavarga, computeBhavaBala, computeChart, computeDashas, computeShadbala, computeBirthPanchanga, computePanchanga, computePanchangTable, computeTransits, completedYears, computeVarshaphalaReport, type AnnualDashaSystem, computeVimshopaka, computeMuhurta, dashasAt, MUHURTA_ACTIVITIES, type MuhurtaActivity, type AshtakavargaOptions, type CalendarMode, type CoreOptions, type DashaOptions, type ShadbalaOptions } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { formatAshtakavarga, formatBhavaBala, formatDashas, formatJson, formatShadbala, formatTable, formatBirthPanchanga, formatPanchanga, formatPanchangTable, formatTransits, formatMuhurta, formatVarshaphala, formatVimshopaka } from './format';
import { readChartFile } from './input';

export interface Io { readFile(path: string): string; out(text: string): void; err(text: string): void }

const USAGE = 'usage: chart <file.json|file.xml> [--format json|table] [--fidelity corrected|pl9] [--ayanamsha <name>] [--offset <degrees>] [--gulika end|beginning]';

/** The options of the rashi dashas: the flag, the option it sets, and its values. */
const RASHI_FLAGS: Record<string, [keyof NonNullable<DashaOptions['rashi']>, Record<string, string | boolean>]> = {
  '--chara-method': ['charaMethod', { 'kn-rao': 'knRao', parashara: 'parashara' }],
  '--chara-antar-from-lord': ['charaAntarFromLord', { yes: true, no: false }],
  '--padanadhamsa-method': ['padanadhamsaMethod', { 'kn-rao': 'knRao', iranganti: 'iranganti' }],
  '--antar-start': ['antardashaStart', { sign: 'sign', lord: 'lord' }],
  '--rahu-exaltation': ['rahuExaltation', { taurus: 'taurus', gemini: 'gemini' }],
  '--mercury-exaltation': ['mercuryExaltation', { degree: 'degree', anywhere: 'anywhere' }],
};
const DASHAS_USAGE = 'usage: dashas <file.json|file.xml> [--system <name>] [--levels 1-5] [--cycles 1-20] [--year 365.25|360|327.85|365.2422] [--base <point>] [--varga D1|D9] [--balance degree|time] [--kc-antardashas 12|9] [--kc-sequence continue|same-pada] [--chara-method kn-rao|parashara] [--chara-antar-from-lord yes|no] [--padanadhamsa-method kn-rao|iranganti] [--antar-start sign|lord] [--rahu-exaltation taurus|gemini] [--mercury-exaltation degree|anywhere] [--format json|table] [--fidelity corrected|pl9]';

const STRENGTHS_USAGE = 'usage: strengths <file.json|file.xml> --part ashtakavarga|shadbala|bhava|vimshopaka [ashtakavarga: --av-method varahamihira|parashara --ekadhipatya parashara|other --virgo 6|5] [shadbala and bhava: --drekkana parashara|hora-ratnam --dig cusps|kendras --mercury-paksha with-malefics|benefic --mercury-drik with-malefics|benefic --jup-merc-drik full|quarter] [--format json|table] [--fidelity corrected|pl9]';

/** The options of the Ashtakavarga: the flag, the option it sets, and its values. */
const AV_FLAGS: Record<string, [keyof AshtakavargaOptions, Record<string, string | number>]> = {
  '--av-method': ['method', { varahamihira: 'varahamihira', parashara: 'parashara' }],
  '--ekadhipatya': ['ekadhipatya', { parashara: 'parashara', other: 'other' }],
  '--virgo': ['virgoMultiplier', { 6: 6, 5: 5 }],
};

/** The options of the Shadbala, likewise. */
const SB_FLAGS: Record<string, [keyof ShadbalaOptions, Record<string, string>]> = {
  '--drekkana': ['drekkana', { parashara: 'parashara', 'hora-ratnam': 'horaRatnam' }],
  '--dig': ['digBala', { cusps: 'cusps', kendras: 'kendras' }],
  '--mercury-paksha': ['mercuryPaksha', { 'with-malefics': 'withMalefics', benefic: 'benefic' }],
  '--mercury-drik': ['mercuryDrik', { 'with-malefics': 'withMalefics', benefic: 'benefic' }],
  '--jup-merc-drik': ['jupiterMercuryDrik', { full: 'full', quarter: 'quarter' }],
};
const PART_FLAGS: Record<string, Record<string, [string, Record<string, string | number>]>> = { ashtakavarga: AV_FLAGS, shadbala: SB_FLAGS, bhava: SB_FLAGS, vimshopaka: {} };

const TRANSITS_USAGE = 'usage: transits <file.json|file.xml> --at "yyyy-mm-dd hh:mm:ss" [--utc] [--place <latitude,longitudeEast>] [--format json|table] [--fidelity corrected|pl9]  (--at is Jaipur time unless --utc; the place is Jaipur, the default of PL9, unless --place)';
/** PL9's default place for the second instant, its installation's: Jaipur, 26N55'00, 75E49'40, 5h30 east. */
const JAIPUR = { latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 };
const MUHURTA_USAGE = 'usage: muhurta <file.json|file.xml> --at "yyyy-mm-dd hh:mm:ss" [--utc] [--place <latitude,longitudeEast>] [--activity general|travelling|marriage] [--format json|table] [--fidelity corrected|pl9]  (--at is Jaipur time unless --utc; the place is Jaipur, the default of PL9, unless --place; the weekday on the clock of the place, local mean time at another --place; the activity of the thermometer, general by default)';

/** The Julian day of a Gregorian date and time "yyyy-mm-dd hh:mm:ss", or undefined if it is not one. */
function julianDay(text: string): number | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})$/.exec(text);
  if (!m) return undefined;
  const [y, mo, d, h, mi, s] = m.slice(1).map(Number) as [number, number, number, number, number, number];
  if (mo < 1 || mo > 12 || d < 1 || d !== new Date(Date.UTC(y, mo - 1, d)).getUTCDate() || h > 23 || mi > 59 || s > 59) return undefined;
  return Date.UTC(y, mo - 1, d, h, mi, s) / 86400000 + 2440587.5;
}

export async function run(argv: string[], io: Io): Promise<number> {
  if (argv[0] === 'dashas') return runDashas(argv.slice(1), io);
  if (argv[0] === 'transits') return runTransits(argv.slice(1), io);
  if (argv[0] === 'muhurta') return runMuhurta(argv.slice(1), io);
  if (argv[0] === 'panchanga') return runPanchanga(argv.slice(1), io);
  if (argv[0] === 'varshaphala') return runVarshaphala(argv.slice(1), io);
  if (argv[0] === 'strengths') return runStrengths(argv.slice(1), io);
  let file: string | undefined;
  let format = 'table';
  const options: Partial<CoreOptions> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === '--format' || a === '--ayanamsha' || a === '--offset' || a === '--fidelity' || a === '--gulika') {
      const value = argv[++i];
      if (value === undefined || value === '' || value.startsWith('--')) return fail(io, `option ${a} needs a value\n${USAGE}`);
      if (a === '--format') format = value;
      else if (a === '--ayanamsha') options.ayanamsha = value as CoreOptions['ayanamsha'];
      else if (a === '--fidelity') options.fidelity = value as CoreOptions['fidelity'];
      else if (a === '--gulika') options.gulika = value as CoreOptions['gulika'];
      else options.ayanamshaOffsetDegrees = Number(value);
    }
    else if (a.startsWith('--') || file !== undefined) return fail(io, `unexpected argument "${a}"\n${USAGE}`);
    else file = a;
  }
  if (!file) return fail(io, USAGE);
  if (format !== 'json' && format !== 'table') return fail(io, `unknown format "${format}"\n${USAGE}`);
  let eph;
  try {
    const input = readChartFile(io.readFile(file), file);
    eph = await createSwissEphemeris();
    const chart = computeChart(eph, input, options);
    io.out(format === 'json' ? formatJson(chart) + '\n' : formatTable(chart));
    return 0;
  } catch (e) {
    return fail(io, `${(e as Error).name}: ${(e as Error).message}`);
  } finally {
    eph?.close();
  }
}

async function runDashas(argv: string[], io: Io): Promise<number> {
  let file: string | undefined;
  let format = 'table';
  const options: Partial<DashaOptions> = {};
  const core: Partial<CoreOptions> = {};
  const flags = ['--format', '--fidelity', '--system', '--levels', '--cycles', '--year', '--base', '--varga', '--balance', '--kc-antardashas', '--kc-sequence', ...Object.keys(RASHI_FLAGS)];
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (flags.includes(a)) {
      const value = argv[++i];
      if (value === undefined || value === '' || value.startsWith('--')) return fail(io, `option ${a} needs a value\n${DASHAS_USAGE}`);
      if (a === '--format') format = value;
      else if (a === '--fidelity') core.fidelity = value as CoreOptions['fidelity'];
      else if (a === '--system') options.system = value as DashaOptions['system'];
      else if (a === '--levels') options.levels = Number(value) as DashaOptions['levels'];
      else if (a === '--cycles') options.cycles = Number(value);
      else if (a === '--kc-antardashas') options.kalachakra = { sequence: options.kalachakra?.sequence ?? 'continue', antardashas: Number(value) as 12 | 9 };
      else if (a === '--kc-sequence') options.kalachakra = { antardashas: options.kalachakra?.antardashas ?? 12, sequence: (value === 'same-pada' ? 'samePada' : value) as 'continue' | 'samePada' };
      else if (a in RASHI_FLAGS) {
        const [key, values] = RASHI_FLAGS[a]!;
        if (!(value in values)) return fail(io, `option ${a} takes ${Object.keys(values).join(' or ')}
${DASHAS_USAGE}`);
        options.rashi = { ...options.rashi, [key]: values[value] };
      }
      else if (a === '--year') options.yearDays = value as DashaOptions['yearDays'];
      else if (a === '--base') options.base = value as DashaOptions['base'];
      else if (a === '--varga') options.varga = value as DashaOptions['varga'];
      else options.balance = value as DashaOptions['balance'];
    }
    else if (a.startsWith('--') || file !== undefined) return fail(io, `unexpected argument "${a}"\n${DASHAS_USAGE}`);
    else file = a;
  }
  if (!file) return fail(io, DASHAS_USAGE);
  if (format !== 'json' && format !== 'table') return fail(io, `unknown format "${format}"\n${DASHAS_USAGE}`);
  let eph;
  try {
    const input = readChartFile(io.readFile(file), file);
    eph = await createSwissEphemeris();
    const dashas = computeDashas(eph, input, options, core);
    io.out(format === 'json' ? JSON.stringify(dashas, null, 1) + '\n' : formatDashas(dashas, input.utcOffsetHours ?? 0));
    return 0;
  } catch (e) {
    return fail(io, `${(e as Error).name}: ${(e as Error).message}`);
  } finally {
    eph?.close();
  }
}

async function runStrengths(argv: string[], io: Io): Promise<number> {
  let file: string | undefined;
  let format = 'table';
  let part = 'ashtakavarga';
  const flags: [string, string][] = [];
  const core: Partial<CoreOptions> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === '--format' || a === '--fidelity' || a === '--part' || Object.hasOwn(AV_FLAGS, a) || Object.hasOwn(SB_FLAGS, a)) {
      const value = argv[++i];
      if (value === undefined || value === '' || value.startsWith('--')) return fail(io, `option ${a} needs a value\n${STRENGTHS_USAGE}`);
      if (a === '--format') format = value;
      else if (a === '--fidelity') core.fidelity = value as CoreOptions['fidelity'];
      else if (a === '--part') part = value;
      else flags.push([a, value]);
    }
    else if (a.startsWith('--') || file !== undefined) return fail(io, `unexpected argument "${a}"\n${STRENGTHS_USAGE}`);
    else file = a;
  }
  if (!file) return fail(io, STRENGTHS_USAGE);
  if (format !== 'json' && format !== 'table') return fail(io, `unknown format "${format}"\n${STRENGTHS_USAGE}`);
  if (!Object.hasOwn(PART_FLAGS, part)) return fail(io, `part "${part}" is not computed yet\n${STRENGTHS_USAGE}`);
  // Each part takes only its own options.
  const options: Record<string, unknown> = {};
  for (const [a, value] of flags) {
    if (!Object.hasOwn(PART_FLAGS[part]!, a)) return fail(io, `option ${a} is not an option of the ${part}\n${STRENGTHS_USAGE}`);
    const [key, values] = PART_FLAGS[part]![a]!;
    if (!Object.hasOwn(values, value)) return fail(io, `option ${a} takes ${Object.keys(values).join(' or ')}\n${STRENGTHS_USAGE}`);
    options[key] = values[value];
  }
  let eph;
  try {
    const input = readChartFile(io.readFile(file), file);
    eph = await createSwissEphemeris();
    if (part === 'vimshopaka') {
      const v = computeVimshopaka(eph, input, core);
      io.out(format === 'json' ? JSON.stringify(v, null, 1) + '\n' : formatVimshopaka(v));
    } else if (part === 'bhava') {
      const bb = computeBhavaBala(eph, input, options as Partial<ShadbalaOptions>, core);
      io.out(format === 'json' ? JSON.stringify(bb, null, 1) + '\n' : formatBhavaBala(bb));
    } else if (part === 'shadbala') {
      const sb = computeShadbala(eph, input, options as Partial<ShadbalaOptions>, core);
      io.out(format === 'json' ? JSON.stringify(sb, null, 1) + '\n' : formatShadbala(sb));
    } else {
      const av = computeAshtakavarga(eph, input, options as Partial<AshtakavargaOptions>, core);
      io.out(format === 'json' ? JSON.stringify(av, null, 1) + '\n' : formatAshtakavarga(av));
    }
    return 0;
  } catch (e) {
    return fail(io, `${(e as Error).name}: ${(e as Error).message}`);
  } finally {
    eph?.close();
  }
}

async function runMuhurta(argv: string[], io: Io): Promise<number> {
  let file: string | undefined;
  let format = 'table';
  let at: string | undefined;
  let place: string | undefined;
  let activity: string = 'general';
  let utc = false;
  const core: Partial<CoreOptions> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === '--utc') utc = true;
    else if (a === '--format' || a === '--fidelity' || a === '--at' || a === '--place' || a === '--activity') {
      const value = argv[++i];
      if (value === undefined || value === '' || value.startsWith('--')) return fail(io, `option ${a} needs a value\n${MUHURTA_USAGE}`);
      if (a === '--format') format = value;
      else if (a === '--fidelity') core.fidelity = value as CoreOptions['fidelity'];
      else if (a === '--at') at = value;
      else if (a === '--activity') activity = value;
      else place = value;
    }
    else if (a.startsWith('--') || file !== undefined) return fail(io, `unexpected argument "${a}"\n${MUHURTA_USAGE}`);
    else file = a;
  }
  if (!file || !at) return fail(io, MUHURTA_USAGE);
  if (format !== 'json' && format !== 'table') return fail(io, `unknown format "${format}"\n${MUHURTA_USAGE}`);
  if (!(MUHURTA_ACTIVITIES as readonly string[]).includes(activity)) return fail(io, `unknown activity "${activity}"\n${MUHURTA_USAGE}`);
  const jd = julianDay(at);
  if (jd === undefined) return fail(io, `"${at}" is not a date and time "yyyy-mm-dd hh:mm:ss"\n${MUHURTA_USAGE}`);
  let where = { latitude: JAIPUR.latitude, longitudeEast: JAIPUR.longitudeEast };
  if (place !== undefined) {
    const m = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(place);
    if (!m || Math.abs(Number(m[1])) > 90 || Math.abs(Number(m[2])) > 180) return fail(io, `"${place}" is not a place "latitude,longitudeEast"\n${MUHURTA_USAGE}`);
    where = { latitude: Number(m[1]), longitudeEast: Number(m[2]) };
  }
  // The weekday of the thermometer is on the place's clock: Jaipur's, or local mean time at another --place; --utc only
  // changes how --at is read.
  const clock = place === undefined ? JAIPUR.utcOffsetHours : where.longitudeEast / 15;
  const instant = { jdUt: utc ? jd : jd - JAIPUR.utcOffsetHours / 24, ...where, utcOffsetHours: clock };
  let eph;
  try {
    const input = readChartFile(io.readFile(file), file);
    eph = await createSwissEphemeris();
    const m = computeMuhurta(eph, input, instant, { ...core, activity: activity as MuhurtaActivity });
    io.out(format === 'json' ? JSON.stringify(m, null, 1) + '\n' : formatMuhurta(m));
    return 0;
  } catch (e) {
    return fail(io, `${(e as Error).name}: ${(e as Error).message}`);
  } finally {
    eph?.close();
  }
}

async function runTransits(argv: string[], io: Io): Promise<number> {
  let file: string | undefined;
  let format = 'table';
  let at: string | undefined;
  let place: string | undefined;
  let utc = false;
  const core: Partial<CoreOptions> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === '--utc') utc = true;
    else if (a === '--format' || a === '--fidelity' || a === '--at' || a === '--place') {
      const value = argv[++i];
      if (value === undefined || value === '' || value.startsWith('--')) return fail(io, `option ${a} needs a value\n${TRANSITS_USAGE}`);
      if (a === '--format') format = value;
      else if (a === '--fidelity') core.fidelity = value as CoreOptions['fidelity'];
      else if (a === '--at') at = value;
      else place = value;
    }
    else if (a.startsWith('--') || file !== undefined) return fail(io, `unexpected argument "${a}"\n${TRANSITS_USAGE}`);
    else file = a;
  }
  if (!file || !at) return fail(io, TRANSITS_USAGE);
  if (format !== 'json' && format !== 'table') return fail(io, `unknown format "${format}"\n${TRANSITS_USAGE}`);
  const jd = julianDay(at);
  if (jd === undefined) return fail(io, `"${at}" is not a date and time "yyyy-mm-dd hh:mm:ss"\n${TRANSITS_USAGE}`);
  let where = { latitude: JAIPUR.latitude, longitudeEast: JAIPUR.longitudeEast };
  if (place !== undefined) {
    const m = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(place);
    if (!m || Math.abs(Number(m[1])) > 90 || Math.abs(Number(m[2])) > 180) return fail(io, `"${place}" is not a place "latitude,longitudeEast"\n${TRANSITS_USAGE}`);
    where = { latitude: Number(m[1]), longitudeEast: Number(m[2]) };
  }
  const instant = { jdUt: utc ? jd : jd - JAIPUR.utcOffsetHours / 24, ...where };
  let eph;
  try {
    const input = readChartFile(io.readFile(file), file);
    eph = await createSwissEphemeris();
    const t = { ...computeTransits(eph, input, instant, core), dashas: dashasAt(eph, input, instant.jdUt, core) };
    io.out(format === 'json' ? JSON.stringify(t, null, 1) + '\n' : formatTransits(t));
    return 0;
  } catch (e) {
    return fail(io, `${(e as Error).name}: ${(e as Error).message}`);
  } finally {
    eph?.close();
  }
}

const PANCHANGA_USAGE = 'usage: panchanga <file.json|file.xml> [--at "yyyy-mm-dd hh:mm:ss"] [--utc] [--place <latitude,longitudeEast>] [--calendar krishnadi|shukladi|krishnadi-half] [--days <n>] [--format json|table] [--fidelity corrected|pl9]  (without --at, the panchanga of the birth; --at is Jaipur time unless --utc, the place Jaipur unless --place; --days n, the Print -> Panchang table of n days from the date of --at)';
const CALENDAR_MODES: Record<string, CalendarMode> = { krishnadi: 'krishnadi', shukladi: 'shukladi', 'krishnadi-half': 'krishnadiHalf' };

async function runPanchanga(argv: string[], io: Io): Promise<number> {
  let file: string | undefined;
  let format = 'table';
  let at: string | undefined;
  let place: string | undefined;
  let utc = false;
  let calendar: string | undefined;
  let daysText: string | undefined;
  const core: Partial<CoreOptions> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (a === '--utc') utc = true;
    else if (a === '--format' || a === '--fidelity' || a === '--at' || a === '--place' || a === '--calendar' || a === '--days') {
      const value = argv[++i];
      if (value === undefined || value === '' || value.startsWith('--')) return fail(io, `option ${a} needs a value\n${PANCHANGA_USAGE}`);
      if (a === '--format') format = value;
      else if (a === '--fidelity') core.fidelity = value as CoreOptions['fidelity'];
      else if (a === '--at') at = value;
      else if (a === '--calendar') calendar = value;
      else if (a === '--days') daysText = value;
      else place = value;
    }
    else if (a.startsWith('--') || file !== undefined) return fail(io, `unexpected argument "${a}"\n${PANCHANGA_USAGE}`);
    else file = a;
  }
  if (!file) return fail(io, PANCHANGA_USAGE);
  if (format !== 'json' && format !== 'table') return fail(io, `unknown format "${format}"\n${PANCHANGA_USAGE}`);
  const mode = CALENDAR_MODES[calendar ?? 'krishnadi'];
  if (!mode) return fail(io, `unknown calendar "${calendar}"\n${PANCHANGA_USAGE}`);
  const days = daysText === undefined ? undefined : Number(daysText);
  if (days !== undefined && !(Number.isInteger(days) && days >= 1 && days <= 366)) return fail(io, `--days takes a whole number of days from 1 to 366\n${PANCHANGA_USAGE}`);
  if (at === undefined && (calendar !== undefined || days !== undefined)) return fail(io, `--calendar and --days go with --at\n${PANCHANGA_USAGE}`);
  let instant: { jdUt: number; latitude: number; longitudeEast: number; utcOffsetHours: number } | undefined;
  if (at !== undefined) {
    const jd = julianDay(at);
    if (jd === undefined) return fail(io, `"${at}" is not a date and time "yyyy-mm-dd hh:mm:ss"\n${PANCHANGA_USAGE}`);
    let where = { latitude: JAIPUR.latitude, longitudeEast: JAIPUR.longitudeEast };
    if (place !== undefined) {
      const m = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(place);
      if (!m || Math.abs(Number(m[1])) > 90 || Math.abs(Number(m[2])) > 180) return fail(io, `"${place}" is not a place "latitude,longitudeEast"\n${PANCHANGA_USAGE}`);
      where = { latitude: Number(m[1]), longitudeEast: Number(m[2]) };
    }
    instant = { jdUt: utc ? jd : jd - JAIPUR.utcOffsetHours / 24, ...where, utcOffsetHours: utc ? 0 : JAIPUR.utcOffsetHours };
  } else if (place !== undefined || utc) return fail(io, `--place and --utc go with --at\n${PANCHANGA_USAGE}`);
  let eph;
  try {
    const input = readChartFile(io.readFile(file), file);
    eph = await createSwissEphemeris();
    if (instant) {
      // The civil date in the instant's clock of the day the table starts; for the panchanga of the instant, its Vedic
      // day (the sunrise before it), whose month is named.
      const dateOf = (jd: number) => {
        const civil = new Date(Math.round((jd + instant!.utcOffsetHours / 24 - 2440587.5) * 86400000));
        return { year: civil.getUTCFullYear(), month: civil.getUTCMonth() + 1, day: civil.getUTCDate() };
      };
      if (days !== undefined) {
        const table = computePanchangTable(eph, dateOf(instant.jdUt), days, instant, mode, core);
        io.out(format === 'json' ? JSON.stringify(table, null, 1) + '\n' : formatPanchangTable(table, instant.utcOffsetHours));
      } else {
        const p = computePanchanga(eph, instant, core);
        const table = computePanchangTable(eph, dateOf(p.sunrise ?? instant.jdUt), 1, instant, mode, core);
        const month = { mode: calendar ?? 'krishnadi', name: table.month.name, vikram: table.vikram, saka: table.saka };
        io.out(format === 'json' ? JSON.stringify({ ...p, calendar: month }, null, 1) + '\n' : formatPanchanga(p) + `month      ${month.name} (${month.mode}), Vikram ${month.vikram}, Saka ${month.saka}\n`);
      }
    } else {
      const p = computeBirthPanchanga(eph, input, core);
      io.out(format === 'json' ? JSON.stringify(p, null, 1) + '\n' : formatBirthPanchanga(p));
    }
    return 0;
  } catch (e) {
    return fail(io, `${(e as Error).name}: ${(e as Error).message}`);
  } finally {
    eph?.close();
  }
}

const VARSHAPHALA_USAGE = 'usage: varshaphala <file.json|file.xml> (--year <completed years> | --at "yyyy-mm-dd hh:mm:ss") [--place <latitude,longitudeEast>] [--solar-return true|mean] [--dasha mudda|mudda-kalidasa|mudda-without-balance|patyayini] [--format json|table] [--fidelity corrected|pl9]  (--at, in UT, gives the year of age that holds it; the annual chart is cast at the birth place unless --place)';
const DASHA_NAMES: Record<string, AnnualDashaSystem> = { mudda: 'mudda', 'mudda-kalidasa': 'muddaKalidasa', 'mudda-without-balance': 'muddaWithoutBalance', patyayini: 'patyayini' };

async function runVarshaphala(argv: string[], io: Io): Promise<number> {
  let file: string | undefined;
  const opt: Record<string, string> = {};
  const core: Partial<CoreOptions> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]!;
    if (['--year', '--at', '--place', '--solar-return', '--dasha', '--format', '--fidelity'].includes(a)) {
      const value = argv[++i];
      if (value === undefined || value === '' || (value.startsWith('--') && a !== '--year')) return fail(io, `option ${a} needs a value\n${VARSHAPHALA_USAGE}`);
      if (a === '--fidelity') core.fidelity = value as CoreOptions['fidelity'];
      else opt[a.slice(2)] = value;
    } else if (a.startsWith('--') || file !== undefined) return fail(io, `unexpected argument "${a}"\n${VARSHAPHALA_USAGE}`);
    else file = a;
  }
  if (!file) return fail(io, VARSHAPHALA_USAGE);
  const format = opt.format ?? 'table';
  if (format !== 'json' && format !== 'table') return fail(io, `unknown format "${format}"\n${VARSHAPHALA_USAGE}`);
  if ((opt.year === undefined) === (opt.at === undefined)) return fail(io, `give either --year or --at\n${VARSHAPHALA_USAGE}`);
  if (opt.year !== undefined && !/^\d+$/.test(opt.year)) return fail(io, `"${opt.year}" is not a whole number of years\n${VARSHAPHALA_USAGE}`);
  const atJd = opt.at === undefined ? undefined : julianDay(opt.at);
  if (opt.at !== undefined && atJd === undefined) return fail(io, `"${opt.at}" is not a date and time "yyyy-mm-dd hh:mm:ss"\n${VARSHAPHALA_USAGE}`);
  const mode = opt['solar-return'] ?? 'true';
  if (mode !== 'true' && mode !== 'mean') return fail(io, `unknown solar return "${mode}"\n${VARSHAPHALA_USAGE}`);
  const dasha = DASHA_NAMES[opt.dasha ?? 'mudda'];
  if (!dasha) return fail(io, `unknown dasha "${opt.dasha}"\n${VARSHAPHALA_USAGE}`);
  let place: { latitude: number; longitudeEast: number } | undefined;
  if (opt.place !== undefined) {
    const m = /^(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)$/.exec(opt.place);
    if (!m || Math.abs(Number(m[1])) > 90 || Math.abs(Number(m[2])) > 180) return fail(io, `"${opt.place}" is not a place "latitude,longitudeEast"\n${VARSHAPHALA_USAGE}`);
    place = { latitude: Number(m[1]), longitudeEast: Number(m[2]) };
  }
  let eph;
  try {
    const input = readChartFile(io.readFile(file), file);
    if (opt.year === undefined && atJd! < input.jdUt) return fail(io, `--at is before the birth: there is no year of age then
${VARSHAPHALA_USAGE}`);
    const years = opt.year !== undefined ? Number(opt.year) : completedYears(input.jdUt, atJd!);
    eph = await createSwissEphemeris();
    const report = computeVarshaphalaReport(eph, input, years, { ...core, solarReturn: mode, place });
    io.out(format === 'json' ? JSON.stringify(report, null, 1) + '\n' : formatVarshaphala(report, dasha, input.utcOffsetHours ?? 0));
    return 0;
  } catch (e) {
    return fail(io, `${(e as Error).name}: ${(e as Error).message}`);
  } finally {
    eph?.close();
  }
}

function fail(io: Io, message: string): number {
  io.err(message + '\n');
  return 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await run(process.argv.slice(2), {
    readFile: (p) => readFileSync(p, 'utf8'),
    out: (t) => void process.stdout.write(t),
    err: (t) => void process.stderr.write(t),
  });
}
