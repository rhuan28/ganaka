import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { VARGAS } from '@reverse/core';
import { run } from '../src/main';

const data = (name: string) => new URL(`./data/${name}`, import.meta.url);
const expected = (name: string) => readFileSync(new URL(`./expected/${name}`, import.meta.url), 'utf8');
const io = () => {
  const o = { out: '', err: '' };
  return { o, io: { readFile: (p: string) => readFileSync(p, 'utf8'), out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) } };
};
const path = (name: string) => fileURLToPath(data(name));

describe('chart command', () => {
  it('prints the chart of a JSON file as JSON', async () => {
    const { o, io: i } = io();
    expect(await run([path('chart.json'), '--format', 'json'], i)).toBe(0);
    expect(o.out).toBe(expected('chart.json.txt'));
    expect(o.err).toBe('');
  });
  it('prints the chart of a PL9 XML file as a table, the default format', async () => {
    const { o, io: i } = io();
    expect(await run([path('chart.xml')], i)).toBe(0);
    expect(o.out).toBe(expected('chart.table.txt'));
  });
  it('gives the same result for the same chart in both input formats', async () => {
    const a = io();
    const b = io();
    await run([path('chart.json'), '--format', 'json'], a.io);
    await run([path('chart.xml'), '--format', 'json'], b.io);
    expect(a.o.out).toBe(b.o.out);
  });
  it('computes in the corrected mode unless told otherwise, and says so', async () => {
    const a = io();
    const b = io();
    await run([path('chart.json'), '--format', 'json'], a.io);
    await run([path('chart.json'), '--format', 'json', '--fidelity', 'pl9'], b.io);
    expect(JSON.parse(a.o.out).fidelity).toBe('corrected');
    expect(JSON.parse(b.o.out).fidelity).toBe('pl9');
  });
  it('gives a chart beyond the polar circle, with what is missing, and exit code 0', async () => {
    const o = { out: '', err: '' };
    const code = await run(['polar.json'], { readFile: () => '{"jdUt":2451545,"latitude":75,"longitudeEast":20}', out: (t) => void (o.out += t), err: (t) => void (o.err += t) });
    expect(code).toBe(0);
    expect(o.out).toMatch(/missing: lagna/);
    expect(o.err).toBe('');
  });
  it('takes the Gulika method, which moves Gulika and nothing else', async () => {
    const a = io();
    const b = io();
    await run([path('chart.json'), '--format', 'json', '--gulika', 'end'], a.io);
    await run([path('chart.json'), '--format', 'json', '--gulika', 'beginning'], b.io);
    const pa = JSON.parse(a.o.out).points;
    const pb = JSON.parse(b.o.out).points;
    expect(pb.gulika.longitude).not.toBeCloseTo(pa.gulika.longitude, 3);
    expect({ ...pb, gulika: 0 }).toEqual({ ...pa, gulika: 0 });
  });
  it('gives Mandi, the Bhrigu point and the 45 vargas', async () => {
    const j = io();
    await run([path('chart.json'), '--format', 'json'], j.io);
    const chart = JSON.parse(j.o.out);
    expect(chart.points.mandi.longitude).toBeGreaterThanOrEqual(0);
    expect(chart.points.bhrigu.longitude).toBeGreaterThanOrEqual(0);
    expect(Object.keys(chart.vargas)).toHaveLength(45);
    const t = io();
    await run([path('chart.json')], t.io);
    const lines = t.o.out.split('\n');
    expect(lines.some((l) => l.startsWith('mandi '))).toBe(true);
    expect(lines.some((l) => l.startsWith('bhrigu '))).toBe(true);
    for (const v of VARGAS.slice(16)) expect(lines.filter((l) => l.startsWith(`${v} `)), v).toHaveLength(1);
  });
  it('applies the ayanamsha and the offset', async () => {
    const a = io();
    const b = io();
    await run([path('chart.json'), '--format', 'json'], a.io);
    await run([path('chart.json'), '--format', 'json', '--ayanamsha', 'raman', '--offset', '1'], b.io);
    expect(JSON.parse(b.o.out).points.sun.longitude).not.toBeCloseTo(JSON.parse(a.o.out).points.sun.longitude, 3);
  });
  it.each([
    ['no file', []], ['a missing file', ['nope.json']], ['an unknown format', ['x.json', '--format', 'yaml']],
    ['an unknown ayanamsha', [path('chart.json'), '--ayanamsha', 'nope']], ['a non-numeric offset', [path('chart.json'), '--offset', 'abc']],
    ['an unknown flag', [path('chart.json'), '--verbose']], ['an unknown mode', [path('chart.json'), '--fidelity', 'exact']],
    ['an option without its value', [path('chart.json'), '--ayanamsha']], ['an empty offset', [path('chart.json'), '--offset', '']],
    ['an option where a value should be', [path('chart.json'), '--offset', '--format', 'json']],
    ['an unknown Gulika method', [path('chart.json'), '--gulika', 'middle']], ['the Gulika method without its value', [path('chart.json'), '--gulika']],
  ])('fails cleanly with %s: message on stderr, nothing on stdout, non-zero exit', async (_name, argv) => {
    const { o, io: i } = io();
    expect(await run(argv, i)).not.toBe(0);
    expect(o.out).toBe('');
    expect(o.err.length).toBeGreaterThan(0);
    expect(o.err).not.toMatch(/\n\s+at /);
  });
  it('fails cleanly with a malformed chart and with a date outside the ephemeris data', async () => {
    for (const text of ['{', '{"jdUt":1000000,"latitude":0,"longitudeEast":0}']) {
      const o = { out: '', err: '' };
      const code = await run(['bad.json'], { readFile: () => text, out: (t) => void (o.out += t), err: (t) => void (o.err += t) });
      expect(code).not.toBe(0);
      expect(o.out).toBe('');
      expect(o.err.length).toBeGreaterThan(0);
    }
  });
});

