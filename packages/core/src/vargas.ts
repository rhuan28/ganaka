import { InvalidInputError } from './errors';
import type { Fidelity } from './fidelity';
import { divisionIndex, norm360 } from './zodiac';

export const CLASSICAL_VARGAS = ['D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12', 'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60'] as const;
/** The 45 vargas of PL9, in the order of its selection window. See docs/spec/vargas.md for PL9's names. */
export const VARGAS = [
  ...CLASSICAL_VARGAS,
  'D5', 'D6', 'D8', 'D11', 'D150',
  'D2-parivritti', 'D2-samasaptaka', 'D3-parivritti', 'D4-parivritti', 'D10-parivritti', 'D12-parivritti', 'D30-parivritti', 'D5-parivritti',
  'D16-iyer', 'D11-iyer', 'D108-nd', 'D108-dn',
  'D2-kashinatha', 'D2-somanatha', 'D3-jagannatha', 'D3-somanatha', 'D4-vedamsha', 'D6-kaulaka',
  'D9-pada', 'D9-nadi', 'D9-somanatha', 'D24-parasiddhamsha', 'D24-siddhamsha', 'D30-venkatesha',
] as const;
export type ClassicalVargaName = (typeof CLASSICAL_VARGAS)[number];
export type VargaName = (typeof VARGAS)[number];

/** Parts each sign is divided into. */
export const VARGA_PARTS: Record<VargaName, number> = {
  D1: 1, D2: 2, D3: 3, D4: 4, D7: 7, D9: 9, D10: 10, D12: 12, D16: 16, D20: 20, D24: 24, D27: 27, D30: 30, D40: 40, D45: 45, D60: 60,
  D5: 5, D6: 6, D8: 8, D11: 11, D150: 150,
  'D2-parivritti': 2, 'D2-samasaptaka': 2, 'D3-parivritti': 3, 'D4-parivritti': 4, 'D10-parivritti': 10, 'D12-parivritti': 12,
  'D30-parivritti': 30, 'D5-parivritti': 5, 'D16-iyer': 16, 'D11-iyer': 11, 'D108-nd': 108, 'D108-dn': 108,
  'D2-kashinatha': 2, 'D2-somanatha': 2, 'D3-jagannatha': 3, 'D3-somanatha': 3, 'D4-vedamsha': 4, 'D6-kaulaka': 6,
  'D9-pada': 9, 'D9-nadi': 9, 'D9-somanatha': 9, 'D24-parasiddhamsha': 24, 'D24-siddhamsha': 24, 'D30-venkatesha': 30,
};

const mod12 = (v: number) => ((Math.floor(v) % 12) + 12) % 12;
/** Movable sign of the element of a sign: fire Aries, earth Capricorn, air Libra, water Cancer. */
const ELEMENT_START = [0, 9, 6, 3] as const;
/** The other sign of the lord of each sign; Cancer and Leo pair with each other. */
const OTHER_SIGN_OF_LORD = [7, 6, 5, 4, 3, 2, 1, 0, 11, 10, 9, 8] as const;
/** Signs of Mars, Mercury and Jupiter: their first half goes to the other sign of the lord. */
const OTHER_SIGN_FIRST: ReadonlySet<number> = new Set([0, 2, 5, 7, 8, 11]);
/** D2-samasaptaka: the sign of each axis (Aries-Libra, Taurus-Scorpio, ...) that takes the first half. */
const SAMASAPTAKA_FIRST = [6, 1, 8, 9, 4, 11] as const;
const D5_ODD = [0, 10, 8, 2, 6] as const;
const D5_EVEN = [1, 5, 11, 9, 7] as const;

const LEO = 4;
const CANCER = 3;

/** D30: upper limit of each unequal part, in degrees, and its sign. A limit belongs to the part that ends there. */
const D30_ODD: readonly (readonly [number, number])[] = [[5, 0], [10, 10], [18, 8], [25, 2], [30, 6]];
const D30_EVEN: readonly (readonly [number, number])[] = [[5, 1], [12, 5], [20, 11], [25, 9], [30, 7]];

function trimshamsha(longitude: number): number {
  const lon = norm360(longitude);
  const sign = divisionIndex(lon, 12);
  const degrees = lon - sign * 30;
  const table = sign % 2 === 0 ? D30_ODD : D30_EVEN;
  for (const [limit, result] of table) if (degrees <= limit) return result;
  return table[table.length - 1]![1];
}

/**
 * Sign, 0 = Aries ... 11 = Pisces, that a sidereal longitude occupies in a varga, by the rules PL9 uses.
 * See docs/spec/vargas.md. "Odd" and "even" count the signs from Aries = 1.
 */
