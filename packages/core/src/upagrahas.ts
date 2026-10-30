import type { Ephemeris } from '@reverse/ephemeris';
import { ayanamshaFrame } from './ayanamsha';
import { gulikaadi } from './gulika';
import { resolveOptions, type CoreOptions } from './options';
import { computePositions, type ChartInput } from './positions';
import { dayFrame } from './sunrise';
import { norm360 } from './zodiac';

/** The five upagrahas derived from the Sun. See docs/spec/upagrahas.md. */
export function upagrahas(sunLongitude: number) {
  const dhuma = norm360(sunLongitude + 133 + 20 / 60);
  const vyatipata = norm360(360 - dhuma);
  const parivesha = norm360(vyatipata + 180);
  const indrachapa = norm360(360 - parivesha);
  const upaketu = norm360(indrachapa + 16 + 40 / 60);
  return { dhuma, vyatipata, parivesha, indrachapa, upaketu };
}

/** The middle of the arc that goes from Rahu to the Moon in the order of the signs. See docs/spec/upagrahas.md. */
export function bhriguPoint(moonLongitude: number, rahuLongitude: number): number {
  return norm360(rahuLongitude + norm360(moonLongitude - rahuLongitude) / 2);
}

/** What the Sub-Planets sheet shows: the Gulikaadi group of the day or night, and the five derived from the Sun. */
export function computeUpagrahas(eph: Ephemeris, input: ChartInput, coreOptions?: Partial<CoreOptions>) {
  const core = resolveOptions(coreOptions);
  const frame = ayanamshaFrame(eph, core.ayanamsha, core.ayanamshaOffsetDegrees, core.fidelity);
  const day = dayFrame(eph, input.jdUt, input.latitude, input.longitudeEast, frame);
  const group = gulikaadi(eph, input.jdUt, input.latitude, input.longitudeEast, frame, input.utcOffsetHours ?? 0, day);
  const sun = computePositions(eph, input, coreOptions).points.sun.longitude;
  return { sunrise: day.sunrise, sunset: day.sunset, nextSunrise: day.nextSunrise, ...group, dhoomadi: upagrahas(sun), fidelity: core.fidelity };
}
