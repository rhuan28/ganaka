import { Type } from '@sinclair/typebox';
import type { FastifyInstance } from 'fastify';

const Body = Type.Object({
  requests: Type.Array(Type.Object({
    id: Type.String({ minLength: 1 }),
    // The calculations only: neither the batch itself nor the import, whose large bodies would escape the limit.
    path: Type.String({ pattern: '^/v1/(?!batch$|import/)[a-z0-9/-]+$' }),
    body: Type.Object({}, { additionalProperties: true }),
  }, { additionalProperties: false }), { minItems: 1, maxItems: 20 }),
}, { additionalProperties: false });

class BatchError extends Error {
  statusCode = 400;
}

/**
 * Several calculations in one request: each one runs through its own route, so each answer (an error included) is
 * exactly what that route alone gives. The whole batch counts once against the caller's limit: the inner requests carry
 * `token`, which the rate limit lets through.
 */
export function batch(scope: FastifyInstance, root: FastifyInstance, token: string): void {
  scope.post<{ Body: typeof Body.static }>('/v1/batch', { schema: { body: Body, tags: ['batch'], summary: 'Several calculations in one request' } }, async (req) => {
    const { requests } = req.body;
    const ids = new Set(requests.map((q) => q.id));
    if (ids.size !== requests.length) throw new BatchError('each request needs its own id');
    const unknown = requests.find((q) => !root.hasRoute({ method: 'POST', url: q.path }));
    if (unknown) throw new BatchError(`no calculation at ${unknown.path}`);
    const results = [];
    for (const q of requests) {
      const r = await root.inject({ method: 'POST', url: q.path, payload: q.body, headers: { 'x-api-key': String(req.headers['x-api-key']), 'x-batch-token': token } });
      results.push({ id: q.id, status: r.statusCode, body: r.json() as unknown });
    }
    return { results };
  });
}
