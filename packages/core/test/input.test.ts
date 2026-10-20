import { describe, expect, it } from 'vitest';
import { InvalidInputError, parseChartInput } from '../src/index';

const place = { latitude: 44.2377778, longitudeEast: 150.6744444 };

describe('the birth input', () => {
  it('takes a UTC instant or a Julian day and a place', () => {
    const c = parseChartInput({ utc: '1995-05-27T23:15:57Z', ...place });
    expect(c.jdUt).toBeCloseTo(2449865.4694097, 6);
    expect(c.latitude).toBe(place.latitude);
    expect(parseChartInput({ jdUt: 2449865.5, ...place, utcOffsetHours: 5.5 })).toEqual({ jdUt: 2449865.5, ...place, utcOffsetHours: 5.5 });
  });
  it('refuses what it cannot read, saying why', () => {
    const bad = (v: unknown, message: RegExp) => expect(() => parseChartInput(v)).toThrow(message);
    bad({ jdUt: 1, utc: '2000-01-01T00:00:00Z', ...place }, /give exactly one of/);
    bad({ jdUt: 1, latitude: 91, longitudeEast: 0 }, /latitude/);
    bad({ utc: '2001-02-29T00:00:00Z', ...place }, /is not a real date/);
    bad({ jdUt: 1, latitude: 0, longitudeEast: 0, foo: 1 }, /unknown field "foo"/);
    bad([1, 2], /one JSON object/);
    expect(() => parseChartInput(null)).toThrow(InvalidInputError);
  });
});
