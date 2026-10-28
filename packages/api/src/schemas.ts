import { AYANAMSHA_NAMES, FIDELITIES, type CoreOptions } from '@reverse/core';
import { Type, type Static } from '@sinclair/typebox';

// The request schemas: they validate every request and, through @fastify/swagger, write the OpenAPI document. Every
// object refuses unknown fields, so a misspelt option is an error, never silently ignored.

const strict = { additionalProperties: false } as const;
const literals = <T extends readonly string[]>(values: T) => Type.Union(values.map((v) => Type.Literal(v)));

/** A birth, or any instant and place: exactly one of `jdUt` and `utc` (checked by the core's `parseChartInput`). */
export const Birth = Type.Object({
  jdUt: Type.Optional(Type.Number({ description: 'Julian day, UT' })),
  utc: Type.Optional(Type.String({ description: 'UTC instant, as 2000-01-01T12:00:00Z' })),
  latitude: Type.Number({ minimum: -90, maximum: 90 }),
  longitudeEast: Type.Number({ minimum: -180, maximum: 180 }),
  utcOffsetHours: Type.Optional(Type.Number({ minimum: -24, maximum: 24, description: 'the clock\'s offset from UT, hours, already resolved (the calculation endpoints do not resolve time zones)' })),
}, strict);
export type Birth = Static<typeof Birth>;

/** An options object the core validates itself (a wrong name or value answers 400 invalid-option). */
export const LooseOptions = (description: string) => Type.Object({}, { additionalProperties: true, description });

/** The core's options (`CoreOptions`), all optional; `fidelity` is 'corrected' unless asked. */
export const CoreOptionsSchema = Type.Object({
  ayanamsha: Type.Optional(literals(AYANAMSHA_NAMES)),
  ayanamshaOffsetDegrees: Type.Optional(Type.Number()),
  node: Type.Optional(literals(['true', 'mean'] as const)),
  sunrise: Type.Optional(literals(['centre', 'edge'] as const)),
  gulika: Type.Optional(literals(['end', 'beginning'] as const)),
  karakas: Type.Optional(literals(['seven', 'eight'] as const)),
  bhavapada: Type.Optional(literals(['parashara', 'knrao'] as const)),
  fidelity: Type.Optional(literals(FIDELITIES)),
  // PL9's "Nature of planets": the core checks each planet and code (a wrong one answers 400 invalid-option).
  natures: Type.Optional(Type.Object({
    natural: Type.Optional(LooseOptions('the natural codes by planet, as `{ "moon": "lessThanThirdFull" }`')),
    functional: Type.Optional(LooseOptions('the functional rows by the Lagna sign, as `{ "aries": { "sun": "neutral" } }`')),
  }, strict)),
}, strict);
export type CoreOptionsBody = Static<typeof CoreOptionsSchema>;

/** The error every refusal carries. */
export const ErrorBody = Type.Object({
  error: Type.Object({ code: Type.String(), message: Type.String(), option: Type.Optional(Type.String()) }),
});

/** The core options with the service's default mode (the values were checked against the schema's lists). */
export function coreOptionsOf(options: CoreOptionsBody | undefined): Partial<CoreOptions> & Pick<CoreOptions, 'fidelity'> {
  return { ...(options as Partial<CoreOptions> | undefined), fidelity: (options?.fidelity ?? 'corrected') as CoreOptions['fidelity'] };
}
