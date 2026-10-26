import { describe, expect, it } from 'vitest';
import { computeCompatibility, parseChartInput } from '@reverse/core';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const other = { utc: '1990-01-10T08:00:00Z', latitude: -23.55, longitudeEast: -46.63 };
const app = buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const post = (body: unknown, url = '/v1/compatibility') => app.inject({ method: 'POST', url, payload: body as object, headers: { 'x-api-key': 'k1' } });
const same = (x: unknown) => JSON.parse(JSON.stringify(x));

describe('the compatibility route', () => {
  it('gives what the core gives', async () => {
    const r = await post({ native: { birth, sex: 'male' }, partner: { birth: other, sex: 'female' }, compatibility: { point: 'moon' } });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual(same(computeCompatibility(fakeSky, { input: parseChartInput(birth), sex: 'male' }, { input: parseChartInput(other), sex: 'female' }, { point: 'moon' }, { fidelity: 'corrected' })));
    expect(r.json().bride).toBe('partner');
  });
  it('refuses a missing partner, an unknown sex or field', async () => {
    expect((await post({ native: { birth, sex: 'male' } })).statusCode).toBe(400);
    expect((await post({ native: { birth, sex: 'x' }, partner: { birth, sex: 'male' } })).statusCode).toBe(400);
    expect((await post({ native: { birth, sex: 'male' }, partner: { birth, sex: 'male' }, extra: 1 })).statusCode).toBe(400);
  });
  it('runs inside a batch', async () => {
    const r = await post({ requests: [{ id: 'a', path: '/v1/compatibility', body: { native: { birth, sex: 'male' }, partner: { birth, sex: 'male' } } }] }, '/v1/batch');
    expect(r.json().results[0].status).toBe(200);
  });
});
