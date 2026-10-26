import { computeRemedies, parseChartInput } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, type CoreOptionsBody } from '../schemas';

const Body = Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema) }, { additionalProperties: false });

/** Saturn's Sade Sati, Dhayya and Kantaka periods, the Mangala Dosha and the gems' lords of a chart (docs/spec/remedies.md). */
export const remedies: Route = (app, { eph }) => {
  app.post<{ Body: { birth: unknown; options?: CoreOptionsBody } }>('/v1/remedies', { schema: { body: Body, tags: ['charts'], summary: 'Sade Sati, Kantaka Saturn, Mangala Dosha and gems' } }, async (req) =>
    computeRemedies(eph, parseChartInput(req.body.birth), coreOptionsOf(req.body.options)));
};
