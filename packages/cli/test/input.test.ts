import { describe, expect, it } from 'vitest';
import { ChartFileError, readChartFile } from '../src/input';

const xml = (over: Record<string, string> = {}) => {
  const f = { BirthDate: '2451545.0000000', Longitude: '-77.2000000', Latitude: '28.6000000', TimeZone: '0.0000000', DST: '0.0000000', ...over };
  return `<!DOCTYPE BirthData>\n<BirthData>\n  <BirthInfo>\n${Object.entries(f).map(([k, v]) => `    <${k}>${v}</${k}>`).join('\n')}\n  </BirthInfo>\n</BirthData>\n`;
};

describe('readChartFile, JSON', () => {
  it('reads a Julian day', () => {
    expect(readChartFile('{"jdUt":2451545,"latitude":28.6,"longitudeEast":77.2}', 'a.json')).toEqual({ jdUt: 2451545, latitude: 28.6, longitudeEast: 77.2 });
  });
  it('reads the clock offset when given', () => {
    expect(readChartFile('{"jdUt":2451545,"latitude":28.6,"longitudeEast":77.2,"utcOffsetHours":5.5}', 'a.json').utcOffsetHours).toBe(5.5);
  });
  it('accepts a JSON file that starts with a byte-order mark', () => {
    expect(readChartFile('﻿{"jdUt":2451545,"latitude":0,"longitudeEast":0}', 'a.json').jdUt).toBe(2451545);
  });
  it('reads a UTC instant', () => {
    expect(readChartFile('{"utc":"2000-01-01T12:00:00Z","latitude":0,"longitudeEast":0}', 'a.json').jdUt).toBeCloseTo(2451545, 9);
  });
  it.each([
    ['not json', '{'], ['an array', '[]'], ['no latitude', '{"jdUt":1,"longitudeEast":0}'],
    ['both instants', '{"jdUt":1,"utc":"2000-01-01T12:00:00Z","latitude":0,"longitudeEast":0}'],
    ['no instant', '{"latitude":0,"longitudeEast":0}'], ['a string number', '{"jdUt":"1","latitude":0,"longitudeEast":0}'],
    ['latitude out of range', '{"jdUt":2451545,"latitude":91,"longitudeEast":0}'],
    ['longitude out of range', '{"jdUt":2451545,"latitude":0,"longitudeEast":181}'],
    ['an instant without Z', '{"utc":"2000-01-01T12:00:00","latitude":0,"longitudeEast":0}'],
    ['an impossible date', '{"utc":"2000-02-30T12:00:00Z","latitude":0,"longitudeEast":0}'],
    ['an unknown field', '{"jdUt":2451545,"latitude":0,"longitudeEast":0,"tz":3}'],
  ])('rejects %s', (_name, text) => {
    expect(() => readChartFile(text, 'a.json')).toThrow(ChartFileError);
  });
});

describe('readChartFile, PL9 XML', () => {
  it('reads date, latitude and longitude, turning west-positive into east-positive', () => {
    expect(readChartFile(xml(), 'a.xml')).toEqual({ jdUt: 2451545, latitude: 28.6, longitudeEast: 77.2 });
  });
  it.each([
    ['a missing field', xml().replace(/ *<Latitude>.*\n/, '')], ['a non-numeric field', xml({ BirthDate: 'abc' })],
    ['no BirthInfo', '<BirthData></BirthData>'], ['an empty file', ''],
  ])('rejects %s', (_name, text) => {
    expect(() => readChartFile(text, 'a.xml')).toThrow(ChartFileError);
  });
  it('turns the local time of the file into universal time: the zone is hours west, daylight saving is hours ahead', () => {
    // India: 5.5 hours east of Greenwich is written as -5.5.
    const india = readChartFile(xml({ TimeZone: '-5.5000000' }), 'a.xml');
    expect(india.jdUt).toBeCloseTo(2451545 - 5.5 / 24, 9);
    expect(india.utcOffsetHours).toBeCloseTo(5.5, 9);
    // New York in summer: 5 hours west, one hour of daylight saving.
    const newYork = readChartFile(xml({ TimeZone: '5.0000000', DST: '1.0000000' }), 'a.xml');
    expect(newYork.jdUt).toBeCloseTo(2451545 + 4 / 24, 9);
    expect(newYork.utcOffsetHours).toBeCloseTo(-4, 9);
  });
  it('refuses a file without its time zone or daylight saving: the instant would be a guess', () => {
    expect(() => readChartFile(xml().replace(/ *<TimeZone>.*\n/, ''), 'a.xml')).toThrow(ChartFileError);
    expect(() => readChartFile(xml().replace(/ *<DST>.*\n/, ''), 'a.xml')).toThrow(ChartFileError);
    expect(() => readChartFile(xml().replace(/<TimeZone>.*<\/TimeZone>/, '<TimeZone/>'), 'a.xml')).toThrow(ChartFileError);
  });
  it.each([['hexadecimal', '0x10'], ['exponent', '1e3'], ['two points', '1.2.3'], ['a space inside', '12 5']])('rejects a %s number', (_n, value) => {
    expect(() => readChartFile(xml({ Latitude: value }), 'a.xml')).toThrow(ChartFileError);
  });
  it('rejects an unknown extension', () => {
    expect(() => readChartFile('{}', 'a.txt')).toThrow(ChartFileError);
  });
});
