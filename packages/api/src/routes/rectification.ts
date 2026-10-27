import { computeRectification, lagnaStep, NAKSHATRA_DASHA_SYSTEMS, parseChartInput, vargaWindow, WINDOW_VARGAS } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, type CoreOptionsBody } from '../schemas';

const Rectification = Type.Object({
  zoom: Type.Optional(Type.Integer({ minimum: 0, maximum: 5 })),
  before: Type.Optional(Type.Integer({ minimum: 0, maximum: 100 })),
  after: Type.Optional(Type.Integer({ minimum: 0, maximum: 100 })),
  events: Type.Optional(Type.Array(Type.Number({ minimum: 0, maximum: 10_000_000 }), { maxItems: 100 })),
  system: Type.Optional(Type.Union(NAKSHATRA_DASHA_SYSTEMS.map((s) => Type.Literal(s)))),
  levels: Type.Optional(Type.Integer({ minimum: 1, maximum: 5 })),
}, { additionalProperties: false });
type B = { birth: unknown; options?: CoreOptionsBody; rectification?: Record<string, unknown> };

/** PL9's Rectification Tool, and the Lagna's own steps and varga windows (docs/spec/rectification.md). */
export const rectification: Route = (app, { eph }) => {
  app.post<{ Body: B }>('/v1/rectification', {
    schema: { body: Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema), rectification: Type.Optional(Rectification) }, { additionalProperties: false }), tags: ['charts'], summary: 'The Rectification Tool' },
  }, async (req) => computeRectification(eph, parseChartInput(req.body.birth), req.body.rectification ?? {}, coreOptionsOf(req.body.options)));

  app.post<{ Body: B }>('/v1/lagna-steps', {
    schema: { body: Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema) }, { additionalProperties: false }), tags: ['charts'], summary: 'Where the time tool steps by the Lagna, and each varga Lagna\'s window' },
  }, async (req) => {
    const input = parseChartInput(req.body.birth), o = coreOptionsOf(req.body.options);
    // Beyond the polar circle there is no Lagna: each answer is null, not the whole request refused.
    const or = <T,>(f: () => T): T | null => { try { return f(); } catch (e) { if (e instanceof Error && /no Lagna/.test(e.message)) return null; throw e; } };
    const steps = (kind: 'ascendant' | 'navamsha') => or(() => ({ next: lagnaStep(eph, input, kind, 1, o), previous: lagnaStep(eph, input, kind, -1, o) }));
    return { ascendant: steps('ascendant'), navamsha: steps('navamsha'), vargas: Object.fromEntries(WINDOW_VARGAS.map((v) => [v, or(() => vargaWindow(eph, input, v, o))])) };
  });
};
