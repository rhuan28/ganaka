import { chartInputOf, InvalidInputError, parseChartInput, Pl9FileError, readPl9Chart, type ChartInput } from '@reverse/core';

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

/** Reads the birth of a chart file saved by Parashara's Light 9 (the core reads the whole file). */
function readPl9Xml(text: string): ChartInput {
  let b;
  try {
    b = readPl9Chart(text).birth;
  } catch (e) {
    if (e instanceof Pl9FileError) throw new ChartFileError(e.message);
    throw e;
  }
  return wrapped(() => chartInputOf(b.jdUt, b.latitude, b.longitudeEast, b.utcOffsetHours));
}

export function readChartFile(text: string, fileName: string): ChartInput {
  if (/\.json$/i.test(fileName)) return readJson(text);
  if (/\.xml$/i.test(fileName)) return readPl9Xml(text);
  throw new ChartFileError('the file name must end in .json or .xml');
}
