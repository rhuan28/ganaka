import { describe, expect, it } from 'vitest';
import { parseTransits } from '../src/transitTables';

const RAW = [
  'chart\tREF 0010',
  'at\tnow\t2026-10-17 04:36:16',
  "place\tnow\t26N55'00\t75E49'40\t-5:30:00",
  'trpos\tnow\tlagna\t03:51:58\tVir\tU.Phalg.\t-',
  'trpos\tnow\tvenus\t10:38:58\tLib\tSwati\tR',
  'trsb\tnow\tsun\t0.99',
  'trkaksha\tnow\tsun\tVir\t1\tlagna\t7\t38',
  'trgochara\tnow\ttarabala\tMitra: Good',
  'trkp\tnow\tlagna\t3\tsun\tsaturn\tvenus',
  'srpos\tnow\tmoon\t24:29\tBha',
  'trvarga\tnow\tD9\tsun\t24:19:32\tVir\tEnemy\t5\tDrm.\tInfant\tNeutral\t8/3/1',
  'trvarga\tnow\tD9\tketu\t04:32:49\tTau\tDebil.\t-\tSlp.\tDead\tNeutral\t4/11/9',
  'srdasha\tnow\t1\trahu-saturn\tFri\t09-10-2026',
  'tringress\tnow\tmercury\tGem\t07-07\t08-05\tR',
  'tringress\tnow\tsaturn\tPis\t01-01\tend\t-',
  'trcal\tnow\t2026-10\tsun\t3.445\tvenus\t7',
  'trcal\tnow\t2026-10\tsun\t1.314\tsun\t-',
  'at\tmuhurta\t2030-06-15 06:00:00',
  'trpos\tmuhurta\tjupiter\t24:48:17\tLib\tVishakha\tR',
  'event\tmuhurta\tdate\t15 Jun 2030\t15 Jun 2030',
  'event\tmuhurta\tchara\tAq-Vi-Sc-Sa-Vi\tAq-Vi-Sc-Sa-Vi',
].join('\n') + '\n';

describe('the raw transit files', () => {
  it('are read into two snapshots, each value in its place', () => {
    const t = parseTransits(RAW);
    expect(t.chart).toBe('REF 0010');
    expect(t.snaps.now!.at).toBe('2026-10-17 04:36:16');
    expect(t.snaps.now!.place).toEqual({ latitude: "26N55'00", longitude: "75E49'40", timezone: '-5:30:00' });
    expect(t.snaps.now!.pos.lagna).toEqual({ dms: '03:51:58', sign: 'Vir', nakshatra: 'U.Phalg.', retrograde: false });
    expect(t.snaps.now!.pos.venus!.retrograde).toBe(true);
    expect(t.snaps.now!.sb.sun).toBe(0.99);
    expect(t.snaps.now!.kaksha.sun).toEqual({ sign: 'Vir', bindu: 1, lord: 'lagna', ash: 7, sarva: 38 });
    expect(t.snaps.muhurta!.events).toEqual({ date: ['15 Jun 2030', '15 Jun 2030'], chains: { chara: ['Aq-Vi-Sc-Sa-Vi', 'Aq-Vi-Sc-Sa-Vi'] } });
    expect(t.snaps.now!.vargas!.D9!.sun).toEqual({ dms: '24:19:32', sign: 'Vir', dignity: 'Enemy', bindus: 5, av3: 'Drm.', av5: 'Infant', functional: 'Neutral', houses: '8/3/1' });
    expect(t.snaps.now!.vargas!.D9!.ketu!.bindus).toBeNull();
    expect(t.snaps.now!.kp!.lagna).toEqual({ pada: 3, star: 'sun', sub: 'saturn', subSub: 'venus' });
    expect(t.snaps.now!.sunrise).toEqual({ pos: { moon: { dm: '24:29', nakshatra: 'Bha' } }, dasha: [{ chain: 'rahu-saturn', weekday: 'Fri', date: '09-10-2026' }] });
    expect(t.snaps.now!.gochara.tarabala).toBe('Mitra: Good');
    expect(t.snaps.now!.ingress).toEqual([
      { planet: 'mercury', sign: 'Gem', from: '07-07', to: '08-05', retrograde: true },
      { planet: 'saturn', sign: 'Pis', from: '01-01', to: 'end', retrograde: false },
    ]);
    expect(t.snaps.now!.calendar).toEqual({ month: '2026-10', marks: [
      { planet: 'sun', day: 3.445, lord: 'venus', ash: 7 },
      { planet: 'sun', day: 1.314, lord: 'sun', ash: null },
    ] });
    expect(t.snaps.muhurta!.at).toBe('2030-06-15 06:00:00');
    expect(t.snaps.muhurta!.pos.jupiter!.dms).toBe('24:48:17');
  });
  it('refuse a line, a snapshot, a point, a sign or a value they do not know, naming the line', () => {
    expect(() => parseTransits('chart\tX\nother\tnow\n')).toThrow(/line 2/);
    expect(() => parseTransits('chart\tX\nat\tlater\t2026-10-17 04:36:16\n')).toThrow(/line 2/);
    expect(() => parseTransits('chart\tX\ntrpos\tnow\tpluto\t03:51:58\tVir\tU.Phalg.\t-\n')).toThrow(/line 2/);
    expect(() => parseTransits('chart\tX\ntrpos\tnow\tsun\t03:51:58\tXyz\tU.Phalg.\t-\n')).toThrow(/line 2/);
    expect(() => parseTransits('chart\tX\ntrkaksha\tnow\tsun\tVir\t2\tlagna\t7\t38\n')).toThrow(/line 2/);
    expect(() => parseTransits('chart\tX\ntrsb\tnow\tsun\tx\n')).toThrow(/line 2/);
    expect(() => parseTransits('chart\tX\ntrgochara\tnow\tother\tx\n')).toThrow(/line 2/);
    expect(() => parseTransits('chart\tX\ntringress\tnow\tsun\tPis\t13-01\tend\t-\n')).toThrow(/line 2/);
    expect(() => parseTransits('chart\tX\ntrcal\tnow\t2026-10\tsun\tx\tvenus\t7\n')).toThrow(/line 2/);
  });
});

