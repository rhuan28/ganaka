import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import type { Ephemeris } from '@reverse/ephemeris';
import Fastify, { type FastifyInstance, type FastifyServerOptions } from 'fastify';
import { sendError } from './errors';
import { randomBytes } from 'node:crypto';
import { atlas } from './routes/atlas';
import { batch } from './routes/batch';
import { chart } from './routes/chart';
import { dashas } from './routes/dashas';
import { importRoutes } from './routes/import';
import { natalExtras } from './routes/natalExtras';
import { yogas } from './routes/yogas';
import { yogaContext } from './routes/yogaContext';
import { planetInfo } from './routes/planetInfo';
import { compatibility } from './routes/compatibility';
import { remedies } from './routes/remedies';
import { strengths } from './routes/strengths';
import { time } from './routes/time';

export interface ServerOptions {
  eph: Ephemeris;
  /** API key → the client's name. */
  keys: Record<string, string>;
  rateLimitPerMinute: number;
  /** Client name → requests per minute, for the clients that do not take `rateLimitPerMinute`. */
  rateLimits?: Record<string, number>;
  /** The engine's version, told on every answer so that clients can key their caches on it. */
  engineVersion?: string;
  /** Where the service's source code is (AGPL): sent with every response. */
  sourceUrl: string;
  /** Fastify's logger: off unless given (the entry point turns it on). */
  logger?: FastifyServerOptions['logger'];
}

export type Route = (app: FastifyInstance, o: ServerOptions) => void;
const ROUTES: Route[] = [chart, dashas, strengths, time, atlas, importRoutes, natalExtras, yogas, yogaContext, planetInfo, compatibility, remedies];
const PUBLIC = new Set(['/health', '/openapi.json']);

/** The calculation service: the core's results over HTTP, as JSON, never rounded. */
export function buildServer(o: ServerOptions): FastifyInstance {
  const app = Fastify({ logger: o.logger ?? false, ajv: { customOptions: { removeAdditional: false, coerceTypes: false, useDefaults: false } } });
  app.setErrorHandler(sendError);
  const version = o.engineVersion ?? '0.0.0';
  app.addHook('onSend', async (_req, reply) => { reply.header('X-Source-Code', o.sourceUrl).header('X-Engine-Version', version); });

  const batchToken = randomBytes(24).toString('hex');
  const isPublic = (url: string) => PUBLIC.has(url.split('?')[0]!) || url.startsWith('/docs');
  app.register(rateLimit, {
    max: (_req, key) => o.rateLimits?.[o.keys[key] ?? ''] ?? o.rateLimitPerMinute,
    timeWindow: '1 minute',
    allowList: (req) => isPublic(req.url) || req.headers['x-batch-token'] === batchToken,
    keyGenerator: (req) => String(req.headers['x-api-key'] ?? req.ip),
    errorResponseBuilder: () => ({ statusCode: 429, error: { code: 'rate-limited', message: 'too many requests for this key; try again in a minute' } }),
  });
  app.addHook('onRequest', async (req, reply) => {
    if (isPublic(req.url)) return;
    const key = req.headers['x-api-key'];
    if (typeof key !== 'string' || !Object.hasOwn(o.keys, key)) {
      return reply.status(401).send({ error: { code: 'unauthorized', message: 'a valid x-api-key header is required' } });
    }
  });

  app.register(swagger, {
    openapi: {
      info: { title: 'Vedic astrology calculation service', version, description: `The engine's results over HTTP. Source code (AGPL-3.0-or-later): ${o.sourceUrl}` },
      components: { securitySchemes: { apiKey: { type: 'apiKey', name: 'x-api-key', in: 'header' } } },
      security: [{ apiKey: [] }],
    },
  });
  app.register(swaggerUi, { routePrefix: '/docs' });
  app.register(async (scope) => {
    scope.get('/health', { schema: { hide: true } }, async () => ({ ok: true, version }));
    scope.get('/openapi.json', { schema: { hide: true } }, async () => app.swagger());
    for (const route of ROUTES) route(scope, o);
    batch(scope, app, batchToken);
  });
  return app;
}
