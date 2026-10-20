import { describe, expect, it } from 'vitest';
import { VARGAS, computeChart } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures } from '../src/conformance';
import { loadTableFixtures } from '../src/tables';
import { SHOWN_LONGITUDES, verifyChartTables } from '../src/verifyTables';

describe('values read from PL9\'s printed PDFs', () => {
  it('match the core in every chart: 45 vargas of 12 points, Mandi, the Bhrigu point and Gulika by both methods', async () => {
    const eph = await createSwissEphemeris();
    const byId = new Map(loadFixtures('fixtures').map((f) => [f.id, f]));
    const tables = loadTableFixtures().filter((t) => Object.keys(t.pl9.longitudes ?? {}).length > 0);
    expect(tables.length).toBeGreaterThanOrEqual(30);
    let checked = 0;
    let values = 0;
    let withMandi = 0;
    for (const t of tables) {
      const fx = byId.get(t.id)!;
      const chart = computeChart(eph, fx.input, { fidelity: 'pl9' });
      const begin = computeChart(eph, fx.input, { fidelity: 'pl9', gulika: 'beginning' });
      const v = verifyChartTables(t, fx, chart, 0.5, { gulikaBeginning: begin.points.gulika!.longitude, gulikaEnd: chart.points.gulika!.longitude });
      expect(v.failures, t.id).toEqual([]);
      // A label the reader cannot place is left out: never the Lagna or a graha.
      for (const g of VARGAS) {
        const held = Object.keys(t.pl9.vargas[g] ?? {});
        expect(held.filter((p) => p !== 'mandi' && p !== 'bhrigu'), `${t.id} ${g}`).toHaveLength(10);
        values += held.length;
      }
      // Mandi's degrees can be cut at the edge of the drawing in both charts that show them.
      for (const k of SHOWN_LONGITUDES) if (k !== 'mandi') expect(t.pl9.longitudes[k], `${t.id} ${k}`).toBeDefined();
      if (t.pl9.longitudes.mandi) withMandi++;
      // The Jaimini pages: the three pada charts, both karaka tables, the special points and the special lagnas.
      expect(Object.keys(t.pl9.arudhas ?? {}).sort(), t.id).toEqual(['D1', 'D10', 'D9']);
      expect(Object.keys(t.pl9.karakas ?? {}).sort(), t.id).toEqual(['7', '8']);
      expect(Object.keys(t.pl9.special ?? {}).sort(), t.id).toEqual(['arudhaLagna', 'induLagna', 'karakamsha', 'upapada']);
      for (const k of ['bhavaLagna', 'horaLagna', 'ghatikaLagna', 'jaiminiHoraLagna']) expect(t.pl9.longitudes[k], `${t.id} ${k}`).toBeDefined();
      checked += v.checked;
    }
    eph.close();
    expect(checked).toBeGreaterThan(30 * 45 * 10);
    // At most one varga value in twenty left out, and Mandi in degrees in at least thirty charts.
    expect(values).toBeGreaterThan(0.95 * tables.length * VARGAS.length * 12);
    expect(withMandi).toBeGreaterThanOrEqual(30);
  });
});
