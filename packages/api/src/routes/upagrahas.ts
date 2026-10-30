import { computeUpagrahas, parseChartInput } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, type CoreOptionsBody } from '../schemas';

const Body = Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema) }, { additionalProperties: false });
type B = { birth: unknown; options?: CoreOptionsBody };

/** PL9's Sub-Planets sheet: the Gulikaadi group (each part's Lagna at its beginning and end) and the Dhoomadi group. */
export const upagrahaRoute: Route = (app, { eph }) => {
  app.post<{ Body: B }>('/v1/upagrahas', { schema: { body: Body, tags: ['charts'], summary: 'The upagrahas of the Gulika and Dhooma groups' } }, async (req) =>
    computeUpagrahas(eph, parseChartInput(req.body.birth), coreOptionsOf(req.body.options)));
};