describe('the check of a transit snapshot', () => {
  const point = (longitude: number, retrograde = false) => ({ longitude, sign: Math.floor(longitude / 30), nakshatra: 0, pada: 1, retrograde });
  const t = {
    points: { lagna: point(65.152), sun: point(59.707361), moon: point(228.987778), mars: point(54.359722), mercury: point(48.654167), jupiter: point(204.804722, true), venus: point(26.8025), saturn: point(37.465), rahu: point(232.074722, true), ketu: point(52.074722, true) },
    kakshas: { sun: { sign: 1, kaksha: 8, lord: 'lagna', bindu: 1, ash: 4, sarva: 31 } },
    shadbalaRatio: { sun: 1.1612 },
    tarabala: { count: 7, name: 'Vadha', good: false },
    chandrabala: { house: 8, good: false },
  } as never;
  const snap = parseTransits([
    'chart\tREF 0010',
    'trpos\tmuhurta\tsun\t29:42:26\tTau\tMrigashi\t-',
    'trpos\tmuhurta\tjupiter\t24:48:17\tLib\tVishakha\tR',
    'trpos\tmuhurta\trahu\t22:04:29\tSco\tJyeshtha\t-',
    'trkaksha\tmuhurta\tsun\tTau\t1\tlagna\t4\t31',
    'trsb\tmuhurta\tsun\t1.16',
    'trgochara\tmuhurta\ttarabala\tVadha: Dangers',
    'trgochara\tmuhurta\tchandrabala\t8 Inauspicious',
    'trgochara\tmuhurta\tvimshottari\tRa-Ve-Su-Me-Ve',
  ].join('\n')).snaps.muhurta!;
  it('takes the printed seconds as truncated, compares kakshas and texts exactly, the nodes never marked R', async () => {
    const { verifyTransitSnapshot } = await import('../src/transitTables');
    expect(verifyTransitSnapshot(snap, t, { vimshottari: 'Ra-Ve-Su-Me-Ve' })).toEqual({ values: 8, failures: [] });
    const off = { ...(t as object), shadbalaRatio: { sun: 1.17 }, tarabala: { count: 8, name: 'Mitra', good: true } } as never;
    expect(verifyTransitSnapshot(snap, off, { vimshottari: 'Ra-Ve-Su-Me-Ju' }).failures).toEqual([
      'sb sun: PL9 1.16, core 1.1700', 'tarabala: PL9 Vadha: Dangers, core Mitra', 'vimshottari: PL9 Ra-Ve-Su-Me-Ve, core Ra-Ve-Su-Me-Ju',
    ]);
  });
  it('compares the KP lords of each point printed', async () => {
    const { verifyTransitSnapshot } = await import('../src/transitTables');
    const { kpLords } = await import('@reverse/core');
    const k = kpLords(59.707361);
    const withKp = { ...snap, kp: { sun: { pada: k.pada, star: k.star, sub: k.sub, subSub: k.subSub } } };
    expect(verifyTransitSnapshot(withKp, t).failures).toEqual([]);
    const wrong = { ...snap, kp: { sun: { ...withKp.kp.sun, sub: k.sub === 'sun' ? 'moon' : 'sun' } } };
    expect(verifyTransitSnapshot(wrong, t).failures.map((f) => f.split(':')[0])).toEqual(['kp sun']);
  });
});

