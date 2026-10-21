import {
  aspectTable, CLASSICAL_VARGAS, computeChart, computeSunriseChart, LagnaUndefinedError, lordships, panchPakshi, parseChartInput,
  PLANETS_9, shadvargaDispositors, SunriseUndefinedError, taraMatrix, type Chart, type ChartInput,
} from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, type CoreOptionsBody } from '../schemas';

const strict = { additionalProperties: false } as const;
const Plain = Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema) }, strict);
const WithAt = Type.Object({ birth: Birth, at: Birth, options: Type.Optional(CoreOptionsSchema) }, strict);
const WithVarga = Type.Object({ birth: Birth, varga: Type.Union(CLASSICAL_VARGAS.map((v) => Type.Literal(v))), options: Type.Optional(CoreOptionsSchema) }, strict);
type B = { birth: unknown; at?: unknown; varga?: (typeof CLASSICAL_VARGAS)[number]; options?: CoreOptionsBody };

const longitudesOf = (chart: Chart, input: ChartInput, names: readonly string[]) =>
  Object.fromEntries(names.map((p) => {
    const point = chart.points[p as 'sun'];
    if (!point) throw new LagnaUndefinedError(input.latitude);
    return [p, point.longitude];
  })) as never;

/** The natal pages' tables that the chart alone gives: the sunrise chart, Panch Pakshi, aspects, taras, lordships and dispositors. */
export const natalExtras: Route = (app, { eph }) => {
  const chartOf = (body: B) => {
    const input = parseChartInput(body.birth);
    return { input, chart: computeChart(eph, input, coreOptionsOf(body.options)) };
  };

  app.post<{ Body: B }>('/v1/sunrise-chart', { schema: { body: Plain, tags: ['charts'], summary: 'The chart at the sunrise that begins the birth\'s day' } }, async (req) => {
    const input = parseChartInput(req.body.birth);
    const r = computeSunriseChart(eph, input, coreOptionsOf(req.body.options));
    if (!r) throw new SunriseUndefinedError(input.jdUt, input.latitude);
    return r;
  });
  app.post<{ Body: B }>('/v1/panch-pakshi', { schema: { body: WithAt, tags: ['time'], summary: 'Panch Pakshi at an instant and place' } }, async (req) => {
    const natal = parseChartInput(req.body.birth), at = parseChartInput(req.body.at);
    const r = panchPakshi(eph, natal, { ...at, utcOffsetHours: at.utcOffsetHours ?? 0 }, coreOptionsOf(req.body.options));
    if (!r) throw new SunriseUndefinedError(at.jdUt, at.latitude);
    return r;
  });
  app.post<{ Body: B }>('/v1/aspects', { schema: { body: Plain, tags: ['charts'], summary: 'The graded aspects between the planets' } }, async (req) => {
    const { input, chart } = chartOf(req.body);
    return aspectTable(longitudesOf(chart, input, PLANETS_9));
  });
  app.post<{ Body: B }>('/v1/tarabala', { schema: { body: Plain, tags: ['charts'], summary: 'The nakshatra matrix of taras' } }, async (req) => {
    const { input, chart } = chartOf(req.body);
    return taraMatrix(longitudesOf(chart, input, ['lagna', ...PLANETS_9]));
  });
  app.post<{ Body: B }>('/v1/lordships', { schema: { body: WithVarga, tags: ['charts'], summary: 'The lords of the houses of a varga and where they are' } }, async (req) => {
    const { input, chart } = chartOf(req.body);
    const signs = chart.vargas[req.body.varga!];
    if (signs.lagna === undefined) throw new LagnaUndefinedError(input.latitude);
    return lordships(signs);
  });
  app.post<{ Body: B }>('/v1/dispositors', { schema: { body: Plain, tags: ['charts'], summary: 'The dispositors of the planets in the Shad Varga' } }, async (req) =>
    shadvargaDispositors(chartOf(req.body).chart.vargas));
};
