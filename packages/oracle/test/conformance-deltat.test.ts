import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { pl9DeltaTSeconds } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import type { Fixture } from '../src/fixtures';
import { fitChart } from '../src/measure';

const dir = resolve(dirname(fileURLToPath(import.meta.url)), '../fixtures');
const fixtures = readdirSync(dir).filter((f) => f.endsWith('.json')).map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Fixture);

describe('PL9 Delta T', () => {
  it('matches the Delta T implied by every reference chart to within 0.05 second', async () => {
    const eph = await createSwissEphemeris();
    let worst = 0;
    for (const fx of fixtures) {
      const implied = eph.deltaTSeconds(fx.input.jdUt) + fitChart(eph, fx).dtSeconds;
      const diff = Math.abs(pl9DeltaTSeconds(fx.input.jdUt) - implied);
      expect(diff, `${fx.id} (JD ${fx.input.jdUt}): implied ${implied.toFixed(3)} s`).toBeLessThan(0.05);
      worst = Math.max(worst, diff);
    }
    eph.close();
    expect(worst).toBeLessThan(0.05);
  });
});
