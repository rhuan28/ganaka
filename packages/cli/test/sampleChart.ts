import { computeChart, type Chart } from '@reverse/core';
import { fakeSky } from '../../core/test/fakeSky';

const base = computeChart(fakeSky, { jdUt: 2451545.4, latitude: 20, longitudeEast: 30 });

/** A small fixed chart from mean motions, with Saturn made retrograde. */
export const sampleChart: Chart = {
  ...base,
  points: { ...base.points, saturn: { ...base.points.saturn, longitudeSpeed: -0.02, retrograde: true } },
};