describe('the check of the sunrise chart', () => {
  // REF 0010: the Moon at 24°29' Aries (Bharani) at the sunrise of 27 May 1995; Rahu-Saturn from 9 Oct 2026, a Friday.
  const shown = {
    pos: { moon: { dm: '24:29', nakshatra: 'Bha' }, sun: { dm: '12:12', nakshatra: 'Ro' }, venus: { dm: '19:17', nakshatra: 'BhaB' } },
    dasha: [{ chain: 'rahu-saturn', weekday: 'Fri', date: '09-10-2026' }, { chain: 'rahu-mercury', weekday: 'Tue', date: '14-08-2029' }],
  };
  const friday = Date.UTC(2026, 9, 9, 12) / 86400000 + 2440587.5;
  const computed = {
    points: { moon: { longitude: 24 + 29.6 / 60 }, sun: { longitude: 42 + 12.2 / 60 }, venus: { longitude: 19 + 16.996 / 60 } },
    periods: [{ chain: 'rahu-jupiter', start: friday - 900 }, { chain: 'rahu-saturn', start: friday }, { chain: 'rahu-mercury', start: Date.UTC(2029, 7, 14, 6) / 86400000 + 2440587.5 }],
    utcOffsetHours: 0,
  };
  it('takes the degrees rounded to the second, shown to the minute (Venus 19°16\'59.8" printed 19:17, the Moon 24°29\'36" 24:29), the nakshatra by its first letters, the dashas from the first row', async () => {
    const { verifySunrise } = await import('../src/transitTables');
    expect(verifySunrise(shown, computed)).toEqual({ values: 5, failures: [] });
  });
  it('takes a start within 15 seconds of midnight as printed on either day (REF 0278: 9.5 s before)', async () => {
    const { verifySunrise } = await import('../src/transitTables');
    const late = { ...computed, periods: computed.periods.map((p, i) => (i === 1 ? { ...p, start: Date.UTC(2026, 9, 9) / 86400000 + 2440587.5 - 9.5 / 86400 } : p)) };
    expect(verifySunrise(shown, late).failures).toEqual([]);
  });
  it('starts the dashas at the period running at the print\'s clock', async () => {
    const { verifySunrise } = await import('../src/transitTables');
    expect(verifySunrise(shown, { ...computed, startJdUt: friday + 10 })).toEqual({ values: 6, failures: [] });
    expect(verifySunrise(shown, { ...computed, startJdUt: friday - 10 }).failures.map((f) => f.split(':')[0])).toEqual(['sunrise dasha start']);
    // A period starting within a minute after the clock may already be the first row printed.
    expect(verifySunrise(shown, { ...computed, startJdUt: friday - 30 / 86400 }).failures).toEqual([]);
    // A clock before the first period (a birth after the clock) starts the list at the first.
    const early = { ...computed, periods: computed.periods.slice(1) };
    expect(verifySunrise(shown, { ...early, startJdUt: friday - 1000 }).failures).toEqual([]);
  });
  it('names each value that differs', async () => {
    const { verifySunrise } = await import('../src/transitTables');
    const off = { ...computed, points: { ...computed.points, moon: { longitude: 25 } }, periods: computed.periods.map((p, i) => (i === 2 ? { ...p, chain: 'rahu-ketu' } : p)) };
    expect(verifySunrise(shown, off).failures.map((f) => f.split(':')[0])).toEqual(['sunrise moon', 'sunrise dasha 2']);
  });
});

describe('the check of the Events page', () => {
  it('compares the four dashas of both events with the core at the instant given', async () => {
    const { verifyEvents } = await import('../src/transitTables');
    const shown = { date: ['15 Jun 2030', '15 Jun 2030'] as [string, string], chains: { chara: ['Aq-Vi-Sc-Sa-Vi', 'Aq-Vi-Sc-Sa-Vi'] as [string, string], vimshottari: ['Ra-Ve-Su-Me-Ve', 'Ra-Ve-Su-Me-Ve'] as [string, string] } };
    expect(verifyEvents(shown, { chara: 'Aq-Vi-Sc-Sa-Vi', vimshottari: 'Ra-Ve-Su-Me-Ve' })).toEqual({ values: 4, failures: [] });
    expect(verifyEvents(shown, { chara: 'Aq-Vi-Sc-Sa-Li', vimshottari: 'Ra-Ve-Su-Me-Ve' }).failures).toEqual([
      'event today chara: PL9 Aq-Vi-Sc-Sa-Vi, core Aq-Vi-Sc-Sa-Li', 'event muhurta chara: PL9 Aq-Vi-Sc-Sa-Vi, core Aq-Vi-Sc-Sa-Li',
    ]);
  });
});

