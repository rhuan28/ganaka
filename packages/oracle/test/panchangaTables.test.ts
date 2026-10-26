import { describe, expect, it } from 'vitest';
import { KNOWN_BIRTH_PENDING, parsePanchanga, verifyBirthPanchanga, verifyPanchangPrintout, type BirthPanchangaLike, type PanchangaFixture, type PanchangPrintout } from '../src/panchangaTables';

describe('the raw panchanga files', () => {
  it('read the birth fields by their keys and the two Tithi Pravesh instants', () => {
    const p = parsePanchanga([
      'chart\tREF 0010',
      'pcbirth\ttithiAtSunrise\tKrishna Chaturdashi',
      'pcbirth\ttithiEnd\t06:59:04',
      'pcbirth\ttithiEndGhatis\t31:24:51',
      'pcbirth\tsamvatChaitradi\t2052',
      'pctp\tnatal\t15 May 2026 17:41:20',
      'pctp\tlocal\t15 May 2026 23:11:20',
    ].join('\n') + '\n');
    expect(p.chart).toBe('REF 0010');
    expect(p.birth).toEqual({ tithiAtSunrise: 'Krishna Chaturdashi', tithiEnd: '06:59:04', tithiEndGhatis: '31:24:51', samvatChaitradi: '2052' });
    expect(p.tithiPravesh).toEqual({ natal: '15 May 2026 17:41:20', local: '15 May 2026 23:11:20' });
  });
  it('refuse a field, a variant or a line they do not know, naming the line', () => {
    expect(() => parsePanchanga('chart\tX\npcbirth\tother\tx\n')).toThrow(/line 2/);
    expect(() => parsePanchanga('chart\tX\npctp\tlater\t15 May 2026 17:41:20\n')).toThrow(/line 2/);
    expect(() => parsePanchanga('chart\tX\npctp\tnatal\t2026-05-15\n')).toThrow(/line 2/);
    expect(() => parsePanchanga('chart\tX\nother\tx\n')).toThrow(/line 2/);
  });
});

describe('the Panchang printout check', () => {
  // Two days of REF 0010's June 2026 printout (Jaipur, UT+5:30) and a core table that agrees with them.
  const midnight = (day: number) => Date.UTC(2026, 5, day) / 86400000 + 2440587.5 - 5.5 / 24;
  const at = (day: number, s: number) => midnight(day) + s / 86400;
  const hms = (h: number, m: number, s: number) => h * 3600 + m * 60 + s;
  const day = (date: string, over: Partial<PanchangPrintout['days'][number]> = {}): PanchangPrintout['days'][number] => ({
    tithi: 'Krishna Chaturdashi', tithiEnd: '12:20:01', vaar: 'Sun', nakshatra: 'Rohini', nakEnd: '22:13:51', yoga: 'Dhriti', yogaEnd: '13:15:08',
    karana: 'Shakuni', karanaEnd: '12:20:01', dinman: '13:40:58', sunrise: '05:36:29', sunset: '19:17:27', moonrise: '04:29:24', moonset: '18:40:17',
    date, transits: '', ausp: 'Inausp', ...over,
  });
  const shown = (): PanchangPrintout => ({
    header: { month: 'Adhik Jyeshtha', paksha: 'Krishna', vikram: 2083, saka: 1948, from: 'Sun 14 Jun 2026', ratriman: '10:19:22', ayanamsha: 'Lahiri -24:13:43' },
    days: [day('14-06-2026'), day('15-06-2026', { tithi: 'Amavasya', tithiEnd: '...', vaar: 'Mon' })],
    extraTithis: [], lagna: [], provenance: { program: 'PL9', method: 'test', source: 'test', extractedOn: '2026-10-17' },
  });
  const row = (d: number, vara: number, tithi: string, tithiEnd: number) => ({
    year: 2026, month: 6, day: d, sunrise: at(d, hms(5, 36, 29)), sunset: at(d, hms(19, 17, 27)), nextSunrise: at(d + 1, hms(5, 36, 35)), vara,
    atSunrise: {
      tithi: { name: tithi, endJdUt: tithiEnd }, nakshatra: { name: 'Rohini', endJdUt: at(d, hms(22, 13, 51)) },
      yoga: { name: 'Dhriti', endJdUt: at(d, hms(13, 15, 8)) }, karana: { name: 'Shakuni', endJdUt: at(d, hms(12, 20, 1)) },
    },
    extraTithi: null,
  });
  const table = () => ({
    month: { name: 'Adhik Jyeshtha', paksha: 'krishna' }, vikram: 2083, saka: 1948, ayanamshaDegrees: 24 + 13 / 60 + 42.6 / 3600,
    rows: [row(14, 0, 'Krishna Chaturdashi', at(14, hms(12, 20, 1))), row(15, 1, 'Krishna Amavasya', at(16, hms(8, 0, 0)))],
  });

  it('accepts a printout the core agrees with: names without the fortnight, a second either way, an end past the next sunrise as "..."', () => {
    const t = table();
    t.rows[0]!.sunset += 1 / 86400;
    expect(verifyPanchangPrintout(shown(), t, 5.5)).toMatchObject({ failures: [], pending: [] });
  });

  it('names each value that differs, with the date of its row', () => {
    const t = table();
    t.vikram = 2082;
    t.rows[0]!.atSunrise.yoga.name = 'Shoolam';
    t.rows[0]!.atSunrise.nakshatra.endJdUt += 2 / 86400;
    t.rows[1]!.atSunrise.tithi.endJdUt = at(15, hms(23, 0, 0));
    const v = verifyPanchangPrintout(shown(), t, 5.5);
    expect(v.failures).toEqual([
      'vikram: PL9 2083, core 2082',
      '14-06-2026 nakEnd: PL9 22:13:51, core 80033 s',
      '14-06-2026 yoga: PL9 Dhriti, core Shoolam',
      '15-06-2026 tithiEnd: PL9 ..., core 82800 s',
    ]);
  });
});

