import { describe, expect, it } from 'vitest';
import { dashasAt, eventDashas, monthCalendar, monthEvents, sunriseDashaRows } from '../src/index';
import { fakeSky } from './fakeSky';

const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: 150.6744444 };
const o = { fidelity: 'pl9' } as const;
const clock = Date.UTC(2026, 9, 17, 4, 6, 23) / 864e5 + 2440587.5 - 5.5 / 24;

describe('the rules of the clock pages', () => {
  it('list the sunrise chart\'s antardashas from the one running at the clock read as UT', () => {
    const rows = sunriseDashaRows(fakeSky, natal, { jdUt: clock, utcOffsetHours: 5.5 }, 16, o)!;
    expect(rows).toHaveLength(16);
    expect(rows[0]!.chain).toHaveLength(2);
    expect(rows[0]!.startJdUt).toBeLessThanOrEqual(clock + 5.5 / 24);
    expect(rows[1]!.startJdUt).toBeGreaterThan(clock + 5.5 / 24);
    // A clock before the birth starts the list at the first antardasha.
    const early = sunriseDashaRows(fakeSky, natal, { jdUt: natal.jdUt - 100, utcOffsetHours: 5.5 }, 3, o)!;
    expect(early[0]!.startJdUt).toBeLessThanOrEqual(natal.jdUt);
    expect(sunriseDashaRows(fakeSky, { ...natal, latitude: 89.5, jdUt: 2449890.5 }, { jdUt: clock, utcOffsetHours: 5.5 }, 16, o)).toBeNull();
  });
  it('take the month\'s events in the place\'s clock, the dashas from 0h UT of the first day', () => {
    const c0 = Date.UTC(2026, 9, 1) / 864e5 + 2440587.5 - 5.5 / 24, c1 = Date.UTC(2026, 10, 1) / 864e5 + 2440587.5 - 5.5 / 24;
    expect(monthCalendar(fakeSky, natal, { year: 2026, month: 10 }, { utcOffsetHours: 5.5 }, o))
      .toEqual(monthEvents(fakeSky, natal, c0, c1, o, { dashasFromJdUt: c0 + 5.5 / 24 }));
  });
  it('take an event\'s dashas at its clock read as UT', () => {
    expect(eventDashas(fakeSky, natal, { jdUt: clock, utcOffsetHours: 5.5 }, o)).toEqual(dashasAt(fakeSky, natal, clock + 5.5 / 24, o));
  });
});
