import { Pl9FileError, readPl9Chart, type Pl9Chart } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';

const Body = Type.Object({
  files: Type.Array(Type.Object({ name: Type.String(), text: Type.String({ maxLength: 200_000 }) }, { additionalProperties: false }), { minItems: 1, maxItems: 1000 }),
}, { additionalProperties: false });
type Result = { name: string; ok: true; chart: Pl9Chart } | { name: string; ok: false; error: string };

/** Chart files saved by Parashara's Light 9, read whole: each file answers on its own, a broken one with the reason. */
export const importRoutes: Route = (app) => {
  app.post<{ Body: typeof Body.static }>('/v1/import/pl9', {
    bodyLimit: 20 * 1024 * 1024,
    schema: { body: Body, tags: ['import'], summary: 'Read chart files saved by Parashara\'s Light 9' },
  }, async (req) => ({
    results: req.body.files.map(({ name, text }): Result => {
      try {
        return { name, ok: true, chart: readPl9Chart(text) };
      } catch (e) {
        if (e instanceof Pl9FileError) return { name, ok: false, error: e.message };
        throw e;
      }
    }),
  }));
};