describe('dashas command', () => {
  const inline = (text: string) => {
    const o = { out: '', err: '' };
    return { o, io: { readFile: () => text, out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) } };
  };
  it('prints the dashas as JSON with every period down to the levels asked', async () => {
    const { o, io: i } = io();
    expect(await run(['dashas', path('chart.json'), '--format', 'json', '--levels', '2', '--system', 'yogini', '--cycles', '1'], i)).toBe(0);
    const d = JSON.parse(o.out);
    expect(d.system).toBe('yogini');
    expect(d.fidelity).toBe('corrected');
    expect(d.periods).toHaveLength(8);
    expect(d.periods[0].sub).toHaveLength(8);
    expect(d.periods[0].sub[0].sub).toBeUndefined();
    expect(o.err).toBe('');
  });
  it('prints a table with calendar dates on the chart clock', async () => {
    const a = inline('{"jdUt":2451545,"latitude":20,"longitudeEast":30}');
    const b = inline('{"jdUt":2451545,"latitude":20,"longitudeEast":30,"utcOffsetHours":5.5}');
    expect(await run(['dashas', 'x.json', '--levels', '1'], a.io)).toBe(0);
    expect(await run(['dashas', 'x.json', '--levels', '1'], b.io)).toBe(0);
    expect(a.o.out).toMatch(/^mode: corrected/);
    expect(a.o.out).toMatch(/system: vimshottari/);
    const first = (s: string) => s.split('\n').find((l) => /^\S+\s+\d\d-\d\d-\d{4} \d\d:\d\d/.test(l))!;
    const [, , ha, ma] = /(\d\d-\d\d-\d{4}) (\d\d):(\d\d)/.exec(first(a.o.out))!.slice(0);
    const [, , hb, mb] = /(\d\d-\d\d-\d{4}) (\d\d):(\d\d)/.exec(first(b.o.out))!.slice(0);
    expect((Number(hb) * 60 + Number(mb) - Number(ha) * 60 - Number(ma) + 1440) % 1440).toBe(330);
  });
  it('takes the year, the base and the mode', async () => {
    const a = inline('{"jdUt":2451545,"latitude":20,"longitudeEast":30}');
    expect(await run(['dashas', 'x.json', '--format', 'json', '--year', '360', '--base', 'sun', '--fidelity', 'pl9', '--levels', '1'], a.io)).toBe(0);
    const d = JSON.parse(a.o.out);
    expect(d.options).toMatchObject({ yearDays: '360', base: 'sun' });
    expect(d.fidelity).toBe('pl9');
  });
  it('refuses unknown options and values, and the options not implemented yet', async () => {
    for (const args of [['--cycles', '0'], ['--system', 'nope'], ['--levels', '9'], ['--year', '365'], ['--base', 'pluto'], ['--varga', 'D10'], ['--format', 'xml'], ['--bogus']]) {
      const a = inline('{"jdUt":2451545,"latitude":20,"longitudeEast":30}');
      expect(await run(['dashas', 'x.json', ...args], a.io), args.join(' ')).toBe(1);
      expect(a.o.out).toBe('');
      expect(a.o.err).not.toBe('');
    }
  });
  it('gives a typed error for a Lagna base where the Lagna is not defined', async () => {
    const a = inline('{"jdUt":2451545,"latitude":75,"longitudeEast":30}');
    expect(await run(['dashas', 'x.json', '--base', 'lagna'], a.io)).toBe(1);
    expect(a.o.err).toMatch(/LagnaUndefinedError/);
  });
});

