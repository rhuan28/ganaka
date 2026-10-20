import { describe, expect, it } from 'vitest';
import { EXPORT_POINTS, parseBirthdat } from '../src/birthdat';

const LINE =
  'Chesta 2017\t0\t1\tAccra\tGreater Accra\tGhana\t01:07:2017\t12:00:00\t2457936.000000000000\t0.000000000000\t0.000000000000\t0.216666700000\t5.550000000000\t' +
  '75.743871097706\t171.094467825890\t83.563523135942\t87.246087212557\t169.821498431830\t32.073060740445\t239.246091920389\t121.195539089119\t301.195539089119\t' +
  '209.077204431039\t150.922795568961\t330.922795568961\t29.077204431039\t45.743871091039\t96.929738765349\t219.585168724201\t3.995464210905\t320.105338386811\t264.241062386629\t165.837330196784';

describe('parseBirthdat', () => {
  it('names twenty points in export order', () => {
    expect(EXPORT_POINTS).toHaveLength(20);
    expect(EXPORT_POINTS[0]).toBe('sun');
    expect(EXPORT_POINTS[19]).toBe('lagna');
  });

  it('reads name, Julian day, coordinates and the twenty longitudes', () => {
    const [e] = parseBirthdat(LINE);
    expect(e!.name).toBe('Chesta 2017');
    expect(e!.julianDay).toBe(2457936);
    expect(e!.longitudeWest).toBe(0.2166667);
    expect(e!.latitude).toBe(5.55);
    expect(e!.longitudes.sun).toBe(75.743871097706);
    expect(e!.longitudes.ketu).toBe(301.195539089119);
    expect(e!.longitudes.lagna).toBe(165.837330196784);
    expect(Object.keys(e!.longitudes)).toEqual([...EXPORT_POINTS]);
  });

  it('accepts a byte-order mark, CRLF line ends and a trailing blank line', () => {
    const out = parseBirthdat('\uFEFF' + LINE + '\r\n' + LINE + '\r\n\r\n');
    expect(out).toHaveLength(2);
    expect(out[1]!.longitudes.lagna).toBe(165.837330196784);
  });

  it('rejects a line with too few fields and says which line', () => {
    expect(() => parseBirthdat(LINE + '\nREF 0001\t0\t1')).toThrow(/line 2/);
  });

  it('rejects a longitude that is not a number', () => {
    expect(() => parseBirthdat(LINE.replace('75.743871097706', 'abc'))).toThrow(/line 1.*sun/);
  });
});
