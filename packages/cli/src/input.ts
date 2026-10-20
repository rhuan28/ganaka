import { chartInputOf, InvalidInputError, parseChartInput, type ChartInput } from '@reverse/core';

export class ChartFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChartFileError';
  }
}

function readJson(text: string): ChartInput {
  let v: unknown;
  try {
    v = JSON.parse(text.replace(/^\uFEFF/, ''));
  } catch {
    throw new ChartFileError('the file is not valid JSON');
  }
  if (typeof v !== 'object' || v === null || Array.isArray(v)) throw new ChartFileError('the file must hold one JSON object');
  return wrapped(() => parseChartInput(v));
}

/** The core's input errors, as errors of the chart file. */
function wrapped(read: () => ChartInput): ChartInput {
  try {
    return read();
  } catch (e) {
    if (e instanceof InvalidInputError) throw new ChartFileError(e.message);
    throw e;
  }
}

/** Reads the BirthInfo block of a chart file saved by Parashara's Light 9. */
function readPl9Xml(text: string): ChartInput {
  const info = /<BirthInfo>([\s\S]*?)<\/BirthInfo>/.exec(text)?.[1];
  if (info === undefined) throw new ChartFileError('the file has no BirthInfo block');
  const field = (name: string): number => {
    const raw = new RegExp(`<${name}>([^<]*)</${name}>`).exec(info)?.[1]?.trim();
    if (raw === undefined || !/^[+-]?(\d+\.?\d*|\.\d+)$/.test(raw)) throw new ChartFileError(`field ${name} is missing or not a plain decimal number`);
    return Number(raw);
  };
  const [jd, west, latitude, timeZone, dst] = [field('BirthDate'), field('Longitude'), field('Latitude'), field('TimeZone'), field('DST')];
  // The file holds local time. The zone is in hours, west positive like the longitude; daylight saving is hours ahead
  // (checked on PL9's saved charts against the times its screens show).
  const hoursBehindUt = timeZone - dst;
  return wrapped(() => chartInputOf(jd + hoursBehindUt / 24, latitude, -west, -hoursBehindUt));
}

export function readChartFile(text: string, fileName: string): ChartInput {
  if (/\.json$/i.test(fileName)) return readJson(text);
  if (/\.xml$/i.test(fileName)) return readPl9Xml(text);
  throw new ChartFileError('the file name must end in .json or .xml');
}
