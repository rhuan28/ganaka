import {
  ageAt, completedYears, computeBirthPanchanga, dailyReturn, eventDashas, kakshaCalendar, monthCalendar, monthlyReturn, natalSahams,
  computePositions, resolveNatures, resolveOptions, signIngresses, tithiPravesh, vargaTable, PLANETS_9, computeMuhurta, computePanchangTable, computePanchanga, computeTransits, computeVarshaphalaReport,
  dashasAt, InvalidInputError, MUHURTA_ACTIVITIES, parseChartInput, timeOfTransit, TRANSIT_EVENTS, type CalendarMode, type MuhurtaActivity,
} from '@reverse/core';
import { Type } from '@sinclair/typebox';
import type { Route } from '../server';
import { Birth, coreOptionsOf, CoreOptionsSchema } from '../schemas';

const strict = { additionalProperties: false } as const;
const Place = Type.Object({ latitude: Type.Number({ minimum: -90, maximum: 90 }), longitudeEast: Type.Number({ minimum: -180, maximum: 180 }) }, strict);
const CALENDARS: Record<string, CalendarMode> = { krishnadi: 'krishnadi', shukladi: 'shukladi', 'krishnadi-half': 'krishnadiHalf' };

// "vargas": the vargas whose tables of the transit to add (PL9's "Animated Transits - Vargas").
const Transits = Type.Object({
  birth: Birth, at: Birth, options: Type.Optional(CoreOptionsSchema),
  vargas: Type.Optional(Type.Array(Type.Union(['D9', 'D10'].map((v) => Type.Literal(v))), { maxItems: 2, uniqueItems: true })),
}, strict);
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
  // The monthly or daily return of the year: with "at", the month and day of age at it; with "years", "months" and "days".
  period: Type.Optional(Type.Union([Type.Literal('year'), Type.Literal('month'), Type.Literal('day')])),
  months: Type.Optional(Type.Integer({ minimum: 0, maximum: 11 })), days: Type.Optional(Type.Integer({ minimum: 0, maximum: 29 })),
  // So many periods (years, months or days) after the one of "at" or of "years", "months" and "days"; negative is before.
  offset: Type.Optional(Type.Integer({ minimum: -600, maximum: 600 })),
  solarReturn: Type.Optional(Type.Union([Type.Literal('true'), Type.Literal('mean')])), options: Type.Optional(CoreOptionsSchema),
}, strict);
const TithiPravesh = Type.Object({ birth: Birth, at: Birth, offset: Type.Optional(Type.Integer({ minimum: -600, maximum: 600 })), options: Type.Optional(CoreOptionsSchema) }, strict);
const Month = Type.Object({ birth: Birth, at: Birth, options: Type.Optional(CoreOptionsSchema) }, strict);
const Year = Type.Object({ birth: Birth, at: Birth, options: Type.Optional(CoreOptionsSchema) }, strict);
const Sahams = Type.Object({ birth: Birth, options: Type.Optional(CoreOptionsSchema) }, strict);
const Event = Type.Object({ jdUt: Type.Number(), utcOffsetHours: Type.Number({ minimum: -14, maximum: 14 }) }, strict);
const Events = Type.Object({ birth: Birth, events: Type.Array(Event, { maxItems: 20 }), options: Type.Optional(CoreOptionsSchema) }, strict);
const NINE = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu'] as const;
// PL9's Research -> "Time of transits": when the planet next makes the event with the natal point, after an instant.
const TimeOfTransit = Type.Object({
  birth: Birth, after: Birth,
  planet: Type.Union(NINE.map((p) => Type.Literal(p))),
  event: Type.Union(TRANSIT_EVENTS.map((e) => Type.Literal(e))),
  natal: Type.Union(['lagna', ...NINE].map((p) => Type.Literal(p))),
  // The search runs on the service's only thread: two of Saturn's rounds at most (a fortieth of a second a year).
  years: Type.Optional(Type.Integer({ minimum: 1, maximum: 60 })),
  options: Type.Optional(CoreOptionsSchema),
}, strict);
const Muhurta = Type.Object({
  birth: Birth, at: Birth, activity: Type.Optional(Type.Union(MUHURTA_ACTIVITIES.map((a) => Type.Literal(a)))), options: Type.Optional(CoreOptionsSchema),
}, strict);

