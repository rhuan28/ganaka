export interface Config {
  port: number;
  /** API key → the client's name. */
  keys: Record<string, string>;
  rateLimitPerMinute: number;
  sourceUrl: string;
}

/**
 * The service's configuration from the environment: `API_KEYS` ("client:key,client:key", required), `SOURCE_URL`
 * (where the source code is, required by the AGPL), `PORT` (8080) and `RATE_LIMIT_PER_MINUTE` (120, per key).
 */
export function readConfig(env: Record<string, string | undefined>): Config {
  const keysText = env.API_KEYS?.trim();
  if (!keysText) throw new Error('API_KEYS is required: "client:key,client:key"');
  const keys: Record<string, string> = {};
  for (const entry of keysText.split(',').map((e) => e.trim()).filter(Boolean)) {
    const at = entry.indexOf(':');
    if (at <= 0 || at === entry.length - 1) throw new Error(`API_KEYS: "${entry}" is not "client:key"`);
    if (entry.length - at - 1 < 32) throw new Error(`API_KEYS: the key of "${entry.slice(0, at)}" must have at least 32 characters`);
    keys[entry.slice(at + 1)] = entry.slice(0, at);
  }
  const sourceUrl = env.SOURCE_URL?.trim();
  if (!sourceUrl) throw new Error('SOURCE_URL is required: where the service\'s source code is (AGPL)');
  const whole = (name: string, fallback: number) => {
    const raw = env[name];
    if (raw === undefined || raw === '') return fallback;
    const n = Number(raw);
    if (!Number.isInteger(n) || n <= 0) throw new Error(`${name} must be a whole number above 0`);
    return n;
  };
  return { port: whole('PORT', 8080), keys, rateLimitPerMinute: whole('RATE_LIMIT_PER_MINUTE', 120), sourceUrl };
}
