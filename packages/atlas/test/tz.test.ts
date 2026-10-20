import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { loadTz, UnknownZoneError } from '../src/index';

const tz = loadTz();
const jd = (iso: string) => Date.parse(iso) / 86400000 + 2440587.5;
const zones1970 = readFileSync(join(__dirname, '../tzdata', tz.version, 'zone1970.tab'), 'utf8')
  .split('\n').filter((l) => l && !l.startsWith('#')).map((l) => l.split('\t')[2]!);

/** The offset Node's Intl gives (its own copy of the IANA database, without backzone), seconds. */
const formatters = new Map<string, Intl.DateTimeFormat>();
function intlOffset(zone: string, ms: number): number {
  if (!formatters.has(zone)) formatters.set(zone, new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'longOffset' }));
  const part = formatters.get(zone)!.formatToParts(ms).find((p) => p.type === 'timeZoneName')!.value;
  const m = /^GMT(?:([+-])(\d\d):(\d\d)(?::(\d\d))?)?$/.exec(part);
  if (!m) throw new Error(`unread offset ${part}`);
  if (!m[1]) return 0;
  return (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 3600 + Number(m[3]) * 60 + Number(m[4] ?? 0));
}

describe('the IANA time zone database, compiled with backzone', () => {
  it('is the version kept in the package', () => {
    expect(tz.version).toBe('2026b');
    expect(tz.zones()).toContain('America/Sao_Paulo');
  });
  // Node's copy of the database is the reference only when it is the same version (CI runners may carry another).
  const sameAsNode = (process.versions as Record<string, string | undefined>).tz === tz.version;
  it.skipIf(!sameAsNode)('gives every zone of zone1970.tab the offsets Node gives, twice a month from 1970 to 2037', () => {
    const wrong: string[] = [];
    for (const zone of zones1970) {
      for (let y = 1970; y <= 2037; y++) for (let m = 0; m < 12; m++) for (const d of [1, 15]) {
        const ms = Date.UTC(y, m, d, 12);
        const mine = tz.offsetAtUt(zone, ms / 86400000 + 2440587.5).utcOffsetSeconds;
        const theirs = intlOffset(zone, ms);
        if (mine !== theirs && wrong.length < 10) wrong.push(`${zone} ${new Date(ms).toISOString().slice(0, 10)}: ${mine} vs ${theirs}`);
      }
    }
    expect(wrong).toEqual([]);
  });
  it('keeps the zones backzone separates from their neighbours before 1970', () => {
    expect(tz.offsetAtUt('Europe/Amsterdam', jd('1930-01-01T12:00:00Z')).utcOffsetSeconds).toBe(19 * 60 + 32);
    // Oslo's local mean time, not Berlin's (the main data makes Oslo a link to Berlin).
    expect(tz.offsetAtUt('Europe/Oslo', jd('1890-01-01T12:00:00Z')).utcOffsetSeconds).toBe(43 * 60);
  });
  it('gives the local mean time before a zone\'s first record, and the war time of India', () => {
    const sp = tz.offsetAtUt('America/Sao_Paulo', jd('1900-01-01T12:00:00Z'));
    expect([sp.utcOffsetSeconds, sp.abbreviation]).toEqual([-(3 * 3600 + 6 * 60 + 28), 'LMT']);
    const k = tz.offsetAtUt('Asia/Kolkata', jd('1943-06-01T12:00:00Z'));
    expect([k.utcOffsetSeconds, k.dstSeconds]).toEqual([6.5 * 3600, 3600]);
  });
  it('says daylight saving and the abbreviation', () => {
    const summer = tz.offsetAtUt('Europe/Berlin', jd('2021-07-01T12:00:00Z'));
    expect([summer.utcOffsetSeconds, summer.dstSeconds, summer.abbreviation]).toEqual([7200, 3600, 'CEST']);
    const winter = tz.offsetAtUt('America/Sao_Paulo', jd('2025-07-01T12:00:00Z'));
    expect([winter.utcOffsetSeconds, winter.dstSeconds, winter.abbreviation]).toEqual([-3 * 3600, 0, '-03']);
  });
  it('keeps a rule in force across a zone line that starts long after it (war time)', () => {
    expect(tz.offsetAtUt('America/Phoenix', jd('1944-06-01T12:00:00Z')).utcOffsetSeconds).toBe(-6 * 3600);
    expect(tz.offsetAtUt('Asia/Manila', jd('1945-06-01T12:00:00Z')).utcOffsetSeconds).toBe(9 * 3600);
    expect(tz.offsetAtUt('Europe/Brussels', jd('1944-09-10T12:00:00Z')).utcOffsetSeconds).toBe(2 * 3600);
  });
  it('drops the instants a zone line and a rule change cancel out, as zic does', () => {
    expect(tz.offsetAtUt('Europe/Moscow', jd('1991-03-30T23:30:00Z')).utcOffsetSeconds).toBe(3 * 3600);
    expect(tz.offsetAtUt('America/Indiana/Vincennes', jd('2006-04-02T07:30:00Z')).utcOffsetSeconds).toBe(-5 * 3600);
  });
  it.skipIf(!sameAsNode)('agrees with Node a minute either side of every transition it compiles from 1970 on', () => {
    const wrong: string[] = [];
    for (const zone of zones1970) {
      for (const t of tz.transitions(zone)) {
        if (t.jdUt < jd('1970-01-01T00:00:00Z') || t.jdUt > jd('2037-12-31T00:00:00Z')) continue;
        for (const dt of [-60, 60]) {
          const ms = Math.round((t.jdUt - 2440587.5) * 86400000) + dt * 1000;
          const mine = tz.offsetAtUt(zone, ms / 86400000 + 2440587.5).utcOffsetSeconds, theirs = intlOffset(zone, ms);
          if (mine !== theirs && wrong.length < 10) wrong.push(`${zone} ${new Date(ms).toISOString()}: ${mine} vs ${theirs}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });
  it('follows links, and refuses a zone it does not know', () => {
    expect(tz.canonical('Asia/Calcutta')).toBe('Asia/Kolkata');
    expect(tz.canonical('Mars/Olympus')).toBeNull();
    expect(() => tz.offsetAtUt('Mars/Olympus', jd('2000-01-01T00:00:00Z'))).toThrow(UnknownZoneError);
  });
});
