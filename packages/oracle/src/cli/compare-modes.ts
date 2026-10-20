import { POINTS, computePositions } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { arcsecDiff } from '../angles';
import { loadFixtures } from '../conformance';

/** Prints, as a Markdown table, how far the corrected mode is from the pl9 mode on the reference charts. */
const eph = await createSwissEphemeris();
const byPoint: Record<string, number[]> = {};
for (const fx of loadFixtures()) {
  const a = computePositions(eph, fx.input, { fidelity: 'pl9' });
  const b = computePositions(eph, fx.input, { fidelity: 'corrected' });
  for (const p of POINTS) {
    const x = a.points[p];
    const y = b.points[p];
    if (x && y) (byPoint[p] ??= []).push(Math.abs(arcsecDiff(x.longitude, y.longitude)));
  }
}
eph.close();
const at = (v: number[], q: number) => v[Math.min(v.length - 1, Math.floor(v.length * q))]!;
console.log('| Point | Charts | Median | 95th percentile | Maximum |');
console.log('|---|---|---|---|---|');
for (const p of POINTS) {
  const v = (byPoint[p] ?? []).sort((m, n) => m - n);
  if (v.length) console.log(`| ${p} | ${v.length} | ${at(v, 0.5).toFixed(3)} | ${at(v, 0.95).toFixed(3)} | ${at(v, 1).toFixed(3)} |`);
}
