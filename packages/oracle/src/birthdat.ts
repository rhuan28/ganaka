export const EXPORT_POINTS = [
  'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu',
  'dhuma', 'vyatipata', 'parivesha', 'indrachapa', 'upaketu', 'gulika', 'pranaPada',
  'uranus', 'neptune', 'pluto', 'lagna',
] as const;

export interface Pl9Export {
  name: string;
  julianDay: number;
  /** Degrees, west positive, as PL9 writes it. */
  longitudeWest: number;
  latitude: number;
  /** Sidereal longitudes in degrees, keyed by EXPORT_POINTS. */
  longitudes: Record<string, number>;
}

const FIRST_POINT = 13;

export function parseBirthdat(text: string): Pl9Export[] {
  const out: Pl9Export[] = [];
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/);
  lines.forEach((line, index) => {
    if (line.trim() === '') return;
    const where = `line ${index + 1}`;
    const f = line.split('\t');
    if (f.length < FIRST_POINT + EXPORT_POINTS.length) {
      throw new Error(`${where}: expected at least ${FIRST_POINT + EXPORT_POINTS.length} fields, found ${f.length}`);
    }
    const num = (i: number, label: string) => {
      const v = Number(f[i]);
      if (f[i]!.trim() === '' || !Number.isFinite(v)) throw new Error(`${where}: ${label} is not a number: "${f[i]}"`);
      return v;
    };
    const longitudes: Record<string, number> = {};
    EXPORT_POINTS.forEach((p, k) => {
      longitudes[p] = num(FIRST_POINT + k, p);
    });
    out.push({
      name: f[0]!.trim(),
      julianDay: num(8, 'Julian day'),
      longitudeWest: num(11, 'longitude'),
      latitude: num(12, 'latitude'),
      longitudes,
    });
  });
  return out;
}
