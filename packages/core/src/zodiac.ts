const QUARTERS = 108;

/** Reduces an angle to [0, 360). */
export function norm360(deg: number): number {
  const r = deg % 360;
  const p = r < 0 ? r + 360 : r;
  // "+ 0" turns a negative zero into zero.
  return p >= 360 ? 0 : p + 0;
}

/**
 * Index, 0 to count - 1, of the equal division of the circle that holds the longitude.
 * A boundary belongs to the division that begins there, whatever the rounding of the arithmetic.
 */
export function divisionIndex(longitude: number, count: number): number {
  const lon = norm360(longitude);
  const start = (k: number): number => (k * 360) / count;
  let k = Math.floor((lon * count) / 360);
  if (start(k + 1) <= lon) k++;
  else if (start(k) > lon) k--;
  return Math.max(0, Math.min(count - 1, k));
}

/**
 * Index, 0 to 107, of the nakshatra quarter (3°20') that holds the longitude.
 * Sign, nakshatra and pada all derive from it, so they cannot disagree at a boundary.
 */
function quarterOf(longitude: number): number {
  return divisionIndex(longitude, QUARTERS);
}

/** 0 = Aries ... 11 = Pisces. */
export function signOf(longitude: number): number {
  return Math.floor(quarterOf(longitude) / 9);
}

/** 0 = Ashwini ... 26 = Revati. */
export function nakshatraOf(longitude: number): number {
  return Math.floor(quarterOf(longitude) / 4);
}

/** 1 to 4. */
export function padaOf(longitude: number): number {
  return (quarterOf(longitude) % 4) + 1;
}
