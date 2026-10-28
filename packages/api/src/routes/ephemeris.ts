import { ALL_POINTS, ephemerisTable, InvalidInputError, parseChartInput, type PointName } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, type CoreOptionsBody } from '../schemas';

const strict = { additionalProperties: false } as const;
const Instant = Type.Object({
  jdUt: Type.Optional(Type.Number({ description: 'Julian day, UT' })),
  utc: Type.Optional(Type.String({ description: 'UTC instant, as 2000-01-01T12:00:00Z' })),
}, strict);
const Body = Type.Object({
  from: Birth, to: Instant,
  stepDays: Type.Number({ description: 'the step between rows, days (at least one minute)' }),
  points: Type.Optional(Type.Array(Type.Union(ALL_POINTS.map((p) => Type.Literal(p))), { minItems: 1 })),
  options: Type.Optional(CoreOptionsSchema),
}, strict);

/** PL9's Export Ephemeris: the points' longitudes from one instant to another at a fixed step (docs/spec/api.md). */
export const ephemeris: Route = (app, { eph }) => {
  app.post<{ Body: { from: unknown; to: { jdUt?: number; utc?: string }; stepDays: number; points?: PointName[]; options?: CoreOptionsBody } }>('/v1/ephemeris', { schema: { body: Body, tags: ['time'], summary: 'The points\' longitudes between two instants at a fixed step' } }, async (req) => {
    const from = parseChartInput(req.body.from);
    if ((req.body.to.jdUt === undefined) === (req.body.to.utc === undefined)) throw new InvalidInputError('"to" takes exactly one of "jdUt" and "utc"');
    const to = parseChartInput({ ...req.body.to, latitude: from.latitude, longitudeEast: from.longitudeEast });
    return ephemerisTable(eph, { from, toJdUt: to.jdUt, stepDays: req.body.stepDays, points: req.body.points }, coreOptionsOf(req.body.options));
  });
};
