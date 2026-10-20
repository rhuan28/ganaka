import {
  completedYears, computeBirthPanchanga, computeMuhurta, computePanchangTable, computePanchanga, computeTransits, computeVarshaphalaReport,
  dashasAt, InvalidInputError, MUHURTA_ACTIVITIES, parseChartInput, type CalendarMode, type MuhurtaActivity,
} from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema } from '../schemas';

const strict = { additionalProperties: false } as const;
const Place = Type.Object({ latitude: Type.Number({ minimum: -90, maximum: 90 }), longitudeEast: Type.Number({ minimum: -180, maximum: 180 }) }, strict);
const CALENDARS: Record<string, CalendarMode> = { krishnadi: 'krishnadi', shukladi: 'shukladi', 'krishnadi-half': 'krishnadiHalf' };

const Transits = Type.Object({ birth: Birth, at: Birth, options: Type.Optional(CoreOptionsSchema) }, strict);
const Panchanga = Type.Object({
  birth: Birth, at: Type.Optional(Birth), options: Type.Optional(CoreOptionsSchema),
  calendar: Type.Optional(Type.Union(Object.keys(CALENDARS).map((k) => Type.Literal(k)))),
  // About two weeks, as a page of PL9's Print -> Panchang: a day takes most of a second, and a request runs on the
  // service's only thread.
  days: Type.Optional(Type.Integer({ minimum: 1, maximum: 15 })),
}, strict);
const Varshaphala = Type.Object({
  // The ephemeris covers 1800 to 2399: no year of age past 600 can be cast.
  birth: Birth, years: Type.Optional(Type.Integer({ minimum: 0, maximum: 600 })), at: Type.Optional(Birth), place: Type.Optional(Place),
  solarReturn: Type.Optional(Type.Union([Type.Literal('true'), Type.Literal('mean')])), options: Type.Optional(CoreOptionsSchema),
}, strict);
const Muhurta = Type.Object({
  birth: Birth, at: Birth, activity: Type.Optional(Type.Union(MUHURTA_ACTIVITIES.map((a) => Type.Literal(a)))), options: Type.Optional(CoreOptionsSchema),
}, strict);

/** The pages of time: transits, panchanga, Varshaphala and Muhurta, as the CLI gives them. */
export const time: Route = (app, { eph }) => {
  app.post<{ Body: typeof Transits.static }>('/v1/transits', { schema: { body: Transits, tags: ['time'], summary: 'The transits over the natal chart at an instant and place' } }, async (req) => {
    const natal = parseChartInput(req.body.birth), at = parseChartInput(req.body.at), o = coreOptionsOf(req.body.options);
    return { ...computeTransits(eph, natal, at, o), dashas: dashasAt(eph, natal, at.jdUt, o) };
  });

  app.post<{ Body: typeof Panchanga.static }>('/v1/panchanga', { schema: { body: Panchanga, tags: ['time'], summary: 'The panchanga of the birth, of an instant, or a table of days' } }, async (req) => {
    const natal = parseChartInput(req.body.birth), o = coreOptionsOf(req.body.options);
    if (!req.body.at) {
      if (req.body.calendar !== undefined || req.body.days !== undefined) throw new InvalidInputError('"calendar" and "days" go with "at"');
      return computeBirthPanchanga(eph, natal, o);
    }
    const at = parseChartInput(req.body.at);
    const place = { latitude: at.latitude, longitudeEast: at.longitudeEast, utcOffsetHours: at.utcOffsetHours ?? 0 };
    const mode = CALENDARS[req.body.calendar ?? 'krishnadi']!;
    // The civil date in the instant's clock; for one instant, its Vedic day (the sunrise before it), whose month is named.
    const dateOf = (jd: number) => {
      const civil = new Date(Math.round((jd + place.utcOffsetHours / 24 - 2440587.5) * 86400000));
      return { year: civil.getUTCFullYear(), month: civil.getUTCMonth() + 1, day: civil.getUTCDate() };
    };
    if (req.body.days !== undefined) return computePanchangTable(eph, dateOf(at.jdUt), req.body.days, place, mode, o);
    const p = computePanchanga(eph, { ...at, utcOffsetHours: place.utcOffsetHours }, o);
    const table = computePanchangTable(eph, dateOf(p.sunrise ?? at.jdUt), 1, place, mode, o);
    return { ...p, calendar: { mode: req.body.calendar ?? 'krishnadi', name: table.month.name, vikram: table.vikram, saka: table.saka } };
  });

  app.post<{ Body: typeof Varshaphala.static }>('/v1/varshaphala', { schema: { body: Varshaphala, tags: ['time'], summary: 'The annual chart of a year of age' } }, async (req) => {
    const natal = parseChartInput(req.body.birth);
    if ((req.body.years === undefined) === (req.body.at === undefined)) throw new InvalidInputError('give exactly one of "years" and "at"');
    let years = req.body.years;
    if (years === undefined) {
      const at = parseChartInput(req.body.at);
      if (at.jdUt < natal.jdUt) throw new InvalidInputError('"at" is before the birth: there is no year of age then');
      years = completedYears(natal.jdUt, at.jdUt);
    }
    return computeVarshaphalaReport(eph, natal, years, { ...coreOptionsOf(req.body.options), solarReturn: req.body.solarReturn ?? 'true', place: req.body.place });
  });

  app.post<{ Body: typeof Muhurta.static }>('/v1/muhurta', { schema: { body: Muhurta, tags: ['time'], summary: 'The evaluation of an instant for the native' } }, async (req) =>
    computeMuhurta(eph, parseChartInput(req.body.birth), parseChartInput(req.body.at), { ...coreOptionsOf(req.body.options), activity: (req.body.activity ?? 'general') as MuhurtaActivity }));
};