describe('dashas command with the Kalachakra', () => {
  it('prints the signs, the Deha and the Jeeva, and takes the two options', async () => {
    const o = { out: '', err: '' };
    const i = { readFile: () => '{"jdUt":2451545,"latitude":20,"longitudeEast":30}', out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) };
    expect(await run(['dashas', 'x.json', '--system', 'kalachakra', '--levels', '1'], i)).toBe(0);
    expect(o.out).toMatch(/deha: \w+, jeeva: \w+/);
    expect(o.out).toMatch(/^(aries|taurus|gemini|cancer|leo|virgo|libra|scorpio|sagittarius|capricorn|aquarius|pisces)\s+\d\d-/m);
    const e = { out: '', err: '' };
    const j = { ...i, out: (t: string) => void (e.out += t), err: (t: string) => void (e.err += t) };
    expect(await run(['dashas', 'x.json', '--system', 'kalachakra', '--kc-antardashas', '9', '--fidelity', 'pl9'], j)).toBe(1);
    expect(e.err).toMatch(/NotImplementedOptionError/);
    // Corrected, both options are offered.
    const c = { out: '', err: '' };
    const k = { ...i, out: (t: string) => void (c.out += t), err: (t: string) => void (c.err += t) };
    expect(await run(['dashas', 'x.json', '--system', 'kalachakra', '--kc-antardashas', '9', '--kc-sequence', 'same-pada', '--levels', '2'], k)).toBe(0);
  });
});

describe('dashas command with a rashi dasha', () => {
  it('works with the default options', async () => {
    const o = { out: '', err: '' };
    const i = { readFile: () => '{"jdUt":2451545,"latitude":20,"longitudeEast":30}', out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) };
    expect(await run(['dashas', 'x.json', '--system', 'chara'], i)).toBe(0);
    expect(o.err).toBe('');
    expect(o.out).toMatch(/system: chara/);
  });
  it('takes the options of the Dashas preferences', async () => {
    const out = (args: string[]) => {
      const o = { out: '', err: '' };
      const i = { readFile: () => '{"jdUt":2451545,"latitude":20,"longitudeEast":30}', out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) };
      return run(['dashas', 'x.json', ...args], i).then((code) => ({ code, ...o }));
    };
    const kn = await out(['--system', 'chara', '--levels', '1']);
    const pa = await out(['--system', 'chara', '--levels', '1', '--chara-method', 'parashara', '--chara-antar-from-lord', 'yes']);
    expect(pa.code).toBe(0);
    expect(pa.out).not.toBe(kn.out);
    for (const args of [['--antar-start', 'lord'], ['--rahu-exaltation', 'gemini'], ['--mercury-exaltation', 'anywhere']]) {
      expect((await out(['--system', 'narayana', ...args])).code, args.join(' ')).toBe(0);
    }
    const bad = await out(['--system', 'chara', '--chara-method', 'jaimini']);
    expect(bad.code).toBe(1);
    expect(bad.err).toMatch(/chara-method/);
  });
});

