import { describe, expect, it } from 'vitest';
import { computeChart } from '@reverse/core';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const make = () => buildServer({ eph: fakeSky, keys: { k1: 'tester', k2: 'other' }, rateLimitPerMinute: 2, sourceUrl: 'https://example.org/src' });
const post = (app: ReturnType<typeof make>, url: string, body: unknown, key: string | null = 'k1') =>
  app.inject({ method: 'POST', url, payload: body as object, headers: key ? { 'x-api-key': key } : {} });

describe('the calculation service', () => {
  it('answers its health and its documentation without a key', async () => {
    const app = make();
    expect((await app.inject({ method: 'GET', url: '/health' })).statusCode).toBe(200);
    const doc = await app.inject({ method: 'GET', url: '/openapi.json' });
    expect(doc.statusCode).toBe(200);
    expect(Object.keys(doc.json().paths)).toContain('/v1/chart');
  });
  it('asks for a key, and gives the chart the core gives, corrected by default', async () => {
    const app = make();
    expect((await post(app, '/v1/chart', { birth }, null)).statusCode).toBe(401);
    expect((await post(app, '/v1/chart', { birth }, 'wrong')).json().error.code).toBe('unauthorized');
    const r = await post(app, '/v1/chart', { birth });
    expect(r.statusCode).toBe(200);
    expect(r.headers['x-source-code']).toBe('https://example.org/src');
    const { parseChartInput } = await import('@reverse/core');
    expect(r.json()).toEqual(JSON.parse(JSON.stringify(computeChart(fakeSky, parseChartInput(birth), { fidelity: 'corrected' }))));
    const pl9 = await post(app, '/v1/chart', { birth, options: { fidelity: 'pl9' } });
    expect(pl9.json()).toEqual(JSON.parse(JSON.stringify(computeChart(fakeSky, parseChartInput(birth), { fidelity: 'pl9' }))));
  });
  it('limits the requests per key, not per address', async () => {
    const app = make();
    await post(app, '/v1/chart', { birth });
    await post(app, '/v1/chart', { birth });
    const third = await post(app, '/v1/chart', { birth });
    expect(third.statusCode).toBe(429);
    expect(third.json().error.code).toBe('rate-limited');
    expect((await post(app, '/v1/chart', { birth }, 'k2')).statusCode).toBe(200);
  });
  it('refuses a bad birth, a bad option or an unknown field with 400 and a reason', async () => {
    const app = buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 100, sourceUrl: 'x' });
    const both = await post(app, '/v1/chart', { birth: { ...birth, jdUt: 2449865 } });
    expect([both.statusCode, both.json().error.code]).toEqual([400, 'invalid-input']);
    const lat = await post(app, '/v1/chart', { birth: { ...birth, latitude: 91 } });
    expect(lat.statusCode).toBe(400);
    const opt = await post(app, '/v1/chart', { birth, options: { ayanamsha: 'xyz' } });
    expect([opt.statusCode, opt.json().error.code, opt.json().error.option]).toEqual([400, 'invalid-option', 'ayanamsha']);
    const extra = await post(app, '/v1/chart', { birth, color: 'red' });
    expect([extra.statusCode, extra.json().error.code]).toEqual([400, 'invalid-request']);
  });
});
