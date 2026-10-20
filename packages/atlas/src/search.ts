import { loadCities, type City } from './cities';

/** Without accents and case, the spaces collapsed: "São  Paulo" → "sao paulo". */
export const foldName = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().replace(/\s+/g, ' ').trim();

let index: { keys: string[]; cities: number[] } | undefined;

/** Every name of every city, folded, from each of its words on ("sao paulo" also as "paulo"), sorted. */
function buildIndex(cities: City[]): { keys: string[]; cities: number[] } {
  const entries: [string, number][] = [];
  cities.forEach((c, i) => {
    const keys = new Set<string>();
    for (const n of [c.name, c.asciiName, ...c.altNames]) {
      const f = foldName(n);
      keys.add(f);
      for (let at = f.indexOf(' '); at >= 0; at = f.indexOf(' ', at + 1)) keys.add(f.slice(at + 1));
      for (let at = f.indexOf('-'); at >= 0; at = f.indexOf('-', at + 1)) keys.add(f.slice(at + 1));
    }
    for (const k of keys) if (k) entries.push([k, i]);
  });
  entries.sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  return { keys: entries.map((e) => e[0]), cities: entries.map((e) => e[1]) };
}

/**
 * The cities whose name (or ASCII name, or another name, or a word of one) starts with the query, compared without
 * accents and case, the most populous first; `country` narrows to an ISO code. At most `limit` (10 by default, 50 at
 * most); an empty query finds nothing.
 */
export function searchCities(query: string, o: { country?: string; limit?: number } = {}): City[] {
  const q = foldName(query);
  if (!q) return [];
  const cities = loadCities();
  index ??= buildIndex(cities);
  let lo = 0, hi = index.keys.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (index.keys[mid]! < q) lo = mid + 1; else hi = mid;
  }
  const found = new Set<number>();
  for (let i = lo; i < index.keys.length && index.keys[i]!.startsWith(q); i++) found.add(index.cities[i]!);
  const country = o.country?.toUpperCase();
  const limit = Math.min(Math.max(1, o.limit ?? 10), 50);
  // The cities whose own name starts with the query first, then those found by another name or a word, each by
  // population ("rio" gives Rio de Janeiro before a village called Rio; "paris" Paris before Warsaw, "Paris of the North").
  const tier = (c: City) => (foldName(c.name).startsWith(q) || foldName(c.asciiName).startsWith(q) ? 0 : 1);
  return [...found].map((i) => cities[i]!).filter((c) => !country || c.country.code === country)
    .map((c) => ({ c, t: tier(c) }))
    .sort((a, b) => a.t - b.t || b.c.population - a.c.population || a.c.name.localeCompare(b.c.name)).slice(0, limit).map((x) => x.c);
}
