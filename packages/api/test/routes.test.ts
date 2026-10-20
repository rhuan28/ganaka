import { describe, expect, it } from 'vitest';
import {
  completedYears, computeAshtakavarga, computeBhavaBala, computeBirthPanchanga, computeDashas, computeMuhurta, computePanchanga,
  computeShadbala, computeTransits, computeVarshaphalaReport, computeVimshopaka, dashasAt, parseChartInput,
} from '@reverse/core';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const at = { utc: '2026-10-17T00:00:00Z', latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 };
const natal = parseChartInput(birth), when = parseChartInput(at);
const c = { fidelity: 'corrected' } as const;
const app = buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const post = (url: string, body: unknown) => app.inject({ method: 'POST', url, payload: body as object, headers: { 'x-api-key': 'k1' } });
const same = (x: unknown) => JSON.parse(JSON.stringify(x));

describe('the endpoints', () => {
  it('give what the core gives', async () => {
    const cases: [string, unknown, unknown][] = [
      ['/v1/dashas', { birth, dasha: { system: 'yogini', levels: 2 } }, computeDashas(fakeSky, natal, { system: 'yogini', levels: 2 }, c)],
      ['/v1/strengths/shadbala', { birth }, computeShadbala(fakeSky, natal, {}, c)],
      ['/v1/strengths/bhava-bala', { birth, shadbala: { digBala: 'kendras' } }, computeBhavaBala(fakeSky, natal, { digBala: 'kendras' }, c)],
      ['/v1/strengths/ashtakavarga', { birth, ashtakavarga: { method: 'parashara' } }, computeAshtakavarga(fakeSky, natal, { method: 'parashara' }, c)],
      ['/v1/strengths/vimshopaka', { birth }, computeVimshopaka(fakeSky, natal, c)],
      ['/v1/transits', { birth, at }, { ...computeTransits(fakeSky, natal, when, c), dashas: dashasAt(fakeSky, natal, when.jdUt, c) }],
      ['/v1/panchanga', { birth }, computeBirthPanchanga(fakeSky, natal, c)],
      ['/v1/varshaphala', { birth, years: 31 }, computeVarshaphalaReport(fakeSky, natal, 31, { ...c, solarReturn: 'true' })],
      ['/v1/varshaphala', { birth, at: { utc: '2026-10-17T00:00:00Z', latitude: 0, longitudeEast: 0 } }, computeVarshaphalaReport(fakeSky, natal, completedYears(natal.jdUt, when.jdUt), { ...c, solarReturn: 'true' })],
      ['/v1/muhurta', { birth, at, activity: 'marriage' }, computeMuhurta(fakeSky, natal, when, { ...c, activity: 'marriage' })],
    ];
    for (const [url, body, expected] of cases) {
      const r = await post(url, body);
      expect([url, r.statusCode]).toEqual([url, 200]);
      expect(r.json()).toEqual(same(expected));
    }
    const p = await post('/v1/panchanga', { birth, at, days: 3 });
    expect(p.statusCode).toBe(200);
    expect(p.json().rows).toHaveLength(3);
    const one = await post('/v1/panchanga', { birth, at });
    expect(one.json().sunrise).toEqual(same(computePanchanga(fakeSky, when, c)).sunrise);
  });
  it('say what the sky does not allow, and refuse what a caller got wrong', async () => {
    const polar = { ...birth, latitude: 85 };
    const sb = await post('/v1/strengths/shadbala', { birth: polar });
    expect([sb.statusCode, sb.json().error.code]).toEqual([422, 'lagna-undefined']);
    const chart = await post('/v1/chart', { birth: polar });
    expect(chart.statusCode).toBe(200);
    expect(chart.json().missing.length).toBeGreaterThan(0);
    const dasha = await post('/v1/dashas', { birth, dasha: { system: 'xyz' } });
    expect(dasha.statusCode).toBe(400);
    expect(['invalid-option', 'invalid-request']).toContain(dasha.json().error.code);
    expect((await post('/v1/varshaphala', { birth, years: 3, at })).statusCode).toBe(400);
    expect((await post('/v1/varshaphala', { birth })).statusCode).toBe(400);
    expect((await post('/v1/panchanga', { birth, at, days: 367 })).statusCode).toBe(400);
    expect((await post('/v1/panchanga', { birth, days: 3 })).statusCode).toBe(400);
    expect((await post('/v1/muhurta', { birth, at, activity: 'party' })).statusCode).toBe(400);
  });
  it('are all in the OpenAPI document', async () => {
    const paths = Object.keys((await app.inject({ method: 'GET', url: '/openapi.json' })).json().paths);
    for (const p of ['/v1/chart', '/v1/dashas', '/v1/strengths/shadbala', '/v1/strengths/bhava-bala', '/v1/strengths/ashtakavarga', '/v1/strengths/vimshopaka', '/v1/transits', '/v1/panchanga', '/v1/varshaphala', '/v1/muhurta']) {
      expect(paths).toContain(p);
    }
  });
});
