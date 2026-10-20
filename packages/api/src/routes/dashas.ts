import { computeDashas, InvalidOptionError, parseChartInput, type DashaOptions } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, LooseOptions } from '../schemas';

const Body = Type.Object({
  birth: Birth,
  options: Type.Optional(CoreOptionsSchema),
  dasha: Type.Optional(LooseOptions('The dasha options (DashaOptions): system, levels, yearDays, balance, base, varga, cycles, kalachakra, rashi.')),
}, { additionalProperties: false });

/**
 * Refuses a request too large to answer: five levels hold 9^5 periods a cycle, and more than two cycles of them make
 * an answer of tens of megabytes.
 */
export function checkDashaSize(dasha: Partial<DashaOptions>): void {
  if (dasha.levels === 5 && (dasha.cycles ?? 1) > 2) throw new InvalidOptionError('cycles', 'at most 2 with 5 levels');
}

/** A dasha system's periods (`computeDashas`). */
export const dashas: Route = (app, { eph }) => {
  app.post<{ Body: typeof Body.static }>('/v1/dashas', { schema: { body: Body, tags: ['natal'], summary: 'The periods of a dasha system' } }, async (req) => {
    const dasha = (req.body.dasha ?? {}) as Partial<DashaOptions>;
    checkDashaSize(dasha);
    return computeDashas(eph, parseChartInput(req.body.birth), dasha, coreOptionsOf(req.body.options));
  });
};