describe('strengths command', () => {
  const call = async (args: string[]) => {
    const o = { out: '', err: '' };
    const i = { readFile: () => '{"jdUt":2451545,"latitude":20,"longitudeEast":30}', out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) };
    return { code: await run(['strengths', 'x.json', ...args], i), ...o };
  };
  it('prints the Ashtakavarga: a row of twelve signs for each chart, the Sarva and the pindas', async () => {
    const t = await call(['--part', 'ashtakavarga']);
    expect(t.code).toBe(0);
    expect(t.out).toMatch(/^sarva(\s+\d+){12}\s*$/m);
    expect(t.out).toMatch(/^sun(\s+\d+){12}\s*$/m);
    expect(t.out).toMatch(/sodhya/);
    const j = await call(['--part', 'ashtakavarga', '--format', 'json', '--av-method', 'parashara', '--ekadhipatya', 'other', '--virgo', '5']);
    expect(j.code).toBe(0);
    const parsed = JSON.parse(j.out);
    expect(parsed.sarva.reduce((a: number, b: number) => a + b, 0)).toBe(337);
    expect(parsed.options).toEqual({ method: 'parashara', ekadhipatya: 'other', virgoMultiplier: 5 });
  });
  it('refuses a wrong value or part', async () => {
    const bad = await call(['--part', 'ashtakavarga', '--virgo', '4']);
    expect(bad.code).toBe(1);
    expect(bad.err).toMatch(/--virgo/);
    const part = await call(['--part', 'avasthas']);
    expect(part.code).toBe(1);
    expect(part.err).toMatch(/avasthas/);
  });
  it('prints the Shadbala: a column per planet, a row per part, the war below', async () => {
    const t = await call(['--part', 'shadbala']);
    expect(t.code).toBe(0);
    expect(t.out).toMatch(/^\s+sun\s+moon\s+mars\s+mercury\s+jupiter\s+venus\s+saturn\s*$/m);
    expect(t.out).toMatch(/^total(\s+-?\d+\.\d\d){7}\s*$/m);
    expect(t.out).toMatch(/^rank(\s+[1-7]){7}\s*$/m);
    const j = await call(['--part', 'shadbala', '--format', 'json', '--drekkana', 'hora-ratnam', '--dig', 'kendras', '--mercury-paksha', 'benefic', '--mercury-drik', 'benefic', '--jup-merc-drik', 'quarter']);
    expect(j.code).toBe(0);
    const parsed = JSON.parse(j.out);
    expect(parsed.options).toEqual({ drekkana: 'horaRatnam', digBala: 'kendras', mercuryPaksha: 'benefic', mercuryDrik: 'benefic', jupiterMercuryDrik: 'quarter' });
    expect(Object.keys(parsed.planets)).toEqual(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']);
  });
  it('prints the Bhava Bala: a row per house, with the options of the Shadbala', async () => {
    const t = await call(['--part', 'bhava', '--jup-merc-drik', 'quarter']);
    expect(t.code).toBe(0);
    expect(t.out).toMatch(/^\s*1\s+[A-Z][a-z]{2}\s+\d+(\s+-?\d+\.\d\d){7}\s*$/m);
    expect(t.out.trim().split('\n').filter((l) => /^\s*\d+\s+[A-Z][a-z]{2}\s/.test(l)).length).toBe(12);
    const j = JSON.parse((await call(['--part', 'bhava', '--format', 'json'])).out);
    expect(j.houses.length).toBe(12);
    const bad = await call(['--part', 'bhava', '--virgo', '5']);
    expect(bad.code).toBe(1);
    expect(bad.err).toMatch(/--virgo/);
  });
  it('prints the Vimshopaka: a row per planet with the four groups, and the dignities in the 16 vargas', async () => {
    const t = await call(['--part', 'vimshopaka']);
    expect(t.code).toBe(0);
    expect(t.out).toMatch(/^sun(\s+\d+\.\d\d){4}\s*$/m);
    expect(t.out).toMatch(/^ketu(\s+\d+\.\d\d){4}\s*$/m);
    expect(t.out).toMatch(/^D60(\s+[1-9]){9}\s*$/m);
    const j = JSON.parse((await call(['--part', 'vimshopaka', '--format', 'json'])).out);
    expect(Object.keys(j.planets)).toEqual(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu']);
    const bad = await call(['--part', 'vimshopaka', '--dig', 'kendras']);
    expect(bad.code).toBe(1);
    expect(bad.err).toMatch(/--dig/);
  });
  it("refuses an option of another part, or a wrong value", async () => {
    const other = await call(['--part', 'shadbala', '--virgo', '5']);
    expect(other.code).toBe(1);
    expect(other.err).toMatch(/--virgo/);
    const back = await call(['--part', 'ashtakavarga', '--dig', 'kendras']);
    expect(back.code).toBe(1);
    expect(back.err).toMatch(/--dig/);
    const value = await call(['--part', 'shadbala', '--jup-merc-drik', 'half']);
    expect(value.code).toBe(1);
    expect(value.err).toMatch(/--jup-merc-drik/);
  });
});

describe('transits command', () => {
  const call = async (args: string[]) => {
    const o = { out: '', err: '' };
    const i = { readFile: () => '{"jdUt":2449865.4694097,"latitude":44.2377778,"longitudeEast":-150.6744444}', out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) };
    return { code: await run(['transits', 'x.json', ...args], i), ...o };
  };
  it('takes --at as Jaipur time by default, as UT with --utc, and Jaipur as the place unless --place says otherwise', async () => {
    const local = JSON.parse((await call(['--at', '2030-06-15 06:00:00', '--format', 'json'])).out);
    expect(local.at.jdUt).toBeCloseTo(2462667.75 - 5.5 / 24, 9);
    expect([local.at.latitude, local.at.longitudeEast]).toEqual([26.9166667, 75.8277778]);
    const ut = JSON.parse((await call(['--at', '2030-06-15 06:00:00', '--utc', '--format', 'json'])).out);
    expect(ut.at.jdUt).toBeCloseTo(2462667.75, 9);
    const there = JSON.parse((await call(['--at', '2030-06-15 06:00:00', '--place', '-23.55,-46.63', '--format', 'json'])).out);
    expect([there.at.latitude, there.at.longitudeEast]).toEqual([-23.55, -46.63]);
  });
  it('prints the transit positions, the kakshas, the Shadbala, Tarabala, Chandrabala and the dashas', async () => {
    const t = await call(['--at', '2030-06-15 06:00:00']);
    expect(t.code).toBe(0);
    expect(t.out).toMatch(/^lagna\s+\d\d°\d\d'\d\d" \w{3}/m);
    expect(t.out).toMatch(/^ketu\s+\d\d°\d\d'\d\d" \w{3}/m);
    expect(t.out).toMatch(/^sun\s+\w{3}\s+[1-8]\s+\w+\s+[01]\s+\d\s+\d+\s+\d+\.\d\d\s*$/m);
    expect(t.out).toMatch(/^tarabala\s+[1-9] \w+ (good|bad)\s*$/m);
    expect(t.out).toMatch(/^chandrabala\s+\d+ (good|bad)\s*$/m);
    expect(t.out).toMatch(/^vimshottari\s+\w\w(-\w\w){4}\s*$/m);
    expect(t.out).toMatch(/^narayana\s+(Ar|Ta|Ge|Ca|Le|Vi|Li|Sc|Sa|Cp|Aq|Pi)(-(Ar|Ta|Ge|Ca|Le|Vi|Li|Sc|Sa|Cp|Aq|Pi)){4}\s*$/m);
  });
  it('prints a dash for the Narayana of a birth without a Lagna', async () => {
    const o = { out: '', err: '' };
    const i = { readFile: () => '{"jdUt":2449865.4694097,"latitude":89.5,"longitudeEast":-150.6744444}', out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) };
    expect(await run(['transits', 'x.json', '--at', '2030-06-15 06:00:00'], i)).toBe(0);
    expect(o.out).toMatch(/^narayana\s+—\s*$/m);
  });
  it('refuses a missing or malformed --at and a malformed --place', async () => {
    for (const args of [[], ['--at', '2030-06-15'], ['--at', '2030-13-01 00:00:00'], ['--at', '2030-06-15 06:00:00', '--place', 'x']]) {
      const r = await call(args);
      expect(r.code).toBe(1);
      expect(r.err).toMatch(/usage: transits/);
    }
  });
});

describe('panchanga command', () => {
  const call = async (args: string[]) => {
    const o = { out: '', err: '' };
    const i = { readFile: () => '{"jdUt":2449865.4694097,"latitude":44.2377778,"longitudeEast":150.6744444}', out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) };
    return { code: await run(['panchanga', 'x.json', ...args], i), ...o };
  };
  it('prints the panchanga of the birth without --at: the elements at sunrise with their ends, at birth, the calendars and the Avakhada', async () => {
    const t = await call([]);
    expect(t.code).toBe(0);
    expect(t.out).toMatch(/^sunrise\s+\d\d:\d\d:\d\d\s*$/m);
    expect(t.out).toMatch(/^next\s+(Sun|Mon|Tue|Wed|Thu|Fri|Sat) \d\d:\d\d:\d\d\s*$/m);
    expect(t.out).toMatch(/^tithi\s+\w+ \w+\s+ends \d\d:\d\d:\d\d\s+\d+:\d+:\d+ ghatis\s+at birth \w+ \w+\s*$/m);
    expect(t.out).toMatch(/^chaitradi\s+\d{4} [\w ]+\s*$/m);
    expect(t.out).toMatch(/^gana\s+\w+\s*$/m);
    const j = JSON.parse((await call(['--format', 'json'])).out);
    expect(j.saka).toBe(j.chaitradi.samvat - 135);
  });
  it('prints the panchanga of an instant with --at, Jaipur time and place unless --utc and --place', async () => {
    const j = JSON.parse((await call(['--at', '2030-06-15 06:00:00', '--format', 'json'])).out);
    expect(j.at.jdUt).toBeCloseTo(2462667.75 - 5.5 / 24, 9);
    expect([j.at.latitude, j.at.longitudeEast]).toEqual([26.9166667, 75.8277778]);
    expect(j.avakhada).toBeUndefined();
    const t = await call(['--at', '2030-06-15 06:00:00']);
    expect(t.out).toMatch(/^tithi\s+\w+ \w+\s+ends/m);
  });
  it('beyond the polar circle prints what needs no sunrise and says the sunrise is missing', async () => {
    const o = { out: '', err: '' };
    const i = { readFile: () => '{"jdUt":2449865.4694097,"latitude":78.2,"longitudeEast":15.6}', out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) };
    expect(await run(['panchanga', 'x.json'], i)).toBe(0);
    expect(o.out).toMatch(/^sunrise\s+—\s*$/m);
    expect(o.out).toMatch(/^missing\s+sunrise \(beyondPolarCircle\)\s*$/m);
    expect(o.out).toMatch(/^chaitradi\s+2052 /m);
    expect(o.out).toMatch(/^tithi\s+—\s+at birth \w+ \w+\s*$/m);
  });
  it('names the month of an instant in the --calendar mode: Adhik Jyeshtha, or First Jyeshtha in krishnadi-half, in June 2026', async () => {
    const at = ['--at', '2026-06-14 12:00:00'];
    expect((await call(at)).out).toMatch(/^month\s+Adhik Jyeshtha \(krishnadi\), Vikram 2083, Saka 1948\s*$/m);
    expect((await call([...at, '--calendar', 'shukladi'])).out).toMatch(/^month\s+Adhik Jyeshtha \(shukladi\), Vikram 2082, Saka 1948\s*$/m);
    expect((await call([...at, '--calendar', 'krishnadi-half'])).out).toMatch(/^month\s+First Jyeshtha \(krishnadi-half\)/m);
  });
  it('names the month of an instant before sunrise by its Vedic day, the day before (30 July 2026, 03:00)', async () => {
    const j = JSON.parse((await call(['--at', '2026-07-30 03:00:00', '--format', 'json'])).out);
    expect(j.calendar.name).toBe(JSON.parse((await call(['--at', '2026-07-29 12:00:00', '--format', 'json'])).out).calendar.name);
  });
  it('prints the Print -> Panchang table with --days: a row a day from the date of --at, with the header', async () => {
    const t = await call(['--at', '2026-06-14 00:00:00', '--days', '3', '--fidelity', 'pl9']);
    expect(t.code).toBe(0);
    expect(t.out).toMatch(/^Adhik Jyeshtha Krishna, Vikram 2083, Saka 1948, ayanamsha -24:13:4\d$/m);
    expect(t.out.split('\n').filter((l) => /^\d\d-06-2026 /.test(l)).map((l) => l.slice(0, 14))).toEqual(['14-06-2026 Sun', '15-06-2026 Mon', '16-06-2026 Tue']);
    expect(t.out).toMatch(/^15-06-2026 Mon .*Amavasya +08:23:5\d/m);
    expect(t.out).toMatch(/^ +then Shukla Pratipada +28:31:0\d$/m);
    const j = JSON.parse((await call(['--at', '2026-06-14 00:00:00', '--days', '3', '--format', 'json'])).out);
    expect(j.rows).toHaveLength(3);
  });
  it('refuses a malformed --at, --place, --calendar or --days, and --calendar or --days without --at', async () => {
    for (const args of [['--at', '2030-06-15'], ['--at', '2030-06-15 06:00:00', '--place', 'x'], ['--at', '2030-06-15 06:00:00', '--calendar', 'lunar'],
      ['--at', '2030-06-15 06:00:00', '--days', '0'], ['--at', '2030-06-15 06:00:00', '--days', '2.5'], ['--calendar', 'shukladi'], ['--days', '3']]) {
      const r = await call(args);
      expect(r.code).toBe(1);
      expect(r.err).toMatch(/usage: panchanga/);
    }
  });
});

