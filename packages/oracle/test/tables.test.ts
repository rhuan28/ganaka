import { describe, expect, it } from 'vitest';
import { mergeTables, parseTables } from '../src/tables';

const RAW = [
  'chart\tREF 0001', 'method\tscreen', '# comment', '',
  'sign\tsun\t4', 'nakshatra\tsun\t8', 'pada\tsun\t2', 'retro\tmars\t1', 'retro\tsun\t0',
  ...Array.from({ length: 12 }, (_, k) => `cusp\tsripati\t${k + 1}\t${(10.5 + 30 * k).toFixed(4)}`),
  'house\tsripati\tsun\t10', 'varga\tD9\tsun\t12', 'varga\tD1\tsun\t4',
].join('\n');

describe('parseTables', () => {
  const t = parseTables(RAW);
  it('reads identity and method', () => {
    expect([t.chart, t.method]).toEqual(['REF 0001', 'screen']);
  });
  it('converts signs and nakshatras to zero-based indices and keeps pada and house as shown', () => {
    expect(t.signs.sun).toBe(3);
    expect(t.nakshatras.sun).toBe(7);
    expect(t.padas.sun).toBe(2);
    expect(t.houses.sripati!.sun).toBe(10);
    expect(t.vargas.D9!.sun).toBe(11);
    expect(t.retrograde).toEqual({ mars: true, sun: false });
  });
  it('reads where each house begins, as it reads the cusps', () => {
    const lines = Array.from({ length: 12 }, (_, k) => ['start', 'sripati', k + 1, (355.5 + 30 * k) % 360].join('\t'));
    const withStarts = parseTables([RAW, ...lines].join('\n'));
    expect(withStarts.starts.sripati).toHaveLength(12);
    expect(withStarts.starts.sripati![1]).toBeCloseTo(25.5, 6);
    expect(() => parseTables(['chart\tREF 0001', 'method\tpdf', 'start\tequal\t1\t10'].join('\n'))).toThrow(/12/);
  });
  it('collects the twelve cusps of a system in order', () => {
    expect(t.cusps.sripati).toHaveLength(12);
    expect(t.cusps.sripati![11]).toBeCloseTo(340.5, 6);
  });
  it.each([
    ['sign\tsun\t13', /sign/], ['sign\tsun\t0', /sign/], ['pada\tsun\t5', /pada/], ['nakshatra\tsun\t28', /nakshatra/],
    ['varga\tD13\tsun\t1', /varga/], ['house\tsripati\tsun\t13', /house/], ['cusp\tsripati\t1\t360', /cusp/],
    ['sign\tvulcan\t1', /point/], ['bogus\tx', /line/], ['sign\tsun', /line/], ['sign\tsun\t1.5', /sign/],
  ])('rejects the bad line %j', (line, message) => {
    expect(() => parseTables(`chart\tREF 0001\nmethod\tscreen\n${line}`)).toThrow(message);
  });
  it('rejects a file without identity, a duplicate value and an incomplete cusp set', () => {
    expect(() => parseTables('sign\tsun\t1')).toThrow(/chart/);
    expect(() => parseTables('chart\tREF 0001\nmethod\tpdf\nsign\tsun\t1\nsign\tsun\t2')).toThrow(/duplicate/);
    expect(() => parseTables('chart\tREF 0001\nmethod\tpdf\ncusp\tequal\t1\t10')).toThrow(/12/);
  });
});

const HEAD = 'chart\tREF 0010\nmethod\tx\n';
/** What a raw file holds, without its identity. */
const held = (text: string) => {
  const { chart, method, ...pl9 } = parseTables(text);
  void chart;
  void method;
  return pl9;
};

