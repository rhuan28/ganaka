import { describe, expect, it } from 'vitest';
import { parseTransits } from '../src/transitTables';

const RAW = [
  'chart\tREF 0010',
  'wsyear\tnow\t31\t2026-05-27 22:06:27',
  'wsplanet\tnow\tsun\t12:23:58\t-\tTau\tRohini\t1,Mo/Ra/Ju\tNeutr.\t1.12\t4,12,4\tAdol',
  'wsplanet\tnow\tketu\t10:13:31\t-\tLeo\tMagha\t4,Ke/Sa/Ve\tNeutr.\t-\t14\tYout',
  'wskaksha\tnow\tsun\tTau\t1\tsun\t4\t31',
  'wspancha\tnow\tsun\t15.0\t16.4\t3.8\t5.0\t2.5\t10.7',
  'wsoffice\tnow\tmunthaPati\tsaturn\t6.52',
  'wsyearlord\tnow\tsaturn',
  'wsmuntha\tnow\tAqu 16:30',
  'wssaham\tnow\tnatal\tPunya\tCancer\t01:00:14\tmoon',
].join('\n') + '\n';

const computed = {
  returnJdUt: Date.UTC(2026, 4, 27, 22, 6, 27.3) / 86400000 + 2440587.5,
  lagnaSpeed: 360,
  points: { sun: 42 + 23 / 60 + 58.4 / 3600, ketu: 130 + 13 / 60 + 31.6 / 3600 },
  rc: { sun: '-', ketu: '-' },
  planets: { sun: { dignity: 6, sbRatio: 1.1204, sbStrong: 4, vb: 12.2, bindus: 4, avastha: 'adolescent' }, ketu: { dignity: 6, sbRatio: null, sbStrong: null, vb: 13.6, bindus: null, avastha: 'youth' } },
  kakshas: { sun: { sign: 1, bindu: 1, lord: 'sun', ash: 4, sarva: 31 } },
  pancha: { sun: { graha: 15, uchcha: 16.43, hudda: 3.75, drekkana: 5, navamsha: 2.5, total: 10.67 } },
  offices: { munthaPati: 'saturn' },
  officeStrength: { saturn: 6.5249 },
  yearLord: 'saturn',
  munthaLongitude: 316.5,
  sahams: { natal: { Punya: { longitude: 91.0039, lord: 'moon', lagnaBound: true } }, annual: {} },
};

describe('the Varshaphala worksheets of the clock\'s year', () => {
  it('are read into the "now" snapshot', () => {
    const v = parseTransits(RAW).snaps.now!.varsha!;
    expect(v.years).toBe(31);
    expect(v.planets.sun).toEqual({ dms: '12:23:58', rc: '-', sign: 'Tau', nakshatra: 'Rohini', kp: '1,Mo/Ra/Ju', dignity: 'Neutr.', sb: '1.12', ints: [4, 12, 4], avastha: 'Adol' });
    expect(v.pancha.sun).toEqual([15, 16.4, 3.8, 5, 2.5, 10.7]);
    expect(v.offices.munthaPati).toEqual({ planet: 'saturn', strength: 6.52 });
    expect(v.sahams.natal.Punya).toEqual({ sign: 'Cancer', dms: '01:00:14', lord: 'moon' });
  });
  it('are compared with the core, the counted columns only where the row is printed whole', async () => {
    const { verifyVarshaClock } = await import('../src/varshaClockTables');
    const v = parseTransits(RAW).snaps.now!.varsha!;
    const r = verifyVarshaClock(v, computed as never, []);
    expect(r.failures).toEqual([]);
    // The return, sun (sign, degree, KP, dignity, SB, 3 counted, avastha) and Ketu without counted columns (its row is cut):
    expect(r.values).toBeGreaterThan(20);
    const off = { ...computed, yearLord: 'mars', pancha: { sun: { ...computed.pancha.sun, total: 10.9 } } };
    expect(verifyVarshaClock(v, off as never, []).failures.map((f) => f.split(':')[0])).toEqual(['pancha sun total', 'year lord']);
    expect(verifyVarshaClock(v, off as never, ['year lord']).pending.map((f) => f.split(':')[0])).toEqual(['year lord']);
  });
});

