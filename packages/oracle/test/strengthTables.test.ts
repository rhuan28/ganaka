import { describe, expect, it } from 'vitest';
import { ashtakavarga, shadbala, type AvSigns } from '@reverse/core';
import { parseStrengths, SHADBALA_PARTS, verifyAshtakavarga, verifyShadbala } from '../src/strengthTables';

describe('the Vimshopaka lines', () => {
  it('are read as "group planet value" and "varga planet dignity", and refuse what they do not know', () => {
    const p = parseStrengths('chart\tREF 0010\nvim\tshadvarga\tsun\t12\nvim\tshodashavarga\tketu\t8\nvc\tD60\trahu\t3\n');
    expect(p.vim).toEqual(['shadvarga sun 12', 'shodashavarga ketu 8', 'D60 rahu 3']);
    expect(() => parseStrengths('chart\tX\nvim\tother\tsun\t12\n')).toThrow(/line 2/);
    expect(() => parseStrengths('chart\tX\nvc\tD5\tsun\t3\n')).toThrow(/line 2/);
    expect(() => parseStrengths('chart\tX\nvc\tD1\tsun\t10\n')).toThrow(/line 2/);
  });
  it('are checked against the core: the dignities exactly, the scores rounded, either way at exactly a half', async () => {
    const { verifyVimshopaka } = await import('../src/strengthTables');
    const row = { scores: { shadvarga: 12.5, saptavarga: 10.2, dashavarga: 11, shodashavarga: 9.6 }, dignities: { D1: 6, D60: 3 } };
    const v = { planets: { sun: row } } as never;
    expect(verifyVimshopaka(['shadvarga sun 12', 'saptavarga sun 10', 'shodashavarga sun 10', 'D1 sun 6', 'D60 sun 3'], v)).toEqual({ values: 5, failures: [] });
    expect(verifyVimshopaka(['shadvarga sun 13', 'saptavarga sun 11', 'D1 sun 7'], v).failures).toEqual(['saptavarga sun: PL9 11, core 10.2000', 'D1 sun: PL9 7, core 6']);
  });
});

const SIGNS: AvSigns = { sun: 0, moon: 3, mars: 5, mercury: 1, jupiter: 8, venus: 11, saturn: 6, lagna: 4 };

/** The raw lines PL9 would print for a computed Ashtakavarga. */
function raw(av: ReturnType<typeof ashtakavarga>): string {
  const lines = ['chart\tREF 0042'];
  for (const owner of Object.keys(av.bhinna) as (keyof typeof av.bhinna)[]) {
    lines.push(`av\tbhinna\t${owner}\t${av.bhinna[owner].join(' ')}`, `av\ttrikona\t${owner}\t${av.trikona[owner].join(' ')}`,
      `av\tekadhipatya\t${owner}\t${av.ekadhipatya[owner].join(' ')}`, `av\tpinda\t${owner}\t${av.pindas[owner].rashi} ${av.pindas[owner].graha} ${av.pindas[owner].sodhya}`);
    for (const c of Object.keys(av.prastara[owner]) as (keyof typeof av.bhinna)[]) lines.push(`av\tprastara\t${owner}\t${c}\t${av.prastara[owner][c].join(' ')}`);
  }
  lines.push(`av\tsarva\t${av.sarva.join(' ')}`);
  return lines.join('\n') + '\n';
}

describe('the raw strengths files', () => {
  it('are read line by line, and refuse a line they do not know', () => {
    const p = parseStrengths(raw(ashtakavarga(SIGNS)));
    expect(p.chart).toBe('REF 0042');
    expect(p.av.length).toBe(8 * 4 + 64 + 1);
    expect(() => parseStrengths('chart\tX\nav\tbhinna\tsun\t1 2 3\n')).toThrow(/line 2/);
    expect(() => parseStrengths('chart\tX\nav\tother\tsun\t' + '0 '.repeat(12) + '\n')).toThrow(/line 2/);
  });
});

