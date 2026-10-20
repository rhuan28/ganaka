import { CrossingNotFoundError, InvalidInputError, InvalidOptionError, LagnaUndefinedError, NotImplementedOptionError, SunriseUndefinedError } from '@reverse/core';
import { EphemerisRangeError } from '@reverse/ephemeris';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export interface ErrorPayload { error: { code: string; message: string; option?: string } }

/**
 * What the service answers for a refusal: the caller's mistakes are 400 (the option's name when an option is
 * wrong), what the sky does not allow at that place and time is 422, anything else 500 without details.
 */
export function errorReply(e: unknown): { status: number; body: ErrorPayload } {
  const err = (status: number, code: string, message: string, option?: string) => ({ status, body: { error: { code, message, ...(option ? { option } : {}) } } });
  const fe = e as FastifyError & { validation?: { instancePath?: string; params?: Record<string, unknown> }[] };
  if (fe?.validation) {
    const v = fe.validation[0];
    const path = v?.instancePath ?? '';
    const option = /^\/options\/([^/]+)/.exec(path)?.[1] ?? (path === '/options' ? String(v?.params?.additionalProperty ?? '') || undefined : undefined);
    return option ? err(400, 'invalid-option', fe.message, option) : err(400, 'invalid-request', fe.message);
  }
  if (e instanceof InvalidInputError) return err(400, 'invalid-input', e.message);
  if (e instanceof InvalidOptionError) return err(400, 'invalid-option', e.message, e.option);
  if (e instanceof NotImplementedOptionError) return err(400, 'option-not-implemented', e.message);
  if (e instanceof LagnaUndefinedError) return err(422, 'lagna-undefined', e.message);
  if (e instanceof SunriseUndefinedError) return err(422, 'sunrise-undefined', e.message);
  if (e instanceof CrossingNotFoundError) return err(422, 'crossing-not-found', e.message);
  if (e instanceof EphemerisRangeError) return err(422, 'out-of-range', e.message);
  if (fe?.statusCode === 429) return err(429, 'rate-limited', 'too many requests for this key; try again in a minute');
  if (fe?.statusCode && fe.statusCode < 500) return err(fe.statusCode, 'invalid-request', fe.message);
  return err(500, 'internal', 'internal error');
}

export function sendError(e: unknown, req: FastifyRequest, reply: FastifyReply): FastifyReply {
  const { status, body } = errorReply(e);
  if (status >= 500) req.log.error(e);
  return reply.status(status).send(body);
}
