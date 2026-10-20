import { readFileSync } from 'node:fs';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { readConfig } from './config';
import { buildServer } from './server';

// The service's entry point: the configuration from the environment, one ephemeris for the process, and the server.
let config;
try {
  config = readConfig(process.env);
} catch (e) {
  console.error((e as Error).message);
  process.exit(1);
}
// The engine's version is the repository's: the root package.json, two levels up from this package.
const engineVersion = (JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf8')) as { version: string }).version;
const eph = await createSwissEphemeris();
const app = buildServer({ eph, keys: config.keys, rateLimitPerMinute: config.rateLimitPerMinute, rateLimits: config.rateLimits, engineVersion, sourceUrl: config.sourceUrl, logger: { level: process.env.LOG_LEVEL ?? 'info' } });
await app.listen({ host: '0.0.0.0', port: config.port });
console.log(`listening on ${config.port}`);
