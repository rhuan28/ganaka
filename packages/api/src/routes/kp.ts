import { computeKpChart, parseChartInput } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, type CoreOptionsBody } from '../schemas';

const Body = Type.Object({
  birth: Birth,
  options: Type.Optional(CoreOptionsSchema),
  kp: Type.Optional(Type.Object({ horary: Type.Optional(Type.Integer({ minimum: 1, maximum: 249 })) }, { additionalProperties: false })),
}, { additionalProperties: false });

/** The Krishnamurti chart: Placidus cusps, significators, the houses each planet signifies, ruling planets (docs/spec/kp.md). */
export const kp: Route = (app, { eph }) => {
  app.post<{ Body: { birth: unknown; options?: CoreOptionsBody; kp?: { horary?: number } } }>('/v1/kp', { schema: { body: Body, tags: ['charts'], summary: 'The Krishnamurti chart' } }, async (req) =>
    computeKpChart(eph, parseChartInput(req.body.birth), req.body.kp ?? {}, coreOptionsOf(req.body.options)));
};
