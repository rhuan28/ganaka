import { computeYogaContext, parseChartInput } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, type CoreOptionsBody } from '../schemas';

const Body = Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema) }, { additionalProperties: false });
type B = { birth: unknown; options?: CoreOptionsBody };

/** The facts of a chart that yogas read, for a client that evaluates yogas of its own (docs/spec/api.md). */
export const yogaContext: Route = (app, { eph }) => {
  app.post<{ Body: B }>('/v1/yoga-context', { schema: { body: Body, tags: ['charts'], summary: 'The facts of a chart that yogas read' } }, async (req) =>
    computeYogaContext(eph, parseChartInput(req.body.birth), coreOptionsOf(req.body.options)));
};