describe('the check of the Ashtakavarga', () => {
  it('finds no failure where the numbers are the same, and names each that differs', () => {
    const av = ashtakavarga(SIGNS);
    const shown = parseStrengths(raw(av)).av;
    expect(verifyAshtakavarga(shown, av)).toEqual({ values: 8 * 12 * 3 + 8 * 3 + 64 * 12 + 12, failures: [] });
    const other = ashtakavarga({ ...SIGNS, moon: 4 });
    const v = verifyAshtakavarga(shown, other);
    expect(v.failures.length).toBeGreaterThan(0);
    expect(v.failures[0]).toMatch(/^(bhinna|trikona|ekadhipatya|pinda|prastara|sarva) /);
  });
});

describe('the Shadbala lines', () => {
  const sb = shadbala({
    jdUt: 2449865.4694144, longitudeEast: 150.6744, lagna: 106.51515619,
    longitudes: { sun: 42.3994397, moon: 26.88931393, mars: 127.25003407, mercury: 54.08713955, jupiter: 227.29307366, venus: 19.54352399, saturn: 329.69365902, rahu: 191.65447778, ketu: 11.65447778 },
    cusps: [106.51515619, 131.95402545, 157.39289472, 182.83176398, 217.39289472, 251.95402545, 286.51515619, 311.95402545, 337.39289472, 2.83176398, 37.39289472, 71.95402545],
    declinations: { sun: 21.45492792, moon: 18.14255227, mars: 11.3525701, mercury: 22.92750542, jupiter: -22.18415393, venus: 16.09398758, saturn: -2.65912333 },
    latitudes: { mars: 1.42358551, mercury: -0.26246678, jupiter: 0.81142425, venus: -1.46083475, saturn: -1.963193 },
    sunrise: 2449865.26742362, sunset: 2449865.89191436, night: false, sunTropical: 66.19469495,
    cheshta: { mars: 52.30194753, mercury: 55.5262967, jupiter: 58.84020147, venus: 21.00539592, saturn: 38.90066846 },
  });
  /** The page as PL9 would print it: two decimals, whole numbers for the counts. */
  const printed = (s: typeof sb) => ['chart\tREF 0010', ...SHADBALA_PARTS.flatMap((part) => (Object.keys(s.planets) as (keyof typeof s.planets)[]).map((p) => {
    const v = s.planets[p][part];
    return `sb\t${part}\t${p}\t${['rank', 'strong', 'minimum'].includes(part) ? v : v.toFixed(2)}`;
  }))].join('\n') + '\n';
  it('are read as "part planet value", and refuse a part or planet they do not know', () => {
    const p = parseStrengths(printed(sb));
    expect(p.av).toEqual([]);
    expect(p.sb.length).toBe(SHADBALA_PARTS.length * 7);
    expect(p.sb).toContain(`total sun ${sb.planets.sun.total.toFixed(2)}`);
    expect(() => parseStrengths('chart\tX\nsb\tother\tsun\t1.00\n')).toThrow(/line 2/);
    expect(() => parseStrengths('chart\tX\nsb\tdig\trahu\t1.00\n')).toThrow(/line 2/);
    expect(() => parseStrengths('chart\tX\nsb\tdig\tsun\tx\n')).toThrow(/line 2/);
  });
  it('agree with the core to half a hundredth, the counts exactly', () => {
    const shown = parseStrengths(printed(sb)).sb;
    expect(verifyShadbala(shown, sb)).toEqual({ values: SHADBALA_PARTS.length * 7, failures: [], pending: [] });
    const off = { ...sb, planets: { ...sb.planets, sun: { ...sb.planets.sun, dig: sb.planets.sun.dig + 0.02, strong: 4, rank: 3 } } };
    const v = verifyShadbala(shown, off);
    expect(v.failures).toEqual([expect.stringMatching(/^dig sun: PL9 46\.81, core 46\.83/), 'rank sun: PL9 2, core 3', 'strong sun: PL9 5, core 4']);
    expect(v.pending).toEqual([]);
  });
  it('set a rank apart as pending only where the printed ratio ties another planet', () => {
    // Mars 1.27 and Mercury 1.35 printed; make Mars print 1.35 too and swap their ranks.
    const shown = parseStrengths(printed(sb)).sb.map((l) => (l.startsWith('ratio mars ') ? 'ratio mars 1.35' : l));
    const swapped = { ...sb, planets: { ...sb.planets, mars: { ...sb.planets.mars, ratio: 1.35, rank: 3 }, mercury: { ...sb.planets.mercury, rank: 4 } } };
    expect(verifyShadbala(shown, swapped)).toEqual({ values: SHADBALA_PARTS.length * 7, failures: [], pending: ['rank mars: PL9 4, core 3', 'rank mercury: PL9 3, core 4'] });
    // A rank outside the ranks PL9 gave the tied planets is a failure all the same.
    const far = { ...swapped, planets: { ...swapped.planets, mars: { ...swapped.planets.mars, rank: 7 } } };
    expect(verifyShadbala(shown, far).failures).toContain('rank mars: PL9 4, core 7');
  });
});