describe('varshaphala command', () => {
  const call = async (args: string[]) => {
    const o = { out: '', err: '' };
    const i = { readFile: () => '{"jdUt":2449865.4694097,"latitude":44.2377778,"longitudeEast":150.6744444}', out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) };
    return { code: await run(['varshaphala', 'x.json', ...args], i), ...o };
  };
  it('prints the year of age asked: the return, the Muntha, the year lord, the Sahams and the Mudda dasha', async () => {
    const t = await call(['--year', '35', '--fidelity', 'pl9']);
    expect(t.code).toBe(0);
    expect(t.out).toMatch(/^return\s+27 May 2030 22:38:07 UT$/m);
    expect(t.out).toMatch(/^muntha\s+Gemini 16:30:5\d$/m);
    expect(t.out).toMatch(/^year lord\s+venus$/m);
    expect(t.out).toMatch(/^Punya\s+Fortune\s+Taurus 22:0\d:\d\d\s+venus$/m);
    expect(t.out).toMatch(/^mudda\s+venus\s+27-05-2030 22:38/m);
  });
  it('prints the Tripataki: the sign of each point and the planets causing vedha on it', async () => {
    const t = await call(['--year', '35', '--fidelity', 'pl9']);
    expect(t.out).toMatch(/^tripataki\s+sun\s+Leo\s+moon mercury$/m);
    expect(t.out).toMatch(/^tripataki\s+moon\s+Sagittarius\s+saturn rahu ketu$/m);
    expect(t.out).toMatch(/^tripataki\s+rahu\s+Taurus$/m);
  });
  it('beyond the polar circle prints what is missing, never NaN or undefined', async () => {
    const t = await call(['--year', '35', '--place', '85,0']);
    expect(t.code).toBe(0);
    expect(t.out).toMatch(/^missing\s+lagna/m);
    expect(t.out).not.toMatch(/NaN|undefined/);
  });
  it('refuses an --at before the birth instead of giving the year 0', async () => {
    const r = await call(['--at', '1990-06-15 06:00:00']);
    expect(r.code).toBe(1);
    expect(r.err).toMatch(/before the birth/);
  });
  it('takes the year of age that holds a date with --at (UT)', async () => {
    const a = JSON.parse((await call(['--at', '2030-06-15 06:00:00', '--format', 'json'])).out);
    expect(a.varshaphala.years).toBe(35);
  });
  it('refuses a negative or fractional --year, a malformed --at, both, or neither', async () => {
    for (const args of [['--year', '-1'], ['--year', '2.5'], ['--at', '2030-06-15'], ['--year', '3', '--at', '2030-06-15 06:00:00'], [], ['--year', '3', '--solar-return', 'x'], ['--year', '3', '--dasha', 'x']]) {
      const r = await call(args);
      expect(r.code).toBe(1);
      expect(r.err).toMatch(/usage: varshaphala/);
    }
  });
});

