import { describe, expect, it } from 'vitest';
import { CLASSICAL_VARGAS, VARGAS, VARGA_PARTS, signOf, vargaSign, type ClassicalVargaName } from '../src/index';

const PARTS: Record<ClassicalVargaName, number> = { D1: 1, D2: 2, D3: 3, D4: 4, D7: 7, D9: 9, D10: 10, D12: 12, D16: 16, D20: 20, D24: 24, D27: 27, D30: 30, D40: 40, D45: 45, D60: 60 };

/** Worked examples of docs/spec/vargas.md: 15° Aries, 25° Taurus, 29°30' Pisces. */
const EXAMPLES: Record<ClassicalVargaName, [number, number, number]> = {
  D1: [0, 1, 11], D2: [5, 4, 4], D3: [4, 9, 7], D4: [6, 10, 8], D7: [3, 0, 11], D9: [4, 4, 11], D10: [5, 5, 4], D12: [6, 11, 10],
  D16: [8, 5, 11], D20: [10, 0, 11], D24: [4, 11, 2], D27: [1, 1, 11], D30: [8, 9, 7], D40: [8, 3, 9], D45: [10, 5, 4], D60: [6, 3, 10],
};

/** Unequal parts of the D30: upper limit in degrees and sign, for odd and for even signs. */
const D30_ODD: [number, number][] = [[5, 0], [10, 10], [18, 8], [25, 2], [30, 6]];
const D30_EVEN: [number, number][] = [[5, 1], [12, 5], [20, 11], [25, 9], [30, 7]];

describe('vargaSign', () => {
  it('lists the sixteen classical vargas', () => {
    expect(CLASSICAL_VARGAS).toHaveLength(16);
  });
  it('is the sign itself in D1', () => {
    for (let lon = 0; lon < 360; lon += 7.3) expect(vargaSign(lon, 'D1')).toBe(signOf(lon));
  });
  it.each(CLASSICAL_VARGAS)('returns a sign from 0 to 11 everywhere, including the ends of the circle (%s)', (v) => {
    for (const lon of [0, -0, 1e-13, 29.999999999999, 30, 359.9999999999999, 360, -1e-20, 725]) {
      const s = vargaSign(lon, v);
      expect(Number.isInteger(s) && s >= 0 && s <= 11, `${v} at ${lon} gave ${s}`).toBe(true);
    }
  });
  it.each(CLASSICAL_VARGAS.filter((v) => v !== 'D30' && v !== 'D2'))('gives a boundary to the part that begins there (%s)', (v) => {
    const n = PARTS[v];
    for (let k = 0; k < 12 * n; k++) {
      const boundary = (k * 30) / n;
      expect(vargaSign(boundary, v), `${v} part ${k}`).toBe(vargaSign(boundary + 1e-9, v));
    }
  });
  it.each(CLASSICAL_VARGAS.filter((v) => v !== 'D30'))('is constant inside a part (%s)', (v) => {
    const n = PARTS[v];
    for (let k = 0; k < 12 * n; k += 5) {
      const a = (k * 30) / n;
      expect(vargaSign(a + 0.1 / n, v)).toBe(vargaSign(a + 29.9 / n, v));
    }
  });
  it('follows the unequal parts of the D30, the limit belonging to the part that ends there, as in PL9', () => {
    for (const [first, table] of [[0, D30_ODD], [30, D30_EVEN], [240, D30_ODD], [330, D30_EVEN]] as const) {
      let from = 0;
      for (const [to, sign] of table) {
        expect(vargaSign(first + (from + to) / 2, 'D30'), `${first}+${from}..${to}`).toBe(sign);
        expect(vargaSign(first + from + 1e-9, 'D30')).toBe(sign);
        if (to < 30) expect(vargaSign(first + to, 'D30'), `limit ${first}+${to}`).toBe(sign);
        from = to;
      }
    }
  });
  it('reproduces the worked examples of docs/spec/vargas.md', () => {
    for (const v of CLASSICAL_VARGAS) {
      expect([vargaSign(15, v), vargaSign(55, v), vargaSign(359.5, v)], v).toEqual(EXAMPLES[v]);
    }
  });
  it('at exactly 15 degrees of an odd sign gives Virgo in D2 as PL9 does, and Cancer in the corrected mode', () => {
    for (const sign of [0, 2, 4, 6, 8, 10]) {
      const lon = sign * 30 + 15;
      expect(vargaSign(lon, 'D2', 'pl9'), `sign ${sign}`).toBe(5);
      expect(vargaSign(lon, 'D2'), 'the low-level default is the PL9 reproduction').toBe(5);
      expect(vargaSign(lon, 'D2', 'corrected')).toBe(3);
    }
  });
  it('agrees between the modes everywhere else in D2, including the neighbours of 15 degrees and even signs', () => {
    const next = (x: number) => x + 2 ** -44;
    const prev = (x: number) => x - 2 ** -44;
    for (let sign = 0; sign < 12; sign++) {
      const mid = sign * 30 + 15;
      const odd = sign % 2 === 0;
      for (const lon of [prev(mid), next(mid), sign * 30, sign * 30 + 7, sign * 30 + 22]) {
        expect(vargaSign(lon, 'D2', 'pl9'), `${lon}`).toBe(vargaSign(lon, 'D2', 'corrected'));
      }
      expect(vargaSign(prev(mid), 'D2', 'corrected')).toBe(odd ? 4 : 3);
      expect(vargaSign(next(mid), 'D2', 'corrected')).toBe(odd ? 3 : 4);
      if (!odd) expect(vargaSign(mid, 'D2', 'pl9')).toBe(4);
    }
  });
  it('does not depend on the mode in any other varga', () => {
    for (const v of CLASSICAL_VARGAS.filter((x) => x !== 'D2')) {
      for (let lon = 0; lon < 360; lon += 0.25) expect(vargaSign(lon, v, 'pl9')).toBe(vargaSign(lon, v, 'corrected'));
    }
  });
  it('rejects a non-finite longitude and an unknown varga', () => {
    expect(() => vargaSign(Number.NaN, 'D9')).toThrow();
    expect(() => vargaSign(10, 'D13' as never)).toThrow();
  });
});

