import { computeYogas, parseChartInput, type YogaOptions } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, type CoreOptionsBody } from '../schemas';

const strict = { additionalProperties: false } as const;
const YogaOptionsSchema = Type.Object({
  functionalNature: Type.Optional(Type.Boolean()),
  sex: Type.Optional(Type.Union([Type.Literal('male'), Type.Literal('female')])),
}, strict);
const Body = Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema), yogas: Type.Optional(YogaOptionsSchema) }, strict);
type B = { birth: unknown; options?: CoreOptionsBody; yogas?: YogaOptions };

/** The natal yogas the engine knows (docs/spec/yogas.md), present or not, and those it cannot decide. */
export const yogas: Route = (app, { eph }) => {
  app.post<{ Body: B }>('/v1/yogas', { schema: { body: Body, tags: ['charts'], summary: 'The natal yogas' } }, async (req) =>
    computeYogas(eph, parseChartInput(req.body.birth), req.body.yogas ?? {}, coreOptionsOf(req.body.options)));
};
