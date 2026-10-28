import { describe, expect, it } from 'vitest';
import {
  aspectTable, computeChart, houseAspects, computeSunriseChart, lordships, panchPakshi, parseChartInput, shadvargaDispositors, taraMatrix,
} from '@reverse/core';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const at = { utc: '2026-10-20T16:42:00Z', latitude: 44.2377778, longitudeEast: 150.6744444, utcOffsetHours: 10 };
const c = { fidelity: 'corrected' } as const;
const natal = parseChartInput(birth), chart = computeChart(fakeSky, natal, c);
const lon = (p: string) => chart.points[p as 'sun']!.longitude;
const app = buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const post = (url: string, body: unknown) => app.inject({ method: 'POST', url, payload: body as object, headers: { 'x-api-key': 'k1' } });
const same = (x: unknown) => JSON.parse(JSON.stringify(x));
const PLANETS = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'];
const longitudes = (names: string[]) => Object.fromEntries(names.map((p) => [p, lon(p)])) as never;

describe('the natal tables', () => {
  it('give what the core gives', async () => {
    const cases: [string, unknown, unknown][] = [
      ['/v1/sunrise-chart', { birth }, computeSunriseChart(fakeSky, natal, c)],
      ['/v1/panch-pakshi', { birth, at }, panchPakshi(fakeSky, natal, { ...parseChartInput(at), utcOffsetHours: 10 }, c)],
      ['/v1/aspects', { birth }, aspectTable(longitudes(PLANETS))],
      ['/v1/tarabala', { birth }, taraMatrix(longitudes(['lagna', ...PLANETS]))],
      ['/v1/house-aspects', { birth }, { houses: houseAspects(longitudes(['lagna', ...PLANETS])) }],
      ['/v1/lordships', { birth, varga: 'D9' }, lordships(chart.vargas.D9)],
      ['/v1/dispositors', { birth }, shadvargaDispositors(chart.vargas)],
    ];
    for (const [url, body, expected] of cases) {
      const r = await post(url, body);
      expect([url, r.statusCode]).toEqual([url, 200]);
      expect(r.json()).toEqual(same(expected));
    }
  });

  it('refuse an unknown varga and an unknown field', async () => {
    expect((await post('/v1/lordships', { birth, varga: 'D99' })).statusCode).toBe(400);
    expect((await post('/v1/aspects', { birth, extra: 1 })).statusCode).toBe(400);
  });

  it('run inside a batch', async () => {
    const r = await post('/v1/batch', { requests: [{ id: 'a', path: '/v1/aspects', body: { birth } }] });
    expect(r.json().results[0].status).toBe(200);
  });
});
