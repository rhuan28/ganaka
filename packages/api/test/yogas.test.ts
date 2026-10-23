import { describe, expect, it } from 'vitest';
import { computeYogas, parseChartInput } from '@reverse/core';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const polar = { utc: '1995-05-27T23:15:57Z', latitude: 89, longitudeEast: 0 };
const c = { fidelity: 'corrected' } as const;
const app = buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const post = (url: string, body: unknown) => app.inject({ method: 'POST', url, payload: body as object, headers: { 'x-api-key': 'k1' } });
const same = (x: unknown) => JSON.parse(JSON.stringify(x));

describe('the yogas', () => {
  it('give what the core gives, with and without the yoga options', async () => {
    for (const [body, yogaOptions] of [[{ birth }, {}], [{ birth, yogas: { functionalNature: true, sex: 'female' } }, { functionalNature: true, sex: 'female' }]] as const) {
      const r = await post('/v1/yogas', body);
      expect(r.statusCode).toBe(200);
      expect(r.json()).toEqual(same(computeYogas(fakeSky, parseChartInput(birth), yogaOptions, c)));
    }
  });

  it('answer a chart without a Lagna, the yogas that need it under missing', async () => {
    const r = await post('/v1/yogas', { birth: polar });
    expect(r.statusCode).toBe(200);
    expect(r.json().missing.length).toBeGreaterThan(0);
  });

  it('refuse an unknown yoga option and an unknown field', async () => {
    expect((await post('/v1/yogas', { birth, yogas: { sex: 'other' } })).statusCode).toBe(400);
    expect((await post('/v1/yogas', { birth, yogas: { color: 1 } })).statusCode).toBe(400);
    expect((await post('/v1/yogas', { birth, extra: 1 })).statusCode).toBe(400);
  });

  it('run inside a batch', async () => {
    const r = await post('/v1/batch', { requests: [{ id: 'a', path: '/v1/yogas', body: { birth } }] });
    expect(r.json().results[0].status).toBe(200);
  });
});

describe('the yoga context', () => {
  it('gives what the core gives, and answers a chart without a Lagna', async () => {
    const { computeYogaContext } = await import('@reverse/core');
    const r = await post('/v1/yoga-context', { birth });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual(same(computeYogaContext(fakeSky, parseChartInput(birth), c)));
    const p = await post('/v1/yoga-context', { birth: polar });
    expect(p.statusCode).toBe(200);
    expect(p.json().lagna).toBeNull();
    expect((await post('/v1/yoga-context', { birth, yogas: {} })).statusCode).toBe(400);
  });
});