describe('the birth panchanga check', () => {
  const load = async () => {
    const { readFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const { computeBirthPanchanga, clockTime, ghatis } = await import('@reverse/core');
    const { createSwissEphemeris } = await import('@reverse/ephemeris');
    const root = join(__dirname, '..');
    const fx = JSON.parse(readFileSync(join(root, 'fixtures-panchanga', 'ref-0010.json'), 'utf8')) as PanchangaFixture;
    const natal = (JSON.parse(readFileSync(join(root, 'refset-tempo.json'), 'utf8')) as { id: string; jdUt: number; latitude: number; longitudeEast: number; utcOffsetHours?: number }[]).find((r) => r.id === 'ref-0010')!;
    const eph = await createSwissEphemeris();
    try {
      const p = computeBirthPanchanga(eph, natal, { fidelity: 'pl9' }) as unknown as BirthPanchangaLike;
      const M = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const date = (jd: number) => { const d = new Date(Math.round((jd - 2440587.5) * 86400) * 1000); return `${d.getUTCDate()} ${M[d.getUTCMonth()]} ${d.getUTCFullYear()} ${clockTime(jd)}`; };
      return { fx, p, natal, fmt: { clock: (jd: number) => clockTime(jd), ghatis, date } };
    } finally { eph.close(); }
  };

  it('accepts REF 0010 as PL9 printed it, keeping apart only the differences listed for that chart', async () => {
    const { fx, p, natal, fmt } = await load();
    const weekday = (Math.floor(natal.jdUt + 0.5) + 1) % 7;
    const v = verifyBirthPanchanga(fx.pl9.birth, p, fmt, natal.jdUt, weekday, KNOWN_BIRTH_PENDING['ref-0010']);
    expect(v.failures).toEqual([]);
    expect(v.pending).toEqual([]);
    expect(v.values).toBeGreaterThan(60);
  });

  it('names each value that differs, and fails a known kind of difference in a chart not listed for it', async () => {
    const { fx, p, natal, fmt } = await load();
    const weekday = (Math.floor(natal.jdUt + 0.5) + 1) % 7;
    const shifted = { ...p, sunset: p.sunset + 5 / 86400, saka: p.saka + 1, vara: ((p.vara ?? 0) + 1) % 7 };
    const v = verifyBirthPanchanga(fx.pl9.birth, shifted, fmt, natal.jdUt, weekday, []);
    expect(v.failures.map((x) => x.split(':')[0])).toEqual(expect.arrayContaining(['sunset', 'saka', 'hinduWeekday']));
    expect(v.pending).toEqual([]);
  });

  it('names a known difference that no longer happens (a stale pending)', async () => {
    const { fx, p, natal, fmt } = await load();
    const weekday = (Math.floor(natal.jdUt + 0.5) + 1) % 7;
    const v = verifyBirthPanchanga(fx.pl9.birth, p, fmt, natal.jdUt, weekday, ['saka']);
    expect(v.stale).toEqual(['saka']);
    expect(verifyBirthPanchanga(fx.pl9.birth, p, fmt, natal.jdUt, weekday, []).stale).toEqual([]);
  });
});

describe('correction: the weekday of the Panchang table', () => {
  it('repeats, in the pl9 mode, the weekday of the row above after a tithi past the next sunrise (10 Jan 2026 printed Fri); the corrected mode gives Saturday', async () => {
    const { computePanchangTable } = await import('@reverse/core');
    const { createSwissEphemeris } = await import('@reverse/ephemeris');
    const eph = await createSwissEphemeris();
    try {
      const place = { latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 };
      const table = (fidelity: 'pl9' | 'corrected') => computePanchangTable(eph, { year: 2025, month: 12, day: 28 }, 14, place, 'krishnadi', { fidelity });
      const pl9 = table('pl9').rows, corrected = table('corrected').rows;
      expect([pl9[12]!.day, pl9[12]!.vara, pl9[13]!.day, pl9[13]!.vara]).toEqual([9, 5, 10, 5]);
      expect(corrected[13]!.vara).toBe(6);
      expect(pl9.filter((r, i) => r.vara !== new Date(Date.UTC(r.year, r.month - 1, r.day)).getUTCDay()).map((r) => r.day)).toEqual([10]);
    } finally { eph.close(); }
  });
});
