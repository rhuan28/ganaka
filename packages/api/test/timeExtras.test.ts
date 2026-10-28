import { describe, expect, it } from 'vitest';
import {
  ageAt, completedYears, computeVarshaphalaReport, dailyReturn, eventDashas, kakshaCalendar, monthCalendar, monthlyReturn, natalSahams,
  computePositions, parseChartInput, signIngresses, timeOfTransit, tithiPravesh, vargaTable,
} from '@reverse/core';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const birth = { utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 };
const at = { utc: '2026-10-17T00:00:00Z', latitude: 26.9166667, longitudeEast: 75.8277778, utcOffsetHours: 5.5 };
const natal = parseChartInput(birth), when = parseChartInput(at);
const c = { fidelity: 'corrected' } as const;
const app = buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 1000, sourceUrl: 'x' });
const post = (url: string, body: unknown) => app.inject({ method: 'POST', url, payload: body as object, headers: { 'x-api-key': 'k1' } });
const same = (x: unknown) => JSON.parse(JSON.stringify(x));

describe('the time routes the pages of the app need', () => {
  it('cast the monthly and daily returns of the age at an instant', async () => {
    const years = completedYears(natal.jdUt, when.jdUt), age = ageAt(natal.jdUt, when.jdUt);
    const month = await post('/v1/varshaphala', { birth, at, period: 'month' });
    expect(month.statusCode).toBe(200);
    const mj = monthlyReturn(fakeSky, natal, years, age.months, 'true', c);
    expect(month.json()).toEqual(same({ ...computeVarshaphalaReport(fakeSky, natal, years, { ...c, solarReturn: 'true', returnJdUt: mj }), period: { kind: 'month', years, months: age.months } }));
    const day = await post('/v1/varshaphala', { birth, years: 31, months: 4, days: 23, period: 'day' });
    expect(day.json().varshaphala.jdUt).toBe(dailyReturn(fakeSky, natal, 31, 4, 23, 'true', c));
    expect(day.json().period).toEqual({ kind: 'day', years: 31, months: 4, days: 23 });
    expect((await post('/v1/varshaphala', { birth, years: 31, months: 4 })).statusCode).toBe(400);
    // An offset counts whole periods across the year's end.
    const next = await post('/v1/varshaphala', { birth, years: 31, months: 11, period: 'month', offset: 1 });
    expect(next.json().period).toEqual({ kind: 'month', years: 32, months: 0 });
    expect((await post('/v1/varshaphala', { birth, years: 31, offset: -2 })).json().varshaphala.years).toBe(29);
    expect((await post('/v1/varshaphala', { birth, years: 0, offset: -1 })).statusCode).toBe(400);
    expect((await post('/v1/varshaphala', { birth, years: 31, months: 2, days: 3, period: 'month' })).statusCode).toBe(400);
    expect((await post('/v1/tithi-pravesh', { birth, at, offset: -40 })).statusCode).toBe(400);
  });

  it('add the tables of the transit in the vargas asked for', async () => {
    const r = (await post('/v1/transits', { birth, at, vargas: ['D9', 'D10'] })).json();
    const t = (await post('/v1/transits', { birth, at })).json();
    const longitudes = Object.fromEntries(Object.entries(t.points as Record<string, { longitude: number }>).map(([k, v]) => [k, v.longitude]));
    expect(r.vargaTables.D9).toEqual(same(vargaTable(longitudes, 'D9', 'corrected')));
    expect(t).not.toHaveProperty('vargaTables');
  });

  it('answer the Tithi Pravesh, the month, the year, the natal Sahams and the event dashas', async () => {
    expect((await post('/v1/tithi-pravesh', { birth, at })).json().jdUt).toBe(tithiPravesh(fakeSky, natal, when.jdUt, c));
    const m = (await post('/v1/transits/month', { birth, at })).json();
    expect(m.month).toEqual({ year: 2026, month: 10 });
    expect(m.events).toEqual(same(monthCalendar(fakeSky, natal, { year: 2026, month: 10 }, { utcOffsetHours: 5.5 }, c)));
    const start = Date.UTC(2026, 9, 1) / 86400000 + 2440587.5;
    expect(m.kakshas).toEqual(same(kakshaCalendar(fakeSky, natal, start, Date.UTC(2026, 10, 1) / 86400000 + 2440587.5, c)));
    const y = (await post('/v1/transits/year', { birth, at })).json();
    expect(y.year).toBe(2026);
    expect(y.ingresses).toEqual(same(signIngresses(fakeSky, y.from, y.to, c)));
    expect(Object.keys(y.start)).toHaveLength(9);
    expect((await post('/v1/sahams', { birth })).json().sahams).toEqual(same(natalSahams(fakeSky, natal, c)));
    const e = (await post('/v1/events', { birth, events: [{ jdUt: when.jdUt, utcOffsetHours: 5.5 }] })).json();
    expect(e.events[0].dashas).toEqual(same(eventDashas(fakeSky, natal, { jdUt: when.jdUt, utcOffsetHours: 5.5 }, c)));
  });

  it("find when a planet next makes an event with a natal point (PL9's Time of transits), as the core does", async () => {
    const after = { utc: '2026-10-28T00:00:00Z', latitude: 0, longitudeEast: 0 };
    const r = await post('/v1/transits/time', { birth, after, planet: 'moon', event: 'transits', natal: 'sun' });
    expect(r.statusCode).toBe(200);
    const sun = computePositions(fakeSky, natal, c).points.sun.longitude;
    expect(r.json()).toEqual(same({ natalLongitude: sun, found: timeOfTransit(fakeSky, 'moon', 'transits', sun, parseChartInput(after).jdUt, c, 60 * 365.25) }));
    expect(r.json().found.jdUt).toBeGreaterThan(parseChartInput(after).jdUt);
    expect((await post('/v1/transits/time', { birth, after, planet: 'moon', event: 'transits', natal: 'sun', years: 61 })).statusCode).toBe(400);
    expect((await post('/v1/transits/time', { birth, after, planet: 'uranus', event: 'transits', natal: 'sun' })).statusCode).toBe(400);
  });
});
