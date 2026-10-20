import { InvalidInputError } from './errors';
import { chartInputOf } from './input';

// A chart file saved by Parashara's Light 9: an XML file per chart, with the birth, the events, notes, family details
// and tags. Read with small patterns on the text, as the files are flat and regular.

export interface Pl9Place { city: string; state: string; country: string }
export interface Pl9Moment {
  jdUt: number;
  latitude: number;
  longitudeEast: number;
  /** The clock's offset from UT, east positive: zone and daylight saving together. */
  utcOffsetHours: number;
  /** The part of that offset that is daylight saving. */
  dstHours: number;
  place: Pl9Place;
}
export interface Pl9Event extends Pl9Moment { name: string; description: string; classification: string; notes: string; rodden: number }
export interface Pl9Chart {
  firstName: string;
  lastName: string;
  gender: number;
  rodden: number;
  birth: Pl9Moment;
  /** Without PL9's own automatic events ("Today" and "Muhurta"), which it rewrites by itself. */
  events: Pl9Event[];
  notes: string;
  tags: string[];
  /** The non-empty fields of the family block, except the tags and the unused ones. */
  family: Record<string, string>;
}

export class Pl9FileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'Pl9FileError';
  }
}

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" };
function decode(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) =>
    e[0] === '#' ? character(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : Number(e.slice(1))) : NAMED[e.toLowerCase()]!);
}
/** A character code as text; one no character can have becomes the replacement character, never an error. */
const LAST_CODE_POINT = 1_114_111;
const character = (n: number) => (n <= LAST_CODE_POINT ? String.fromCodePoint(n) : '�');

/**
 * What lies between `<tag…>` and `</tag>`, from `from` on, found with plain searches: a file of repeated tags that never
 * close is read in linear time, never with a pattern that goes back and forth over it.
 */
function inner(source: string, open: string, close: string, from = 0): { body: string; open: string; end: number } | undefined {
  const start = source.indexOf(open, from);
  if (start < 0) return undefined;
  const gt = source.indexOf('>', start);
  const end = gt < 0 ? -1 : source.indexOf(close, gt);
  if (end < 0) return undefined;
  return { body: source.slice(gt + 1, end), open: source.slice(start, gt + 1), end: end + close.length };
}

/** The text of `<name>…</name>` inside `block`, decoded; '' when the element is empty or absent. */
function text(block: string, name: string): string {
  return decode(new RegExp(`<${name}>([^<]*)</${name}>`).exec(block)?.[1]?.trim() ?? '');
}
function number(block: string, name: string, where: string): number {
  const raw = new RegExp(`<${name}>([^<]*)</${name}>`).exec(block)?.[1]?.trim();
  if (raw === undefined || !/^[+-]?(\d+\.?\d*|\.\d+)$/.test(raw)) throw new Pl9FileError(`${where}: field ${name} is missing or not a plain decimal number`);
  return Number(raw);
}
const whole = (block: string, name: string) => (/^-?\d+$/.test(text(block, name)) ? Number(text(block, name)) : 0);

/**
 * A moment as the file holds it: local time as a Julian day; the zone in hours, west positive like the longitude; and
 * the daylight saving in hours ahead of the zone (checked on PL9's saved charts against the times its screens show).
 */
function moment(block: string, dateField: string, where: string): Pl9Moment {
  const [date, west, latitude, zone, dst] = [number(block, dateField, where), number(block, 'Longitude', where), number(block, 'Latitude', where), number(block, 'TimeZone', where), number(block, 'DST', where)];
  const hoursBehindUt = zone - dst;
  let input;
  try {
    input = chartInputOf(date + hoursBehindUt / 24, latitude, -west, -hoursBehindUt);
  } catch (e) {
    if (e instanceof InvalidInputError) throw new Pl9FileError(`${where}: ${e.message}`);
    throw e;
  }
  return {
    jdUt: input.jdUt, latitude: input.latitude, longitudeEast: input.longitudeEast, utcOffsetHours: hoursBehindUt === 0 ? 0 : -hoursBehindUt, dstHours: dst,
    place: { city: text(block, 'City'), state: text(block, 'State'), country: text(block, 'Country') },
  };
}

/** Reads a PL9 chart file whole: the birth, the events, the notes, the tags and the family details. */
export function readPl9Chart(source: string): Pl9Chart {
  const info = inner(source, '<BirthInfo>', '</BirthInfo>')?.body;
  if (info === undefined) throw new Pl9FileError('the file has no BirthInfo block');
  const events: Pl9Event[] = [];
  const list = inner(source, '<Events>', '</Events>')?.body ?? '';
  for (let at = 0, e = inner(list, '<Event ', '</Event>'); e; at = e.end, e = inner(list, '<Event ', '</Event>', at)) {
    const [id, block] = [/Id="(\d+)"/.exec(e.open)?.[1] ?? '', e.body];
    const name = text(block, 'Name');
    if ((id === '1' && name === 'Today') || (id === '2' && name === 'Muhurta')) continue;
    events.push({
      ...moment(block, 'Date', `event ${id}`), name, description: text(block, 'Description'),
      classification: text(block, 'EventClassification'), notes: text(block, 'EventNotes'), rodden: whole(block, 'EventRodden'),
    });
  }
  const familyBlock = inner(source, '<FamilyInfo>', '</FamilyInfo>')?.body ?? '';
  const family: Record<string, string> = {};
  for (const m of familyBlock.matchAll(/<(\w+)>([^<]*)<\/\1>/g)) {
    const value = decode(m[2]!.trim());
    if (value && m[1] !== 'Tags' && !/^Unused\d*$/.test(m[1]!)) family[m[1]!] = value;
  }
  return {
    firstName: text(info, 'FirstName'), lastName: text(info, 'LastName'), gender: whole(info, 'Gender'), rodden: whole(info, 'RoddenRating'),
    birth: moment(info, 'BirthDate', 'birth'),
    events,
    notes: decode(inner(source, '<DetailedNotes>', '</DetailedNotes>')?.body.trim() ?? ''),
    tags: text(familyBlock, 'Tags').split(/[,;]/).map((t) => t.trim()).filter(Boolean),
    family,
  };
}