describe('longitudes and the vargas read from the printed PDFs', () => {
  it('reads longitudes shown to the second or to the minute', () => {
    const t = parseTables(HEAD + 'longitude\tmandi\tminute\t58.383333\nlongitude\tgulikaEnd\tsecond\t70.651111\n');
    expect(t.longitudes).toEqual({ mandi: { degrees: 58.383333, shown: 'minute' }, gulikaEnd: { degrees: 70.651111, shown: 'second' } });
  });
  it('gives a file without longitudes an empty set of them', () => {
    expect(parseTables(HEAD + 'sign\tsun\t1\n').longitudes).toEqual({});
  });
  it('refuses a longitude with an unknown key, an unknown precision, a value outside the circle, or given twice', () => {
    expect(() => parseTables(HEAD + 'longitude\tfoo\tminute\t1\n')).toThrow(/foo/);
    expect(() => parseTables(HEAD + 'longitude\tmandi\thour\t1\n')).toThrow(/hour/);
    expect(() => parseTables(HEAD + 'longitude\tmandi\tminute\t360\n')).toThrow(/360/);
    expect(() => parseTables(HEAD + 'longitude\tmandi\tminute\tx\n')).toThrow(/longitude/);
    expect(() => parseTables(HEAD + 'longitude\tmandi\tminute\n')).toThrow(/line/);
    expect(() => parseTables(HEAD + 'longitude\tmandi\tminute\t1\nlongitude\tmandi\tminute\t1\n')).toThrow(/duplicate/);
  });
  it('accepts the new vargas and the two new points', () => {
    const t = parseTables(HEAD + 'varga\tD9-somanatha\tmandi\t3\nvarga\tD150\tbhrigu\t12\n');
    expect(t.vargas['D9-somanatha']).toEqual({ mandi: 2 });
    expect(t.vargas.D150).toEqual({ bhrigu: 11 });
  });
  it('merges what two readings hold', () => {
    const a = held(HEAD + 'sign\tsun\t2\nvarga\tD9\tsun\t1\n');
    const b = held(HEAD + 'varga\tD9\tsun\t1\nvarga\tD9\tmandi\t4\nvarga\tD5\tsun\t12\nlongitude\tmandi\tminute\t58.383333\n');
    const m = mergeTables(a, b);
    expect(m.signs).toEqual({ sun: 1 });
    expect(m.vargas.D9).toEqual({ sun: 0, mandi: 3 });
    expect(m.vargas.D5).toEqual({ sun: 11 });
    expect(m.longitudes.mandi).toEqual({ degrees: 58.383333, shown: 'minute' });
    // The inputs are left as they were.
    expect(a.vargas.D9).toEqual({ sun: 0 });
  });
  it('refuses to merge two readings that disagree, naming the value', () => {
    const a = held(HEAD + 'sign\tsun\t2\nvarga\tD9\tsun\t1\nlongitude\tmandi\tminute\t58.383333\n');
    expect(() => mergeTables(a, held(HEAD + 'varga\tD9\tsun\t2\n'))).toThrow(/D9.*sun/);
    expect(() => mergeTables(a, held(HEAD + 'sign\tsun\t3\n'))).toThrow(/sign.*sun/);
    expect(() => mergeTables(a, held(HEAD + 'longitude\tmandi\tminute\t58.4\n'))).toThrow(/mandi/);
  });
  it('keeps the cusps of the first reading and adds the systems only the second has', () => {
    const twelve = (system: string, kind: string, base: number) => Array.from({ length: 12 }, (_, k) => `${kind}\t${system}\t${k + 1}\t${base + k}`).join('\n') + '\n';
    const a = held(HEAD + twelve('sripati', 'cusp', 10));
    const b = held(HEAD + twelve('sripati', 'cusp', 10.0001) + twelve('equal', 'cusp', 40));
    const m = mergeTables(a, b);
    expect(m.cusps.sripati![0]).toBe(10);
    expect(m.cusps.equal![0]).toBe(40);
  });
  it('merges into a fixture written before longitudes existed', () => {
    const b = held(HEAD + 'longitude\tmandi\tminute\t58.383333\n');
    const old = { signs: {}, nakshatras: {}, padas: {}, retrograde: {}, cusps: {}, houses: {}, vargas: {} } as unknown as typeof b;
    const m = mergeTables(old, b);
    expect(m.longitudes.mandi!.shown).toBe('minute');
    expect(m.starts).toEqual({});
  });
});

describe('the Jaimini lines', () => {
  const twelve = (varga: string, base: number) => Array.from({ length: 12 }, (_, k) => `arudha\t${varga}\t${k + 1}\t${((base + k) % 12) + 1}`).join('\n') + '\n';
  const JAIMINI = HEAD + twelve('D1', 3) + twelve('D9', 0) + twelve('D10', 5)
    + ['AK', 'AmK', 'BK', 'MK', 'PiK', 'GK', 'DK'].map((n, k) => `karaka\t7\t${n}\t${['saturn', 'moon', 'mercury', 'venus', 'jupiter', 'sun', 'mars'][k]}`).join('\n') + '\n'
    + 'special\tarudhaLagna\t10\nspecial\tupapada\t8\nspecial\tkarakamsha\t3\nspecial\tinduLagna\t8\n'
    + 'aspect\tmovableFixed\tmoon-mars\naspect\tdual\tsun-rahu-ketu\n'
    + 'longitude\tbhavaLagna\tsecond\t114.915833\noptions\tkarakas=eight,bhavapada=knrao\n';
  it('reads the padas, the karakas, the special points, the aspects, the special lagnas and the options', () => {
    const t = parseTables(JAIMINI);
    expect(t.arudhas.D1).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11, 0, 1, 2]);
    expect(t.arudhas.D10![0]).toBe(5);
    expect(t.karakas['7']).toEqual(['saturn', 'moon', 'mercury', 'venus', 'jupiter', 'sun', 'mars']);
    expect(t.special).toEqual({ arudhaLagna: 9, upapada: 7, karakamsha: 2, induLagna: 7 });
    expect(t.aspects).toEqual({ movableFixed: ['moon-mars'], dual: ['sun-rahu-ketu'] });
    expect(t.longitudes.bhavaLagna).toEqual({ degrees: 114.915833, shown: 'second' });
    expect(t.options).toEqual({ karakas: 'eight', bhavapada: 'knrao' });
  });
  it('refuses an incomplete pada chart, a karaka out of its place, an unknown special point, aspect or option', () => {
    expect(() => parseTables(HEAD + 'arudha\tD1\t1\t4\n')).toThrow(/pada/);
    expect(() => parseTables(HEAD + 'karaka\t7\tPuK\tsun\n')).toThrow(/karaka/);
    expect(() => parseTables(HEAD + 'karaka\t7\tAK\tpluto\n')).toThrow(/karaka/);
    expect(() => parseTables(HEAD + 'special\tvarnada\t1\n')).toThrow(/varnada/);
    expect(() => parseTables(HEAD + 'aspect\tmovableFixed\tmoon-pluto\n')).toThrow(/aspect/);
    expect(() => parseTables(HEAD + 'options\tkarakas=nine\n')).toThrow(/option/);
  });
  it('merges the Jaimini lines and refuses a disagreement', () => {
    const a = held(JAIMINI);
    const m = mergeTables(held(HEAD + 'sign\tsun\t2\n'), a);
    expect(m.arudhas.D9).toEqual(a.arudhas.D9);
    expect(m.special.upapada).toBe(7);
    expect(() => mergeTables(a, held(HEAD + 'special\tupapada\t9\n'))).toThrow(/upapada/);
  });
});