describe('the check of the transit vargas', () => {
  const shown = { D9: { sun: { dms: '24:19:32', sign: 'Vir', dignity: 'Enemy', bindus: 5, av3: 'Drm.', av5: 'Infant', functional: 'Neutral', houses: '8/3/1' },
    rahu: { dms: '04:32:49', sign: 'Sco', dignity: 'Debil.', bindus: 5, av3: 'Slp.', av5: 'Dead', functional: 'Benefic', houses: '10/5/3' } } };
  const row = (o: object) => ({ degree: 24 + 19 / 60 + 32.4 / 3600, sign: 5, dignity: 7, bindus: 5, jagradadi: 'dreaming', baladi: 'infant', functional: 'neutral', houses: [8, 3, 1], ...o });
  const core = { D9: { sun: row({}), rahu: row({ degree: 4 + 32 / 60 + 49.2 / 3600, sign: 7, dignity: 9, jagradadi: 'sleeping', baladi: 'dead', functional: 'benefic', houses: [10, 5, 3] }) } };
  it('compares every column, the nodes\' functional nature included', async () => {
    const { verifyVargas } = await import('../src/transitTables');
    expect(verifyVargas(shown as never, core as never)).toEqual({ values: 16, failures: [] });
    const off = { D9: { ...core.D9, sun: row({ bindus: 4, houses: [8, 3, 2] }) } };
    expect(verifyVargas(shown as never, off as never).failures.map((f) => f.split(':')[0])).toEqual(['D9 sun bindus', 'D9 sun houses']);
  });
});

describe('the Kota Chakra (worksheet 114)', () => {
  it('is read, and the places compared with the core\'s', async () => {
    const { verifyKota } = await import('../src/transitTables');
    const k = parseTransits('chart\tREF 0010\nkotascore\tnow\t-4.5\nkota\tnow\tmars\t6\nkota\tnow\tmoon\t17\n').snaps.now!.kota!;
    expect(k).toEqual({ score: -4.5, places: { mars: 6, moon: 17 } });
    expect(verifyKota(k, { mars: 6, moon: 17 })).toEqual({ values: 2, failures: [] });
    expect(verifyKota(k, { mars: 7, moon: 17 }).failures).toEqual(['kota mars: PL9 6, core 7']);
  });
});

describe('the Panch Pakshi (worksheet 39)', () => {
  const raw = [
    'chart\tREF 0010',
    'pakshi\tnow\tSat\tBright\tpeacock\tcock\towl\tvulture',
    'pakshiyama\tnow\tday\t1\t06:30:26\t08:47:07\twalking',
    'pakshipart\tnow\tday\t1\t1\tpeacock\twalking\tself\t06:30:26',
    'pakshipart\tnow\tday\t1\t2\tvulture\truling\tfriend\t07:04:36',
  ].join('\n') + '\n';
  it('is read, and compared with the core\'s, the times within two seconds', async () => {
    const { verifyPakshi } = await import('../src/transitTables');
    const { panchPakshiDay } = await import('@reverse/core');
    const k = parseTransits(raw).snaps.now!.pakshi!;
    expect(k.yamas.day[0]!.parts[1]).toEqual({ bird: 'vulture', activity: 'ruling', relation: 'friend', time: '07:04:36' });
    const ist = (d: number, h: number, m: number, s: number) => Date.UTC(2026, 9, d, h, m, s) / 86400000 + 2440587.5 - 5.5 / 24;
    const core = { bird: 'peacock', bright: true, weekday: 6, vara: 6, ...panchPakshiDay('peacock', true, 6, ist(17, 6, 30, 27), ist(17, 17, 53, 48), ist(18, 6, 31, 0)) } as const;
    expect(verifyPakshi(k, core, 5.5)).toEqual({ values: 17, failures: [] });
    expect(verifyPakshi(k, { ...core, bright: false }, 5.5).failures).toEqual(['pakshi half: PL9 Bright, core Dark']);
  });
});

describe('the SB# and VB of the transit table (worksheet 106)', () => {
  it('are read, and compared with the core\'s; the nodes\' VB as any other', async () => {
    const { verifySbVb } = await import('../src/transitTables');
    const k = parseTransits('chart\tREF 0010\ntrsbvb\tnow\tmercury\t5\t13\ntrsbvb\tnow\trahu\t-\t13\ntrsbvb\tnow\tketu\t-\t-\n').snaps.now!.sbvb!;
    expect(k).toEqual({ mercury: { strong: 5, vb: 13 }, rahu: { strong: null, vb: 13 }, ketu: { strong: null, vb: null } });
    expect(verifySbVb(k, { mercury: 5 } as never, { mercury: 12.5, rahu: 12 } as never)).toEqual({ values: 3, failures: ['vb rahu: PL9 13, core 12.00'], pending: [] });
    expect(verifySbVb(k, { mercury: 4 } as never, { mercury: 12.4, rahu: 13 } as never).failures).toEqual(['sb# mercury: PL9 5, core 4', 'vb mercury: PL9 13, core 12.40']);
  });
});
