export type Planet9 = 'sun' | 'moon' | 'mars' | 'mercury' | 'jupiter' | 'venus' | 'saturn' | 'rahu' | 'ketu';
export const PLANETS_9: readonly Planet9[] = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];

/**
 * Signs a sign aspects, by Jaimini: a movable sign the fixed signs but the next one; a fixed sign the movable signs
 * but the one before; a dual sign the other dual signs. See docs/spec/jaimini-aspects.md.
 */
export function rashiAspects(sign: number): number[] {
  const kind = sign % 3;
  const out: number[] = [];
  for (let other = 0; other < 12; other++) {
    if (other === sign) continue;
    if (kind === 0 && other % 3 === 1 && other !== (sign + 1) % 12) out.push(other);
    if (kind === 1 && other % 3 === 0 && other !== (sign + 11) % 12) out.push(other);
    if (kind === 2 && other % 3 === 2) out.push(other);
  }
  return out;
}

/**
 * The aspects PL9 lists: each planet in a movable sign with each planet in a fixed sign that its sign aspects,
 * the movable one first; and the planets in dual signs, when there are two or more, which aspect each other
 * except when in the same sign.
 */
export function jaiminiAspects(signOf: Record<Planet9, number>): { movableFixed: [Planet9, Planet9][]; dual: Planet9[] } {
  const movableFixed: [Planet9, Planet9][] = [];
  for (const a of PLANETS_9) {
    if (signOf[a] % 3 !== 0) continue;
    const seen = rashiAspects(signOf[a]);
    for (const b of PLANETS_9) if (signOf[b] % 3 === 1 && seen.includes(signOf[b])) movableFixed.push([a, b]);
  }
  const duals = PLANETS_9.filter((p) => signOf[p] % 3 === 2);
  return { movableFixed, dual: duals.length >= 2 ? duals : [] };
}

/** House, 1 to 12, of a sign counted from another sign, which is the first house. */
export function houseFrom(sign: number, firstSign: number): number {
  return ((sign - firstSign + 12) % 12) + 1;
}
