import { describe, expect, it } from 'vitest';
import { chartXml, pl9Name, type ChartSpec } from '../src/pl9xml';

const spec: ChartSpec = {
  id: 'ref-0042', jdUt: 2457936, latitude: 5.55, longitudeEast: -0.2166667, kind: 'random', note: '',
};

describe('pl9Name', () => {
  it('turns the id into the name PL9 will show and export', () => {
    expect(pl9Name(spec)).toBe('REF 0042');
  });
});

describe('chartXml', () => {
  const xml = chartXml(spec);
  it('writes the Julian day with seven decimals and zero time zone', () => {
    expect(xml).toContain('<BirthDate>2457936.0000000</BirthDate>');
    expect(xml).toContain('<TimeZone>0.0000000</TimeZone>');
    expect(xml).toContain('<DST>0.0000000</DST>');
  });
  it('flips east longitude to the west-positive convention of the file', () => {
    expect(xml).toContain('<Longitude>0.2166667</Longitude>');
    expect(chartXml({ ...spec, longitudeEast: 75.8166667 })).toContain('<Longitude>-75.8166667</Longitude>');
  });
  it('keeps north latitude positive and south negative', () => {
    expect(xml).toContain('<Latitude>5.5500000</Latitude>');
    expect(chartXml({ ...spec, latitude: -33.9 })).toContain('<Latitude>-33.9000000</Latitude>');
  });
  it('names the chart from the id', () => {
    expect(xml).toContain('<FirstName>REF</FirstName>');
    expect(xml).toContain('<LastName>0042</LastName>');
  });
  it('starts with the doctype and closes the root element', () => {
    expect(xml.startsWith('<!DOCTYPE BirthData>\n<BirthData>')).toBe(true);
    expect(xml.trimEnd().endsWith('</BirthData>')).toBe(true);
  });
  it('rejects an id that does not have the ref-NNNN form', () => {
    expect(() => chartXml({ ...spec, id: 'x' })).toThrow(/ref-NNNN/);
  });
});
