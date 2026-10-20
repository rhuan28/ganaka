import { describe, expect, it } from 'vitest';
import { computeDashas, InvalidOptionError } from '../src/index';
import { fakeSky } from './fakeSky';

const natal = { jdUt: 2449865.4694097, latitude: 44.2377778, longitudeEast: 150.6744444 };

describe('the dasha options', () => {
  it('refuse a name they do not know, as the strengths\' options do', () => {
    const run = () => computeDashas(fakeSky, natal, { colour: 1 } as never, { fidelity: 'pl9' });
    expect(run).toThrow(InvalidOptionError);
    expect(run).toThrow(/colour/);
  });
});
