export function norm360(deg: number): number {
  const r = deg % 360;
  return r < 0 ? r + 360 : r;
}

/** a - b along the shortest arc, in arcseconds, in (-648000, 648000]. */
export function arcsecDiff(a: number, b: number): number {
  const d = norm360(a - b);
  return (d > 180 ? d - 360 : d) * 3600;
}
