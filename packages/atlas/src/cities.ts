import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// The cities of GeoNames (https://www.geonames.org, CC BY 4.0) with a population of 1000 or more, as
// scripts/build-cities.ts reduces them to data/.

export interface City {
  id: number;
  name: string;
  asciiName: string;
  /** Up to 8 other names in Latin script. */
  altNames: string[];
  country: { code: string; name: string };
  admin1: { code: string; name: string } | null;
  latitude: number;
  longitude: number;
  /** The IANA zone, canonical. */
  timeZone: string;
  population: number;
}

let cached: City[] | undefined;

export function loadCities(): City[] {
  if (cached) return cached;
  const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'data');
  const table = (file: string) => new Map(readFileSync(join(dir, file), 'utf8').split('\n').filter(Boolean).map((l) => l.split('\t') as [string, string]));
  const countries = table('countries.tsv'), regions = table('admin1.tsv');
  cached = readFileSync(join(dir, 'cities.tsv'), 'utf8').split('\n').filter(Boolean).map((line) => {
    const [id, name, asciiName, alt, country, admin1, lat, lon, zone, population] = line.split('\t') as string[];
    const region = regions.get(`${country}.${admin1}`);
    return {
      id: Number(id), name: name!, asciiName: asciiName!, altNames: alt ? alt.split('|') : [],
      country: { code: country!, name: countries.get(country!) ?? country! },
      admin1: region ? { code: admin1!, name: region } : null,
      latitude: Number(lat), longitude: Number(lon), timeZone: zone!, population: Number(population),
    };
  });
  return cached;
}
