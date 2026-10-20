import { computeAshtakavarga, computeBhavaBala, computeShadbala, computeVimshopaka, parseChartInput, type AshtakavargaOptions, type ShadbalaOptions } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema, LooseOptions, type CoreOptionsBody } from '../schemas';

const strict = { additionalProperties: false } as const;
const shadbala = LooseOptions('The Shadbala options (ShadbalaOptions): drekkana, digBala, mercuryPaksha, mercuryDrik, jupiterMercuryDrik.');
const ashtakavarga = LooseOptions('The Ashtakavarga options (AshtakavargaOptions): method, ekadhipatya, virgoMultiplier.');
const WithShadbala = Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema), shadbala: Type.Optional(shadbala) }, strict);
const WithAshtakavarga = Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema), ashtakavarga: Type.Optional(ashtakavarga) }, strict);
const Plain = Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema) }, strict);
type B = { birth: unknown; options?: CoreOptionsBody; shadbala?: object; ashtakavarga?: object };

/** The strengths: Shadbala, Bhava Bala, Ashtakavarga and Vimshopaka. */
export const strengths: Route = (app, { eph }) => {
  app.post<{ Body: B }>('/v1/strengths/shadbala', { schema: { body: WithShadbala, tags: ['strengths'], summary: 'Shadbala' } }, async (req) =>
    computeShadbala(eph, parseChartInput(req.body.birth), (req.body.shadbala ?? {}) as Partial<ShadbalaOptions>, coreOptionsOf(req.body.options)));
  app.post<{ Body: B }>('/v1/strengths/bhava-bala', { schema: { body: WithShadbala, tags: ['strengths'], summary: 'Bhava Bala' } }, async (req) =>
    computeBhavaBala(eph, parseChartInput(req.body.birth), (req.body.shadbala ?? {}) as Partial<ShadbalaOptions>, coreOptionsOf(req.body.options)));
  app.post<{ Body: B }>('/v1/strengths/ashtakavarga', { schema: { body: WithAshtakavarga, tags: ['strengths'], summary: 'Ashtakavarga' } }, async (req) =>
    computeAshtakavarga(eph, parseChartInput(req.body.birth), (req.body.ashtakavarga ?? {}) as Partial<AshtakavargaOptions>, coreOptionsOf(req.body.options)));
  app.post<{ Body: B }>('/v1/strengths/vimshopaka', { schema: { body: Plain, tags: ['strengths'], summary: 'Vimshopaka' } }, async (req) =>
    computeVimshopaka(eph, parseChartInput(req.body.birth), coreOptionsOf(req.body.options)));
};
