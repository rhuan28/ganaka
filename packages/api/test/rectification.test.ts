import { describe, expect, it } from 'vitest';
import { computeRectification, parseChartInput } from '@reverse/core';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const app = buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const post = (url: string, body: unknown) => app.inject({ method: 'POST', url, payload: body as object, headers: { 'x-api-key': 'k1' } });
const same = (x: unknown) => JSON.parse(JSON.stringify(x));

describe('the rectification routes', () => {
  it('give the table the core gives, and the Lagna steps with each varga window', async () => {
    const body = { birth, rectification: { zoom: 1, events: [2461340] } };
    const r = await post('/v1/rectification', body);
    expect(r.statusCode).toBe(200);
    expect(r.json()).toEqual(same(computeRectification(fakeSky, parseChartInput(birth), body.rectification, { fidelity: 'corrected' })));
    const s = (await post('/v1/lagna-steps', { birth })).json();
    expect(s.ascendant.next).toBeGreaterThan(s.ascendant.previous);
    expect(Object.keys(s.vargas)).toContain('D9');
  });
  it('answers null steps and windows beyond the polar circle, where there is no Lagna', async () => {
    const s = (await post('/v1/lagna-steps', { birth: { ...birth, latitude: 80 } })).json();
    expect(s.ascendant).toBeNull();
    expect(s.vargas.D9).toBeNull();
  });
  it('refuses a dasha that is not a nakshatra dasha', async () => {
    expect((await post('/v1/rectification', { birth, rectification: { system: 'chara' } })).statusCode).toBe(400);
  });
  it('refuses a zoom past 5 and an unknown field', async () => {
    expect((await post('/v1/rectification', { birth, rectification: { zoom: 6 } })).statusCode).toBe(400);
    expect((await post('/v1/lagna-steps', { birth, extra: 1 })).statusCode).toBe(400);
  });
});
