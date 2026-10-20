import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The IANA time zone database, compiled from its source text (kept in tzdata/<version>/) with backzone applied over
// the links of `backward`, as the database's own PACKRATDATA=backzone build does: every zone keeps its own history
// before 1970 instead of its neighbour's. The rules are those of zic(8): Rule, Zone (with continuation lines) and Link.

export const TZ_VERSION = '2026b';
const FILES = ['africa', 'antarctica', 'asia', 'australasia', 'europe', 'northamerica', 'southamerica', 'etcetera', 'backward', 'backzone'];
/** Transitions are computed up to this year (the ephemeris ends in 2399). */
const LAST_YEAR = 2400;

export class UnknownZoneError extends Error {
  constructor(readonly zone: string) {
    super(`unknown time zone "${zone}"`);
    this.name = 'UnknownZoneError';
  }
}

export interface ZoneOffset {
  /** Seconds east of UT, daylight saving included. */
  utcOffsetSeconds: number;
  /** The daylight saving part of it, seconds (negative in the few zones whose winter time is the "saving"). */
  dstSeconds: number;
  abbreviation: string;
}

export interface TzDatabase {
  version: string;
  zones(): string[];
  /** The zone a name stands for, following links; null when the name is neither a zone nor a link. */
  canonical(name: string): string | null;
  offsetAtUt(zone: string, jdUt: number): ZoneOffset;
  /** The zone's compiled changes, each with the state it starts (for checks and tools). */
  transitions(zone: string): (ZoneOffset & { jdUt: number })[];
}

type On = { kind: 'day'; day: number } | { kind: 'last'; weekday: number } | { kind: 'ge' | 'le'; weekday: number; day: number };
type TimeType = 'w' | 's' | 'u';
interface Rule { from: number; to: number; month: number; on: On; at: number; atType: TimeType; save: number; letter: string }
interface Until { year: number; month: number; on: On; time: number; type: TimeType }
interface Period { stdoff: number; rules: { kind: 'none' } | { kind: 'fixed'; save: number } | { kind: 'named'; name: string }; format: string; until: Until | null }
interface State { at: number; utoff: number; save: number; abbr: string }

const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
const WEEKDAYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function month(text: string): number {
  const i = MONTHS.indexOf(text.slice(0, 3).toLowerCase());
  if (i < 0) throw new Error(`unknown month "${text}"`);
  return i;
}
function weekday(text: string): number {
  const i = WEEKDAYS.indexOf(text.slice(0, 3).toLowerCase());
  if (i < 0) throw new Error(`unknown weekday "${text}"`);
  return i;
}
/** "2", "2:00", "-1:00", "2:00:30", "24:00", "0", "-" → seconds. */
function seconds(text: string): number {
  if (text === '-' || text === '') return 0;
  const negative = text.startsWith('-');
  const [h = 0, m = 0, s = 0] = (negative ? text.slice(1) : text).split(':').map(Number);
  const v = h * 3600 + m * 60 + s;
  return negative ? -v : v;
}
/** A time with its suffix: w (wall clock, the default), s (standard), u/g/z (universal). */
function timeOf(text: string): { time: number; type: TimeType } {
  const m = /^(.*?)([wsugz])?$/.exec(text)!;
  const suffix = m[2];
  return { time: seconds(m[1]!), type: suffix === 's' ? 's' : suffix === 'u' || suffix === 'g' || suffix === 'z' ? 'u' : 'w' };
}
function onOf(text: string): On {
  if (/^\d+$/.test(text)) return { kind: 'day', day: Number(text) };
  if (text.startsWith('last')) return { kind: 'last', weekday: weekday(text.slice(4)) };
  const m = /^(\w+)([<>]=)(\d+)$/.exec(text);
  if (!m) throw new Error(`unknown day "${text}"`);
  return { kind: m[2] === '>=' ? 'ge' : 'le', weekday: weekday(m[1]!), day: Number(m[3]) };
}
function dayOf(year: number, monthIndex: number, on: On): number {
  if (on.kind === 'day') return on.day;
  const wd = (day: number) => new Date(Date.UTC(year, monthIndex, day)).getUTCDay();
  if (on.kind === 'last') {
    const last = new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
    return last - ((wd(last) - on.weekday + 7) % 7);
  }
  if (on.kind === 'ge') return on.day + ((on.weekday - wd(on.day) + 7) % 7);
  return on.day - ((wd(on.day) - on.weekday + 7) % 7);
}
/** Seconds since 1970 of a local date and time of day (days may run past the month's end: Date.UTC carries them). */
const localSeconds = (year: number, monthIndex: number, day: number, time: number) => Date.UTC(year, monthIndex, day) / 1000 + time;

