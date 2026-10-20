import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createSwissEphemeris } from '@reverse/ephemeris';
import type { Fixture } from '../fixtures';
import { MEASURED, byDecade, fitChart, measureChart, median, mergeReport, worstPlanetaryResidual } from '../measure';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dir = join(root, 'fixtures');
const fixtures = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Fixture);

const eph = await createSwissEphemeris();
const rows = fixtures.map((fx) => measureChart(eph, fx));
const fits = fixtures.map((fx) => fitChart(eph, fx));
eph.close();

const fields = MEASURED.map((m) => m.field);
const planets = fields.filter((f) => f !== 'rahu');
const n2 = (v: number) => v.toFixed(2);
const overall: Record<string, number> = {};
for (const f of fields) overall[f] = Math.max(...rows.map((r) => Math.abs(r.residual[f]!)));
const worst = rows.map((r) => ({ id: r.chartId, year: r.year, v: Math.max(...planets.map((f) => Math.abs(r.residual[f]!))) }))
  .sort((a, b) => b.v - a.v).slice(0, 10);
const offsets = rows.map((r) => r.offset);

const lines = [
  '# Medição: PL9 contra Swiss Ephemeris, 1801–2048',
  '',
  `Gerado por \`pnpm --filter @reverse/oracle measure\` a partir de ${rows.length} gabaritos.`,
  'Valores em segundos de arco. "Deslocamento" é a mediana de (PL9 − Swiss Ephemeris com Lahiri) sobre Sol, Marte, Júpiter e Saturno de cada mapa. "Resíduo" é o que sobra em cada corpo depois de retirado o deslocamento do mapa.',
  '',
  '## Deslocamento comum',
  '',
  `Mínimo ${n2(Math.min(...offsets))}, mediana ${n2(median(offsets))}, máximo ${n2(Math.max(...offsets))}.`,
  '',
  '## Por década',
  '',
  `| Década | Mapas | Deslocamento mediano | ${fields.map((f) => `Resíduo máx. ${f}`).join(' | ')} |`,
  `|---|---|---|${fields.map(() => '---').join('|')}|`,
  ...byDecade(rows).map((d) => `| ${d.decade} | ${d.charts} | ${n2(d.medianOffset)} | ${fields.map((f) => n2(d.maxAbsResidual[f] ?? 0)).join(' | ')} |`),
  '',
  '## Maior resíduo por corpo, em toda a faixa',
  '',
  `| ${fields.join(' | ')} |`,
  `|${fields.map(() => '---').join('|')}|`,
  `| ${fields.map((f) => n2(overall[f]!)).join(' | ')} |`,
  '',
  '## Ajuste por mapa: deslocamento angular e deslocamento de tempo',
  '',
  'Para cada mapa, as diferenças de Sol a Saturno são ajustadas a `a + velocidade × dt`; `a` em segundos de arco, `dt` em segundos de tempo.',
  '',
  `Maior resíduo depois do ajuste, em todos os mapas: ${Math.max(...fits.map((f) => f.maxResidual)).toFixed(5)}". Valores de a: mínimo ${Math.min(...fits.map((f) => f.offset)).toFixed(4)}, máximo ${Math.max(...fits.map((f) => f.offset)).toFixed(4)}.`,
  '',
  '| Década | Mapas | a mediano | dt mediano | dt mínimo | dt máximo |',
  '|---|---|---|---|---|---|',
  ...[...new Set(fits.map((f) => Math.floor(f.year / 10) * 10))].sort((x, y) => x - y).map((d) => {
    const g = fits.filter((f) => Math.floor(f.year / 10) * 10 === d);
    const dts = g.map((f) => f.dtSeconds);
    return `| ${d} | ${g.length} | ${median(g.map((f) => f.offset)).toFixed(3)} | ${n2(median(dts))} | ${n2(Math.min(...dts))} | ${n2(Math.max(...dts))} |`;
  }),
  '',
  '## Dez mapas com maior resíduo planetário',
  '',
  '| Mapa | Ano | Resíduo máximo |',
  '|---|---|---|',
  ...worst.map((w) => `| ${w.id} | ${w.year} | ${n2(w.v)} |`),
  '',
];
const out = resolve(root, '../../docs/relatorios/medicao-efemerides.md');
writeFileSync(out, mergeReport(lines.join('\n'), existsSync(out) ? readFileSync(out, 'utf8') : null));
const worstPlanet = worstPlanetaryResidual(rows);
console.log(`${rows.length} charts; common offset median ${n2(median(offsets))}"; largest planetary residual ${n2(worstPlanet)}"; report: ${out}`);
process.exit(worstPlanet > 0.5 ? 1 : 0);
