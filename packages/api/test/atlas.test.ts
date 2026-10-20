import { describe, expect, it } from 'vitest';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const KEY = 'k'.repeat(32);
const app = buildServer({ eph: fakeSky, keys: { [KEY]: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const headers = { 'x-api-key': KEY };

describe('the atlas in the service', () => {
  it('finds cities', async () => {
    const r = await app.inject({ method: 'GET', url: '/v1/atlas/cities?q=taubate', headers });
    expect(r.statusCode).toBe(200);
    expect(r.json().cities[0].name).toBe('Taubaté');
    const in_ = await app.inject({ method: 'GET', url: '/v1/atlas/cities?q=jaipur&country=IN&limit=2', headers });
    expect(in_.json().cities[0].timeZone).toBe('Asia/Kolkata');
    expect((await app.inject({ method: 'GET', url: '/v1/atlas/cities?q=sao&limit=99', headers })).statusCode).toBe(400);
  });
  it('reads a local date at a zone, saying the skipped and the repeated hour', async () => {
    const local = (timeZone: string, l: string) => app.inject({ method: 'POST', url: '/v1/atlas/local', headers, payload: { timeZone, local: l } });
    const skipped = await local('America/Sao_Paulo', '2018-11-04T00:30:00');
    expect([skipped.statusCode, skipped.json().status, skipped.json().readings.length]).toEqual([200, 'nonexistent', 0]);
    const repeated = (await local('America/Sao_Paulo', '2019-02-16T23:30:00')).json();
    expect([repeated.status, repeated.readings.length, repeated.version]).toEqual(['ambiguous', 2, '2026b']);
    const linked = (await local('Asia/Calcutta', '1995-05-27T12:00:00')).json();
    expect([linked.timeZone, linked.readings[0].utcOffsetHours]).toEqual(['Asia/Kolkata', 5.5]);
    const mars = await local('Mars/Olympus', '2000-01-01T00:00:00');
    expect([mars.statusCode, mars.json().error.code]).toEqual([400, 'invalid-input']);
    expect((await local('America/Sao_Paulo', '2019-02-30T10:00:00')).statusCode).toBe(400);
    expect((await local('America/Sao_Paulo', '2019-02-29T10:00:00')).statusCode).toBe(400);
  });
  it('asks for a key and lists both routes in the OpenAPI document', async () => {
    expect((await app.inject({ method: 'GET', url: '/v1/atlas/cities?q=x' })).statusCode).toBe(401);
    const paths = Object.keys((await app.inject({ method: 'GET', url: '/openapi.json' })).json().paths);
    expect(paths).toEqual(expect.arrayContaining(['/v1/atlas/cities', '/v1/atlas/local']));
  });
});
