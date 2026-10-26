import { describe, expect, it } from 'vitest';
import { computeRemedies, parseChartInput } from '@reverse/core';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const app = buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const post = (body: unknown, url = '/v1/remedies') => app.inject({ method: 'POST', url, payload: body as object, headers: { 'x-api-key': 'k1' } });
const same = (x: unknown) => JSON.parse(JSON.stringify(x));

describe('the remedies route', () => {
  it('gives what the core gives', async () => {
    const r = await post({ birth });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual(same(computeRemedies(fakeSky, parseChartInput(birth), { fidelity: 'corrected' })));
  });
  it('refuses an unknown field', async () => {
    expect((await post({ birth, extra: 1 })).statusCode).toBe(400);
  });
});