describe('muhurta command', () => {
  const call = async (args: string[]) => {
    const o = { out: '', err: '' };
    const i = { readFile: () => '{"jdUt":2449865.4694097,"latitude":44.2377778,"longitudeEast":150.6744444}', out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) };
    return { code: await run(['muhurta', 'x.json', ...args], i), ...o };
  };
  it('prints the Muhurta of an instant in Jaipur: Tarabala, the Avasthas and the thermometer of the activity', async () => {
    const t = await call(['--at', '2030-06-15 06:00:00', '--activity', 'travelling', '--fidelity', 'pl9']);
    expect(t.code).toBe(0);
    expect(t.out).toMatch(/^tarabala\s+7 Vadha bad$/m);
    expect(t.out).toMatch(/^sun\s.*\binfant\b/m);
    expect(t.out).toMatch(/^thermometer\s+travelling 4\.5 of 13\.5$/m);
    expect(t.out).toMatch(/^\s+dignity\s+SB%\s+SB#\s+VB\s+avastha$/m);
    expect(t.out).not.toMatch(/^(rahu|ketu)\s+\S+ R/m);
    expect(t.out).toMatch(/^narayana\s+[A-Z][a-z](-[A-Z][a-z]){4}\s*$/m);
  });
  it('prints a dash for the Narayana of a birth without a Lagna', async () => {
    const o = { out: '', err: '' };
    const i = { readFile: () => '{"jdUt":2449865.4694097,"latitude":89.5,"longitudeEast":-150.6744444}', out: (t: string) => void (o.out += t), err: (t: string) => void (o.err += t) };
    expect(await run(['muhurta', 'x.json', '--at', '2030-06-15 06:00:00'], i)).toBe(0);
    expect(o.out).toMatch(/^narayana\s+—\s*$/m);
  });
  it('gives the same thermometer for the same instant written in Jaipur time or in UT (the weekday on the place\'s clock)', async () => {
    const jaipur = JSON.parse((await call(['--at', '2030-06-15 01:30:00', '--activity', 'travelling', '--format', 'json'])).out);
    const ut = JSON.parse((await call(['--at', '2030-06-14 20:00:00', '--utc', '--activity', 'travelling', '--format', 'json'])).out);
    expect(ut.thermometer).toEqual(jaipur.thermometer);
    expect(jaipur.thermometer.inputs.weekday).toBe(7);
  });
  it('refuses an unknown activity', async () => {
    const t = await call(['--at', '2030-06-15 06:00:00', '--activity', 'x']);
    expect(t.code).toBe(1);
    expect(t.err).toMatch(/usage: muhurta/);
  });
});
