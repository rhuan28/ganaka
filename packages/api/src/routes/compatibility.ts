import { computeCompatibility, parseChartInput } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, type CoreOptionsBody } from '../schemas';

const Person = Type.Object({ birth: Birth, sex: Type.Union([Type.Literal('male'), Type.Literal('female')]) }, { additionalProperties: false });
const Body = Type.Object({
  native: Person,
  partner: Person,
  options: Type.Optional(CoreOptionsSchema),
  compatibility: Type.Optional(Type.Object({ point: Type.Optional(Type.Union([Type.Literal('moon'), Type.Literal('lagna')])) }, { additionalProperties: false })),
}, { additionalProperties: false });
type P = { birth: unknown; sex: 'male' | 'female' };
type B = { native: P; partner: P; options?: CoreOptionsBody; compatibility?: { point?: 'moon' | 'lagna' } };

/** The compatibility of two charts: the Ashtakoota, the Dashkoota, the distances and the Mangala Dosha (docs/spec/compatibility.md). */
export const compatibility: Route = (app, { eph }) => {
  app.post<{ Body: B }>('/v1/compatibility', { schema: { body: Body, tags: ['charts'], summary: 'The compatibility of two charts' } }, async (req) => {
    const { native, partner } = req.body;
    return computeCompatibility(eph, { input: parseChartInput(native.birth), sex: native.sex }, { input: parseChartInput(partner.birth), sex: partner.sex },
      req.body.compatibility ?? {}, coreOptionsOf(req.body.options));
  });
};
