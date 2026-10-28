import { describe, expect, it } from 'vitest';
import { ephemerisTable, parseChartInput } from '@reverse/core';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const from = { utc: '2000-01-01T12:00:00Z', latitude: 26.9, longitudeEast: 75.8 };
const app = buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const post = (body: unknown) => app.inject({ method: 'POST', url: '/v1/ephemeris', payload: body as object, headers: { 'x-api-key': 'k1' } });
const same = (x: unknown) => JSON.parse(JSON.stringify(x));

describe('the ephemeris route', () => {
  it('gives what the core gives', async () => {
    const r = await post({ from, to: { utc: '2000-01-03T12:00:00Z' }, stepDays: 1, points: ['sun', 'moon'] });
    expect(r.statusCode).toBe(200);
    const f = parseChartInput(from);
    expect(r.json()).toEqual(same(ephemerisTable(fakeSky, { from: f, toJdUt: f.jdUt + 2, stepDays: 1, points: ['sun', 'moon'] }, { fidelity: 'corrected' })));
  });
  it('refuses a "to" with both or neither instant, an unknown point and an unknown field', async () => {
    expect((await post({ from, to: {}, stepDays: 1 })).statusCode).toBe(400);
    expect((await post({ from, to: { jdUt: 2451546, utc: '2000-01-02T12:00:00Z' }, stepDays: 1 })).statusCode).toBe(400);
    expect((await post({ from, to: { jdUt: 2451546 }, stepDays: 1, points: ['vulcan'] })).statusCode).toBe(400);
    expect((await post({ from, to: { jdUt: 2451546 }, stepDays: 1, extra: 1 })).statusCode).toBe(400);
  });
  it('refuses too many rows', async () => {
    expect((await post({ from, to: { jdUt: 2451545 + 5000 }, stepDays: 1 })).statusCode).toBe(400);
  });
});