/** The pages of time: transits, panchanga, Varshaphala and Muhurta, as the CLI gives them. */
export const time: Route = (app, { eph }) => {
  app.post<{ Body: typeof Transits.static }>('/v1/transits', { schema: { body: Transits, tags: ['time'], summary: 'The transits over the natal chart at an instant and place' } }, async (req) => {
    const natal = parseChartInput(req.body.birth), at = parseChartInput(req.body.at), o = coreOptionsOf(req.body.options);
    const t = computeTransits(eph, natal, at, o);
    if (!req.body.vargas) return { ...t, dashas: dashasAt(eph, natal, at.jdUt, o) };
    const core = resolveOptions(o), natures = resolveNatures(core.natures);
    const longitudes = Object.fromEntries(Object.entries(t.points).map(([k, v]) => [k, v.longitude]));
    const vargaTables = Object.fromEntries(req.body.vargas.map((v) => [v, vargaTable(longitudes, v as 'D9' | 'D10', core.fidelity, natures)]));
    return { ...t, dashas: dashasAt(eph, natal, at.jdUt, o), vargaTables };
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
    const period = req.body.period ?? 'year', o = coreOptionsOf(req.body.options), mode = req.body.solarReturn ?? 'true';
    if (period === 'year' && (req.body.months !== undefined || req.body.days !== undefined)) throw new InvalidInputError('"months" and "days" go with a "period" of month or day');
    if (req.body.at !== undefined && (req.body.months !== undefined || req.body.days !== undefined)) throw new InvalidInputError('with "at", the month and day come from it');
    if (period === 'month' && req.body.days !== undefined) throw new InvalidInputError('"days" goes with a "period" of day');
    const given = req.body.at === undefined ? { years, months: req.body.months ?? 0, days: req.body.days ?? 0 } : ageAt(natal.jdUt, parseChartInput(req.body.at).jdUt);
    // The offset counts whole periods: a month is a twelfth of the year of age, a day a thirtieth of the month.
    const unit = period === 'year' ? 360 : period === 'month' ? 30 : 1;
    const total = given.years * 360 + given.months * 30 + given.days + (req.body.offset ?? 0) * unit;
    if (total < 0) throw new InvalidInputError('the offset goes before the birth: there is no year of age then');
    const age = period === 'year' && req.body.offset === undefined ? given : { years: Math.floor(total / 360), months: Math.floor((total % 360) / 30), days: total % 30 };
    years = age.years;
    if (years > 600) throw new InvalidInputError('no year of age past 600 can be cast');
    const returnJdUt = period === 'month' ? monthlyReturn(eph, natal, years, age.months, mode, o)
      : period === 'day' ? dailyReturn(eph, natal, years, age.months, age.days, mode, o) : undefined;
    const report = computeVarshaphalaReport(eph, natal, years, { ...o, solarReturn: mode, place: req.body.place, ...(returnJdUt === undefined ? {} : { returnJdUt }) });
    return period === 'year' ? report : { ...report, period: { kind: period, years, months: age.months, ...(period === 'day' ? { days: age.days } : {}) } };
  });

  app.post<{ Body: typeof TithiPravesh.static }>('/v1/tithi-pravesh', { schema: { body: TithiPravesh, tags: ['time'], summary: 'The Tithi Pravesh of the year of age that holds an instant' } }, async (req) => {
    const natal = parseChartInput(req.body.birth), at = parseChartInput(req.body.at);
    // A year of age is a mean sidereal year, as in the Tithi Pravesh's own count.
    const date = at.jdUt + (req.body.offset ?? 0) * 365.25636;
    if (date < natal.jdUt) throw new InvalidInputError('the date is before the birth: there is no year of age then');
    return { jdUt: tithiPravesh(eph, natal, date, coreOptionsOf(req.body.options)), years: Math.max(0, Math.floor((date - natal.jdUt) / 365.25636)) };
  });

  // The civil month and year of an instant in its own clock.
  const civil = (at: { jdUt: number; utcOffsetHours?: number }) => {
    const d = new Date(Math.round((at.jdUt + (at.utcOffsetHours ?? 0) / 24 - 2440587.5) * 86400000));
    return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
  };
  const midnightUt = (y: number, m: number) => Date.UTC(y, m - 1, 1) / 86400000 + 2440587.5;

  app.post<{ Body: typeof Month.static }>('/v1/transits/month', { schema: { body: Month, tags: ['time'], summary: 'The transit calendar and the kaksha calendar of the civil month of an instant' } }, async (req) => {
    const natal = parseChartInput(req.body.birth), at = parseChartInput(req.body.at), o = coreOptionsOf(req.body.options);
    const m = civil(at), utcOffsetHours = at.utcOffsetHours ?? 0;
    const events = monthCalendar(eph, natal, m, { utcOffsetHours }, o);
    // Both read the natal Lagna: beyond the polar circle there may be none.
    const kakshas = events === null ? null : kakshaCalendar(eph, natal, midnightUt(m.year, m.month), midnightUt(m.year, m.month + 1), o);
    return { month: m, utcOffsetHours, events, kakshas, missing: events === null ? [{ what: 'events', reason: 'natal Lagna not defined' }, { what: 'kakshas', reason: 'natal Lagna not defined' }] : [] };
  });

  app.post<{ Body: typeof Year.static }>('/v1/transits/year', { schema: { body: Year, tags: ['time'], summary: 'The sign of each planet at the start of the civil year of an instant, and its ingresses in the year' } }, async (req) => {
    const at = parseChartInput(req.body.at), o = coreOptionsOf(req.body.options), utcOffsetHours = at.utcOffsetHours ?? 0;
    const { year } = civil(at);
    const from = midnightUt(year, 1) - utcOffsetHours / 24, to = midnightUt(year + 1, 1) - utcOffsetHours / 24;
    const p = computePositions(eph, { jdUt: from, latitude: 0, longitudeEast: 0 }, o).points;
    const start = Object.fromEntries(PLANETS_9.map((k) => [k, { sign: Math.floor(p[k].longitude / 30), retrograde: p[k].retrograde ?? false }]));
    return { year, utcOffsetHours, from, to, start, ingresses: signIngresses(eph, from, to, o) };
  });

  app.post<{ Body: typeof TimeOfTransit.static }>('/v1/transits/time', { schema: { body: TimeOfTransit, tags: ['time'], summary: 'When a planet next transits, aspects, enters or leaves a natal point, its sign or its nakshatra' } }, async (req) => {
    const natal = parseChartInput(req.body.birth), after = parseChartInput(req.body.after), o = coreOptionsOf(req.body.options);
    const point = computePositions(eph, natal, o).points[req.body.natal as 'lagna' | (typeof NINE)[number]];
    if (!point) throw new InvalidInputError(`the chart has no ${req.body.natal}`);
    const found = timeOfTransit(eph, req.body.planet, req.body.event, point.longitude, after.jdUt, o, (req.body.years ?? 60) * 365.25);
    return { natalLongitude: point.longitude, found: found ?? null };
  });

  app.post<{ Body: typeof Sahams.static }>('/v1/sahams', { schema: { body: Sahams, tags: ['time'], summary: 'The Sahams of the birth chart' } }, async (req) => {
    const s = natalSahams(eph, parseChartInput(req.body.birth), coreOptionsOf(req.body.options));
    return { sahams: s, missing: s ? [] : [{ what: 'sahams', reason: 'natal Lagna not defined' }] };
  });

  app.post<{ Body: typeof Events.static }>('/v1/events', { schema: { body: Events, tags: ['time'], summary: 'The dashas running at each event' } }, async (req) => {
    const natal = parseChartInput(req.body.birth), o = coreOptionsOf(req.body.options);
    return { events: req.body.events.map((e) => ({ ...e, dashas: eventDashas(eph, natal, e, o) })) };
  });

  app.post<{ Body: typeof Muhurta.static }>('/v1/muhurta', { schema: { body: Muhurta, tags: ['time'], summary: 'The evaluation of an instant for the native' } }, async (req) =>
    computeMuhurta(eph, parseChartInput(req.body.birth), parseChartInput(req.body.at), { ...coreOptionsOf(req.body.options), activity: (req.body.activity ?? 'general') as MuhurtaActivity }));
};