function abbreviation(format: string, letter: string, save: number, utoff: number): string {
  if (format.includes('/')) {
    const [std, dst] = format.split('/');
    return (save !== 0 ? dst : std)!;
  }
  if (format.includes('%z')) {
    const sign = utoff < 0 ? '-' : '+';
    const a = Math.abs(utoff), h = Math.floor(a / 3600), m = Math.floor((a % 3600) / 60), s = a % 60;
    const z = `${sign}${String(h).padStart(2, '0')}${m || s ? String(m).padStart(2, '0') : ''}${s ? String(s).padStart(2, '0') : ''}`;
    return format.replace('%z', z);
  }
  return format.replace('%s', letter);
}

interface Source { rules: Map<string, Rule[]>; zones: Map<string, Period[]>; links: Map<string, string> }

function parse(texts: string[]): Source {
  const rules = new Map<string, Rule[]>(), zones = new Map<string, Period[]>(), links = new Map<string, string>();
  for (const text of texts) {
    let zone: Period[] | null = null;
    for (const raw of text.split('\n')) {
      const line = raw.replace(/#.*/, '');
      if (!line.trim()) continue;
      const f = line.trim().split(/\s+/);
      const continuation = /^\s/.test(line) && zone !== null;
      if (!continuation) zone = null;
      if (f[0] === 'Rule') {
        const [, name, from, to, , inMonth, on, at, save, letter] = f as string[];
        const t = timeOf(at!);
        const fromYear = from === 'min' || from === 'minimum' ? -9999 : Number(from);
        const rule: Rule = {
          from: fromYear, to: to === 'only' || to === 'o' ? fromYear : to === 'max' || to === 'maximum' ? 9999 : Number(to),
          month: month(inMonth!), on: onOf(on!), at: t.time, atType: t.type, save: seconds(save!.replace(/[sd]$/, '')), letter: letter === '-' ? '' : letter!,
        };
        if (!rules.has(name!)) rules.set(name!, []);
        rules.get(name!)!.push(rule);
      } else if (f[0] === 'Zone') {
        zone = [];
        zones.set(f[1]!, zone);
        zone.push(period(f.slice(2)));
        if (!zone.at(-1)!.until) zone = null;
      } else if (continuation && zone) {
        zone.push(period(f));
        if (!zone.at(-1)!.until) zone = null;
      } else if (f[0] === 'Link') {
        links.set(f[2]!, f[1]!);
      }
    }
  }
  // A name that is a zone (backzone's) is no longer a link.
  for (const name of zones.keys()) links.delete(name);
  return { rules, zones, links };
}

function period(f: string[]): Period {
  const [stdoff, rules, format, ...until] = f as [string, string, string, ...string[]];
  const r: Period['rules'] = rules === '-' ? { kind: 'none' } : /^-?\d/.test(rules) ? { kind: 'fixed', save: seconds(rules) } : { kind: 'named', name: rules };
  let u: Until | null = null;
  if (until.length) {
    const t = timeOf(until[3] ?? '0');
    u = { year: Number(until[0]), month: until[1] ? month(until[1]) : 0, on: onOf(until[2] ?? '1'), time: t.time, type: t.type };
  }
  return { stdoff: seconds(stdoff), rules: r, format, until: u };
}

function toUt(local: number, type: TimeType, stdoff: number, save: number): number {
  return type === 'u' ? local : type === 's' ? local - stdoff : local - stdoff - save;
}

function compile(periods: Period[], rules: Map<string, Rule[]>): State[] {
  const states: State[] = [];
  const push = (s: State) => {
    const last = states.at(-1);
    if (last && last.utoff === s.utoff && last.save === s.save && last.abbr === s.abbr) return;
    if (last && last.at === s.at) states.pop();
    states.push(s);
  };
  let start = -Infinity;
  for (const p of periods) {
    const untilLocal = p.until ? localSeconds(p.until.year, p.until.month, dayOf(p.until.year, p.until.month, p.until.on), p.until.time) : Infinity;
    if (p.rules.kind !== 'named') {
      const save = p.rules.kind === 'fixed' ? p.rules.save : 0;
      push({ at: start, utoff: p.stdoff + save, save, abbr: abbreviation(p.format, '', save, p.stdoff + save) });
      start = p.until ? toUt(untilLocal, p.until.type, p.stdoff, save) : Infinity;
      continue;
    }
    const set = rules.get(p.rules.name);
    if (!set) throw new Error(`unknown rule set "${p.rules.name}"`);
    // From the rule set's first year: a rule in force at the period's start may date from long before it (war time,
    // kept across zone lines, as zic does).
    const startYear = Math.max(1800, Math.min(...set.map((r) => r.from)));
    const endYear = Math.min(p.until ? p.until.year + 1 : LAST_YEAR, LAST_YEAR);
    // The rule changes of these years in order, each at its instant in UT (a wall-clock time takes the save before it).
    const changes: { local: number; rule: Rule }[] = [];
    for (let y = Math.max(startYear, -9999); y <= endYear; y++) {
      for (const r of set) if (r.from <= y && y <= r.to) changes.push({ local: localSeconds(y, r.month, dayOf(y, r.month, r.on), r.at), rule: r });
    }
    changes.sort((a, b) => a.local - b.local);
    let save = 0;
    const timed = changes.map((c) => {
      const at = toUt(c.local, c.rule.atType, p.stdoff, save);
      save = c.rule.save;
      return { at, rule: c.rule };
    });
    // The save at the period's start: the last change at or before it; else no saving, with the letter of the
    // earliest rule that saves nothing.
    const prior = [...timed].reverse().find((c) => c.at <= start);
    const firstStd = changes.find((c) => c.rule.save === 0)?.rule.letter ?? '';
    save = prior ? prior.rule.save : 0;
    let letter = prior ? prior.rule.letter : firstStd;
    push({ at: start, utoff: p.stdoff + save, save, abbr: abbreviation(p.format, letter, save, p.stdoff + save) });
    let until = p.until ? toUt(untilLocal, p.until.type, p.stdoff, save) : Infinity;
    for (const c of timed) {
      if (c.at <= start) continue;
      if (c.at >= until) break;
      save = c.rule.save;
      letter = c.rule.letter;
      push({ at: c.at, utoff: p.stdoff + save, save, abbr: abbreviation(p.format, letter, save, p.stdoff + save) });
      if (p.until) until = toUt(untilLocal, p.until.type, p.stdoff, save);
    }
    start = until;
  }
  // zic's last step: when a zone line and a rule change follow so closely that the wall clock does not move past the
  // first, the state between them is dropped and the earlier instant takes the later state.
  for (let i = 2; i < states.length; i++) {
    const [a, b, c] = [states[i - 2]!, states[i - 1]!, states[i]!];
    if (c.at + b.utoff <= b.at + a.utoff) {
      states.splice(i - 1, 2, { at: b.at, utoff: c.utoff, save: c.save, abbr: c.abbr });
      i = Math.max(1, i - 2);
    }
  }
  for (let i = 1; i < states.length; i++) {
    const [a, b] = [states[i - 1]!, states[i]!];
    if (a.utoff === b.utoff && a.save === b.save && a.abbr === b.abbr) { states.splice(i, 1); i--; }
  }
  return states;
}

let cached: TzDatabase | undefined;

/** The database of the kept version, compiled once (each zone when first asked for). */
export function loadTz(): TzDatabase {
  if (cached) return cached;
  const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'tzdata', TZ_VERSION);
  const src = parse(FILES.map((f) => readFileSync(join(dir, f), 'utf8')));
  const compiled = new Map<string, State[]>();
  const canonical = (name: string): string | null => {
    let n = name;
    for (let i = 0; i < 10; i++) {
      if (src.zones.has(n)) return n;
      const next = src.links.get(n);
      if (!next) return null;
      n = next;
    }
    return null;
  };
  const statesOf = (zone: string): State[] => {
    const name = canonical(zone);
    if (!name) throw new UnknownZoneError(zone);
    let states = compiled.get(name);
    if (!states) { states = compile(src.zones.get(name)!, src.rules); compiled.set(name, states); }
    return states;
  };
  cached = {
    version: readFileSync(join(dir, 'version'), 'utf8').trim(),
    zones: () => [...src.zones.keys()].sort(),
    canonical,
    transitions(zone) {
      return statesOf(zone).filter((s) => Number.isFinite(s.at)).map((s) => ({ jdUt: s.at / 86400 + 2440587.5, utcOffsetSeconds: s.utoff, dstSeconds: s.save, abbreviation: s.abbr }));
    },
    offsetAtUt(zone, jdUt) {
      const states = statesOf(zone);
      const t = (jdUt - 2440587.5) * 86400;
      let lo = 0, hi = states.length - 1;
      while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (states[mid]!.at <= t) lo = mid; else hi = mid - 1;
      }
      const s = states[lo]!;
      return { utcOffsetSeconds: s.utoff, dstSeconds: s.save, abbreviation: s.abbr };
    },
  };
  return cached;
}