describe('the dasha lists of the clock\'s year', () => {
  const RAW2 = [
    'chart\tREF 0010',
    'wslist\tnow\tdaily\t1\tmoon\tMon\t19-10-2026',
    'wslist\tnow\tdaily\t2\tmars\tTue\t20-10-2026',
    'wsreturn\tnow\tdaily\t31\t4\t20\t2026-10-20 00:21:30',
  ].join('\n') + '\n';
  const day = (d: number, h: number) => Date.UTC(2026, 9, d, h) / 86400000 + 2440587.5;
  it('are read by list, row by row, with the returns\' headers', () => {
    const v = parseTransits(RAW2).snaps.now!.varsha!;
    expect(v.lists!.daily![1]).toEqual({ chain: 'mars', weekday: 'Tue', date: '20-10-2026' });
    expect(v.returns!.daily).toEqual({ years: 31, months: 4, days: 20, at: '2026-10-20 00:21:30' });
  });
  it('are compared row by row; one row off is a border case only for a period starting within a minute after the list\'s start', async () => {
    const { verifyVarshaLists } = await import('../src/varshaClockTables');
    const v = parseTransits(RAW2).snaps.now!.varsha!;
    const rows = [{ chain: ['moon'], startJdUt: day(19, 23) }, { chain: ['mars'], startJdUt: day(20, 0.5) }];
    const returns = { daily: day(20, 0) + (21 * 60 + 44) / 86400 };
    const lists = (r: unknown[], start: number) => ({ rows: { daily: r }, starts: { daily: start }, returns }) as never;
    expect(verifyVarshaLists(v, lists(rows, day(19, 23)))).toEqual({ values: 3, failures: [], borders: [], pending: [] });
    const off = [{ chain: ['ketu'], startJdUt: day(19, 20) }, ...rows];
    expect(verifyVarshaLists(v, lists(off, day(19, 23) - 30 / 86400)).borders).toEqual(['daily: the list starts one row off']);
    expect(verifyVarshaLists(v, lists(off, day(19, 22))).failures.map((f) => f.split(':')[0])).toEqual(['daily row 1', 'daily row 2']);
  });
  it('allow the Kalidasa a minute about midnight, and leave the rows of a pending list pending', async () => {
    const { verifyVarshaLists } = await import('../src/varshaClockTables');
    const raw = RAW2.split('\n').filter((l) => !l.startsWith('wsreturn')).join('\n').replace(/\tdaily\t/g, '\tkalidasa\t');
    const v = parseTransits(raw).snaps.now!.varsha!;
    const early = [{ chain: ['moon'], startJdUt: day(19, 23) }, { chain: ['mars'], startJdUt: day(20, 0) - 47 / 86400 }];
    expect(verifyVarshaLists(v, { rows: { kalidasa: early }, starts: {}, returns: {} } as never).failures).toEqual([]);
    const wrong = [{ chain: ['moon'], startJdUt: day(19, 23) }, { chain: ['sun'], startJdUt: day(20, 1) }];
    const r = verifyVarshaLists(v, { rows: { kalidasa: wrong }, starts: {}, returns: {} } as never, ['kalidasa']);
    expect([r.failures, r.pending.map((x) => x.split(':')[0])]).toEqual([[], ['kalidasa row 2']]);
  });
});

describe('the year of age of the clock', () => {
  it('is the core\'s at the print\'s clock; a day of age turning within a minute after it is a border case', async () => {
    const { verifyVarshaAge } = await import('../src/varshaClockTables');
    const year = 365.25636342592594;
    const natal = 2449865.4694097;
    const shown = { years: 31, returns: { monthly: { years: 31, months: 4, days: 0, at: '' }, daily: { years: 31, months: 4, days: 19, at: '' } } };
    const clock = natal + 31 * year + 4 * year / 12 + 19 * year / 360 + 1 / 1440;
    expect(verifyVarshaAge(shown as never, natal, clock)).toEqual({ values: 6, failures: [], borders: [] });
    expect(verifyVarshaAge(shown as never, natal, clock - 2 / 1440).borders).toEqual(['daily days: PL9 19, core 18 at the clock, 19 a minute later']);
    expect(verifyVarshaAge({ ...shown, years: 30 } as never, natal, clock).failures).toEqual(['year: PL9 30, core 31']);
  });
});
