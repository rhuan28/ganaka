import type { Body, Ephemeris } from '@reverse/ephemeris';
import type { AyanamshaFrame } from '../src/index';

const norm = (v: number) => ((v % 360) + 360) % 360;

/** Mean motions only: enough for the Sun to rise and set once a day. The Lagna itself needs no ephemeris. */
const RATE: Record<string, [number, number]> = {
  sun: [280.46, 0.9856474], moon: [218.32, 13.176396], mars: [355.45, 0.5240208], mercury: [252.25, 4.0923344],
  jupiter: [34.4, 0.0830853], venus: [181.98, 1.6021302], saturn: [50.08, 0.0334442], uranus: [314.06, 0.011725],
  neptune: [304.35, 0.005995], pluto: [238.96, 0.003964], trueNode: [125.04, -0.0529539], meanNode: [125.04, -0.0529539],
};
const position = (jd: number, body: Body) => {
  const [at2000, perDay] = RATE[body]!;
  return { longitude: norm(at2000 + perDay * (jd - 2451545)), latitude: 0, distance: 1, longitudeSpeed: perDay };
};

export const fakeSky = {
  tropical: position,
  meanEquinoxLongitude: position,
  deltaTSeconds: () => 60,
  ayanamshaReference: () => 24,
  obliquityAndNutation: () => ({ trueObliquity: 23.44, meanObliquity: 23.44, nutationLongitude: 0, nutationObliquity: 0 }),
} as unknown as Ephemeris;

export const fakeFrame: AyanamshaFrame = { sunAyanamsha: () => 24, lagnaAyanamsha: () => 24, fidelity: 'pl9' };
