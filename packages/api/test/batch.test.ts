import { describe, expect, it } from 'vitest';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const make = (rateLimitPerMinute = 100) => buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute, sourceUrl: 'x' });
const post = (app: ReturnType<typeof make>, url: string, body: unknown, key: string | null = 'k1') =>
  app.inject({ method: 'POST', url, payload: body as object, headers: key ? { 'x-api-key': key } : {} });

describe('POST /v1/batch', () => {
  it('gives what each route gives', async () => {
    const app = make();
    const requests = [
      { id: 'chart', path: '/v1/chart', body: { birth } },
      { id: 'vim', path: '/v1/dashas', body: { birth, dasha: { levels: 2 } } },
      { id: 'sb', path: '/v1/strengths/shadbala', body: { birth } },
    ];
    const r = await post(app, '/v1/batch', { requests });
    expect(r.statusCode).toBe(200);
    const results = r.json().results;
    expect(results.map((x: { id: string }) => x.id)).toEqual(['chart', 'vim', 'sb']);
    for (const [i, q] of requests.entries()) {
      const single = await post(app, q.path, q.body);
      expect(results[i].status).toBe(200);
      expect(results[i].body).toEqual(single.json());
    }
  });
  it('keeps a failing request to itself', async () => {
    const r = await post(make(), '/v1/batch', { requests: [
      { id: 'bad', path: '/v1/chart', body: { birth, options: { ayanamsha: 'xyz' } } },
      { id: 'good', path: '/v1/chart', body: { birth } },
    ] });
    const [bad, good] = r.json().results;
    expect([bad.status, bad.body.error.code, bad.body.error.option]).toEqual([400, 'invalid-option', 'ayanamsha']);
    expect(good.status).toBe(200);
  });
  it('counts as one request', async () => {
    const app = make(2);
    const batch = await post(app, '/v1/batch', { requests: Array.from({ length: 5 }, (_, i) => ({ id: String(i), path: '/v1/chart', body: { birth } })) });
    expect(batch.statusCode).toBe(200);
    expect(batch.json().results.every((x: { status: number }) => x.status === 200)).toBe(true);
    expect((await post(app, '/v1/chart', { birth })).statusCode).toBe(200);
  });
  it('refuses', async () => {
    const app = make();
    const one = (path: string) => ({ requests: [{ id: 'a', path, body: { birth } }] });
    for (const body of [
      one('/v1/batch'), one('/health'), one('/v1/nothing'), one('/v1/import/pl9'),
      { requests: Array.from({ length: 21 }, (_, i) => ({ id: String(i), path: '/v1/chart', body: { birth } })) },
      { requests: [{ id: 'a', path: '/v1/chart', body: { birth } }, { id: 'a', path: '/v1/chart', body: { birth } }] },
    ]) {
      const r = await post(app, '/v1/batch', body);
      expect([r.statusCode, r.json().error.code]).toEqual([400, 'invalid-request']);
    }
  });
  it('asks for a key', async () => {
    expect((await post(make(), '/v1/batch', { requests: [{ id: 'a', path: '/v1/chart', body: { birth } }] }, null)).statusCode).toBe(401);
  });
});
