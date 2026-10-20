import { describe, expect, it } from 'vitest';
import { readConfig } from '../src/config';

const A = 'a'.repeat(32), B = 'b'.repeat(40);

describe('the service\'s configuration', () => {
  it('reads the keys, the limit, the port and the source link, with defaults', () => {
    expect(readConfig({ API_KEYS: `app:${A}, partner:${B}`, SOURCE_URL: 'https://example.org/src' })).toEqual({
      port: 8080, keys: { [A]: 'app', [B]: 'partner' }, rateLimitPerMinute: 120, rateLimits: {}, sourceUrl: 'https://example.org/src',
    });
    expect(readConfig({ API_KEYS: `app:${A}`, SOURCE_URL: 's', PORT: '3000', RATE_LIMIT_PER_MINUTE: '10' })).toMatchObject({ port: 3000, rateLimitPerMinute: 10 });
  });
  it('names what is missing or malformed', () => {
    expect(() => readConfig({ SOURCE_URL: 's' })).toThrow(/API_KEYS/);
    expect(() => readConfig({ API_KEYS: `app:${A}` })).toThrow(/SOURCE_URL/);
    expect(() => readConfig({ API_KEYS: 'app:short', SOURCE_URL: 's' })).toThrow(/at least 32/);
    expect(() => readConfig({ API_KEYS: 'appabc', SOURCE_URL: 's' })).toThrow(/API_KEYS/);
    expect(() => readConfig({ API_KEYS: `app:${A}`, SOURCE_URL: 's', RATE_LIMIT_PER_MINUTE: 'lots' })).toThrow(/RATE_LIMIT_PER_MINUTE/);
  });
  it('reads a limit per client', () => {
    const base = { API_KEYS: `app:${A}, partner:${B}`, SOURCE_URL: 's' };
    expect(readConfig({ ...base, RATE_LIMITS: 'app:600' }).rateLimits).toEqual({ app: 600 });
    expect(readConfig({ ...base, RATE_LIMITS: ' app:600 , partner:30 ' }).rateLimits).toEqual({ app: 600, partner: 30 });
    expect(() => readConfig({ ...base, RATE_LIMITS: 'ghost:10' })).toThrow(/ghost/);
    expect(() => readConfig({ ...base, RATE_LIMITS: 'app:0' })).toThrow(/RATE_LIMITS/);
    expect(() => readConfig({ ...base, RATE_LIMITS: 'app:x' })).toThrow(/RATE_LIMITS/);
  });
});
