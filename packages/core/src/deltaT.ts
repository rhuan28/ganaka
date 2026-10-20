/**
 * Delta T (TT - UT) as PL9 uses it: the algorithm and table of the Swiss Ephemeris 2.00.00
 * (function deltat_aa in swephlib.c, AGPL), with the tidal acceleration that version used.
 * See docs/spec/delta-t.md.
 */

const TABLE_START = 1620;
/** Seconds, one value per year from 1620.0 to 2019.0. The last six are that version's extrapolation. */
const TABLE: readonly number[] = [
  124, 119, 115, 110, 106, 102, 98, 95, 91, 88, // 1620
  85, 82, 79, 77, 74, 72, 70, 67, 65, 63, // 1630
  62, 60, 58, 57, 55, 54, 53, 51, 50, 49, // 1640
  48, 47, 46, 45, 44, 43, 42, 41, 40, 38, // 1650
  37, 36, 35, 34, 33, 32, 31, 30, 28, 27, // 1660
  26, 25, 24, 23, 22, 21, 20, 19, 18, 17, // 1670
  16, 15, 14, 14, 13, 12, 12, 11, 11, 10, // 1680
  10, 10, 9, 9, 9, 9, 9, 9, 9, 9, // 1690
  9, 9, 9, 9, 9, 9, 9, 9, 10, 10, // 1700
  10, 10, 10, 10, 10, 10, 10, 11, 11, 11, // 1710
  11, 11, 11, 11, 11, 11, 11, 11, 11, 11, // 1720
  11, 11, 11, 11, 12, 12, 12, 12, 12, 12, // 1730
  12, 12, 12, 12, 13, 13, 13, 13, 13, 13, // 1740
  13, 14, 14, 14, 14, 14, 14, 14, 15, 15, // 1750
  15, 15, 15, 15, 15, 16, 16, 16, 16, 16, // 1760
  16, 16, 16, 16, 16, 17, 17, 17, 17, 17, // 1770
  17, 17, 17, 17, 17, 17, 17, 17, 17, 17, // 1780
  17, 17, 16, 16, 16, 16, 15, 15, 14, 14, // 1790
  13.7, 13.4, 13.1, 12.9, 12.7, 12.6, 12.5, 12.5, 12.5, 12.5, // 1800
  12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.5, 12.4, 12.3, 12.2, // 1810
  12, 11.7, 11.4, 11.1, 10.6, 10.2, 9.6, 9.1, 8.6, 8, // 1820
  7.5, 7, 6.6, 6.3, 6, 5.8, 5.7, 5.6, 5.6, 5.6, // 1830
  5.7, 5.8, 5.9, 6.1, 6.2, 6.3, 6.5, 6.6, 6.8, 6.9, // 1840
  7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.7, 7.8, 7.8, // 1850
  7.88, 7.82, 7.54, 6.97, 6.4, 6.02, 5.41, 4.1, 2.92, 1.82, // 1860
  1.61, 0.1, -1.02, -1.28, -2.69, -3.24, -3.64, -4.54, -4.71, -5.11, // 1870
  -5.4, -5.42, -5.2, -5.46, -5.46, -5.79, -5.63, -5.64, -5.8, -5.66, // 1880
  -5.87, -6.01, -6.19, -6.64, -6.44, -6.47, -6.09, -5.76, -4.66, -3.74, // 1890
  -2.72, -1.54, -0.02, 1.24, 2.64, 3.86, 5.37, 6.14, 7.75, 9.13, // 1900
  10.46, 11.53, 13.36, 14.65, 16.01, 17.2, 18.24, 19.06, 20.25, 20.95, // 1910
  21.16, 22.25, 22.41, 23.03, 23.49, 23.62, 23.86, 24.49, 24.34, 24.08, // 1920
  24.02, 24, 23.87, 23.95, 23.86, 23.93, 23.73, 23.92, 23.96, 24.02, // 1930
  24.33, 24.83, 25.3, 25.7, 26.24, 26.77, 27.28, 27.78, 28.25, 28.71, // 1940
  29.15, 29.57, 29.97, 30.36, 30.72, 31.07, 31.35, 31.68, 32.18, 32.68, // 1950
  33.15, 33.59, 34, 34.47, 35.03, 35.73, 36.54, 37.43, 38.29, 39.2, // 1960
  40.18, 41.17, 42.23, 43.37, 44.49, 45.48, 46.46, 47.52, 48.53, 49.59, // 1970
  50.54, 51.38, 52.17, 52.96, 53.79, 54.34, 54.87, 55.32, 55.82, 56.3, // 1980
  56.86, 57.57, 58.31, 59.12, 59.98, 60.78, 61.63, 62.3, 62.97, 63.47, // 1990
  63.83, 64.09, 64.3, 64.47, 64.57, 64.69, 64.85, 65.15, 65.46, 65.78, // 2000
  66.07, 66.32, 66.6, 66.907, 67.267, 67.9, 68.4, 69, 69.5, 70, // 2010
];
const TABLE_END = TABLE_START + TABLE.length - 1;
/** Secular tidal acceleration of the Moon assumed by that version, arcseconds per century squared. */
const TIDAL_ACCELERATION = -25.82;
const J2000 = 2451545;

const at = (i: number) => TABLE[i]!;

/** Delta T in seconds for a Julian day in universal time, from the year 1620 on. */
export function pl9DeltaTSeconds(jdUt: number): number {
  if (!Number.isFinite(jdUt)) throw new RangeError('jdUt must be a finite number');
  const year = 2000 + (jdUt - J2000) / 365.2425;
  if (year < TABLE_START) throw new RangeError(`Delta T is not available before ${TABLE_START}`);

  if (year > TABLE_END) {
    // Long-term parabola, joined to the end of the table over 100 years.
    const b = 0.01 * (year - 1820);
    let ans = -20 + 31 * b * b;
    if (year <= TABLE_END + 100) {
      const b2 = 0.01 * (TABLE_END - 1820);
      ans += (-20 + 31 * b2 * b2 - at(TABLE.length - 1)) * (year - (TABLE_END + 100)) * 0.01;
    }
    return ans;
  }

  const n = TABLE.length;
  const whole = Math.floor(year);
  const iy = whole - TABLE_START;
  let ans = at(iy);
  if (iy + 1 < n) {
    // Bessel interpolation on yearly values, up to fourth differences where neighbours exist.
    const p = year - whole;
    ans += p * (at(iy + 1) - at(iy));
    if (iy - 1 >= 0 && iy + 2 < n) {
      const d: number[] = [];
      for (let i = 0, k = iy - 2; i < 5; i++, k++) d.push(k < 0 || k + 1 >= n ? 0 : at(k + 1) - at(k));
      for (let i = 0; i < 4; i++) d[i] = d[i + 1]! - d[i]!;
      let b = 0.25 * p * (p - 1);
      ans += b * (d[1]! + d[2]!);
      for (let i = 0; i < 3; i++) d[i] = d[i + 1]! - d[i]!;
      b = (2 * b) / 3;
      ans += (p - 0.5) * b * d[1]!;
      if (iy - 2 >= 0 && iy + 3 <= n) {
        for (let i = 0; i < 2; i++) d[i] = d[i + 1]! - d[i]!;
        b = 0.125 * b * (p + 1) * (p - 2);
        ans += b * (d[0]! + d[1]!);
      }
    }
  }
  // The table before 1955 assumes a tidal acceleration of -26; correct to the value in use.
  if (year < 1955) ans += -0.000091 * (TIDAL_ACCELERATION + 26) * (year - 1955) ** 2;
  return ans;
}