const at = (sign: number, degrees: number) => sign * 30 + degrees;
/** Signs of every part of a sign, sampled at the middle of each part. */
const row = (varga: Parameters<typeof vargaSign>[1], sign: number) =>
  Array.from({ length: VARGA_PARTS[varga] }, (_, p) => vargaSign(at(sign, ((p + 0.5) * 30) / VARGA_PARTS[varga]), varga));

describe('the 45 vargas', () => {
  it('lists 45 names, the sixteen classical ones first', () => {
    expect(VARGAS).toHaveLength(45);
    expect(new Set(VARGAS).size).toBe(45);
    expect(VARGAS.slice(0, 16)).toEqual([...CLASSICAL_VARGAS]);
    expect(VARGAS[16]).toBe('D5');
    expect(VARGAS[44]).toBe('D30-venkatesha');
  });
  it('gives a sign from 0 to 11 everywhere, and the same for a longitude taken round the circle', () => {
    for (const v of VARGAS) for (let k = 0; k < 720; k++) {
      const lon = k * 0.5 + 0.123;
      const s = vargaSign(lon, v);
      expect(Number.isInteger(s) && s >= 0 && s <= 11, `${v} at ${lon}`).toBe(true);
      expect(vargaSign(lon - 360, v), `${v} at ${lon} - 360`).toBe(s);
      expect(vargaSign(lon + 720, v), `${v} at ${lon} + 720`).toBe(s);
    }
  });
  it('gives a sign at every exact boundary of a part', () => {
    for (const v of VARGAS) for (let s = 0; s < 12; s++) for (let p = 0; p <= VARGA_PARTS[v]; p++) {
      const r = vargaSign(at(s, (p * 30) / VARGA_PARTS[v]), v);
      expect(Number.isInteger(r) && r >= 0 && r <= 11, `${v} sign ${s} part ${p}`).toBe(true);
    }
  });
  it('multiplies the longitude in the continuous vargas', () => {
    for (const v of ['D150', 'D2-parivritti', 'D3-parivritti', 'D4-parivritti', 'D10-parivritti', 'D12-parivritti', 'D30-parivritti', 'D5-parivritti', 'D6-kaulaka'] as const)
      for (const lon of [0.5, 17.3, 123.456, 251.9, 359.2]) expect(vargaSign(lon, v), `${v} ${lon}`).toBe(Math.floor(((lon * VARGA_PARTS[v]) % 360) / 30));
  });
  it('follows the rule of each of the other vargas', () => {
    expect(row('D5', 0)).toEqual([0, 10, 8, 2, 6]);
    expect(row('D5', 1)).toEqual([1, 5, 11, 9, 7]);
    expect(row('D6', 0)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(row('D6', 1)).toEqual([6, 7, 8, 9, 10, 11]);
    expect(row('D8', 0)[0]).toBe(0);
    expect(row('D8', 1)[0]).toBe(8);
    expect(row('D8', 2)[0]).toBe(4);
    expect(row('D11', 0).slice(0, 3)).toEqual([0, 1, 2]);
    expect(row('D11', 1).slice(0, 3)).toEqual([11, 0, 1]);
    expect([0, 1, 2, 3, 4, 5].flatMap((s) => row('D2-samasaptaka', s))).toEqual([6, 0, 1, 7, 8, 2, 9, 3, 4, 10, 11, 5]);
    expect(row('D2-samasaptaka', 6)).toEqual([6, 0]);
    expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((s) => row('D2-kashinatha', s))).toEqual(
      [[7, 0], [1, 6], [5, 2], [3, 4], [4, 3], [2, 5], [6, 1], [0, 7], [11, 8], [9, 10], [10, 9], [8, 11]]);
    expect(row('D2-somanatha', 0)).toEqual([0, 1]);
    expect(row('D2-somanatha', 1)).toEqual([1, 0]);
    expect(row('D2-somanatha', 11)).toEqual([11, 10]);
    expect(row('D3-jagannatha', 0)).toEqual([0, 4, 8]);
    expect(row('D3-jagannatha', 1)).toEqual([9, 1, 5]);
    expect(row('D3-jagannatha', 2)).toEqual([6, 10, 2]);
    expect(row('D3-jagannatha', 3)).toEqual([3, 7, 11]);
    expect(row('D3-jagannatha', 4)).toEqual([0, 4, 8]);
    expect(row('D3-somanatha', 0)).toEqual([0, 1, 2]);
    expect(row('D3-somanatha', 1)).toEqual([11, 10, 9]);
    expect(row('D3-somanatha', 2)).toEqual([3, 4, 5]);
    expect(row('D3-somanatha', 7)).toEqual([2, 1, 0]);
    expect(row('D3-somanatha', 8)).toEqual([0, 1, 2]);
    expect(row('D4-vedamsha', 0)).toEqual([0, 3, 6, 9]);
    expect(row('D4-vedamsha', 1)).toEqual([4, 7, 10, 1]);
    expect(row('D4-vedamsha', 2)).toEqual([8, 11, 2, 5]);
    expect(row('D9-pada', 0)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    expect(row('D9-pada', 3)).toEqual([3, 2, 1, 0, 11, 10, 9, 8, 7]);
    expect(row('D9-pada', 7)).toEqual([3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(row('D9-pada', 10)).toEqual([6, 5, 4, 3, 2, 1, 0, 11, 10]);
    expect(row('D9-nadi', 1)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
    expect(row('D9-nadi', 2)).toEqual([6, 7, 8, 9, 10, 11, 0, 1, 2]);
    expect(row('D9-nadi', 5)).toEqual([9, 8, 7, 6, 5, 4, 3, 2, 1]);
    expect(row('D9-somanatha', 1)).toEqual([2, 1, 0, 11, 10, 9, 8, 7, 6]);
    expect(row('D9-somanatha', 2)).toEqual([9, 10, 11, 0, 1, 2, 3, 4, 5]);
    expect(row('D9-somanatha', 7)).toEqual([5, 4, 3, 2, 1, 0, 11, 10, 9]);
    expect(row('D16-iyer', 0).slice(0, 3)).toEqual([0, 1, 2]);
    expect(row('D16-iyer', 1).slice(0, 3)).toEqual([4, 3, 2]);
    expect(row('D11-iyer', 0)).toEqual([0, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
    expect(row('D11-iyer', 5)).toEqual(row('D11-iyer', 0));
    expect(row('D24-parasiddhamsha', 0).slice(0, 3)).toEqual([4, 5, 6]);
    expect(row('D24-parasiddhamsha', 1).slice(0, 3)).toEqual([3, 2, 1]);
    expect(row('D24-siddhamsha', 0).slice(0, 3)).toEqual([4, 3, 2]);
    expect(row('D24-siddhamsha', 1).slice(0, 3)).toEqual([3, 2, 1]);
    expect(row('D30-venkatesha', 3).slice(0, 3)).toEqual([3, 4, 5]);
  });
  it('composes the navamsha and the dwadashamsha in the two vargas of 108 parts', () => {
    for (const lon of [1.2, 42.4, 127.25, 227.29, 329.69]) {
      expect(vargaSign(lon, 'D108-nd')).toBe(vargaSign((lon * 9) % 360, 'D12'));
      const s = Math.floor(lon / 30), d = lon - 30 * s;
      expect(vargaSign(lon, 'D108-dn')).toBe(vargaSign((((s + d / 2.5) * 30) % 360), 'D9'));
    }
  });
  it('agrees with PL9 on a chart printed from it', () => {
    // Sun at 12°23'58" of Taurus: signs PL9 shows for it.
    const sun = 42.399439710103;
    const seen: [Parameters<typeof vargaSign>[1], number][] = [
      ['D5', 11], ['D6', 8], ['D8', 11], ['D11', 3], ['D150', 7], ['D2-parivritti', 2], ['D2-samasaptaka', 1], ['D3-parivritti', 4],
      ['D4-parivritti', 5], ['D10-parivritti', 2], ['D12-parivritti', 4], ['D30-parivritti', 6], ['D5-parivritti', 7], ['D16-iyer', 10],
      ['D11-iyer', 8], ['D108-nd', 8], ['D108-dn', 5], ['D2-kashinatha', 1], ['D2-somanatha', 1], ['D3-jagannatha', 1], ['D3-somanatha', 10],
      ['D4-vedamsha', 7], ['D6-kaulaka', 8], ['D9-pada', 0], ['D9-nadi', 6], ['D9-somanatha', 11], ['D24-parasiddhamsha', 6],
      ['D24-siddhamsha', 6], ['D30-venkatesha', 1],
    ];
    for (const [v, sign] of seen) expect(vargaSign(sun, v, 'pl9'), v).toBe(sign);
  });
  it('at exactly 0 degrees of a sign gives Taurus in D11-iyer as PL9 does, and Aries in the corrected mode', () => {
    // Inside a sign D11-iyer never gives Taurus: its eleven parts give Aries and Pisces down to Gemini.
    const inside = new Set(Array.from({ length: 12 * 110 }, (_, k) => vargaSign(k * (360 / (12 * 110)) + 0.01, 'D11-iyer', 'pl9')));
    expect(inside.has(1)).toBe(false);
    for (let s = 0; s < 12; s++) {
      expect(vargaSign(30 * s, 'D11-iyer', 'pl9'), `sign ${s}`).toBe(1);
      expect(vargaSign(30 * s, 'D11-iyer', 'corrected'), `sign ${s}`).toBe(0);
    }
    // Everywhere else the two modes agree.
    for (let k = 1; k < 3600; k++) if (k % 300 !== 0) expect(vargaSign(k / 10, 'D11-iyer', 'corrected')).toBe(vargaSign(k / 10, 'D11-iyer', 'pl9'));
  });
});
