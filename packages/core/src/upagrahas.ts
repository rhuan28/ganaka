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
