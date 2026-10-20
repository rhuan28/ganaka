import { Writable } from 'node:stream';
import { EphemerisRangeError } from '@reverse/ephemeris';
import { describe, expect, it } from 'vitest';
import { errorReply } from '../src/errors';
import { checkDashaSize } from '../src/routes/dashas';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const at = { utc: '2026-10-17T00:00:00Z', latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 };
const KEY = 'k'.repeat(32);
const app = buildServer({ eph: fakeSky, keys: { [KEY]: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const post = (url: string, body: unknown) => app.inject({ method: 'POST', url, payload: body as object, headers: { 'x-api-key': KEY } });

describe('the limits of the service', () => {
  it('answers a date the ephemeris does not cover as 422 out-of-range, not 500', () => {
    const r = errorReply(new EphemerisRangeError(2341972.5));
    expect([r.status, r.body.error.code]).toEqual([422, 'out-of-range']);
  });
  it('refuses requests heavy enough to stall it, naming the option', async () => {
    expect((await post('/v1/varshaphala', { birth, years: 5000 })).statusCode).toBe(400);
    expect((await post('/v1/panchanga', { birth, at, days: 16 })).statusCode).toBe(400);
    expect((await post('/v1/panchanga', { birth, at, days: 2 })).statusCode).toBe(200);
    const deep = await post('/v1/dashas', { birth, dasha: { levels: 5, cycles: 3 } });
    expect([deep.statusCode, deep.json().error.code, deep.json().error.option]).toEqual([400, 'invalid-option', 'cycles']);
    // Two cycles of five levels are still answered (checked without computing them).
    expect(() => checkDashaSize({ levels: 5, cycles: 2 })).not.toThrow();
    expect(() => checkDashaSize({ levels: 4, cycles: 20 })).not.toThrow();
    const unknown = await post('/v1/dashas', { birth, dasha: { colour: 1 } });
    expect([unknown.statusCode, unknown.json().error.code]).toEqual([400, 'invalid-option']);
  });
  it('logs the internal errors it hides from the caller', async () => {
    const lines: string[] = [];
    const logger = { level: 'error', stream: new Writable({ write(chunk, _e, done) { lines.push(String(chunk)); done(); } }) };
    const broken = buildServer({ eph: {} as never, keys: { [KEY]: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x', logger });
    const r = await broken.inject({ method: 'POST', url: '/v1/chart', payload: { birth }, headers: { 'x-api-key': KEY } });
    expect([r.statusCode, r.json().error.message]).toEqual([500, 'internal error']);
    expect(lines.join('')).toMatch(/"level":50/);
  });
});
