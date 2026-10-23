import { computePlanetInfo, parseChartInput } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, type CoreOptionsBody } from '../schemas';

const Body = Type.Object({
  birth: Birth,
  options: Type.Optional(CoreOptionsSchema),
  planetInfo: Type.Optional(Type.Object({ anka: Type.Optional(Type.Integer({ minimum: 1, maximum: 5 })) }, { additionalProperties: false })),
}, { additionalProperties: false });
type B = { birth: unknown; options?: CoreOptionsBody; planetInfo?: { anka?: number } };

/** The data of PL9's planet tables: astronomy, combustion, avasthas, relations and the other columns (docs/spec/planet-info.md). */
export const planetInfo: Route = (app, { eph }) => {
  app.post<{ Body: B }>('/v1/planet-info', { schema: { body: Body, tags: ['charts'], summary: 'The data of the planet tables' } }, async (req) =>
    computePlanetInfo(eph, parseChartInput(req.body.birth), req.body.planetInfo ?? {}, coreOptionsOf(req.body.options)));
};
