import { describe, expect, it } from 'vitest';
import { Pl9FileError, readPl9Chart } from '../src/pl9File';

interface EventSpec { id: number; name: string; date?: string; zone?: string; notes?: string }

/** A chart file shaped like the ones Parashara's Light 9 saves. */
function file(o: { info?: Record<string, string>; events?: EventSpec[]; notes?: string; family?: Record<string, string>; drop?: string } = {}): string {
  const info: Record<string, string> = {
    FirstName: 'Test', LastName: 'Chart', Sounds: '', Gender: '1', BirthDate: '2451545.0000000', Longitude: '-77.2000000',
    Latitude: '28.6000000', TimeZone: '-5.5000000', DST: '0.0000000', City: 'Delhi', State: 'Delhi', Country: 'India',
    BDLookupMode: 'A', RoddenRating: '2', ...o.info,
  };
  const tags = (fields: Record<string, string>) => Object.entries(fields).filter(([k]) => k !== o.drop).map(([k, v]) => `    <${k}>${v}</${k}>`).join('\n');
  const event = (e: EventSpec) => `    <Event Id="${e.id}"><Name>${e.name}</Name>
      <Description>about ${e.name}</Description>
      <Date>${e.date ?? '2461319.4693287'}</Date>
      <Longitude>-75.8166667</Longitude>
      <Latitude>26.9166667</Latitude>
      <TimeZone>${e.zone ?? '-5.5000000'}</TimeZone>
      <DST>0.0000000</DST>
      <City>Jaipur</City>
      <State>Rājasthān</State>
      <Country>India</Country>
      <EventLookupMode>D</EventLookupMode>
      <EventClassification>career</EventClassification>
      <EventNotes>${e.notes ?? ''}</EventNotes>
      <EventRodden>1</EventRodden>
      <IsUsed>0</IsUsed>
    </Event>`;
  const family = { GrandFather: '', Father: '', Mother: '', Tags: '', Unused1: 'u', ...o.family };
  return `<!DOCTYPE BirthData>
<BirthData>
  <BirthInfo>
${tags(info)}
  </BirthInfo>
  <Events>
${(o.events ?? [{ id: 1, name: 'Today' }, { id: 2, name: 'Muhurta' }]).map(event).join('\n')}
  </Events>
  <DetailedNotes>${o.notes ?? ''}</DetailedNotes>
  <BirthdataPicklist/>
  <FamilyInfo>
${tags(family)}
  </FamilyInfo>
  <MuhurtaSessions/>
</BirthData>
`;
}

describe('readPl9Chart', () => {
  it('reads the birth like the CLI did', () => {
    const c = readPl9Chart(file());
    expect(c.birth.jdUt).toBeCloseTo(2451545 - 5.5 / 24, 9);
    expect(c.birth.longitudeEast).toBeCloseTo(77.2, 9);
    expect(c.birth.latitude).toBeCloseTo(28.6, 9);
    expect(c.birth.utcOffsetHours).toBe(5.5);
    expect(c.birth.dstHours).toBe(0);
    expect(c).toMatchObject({ firstName: 'Test', lastName: 'Chart', gender: 1, rodden: 2 });
    expect(c.birth.place).toEqual({ city: 'Delhi', state: 'Delhi', country: 'India' });
  });
  it('a zone of zero is 0, not -0', () => {
    const c = readPl9Chart(file({ info: { TimeZone: '0.0000000', Longitude: '0.2166667' } }));
    expect(Object.is(c.birth.utcOffsetHours, 0)).toBe(true);
  });
  it('daylight saving', () => {
    const c = readPl9Chart(file({ info: { TimeZone: '5.0000000', DST: '1.0000000' } }));
    expect(c.birth.utcOffsetHours).toBe(-4);
    expect(c.birth.dstHours).toBe(1);
    expect(c.birth.jdUt).toBeCloseTo(2451545 + 4 / 24, 9);
  });
  it('names, place and entities', () => {
    const c = readPl9Chart(file({ info: { FirstName: 'Jos&#233; &amp; Ana', City: 'S&#227;o Paulo', State: 'Rājasthān', Country: '&lt;x&gt; &quot;y&quot; &apos;z&apos; &#x41;' } }));
    expect(c.firstName).toBe('José & Ana');
    expect(c.birth.place).toEqual({ city: 'São Paulo', state: 'Rājasthān', country: '<x> "y" \'z\' A' });
  });
  it('events, without the automatic ones', () => {
    const c = readPl9Chart(file({ events: [{ id: 1, name: 'Today' }, { id: 2, name: 'Muhurta' }, { id: 3, name: 'Marriage', date: '2455000.5000000', zone: '3.0000000', notes: 'first&#10;line' }] }));
    expect(c.events).toHaveLength(1);
    const e = c.events[0]!;
    expect(e).toMatchObject({ name: 'Marriage', description: 'about Marriage', classification: 'career', notes: 'first\nline', rodden: 1, utcOffsetHours: -3, dstHours: 0 });
    expect(e.jdUt).toBeCloseTo(2455000.5 + 3 / 24, 9);
    expect(e.longitudeEast).toBeCloseTo(75.8166667, 9);
    expect(e.place).toEqual({ city: 'Jaipur', state: 'Rājasthān', country: 'India' });
  });
  it('an Event named Today that is not Id 1 is kept', () => {
    const c = readPl9Chart(file({ events: [{ id: 4, name: 'Today' }, { id: 2, name: 'Muhurta' }] }));
    expect(c.events.map((e) => e.name)).toEqual(['Today']);
  });
  it('notes, tags and family', () => {
    const c = readPl9Chart(file({ notes: 'x', family: { Tags: 'client, 2017; vip;', Father: 'F' } }));
    expect(c.notes).toBe('x');
    expect(c.tags).toEqual(['client', '2017', 'vip']);
    expect(c.family).toEqual({ Father: 'F' });
  });
  it('refuses', () => {
    expect(() => readPl9Chart('<BirthData></BirthData>')).toThrow(Pl9FileError);
    expect(() => readPl9Chart(file({ info: { BirthDate: 'abc' } }))).toThrow(/BirthDate/);
    expect(() => readPl9Chart(file({ drop: 'Latitude' }))).toThrow(/Latitude/);
    expect(() => readPl9Chart(file({ info: { Latitude: '95' } }))).toThrow(Pl9FileError);
  });
  it('an impossible character code becomes U+FFFD, not an error', () => {
    expect(readPl9Chart(file({ info: { FirstName: '&#99999999;x&#x110000;' } })).firstName).toBe('�x�');
  });
  it('a file of repeated tags that never close is refused quickly', () => {
    for (const text of ['<BirthInfo>'.repeat(18_000), `<BirthData><BirthInfo><BirthDate>1</BirthDate></BirthInfo><Events>${'<Event Id="1">'.repeat(14_000)}</Events></BirthData>`]) {
      const t = performance.now();
      try { readPl9Chart(text); } catch { /* refused or read: either way, quickly */ }
      expect(performance.now() - t).toBeLessThan(60);
    }
  });
});
