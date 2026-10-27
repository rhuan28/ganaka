import { describe, expect, it } from 'vitest';
import { computeKpChart, parseChartInput } from '@reverse/core';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const app = buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const post = (body: unknown) => app.inject({ method: 'POST', url: '/v1/kp', payload: body as object, headers: { 'x-api-key': 'k1' } });
const same = (x: unknown) => JSON.parse(JSON.stringify(x));

describe('the KP route', () => {
  it('gives what the core gives, and a horary chart by number', async () => {
    const r = await post({ birth });
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual(same(computeKpChart(fakeSky, parseChartInput(birth), {}, { fidelity: 'corrected' })));
    expect((await post({ birth, kp: { horary: 1 } })).json().horary.number).toBe(1);
  });
  it('refuses a horary number out of 1 to 249 and an unknown field', async () => {
    expect((await post({ birth, kp: { horary: 250 } })).statusCode).toBe(400);
    expect((await post({ birth, extra: 1 })).statusCode).toBe(400);
  });
});
