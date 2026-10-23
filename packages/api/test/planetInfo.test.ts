import { describe, expect, it } from 'vitest';
import { computePlanetInfo, parseChartInput } from '@reverse/core';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const polar = { utc: '1995-05-27T23:15:57Z', latitude: 89, longitudeEast: 0 };
const c = { fidelity: 'corrected' } as const;
const app = buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const post = (body: unknown, url = '/v1/planet-info') => app.inject({ method: 'POST', url, payload: body as object, headers: { 'x-api-key': 'k1' } });
const same = (x: unknown) => JSON.parse(JSON.stringify(x));

describe('the planet info', () => {
  it('gives what the core gives, with the Anka asked for', async () => {
    const r = await post({ birth, planetInfo: { anka: 3 } });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual(same(computePlanetInfo(fakeSky, parseChartInput(birth), { anka: 3 }, c)));
    expect(r.json().anka).toBe(3);
  });

  it('answers a chart without a Lagna, with what it lacks under missing', async () => {
    const r = await post({ birth: polar });
    expect(r.statusCode).toBe(200);
    expect(r.json().missing.map((m: { field: string }) => m.field)).toContain('shayanadi');
  });

  it('refuses an Anka outside 1 to 5 and an unknown field', async () => {
    expect((await post({ birth, planetInfo: { anka: 6 } })).statusCode).toBe(400);
    expect((await post({ birth, planetInfo: { anka: 1.5 } })).statusCode).toBe(400);
    expect((await post({ birth, planetInfo: { color: 1 } })).statusCode).toBe(400);
    expect((await post({ birth, extra: 1 })).statusCode).toBe(400);
  });

  it('runs inside a batch', async () => {
    const r = await post({ requests: [{ id: 'a', path: '/v1/planet-info', body: { birth } }] }, '/v1/batch');
    expect(r.json().results[0].status).toBe(200);
  });
});
