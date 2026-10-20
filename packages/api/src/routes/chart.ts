import { computeChart, parseChartInput } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema } from '../schemas';

const Body = Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema) }, { additionalProperties: false });

/** The natal chart: positions, vargas, houses and the points the core gives (`computeChart`). */
export const chart: Route = (app, { eph }) => {
  app.post<{ Body: typeof Body.static }>('/v1/chart', { schema: { body: Body, tags: ['natal'], summary: 'The natal chart' } }, async (req) =>
    computeChart(eph, parseChartInput(req.body.birth), coreOptionsOf(req.body.options)));
};