describe("the check against PL9's memory", () => {
  it('compares each part at full precision, to a ten-thousandth', async () => {
    const { verifyShadbalaMemory } = await import('../src/strengthTables');
    const memory = { total: [601.03606, 287.22667, 381.04195, 567.0556, 324.78036, 357.25367, 496.39859] };
    const sb = { planets: Object.fromEntries(['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn'].map((p, i) => [p, { total: memory.total[i]! + 0.00005 }])) } as never;
    expect(verifyShadbalaMemory(memory, sb)).toEqual({ values: 7, failures: [] });
    const off = { planets: { ...(sb as { planets: object }).planets, moon: { total: 287.3 } } } as never;
    expect(verifyShadbalaMemory(memory, off).failures).toEqual([expect.stringMatching(/^total moon: PL9 287\.22667, core 287\.3/)]);
    const nan = { planets: { ...(sb as { planets: object }).planets, moon: { total: NaN } } } as never;
    expect(verifyShadbalaMemory(memory, nan).failures.length).toBe(1);
    expect(verifyShadbalaMemory({ total: memory.total.slice(0, 6) }, sb).failures.length).toBe(1);
  });
});

describe('the Bhava Bala lines', () => {
  it('are read as "part house value", and refuse a part, house or value they do not know', () => {
    const p = parseStrengths('chart\tREF 0010\nbb\tsign\t1\t3\nbb\tlord\t1\t287\nbb\tdrishti\t2\t-26\nbb\trupas\t12\t11\n');
    expect(p.bb).toEqual(['sign 1 3', 'lord 1 287', 'drishti 2 -26', 'rupas 12 11']);
    expect(() => parseStrengths('chart\tX\nbb\tother\t1\t3\n')).toThrow(/line 2/);
    expect(() => parseStrengths('chart\tX\nbb\tlord\t13\t3\n')).toThrow(/line 2/);
    expect(() => parseStrengths('chart\tX\nbb\tlord\t1\tx\n')).toThrow(/line 2/);
  });
});

describe('the check of the Bhava Bala', () => {
  it('takes the parts as truncated, the total and rupas as rounded, and names each value that differs', async () => {
    const { verifyBhavaBala } = await import('../src/strengthTables');
    const row = { sign: 3, degree: 16, lord: 287.2, dig: 0, drishti: 42.16, occupants: 0, dayNight: 0, total: 329.39, rupas: 5.49 };
    const bb = { houses: Array.from({ length: 12 }, () => ({ ...row })) };
    const shown = Array.from({ length: 12 }, (_, i) => [`sign ${i + 1} 3`, `degree ${i + 1} 16`, `lord ${i + 1} 287`, `drishti ${i + 1} 42`, `total ${i + 1} 329`, `rupas ${i + 1} 5`]).flat();
    expect(verifyBhavaBala(shown, bb)).toEqual({ values: 72, failures: [] });
    const off = { houses: bb.houses.map((h, i) => (i === 2 ? { ...h, drishti: -42.16, total: 330.6 } : h)) };
    expect(verifyBhavaBala(shown, off).failures).toEqual(['drishti 3: PL9 42, core -42.1600', 'total 3: PL9 329, core 330.6000']);
  });
});

