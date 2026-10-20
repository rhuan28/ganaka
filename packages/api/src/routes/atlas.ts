import { loadTz, resolveLocal, searchCities, UnknownZoneError } from '@reverse/atlas';
import { InvalidInputError } from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';

const strict = { additionalProperties: false } as const;
const Search = Type.Object({
  q: Type.String({ minLength: 1, maxLength: 100 }),
  country: Type.Optional(Type.String({ pattern: '^[A-Za-z]{2}$' })),
  // A query string is text: the service converts no types, so the limit is digits, 1 to 50.
  limit: Type.Optional(Type.String({ pattern: '^([1-9]|[1-4][0-9]|50)$' })),
}, strict);
const Local = Type.Object({
  timeZone: Type.String({ minLength: 1, maxLength: 64, description: 'an IANA zone or a link to one' }),
  local: Type.String({ pattern: '^\\d{4}-\\d{2}-\\d{2}T\\d{2}:\\d{2}:\\d{2}$', description: 'the local date and time, YYYY-MM-DDTHH:mm:ss' }),
}, strict);

/** The atlas: the cities by name, and a local date at a zone (the offset and daylight saving, with both readings or none at a turn). */
export const atlas: Route = (app) => {
  app.get<{ Querystring: typeof Search.static }>('/v1/atlas/cities', { schema: { querystring: Search, tags: ['atlas'], summary: 'Cities by name (GeoNames, CC BY 4.0)' } }, async (req) =>
    ({ cities: searchCities(req.query.q, { country: req.query.country, limit: req.query.limit === undefined ? undefined : Number(req.query.limit) }) }));

  app.post<{ Body: typeof Local.static }>('/v1/atlas/local', { schema: { body: Local, tags: ['atlas'], summary: 'A local date at a time zone (IANA, with backzone)' } }, async (req) => {
    const tz = loadTz();
    const zone = tz.canonical(req.body.timeZone);
    if (!zone) throw new UnknownZoneError(req.body.timeZone);
    const [year, month, day, hour, minute, second] = req.body.local.match(/\d+/g)!.map(Number) as [number, number, number, number, number, number];
    const probe = new Date(0);
    probe.setUTCFullYear(year, month - 1, day);
    if (month < 1 || month > 12 || probe.getUTCMonth() !== month - 1 || hour > 23 || minute > 59 || second > 59) throw new InvalidInputError(`"${req.body.local}" is not a real date and time`);
    return { timeZone: zone, version: tz.version, ...resolveLocal(tz, zone, { year, month, day, hour, minute, second }) };
  });
};