export function vargaSign(longitude: number, varga: VargaName, fidelity: Fidelity = 'pl9'): number {
  if (!Number.isFinite(longitude)) throw new InvalidInputError('longitude must be a finite number');
  const n = VARGA_PARTS[varga];
  if (!Object.hasOwn(VARGA_PARTS, varga) || n === undefined) throw new InvalidInputError(`unknown varga "${String(varga)}"`);
  if (varga === 'D30') return trimshamsha(longitude);

  // One index for the whole circle, so that sign and part cannot disagree at a boundary.
  const index = divisionIndex(longitude, 12 * n);
  const sign = Math.floor(index / n);
  const part = index % n;
  const odd = sign % 2 === 0;
  // Position inside the sign in units of one part, not truncated: the reversed counts need it.
  const f = ((norm360(longitude) - 30 * sign) * n) / 30;
  const pair = Math.floor(sign / 2);
  switch (varga) {
    case 'D1':
      return sign;
    case 'D2':
      // PL9 takes exactly 15 degrees of an odd sign as the end of the first half, and its arithmetic there
      // lands on Virgo, which is not a hora sign. Reproduced in the 'pl9' mode only. See docs/spec/vargas.md.
      if (fidelity === 'pl9' && odd && norm360(longitude) - 30 * sign === 15) return 5;
      return (part === 0) === odd ? LEO : CANCER;
    case 'D3':
      return (sign + 4 * part) % 12;
    case 'D4':
      return (sign + 3 * part) % 12;
    // The longitude multiplied by the number of parts: the count runs on from one sign to the next.
    case 'D7':
    case 'D9':
    case 'D16':
    case 'D20':
    case 'D27':
      return index % 12;
    case 'D10':
      return (sign + (odd ? 0 : 8) + part) % 12;
    case 'D12':
    case 'D60':
      return (sign + part) % 12;
    case 'D24':
      return ((odd ? LEO : CANCER) + part) % 12;
    case 'D40':
      return ((odd ? 0 : 6) + part) % 12;
    case 'D45':
      return ([0, 4, 8][sign % 3]! + part) % 12;
    case 'D150':
    case 'D2-parivritti':
    case 'D3-parivritti':
    case 'D4-parivritti':
    case 'D10-parivritti':
    case 'D12-parivritti':
    case 'D30-parivritti':
    case 'D5-parivritti':
    case 'D6-kaulaka':
      return index % 12;
    case 'D5':
      return (odd ? D5_ODD : D5_EVEN)[part]!;
    case 'D6':
      return ((odd ? 0 : 6) + part) % 12;
    case 'D8':
      return ([0, 8, 4][sign % 3]! + part) % 12;
    case 'D11':
      return mod12(part - sign);
    case 'D2-samasaptaka': {
      // The two halves of a sign go to the two signs of its axis, the same one first for both signs of the axis.
      const first = SAMASAPTAKA_FIRST[sign % 6]!;
      return part === 0 ? first : (first + 6) % 12;
    }
    case 'D2-kashinatha':
      return (part === 0) === OTHER_SIGN_FIRST.has(sign) ? OTHER_SIGN_OF_LORD[sign]! : sign;
    case 'D2-somanatha':
      return mod12(odd ? sign + part : sign - part);
    case 'D3-jagannatha':
      return (ELEMENT_START[sign % 4]! + 4 * part) % 12;
    case 'D3-somanatha':
      return mod12(odd ? 3 * pair + part : 11 - 3 * pair - part);
    case 'D4-vedamsha':
      return ([0, 4, 8][sign % 3]! + 3 * part) % 12;
    case 'D9-pada':
      return mod12(ELEMENT_START[sign % 4]! + (Math.floor(sign / 3) % 2 === 0 ? part : -part));
    case 'D9-nadi':
      return mod12(ELEMENT_START[sign % 4]! + (odd ? part : -part));
    case 'D9-somanatha':
      return mod12(odd ? 9 * pair + part : 2 - 3 * pair - part);
    case 'D16-iyer':
      return odd ? (sign + part) % 12 : mod12(sign + 4 - f);
    case 'D11-iyer':
      // At exactly 0 degrees PL9's formula gives Taurus, which no part of this varga gives. Reproduced in the 'pl9'
      // mode only; the corrected mode takes the part that begins there. See docs/spec/correcoes.md.
      if (fidelity !== 'pl9' && f === 0) return 0;
      return mod12(1 - f);
    case 'D24-parasiddhamsha':
      return odd ? (4 + part) % 12 : mod12(4 - f);
    case 'D24-siddhamsha':
      return mod12((odd ? 5 : 4) - f);
    case 'D30-venkatesha':
      return (sign + part) % 12;
    case 'D108-nd':
      return vargaSign(norm360(longitude) * 9, 'D12', fidelity);
    case 'D108-dn': {
      const lon = norm360(longitude);
      return vargaSign((sign + (lon - 30 * sign) / 2.5) * 30, 'D9', fidelity);
    }
  }
}
