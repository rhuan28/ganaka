export type ChartKind =
  | 'random' | 'recent' | 'early' | 'sign-edge' | 'nakshatra-edge' | 'station'
  | 'sunrise-edge' | 'sunset-edge' | 'day-series' | 'moon-node' | 'sunrise-tight' | 'time-zone';

export interface ChartSpec {
  id: string;
  /** Julian day, universal time. */
  jdUt: number;
  /** Degrees, north positive. */
  latitude: number;
  /** Degrees, east positive. */
  longitudeEast: number;
  kind: ChartKind;
  note: string;
}

function number4(spec: ChartSpec): string {
  const m = /^ref-(\d{4})$/.exec(spec.id);
  if (!m) throw new Error(`chart id "${spec.id}" is not of the form ref-NNNN`);
  return m[1]!;
}

export function pl9Name(spec: ChartSpec): string {
  return `REF ${number4(spec)}`;
}

/** A chart file PL9 can open: UT birth time, no time zone, no daylight saving. */
export function chartXml(spec: ChartSpec): string {
  const f = (v: number) => v.toFixed(7);
  const west = spec.longitudeEast === 0 ? 0 : -spec.longitudeEast;
  return `<!DOCTYPE BirthData>
<BirthData>
  <BirthInfo>
    <FirstName>REF</FirstName>
    <LastName>${number4(spec)}</LastName>
    <Sounds></Sounds>
    <Gender>0</Gender>
    <BirthDate>${f(spec.jdUt)}</BirthDate>
    <Longitude>${f(west)}</Longitude>
    <Latitude>${f(spec.latitude)}</Latitude>
    <TimeZone>${f(0)}</TimeZone>
    <DST>${f(0)}</DST>
    <City>Reference</City>
    <State></State>
    <Country></Country>
    <BDLookupMode>A</BDLookupMode>
    <RoddenRating>0</RoddenRating>
  </BirthInfo>
  <Events/>
  <DetailedNotes></DetailedNotes>
  <BirthdataPicklist/>
  <AnimatedPicklist/>
  <MuhurtaPicklist/>
  <FamilyInfo>
    <GrandFather></GrandFather>
    <Father></Father>
    <Mother></Mother>
    <Caste></Caste>
    <Gotra></Gotra>
    <Address1></Address1>
    <Address2></Address2>
    <Address3></Address3>
    <Email></Email>
    <Phone></Phone>
    <Tags></Tags>
    <Unused1></Unused1>
    <Unused2></Unused2>
    <Unused3></Unused3>
  </FamilyInfo>
  <MuhurtaSessions/>
</BirthData>
`;
}
