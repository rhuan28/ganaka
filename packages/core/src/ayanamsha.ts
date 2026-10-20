import type { Ephemeris, SiderealMode } from '@reverse/ephemeris';
import type { Fidelity } from './fidelity';
import { assertAyanamsha, type AyanamshaName } from './options';
import { pl9NutationThirteenTerms } from './lagna';
import { ephemerisInstant } from './planets';

/**
 * Each PL9 ayanamsha as a mode of the library plus a constant, in arcseconds (PL9 minus library).
 * Measured over thirty charts each, 1801-2048; see docs/spec/ayanamsha.md.
 */
const RULES: Record<Exclude<AyanamshaName, 'sayana'>, { mode: SiderealMode; shiftArcsec: number }> = {
  lahiri: { mode: 'lahiri', shiftArcsec: -0.1382 },
  yukteshwar: { mode: 'yukteshwar', shiftArcsec: 0 },
  raman: { mode: 'raman', shiftArcsec: 0.828 },
  bhasin: { mode: 'bhasin', shiftArcsec: 0 },
  fagan: { mode: 'faganBradley', shiftArcsec: 0.4021 },
  krishnamurti: { mode: 'krishnamurti', shiftArcsec: 0.828 },
  krishnamurtiNew: { mode: 'krishnamurti', shiftArcsec: 322.828 },
  trueChitra: { mode: 'trueCitra', shiftArcsec: 0 },
};

/**
 * The angle PL9 subtracts from a longitude referred to the mean equinox of date.
 * `offsetDegrees` is PL9's "Specify offset": it is subtracted from the ayanamsha, so a positive
 * offset increases every sidereal longitude.
 * With "sayana" PL9 gives apparent tropical longitudes; in this framework that is minus the nutation.
 */
export function ayanamshaPl9(eph: Ephemeris, jdUt: number, name: AyanamshaName, offsetDegrees = 0, fidelity: Fidelity = 'pl9'): number {
  assertAyanamsha(name, offsetDegrees);
  if (name === 'sayana') {
    return -eph.obliquityAndNutation(ephemerisInstant(eph, jdUt, fidelity)).nutationLongitude - offsetDegrees;
  }
  const rule = RULES[name];
  if (!rule) throw new Error(`unknown ayanamsha "${name}"`);
  return eph.ayanamshaReference(jdUt, rule.mode) + rule.shiftArcsec / 3600 - offsetDegrees;
}

/** The angles PL9 subtracts at a given instant: from a planet's longitude, and from the ascendant. */
export interface AyanamshaFrame {
  sunAyanamsha(jdUt: number): number;
  lagnaAyanamsha(jdUt: number): number;
  /** The mode the frame belongs to; the sunrise search follows it. */
  fidelity: Fidelity;
}

/**
 * The same ayanamsha for planets and for the Lagna, except with "sayana":
 * there PL9 leaves the ascendant as computed, taking no nutation out. See docs/spec/lagna.md.
 */
export function ayanamshaFrame(eph: Ephemeris, name: AyanamshaName, offsetDegrees = 0, fidelity: Fidelity = 'pl9'): AyanamshaFrame {
  assertAyanamsha(name, offsetDegrees);
  const planets = (jdUt: number) => ayanamshaPl9(eph, jdUt, name, offsetDegrees, fidelity);
  return {
    sunAyanamsha: planets,
    lagnaAyanamsha: name === 'sayana' ? (jdUt) => -pl9NutationThirteenTerms(jdUt, fidelity) - offsetDegrees : planets,
    fidelity,
  };
}
