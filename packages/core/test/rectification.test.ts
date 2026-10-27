import { describe, expect, it } from 'vitest';
import { computeDashas, computeRectification, lagnaStep, parseChartInput, RECTIFICATION_STEPS, vargaWindow } from '../src';
import { fakeSky } from './fakeSky';

const birth = parseChartInput({ utc: '1995-05-27T23:15:57Z', latitude: 44.2377778, longitudeEast: 150.6744444 });

describe('the Rectification Tool', () => {
  it('moves the birth step by step around it, 8 rows before and 10 after by default, and shows the dasha levels of the zoom', () => {
    const r = computeRectification(fakeSky, birth, { events: [birth.jdUt + 10000] });
    expect(r.rows.map((x) => x.offset)).toEqual(Array.from({ length: 19 }, (_, i) => i - 8));
    expect(r.rows[8]!.jdUt).toBe(birth.jdUt);
    expect(r.rows[9]!.jdUt - birth.jdUt).toBeCloseTo(RECTIFICATION_STEPS[0] / 86400, 9);
    expect(r.levels).toBe(3);
    expect(r.rows.every((x) => x.dashas[0]!.length === 3 && x.navamshaSign === null)).toBe(true);
    expect(computeRectification(fakeSky, birth, { zoom: 2 }).rows[0]!.navamshaSign).not.toBeNull();
    expect(computeRectification(fakeSky, birth, { zoom: 5 }).levels).toBe(5);
  });

  it("reads the birth's own dasha table: the birth row gives the dasha running at the event", () => {
    const event = birth.jdUt + 1000;
    const r = computeRectification(fakeSky, birth, { events: [event], before: 23, after: 25 });
    const natal = computeDashas(fakeSky, birth, { system: 'vimshottari', levels: 3 }).periods;
    const md = natal.find((p) => p.start <= event && event < p.end)!;
    expect(r.rows[23]!.dashas[0]![0]).toBe(md.lord);
    // Before the table's start, its first period at every level (PL9 prints the birth lord three times).
    const early = computeRectification(fakeSky, birth, { events: [birth.jdUt - 100000] }).rows[0]!.dashas[0]!;
    expect(new Set(early).size).toBe(1);
  });
});

describe("the Lagna's steps and windows", () => {
  it('steps by the Ascendant into the next sign and back into the previous one, by the Navamsha just past its navamsha', () => {
    const next = lagnaStep(fakeSky, birth, 'ascendant', 1), previous = lagnaStep(fakeSky, birth, 'ascendant', -1);
    expect(next).toBeGreaterThan(birth.jdUt);
    expect(previous).toBeLessThan(birth.jdUt);
    const w = vargaWindow(fakeSky, birth, 'D9');
    expect(w.start).toBeLessThanOrEqual(birth.jdUt);
    expect(w.end).toBeGreaterThan(birth.jdUt);
    expect(lagnaStep(fakeSky, birth, 'navamsha', 1)).toBeGreaterThan(w.end);
    expect(vargaWindow(fakeSky, birth, 'D1')).toEqual({ start: birth.jdUt, end: birth.jdUt });
  });
});
