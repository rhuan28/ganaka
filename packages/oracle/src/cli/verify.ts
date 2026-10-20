import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeAshtakavarga, computeBhavaBala, computeShadbala, computeBirthPanchanga, computePanchangTable, computePositions, computeTransits, clockTime, ghatis, karanaName, karanaOf, tithiOf, yogaOf, tithiPravesh, TITHIS, YOGAS, computeVimshopaka, computeSunriseChart, dashasAt, eventDashas, kotaChakra, monthCalendar, panchPakshi, sunriseDashaRows, worksheetDashaLists, monthEvents, vargaTable, kakshaCalendar, signIngresses, timeOfTransit, type TransitEvent, DASHA_SYSTEMS, HOUSE_SYSTEMS, KALACHAKRA_YEARS, RASHI_DASHA_SYSTEMS, SIGN_NAMES, divisionIndex, NAKSHATRA_DASHA_SYSTEMS, POINTS, VARGAS, computeChart, computeDashas, type AshtakavargaOptions, type AyanamshaName, type BhavaRow, type ShadbalaOptions, type DashaSystem, type Chart, type CoreOptions } from '@reverse/core';
import { createSwissEphemeris } from '@reverse/ephemeris';
import { loadFixtures } from '../conformance';
import type { Fixture } from '../fixtures';
import { loadDashaFixtures, type DashaFixture } from '../dashaTables';
import { loadTableFixtures, type TableFixture } from '../tables';
import { SHOWN_LONGITUDES, missingKinds, optionCoverage, vargaCoverage, verifyChartTables, type TableVerdict } from '../verifyTables';
import { setProblem, verifyChart, type ChartVerdict } from '../verify';
import { DAY_EDGE_SLACK, cyclesToCover, shownJd, verifyDashas, type DashaVerdict } from '../verifyDashas';
import { computeVarshaphalaInputs, loadVarshaphalaFixtures, pendingWithoutReport, verifyVarshaphala, KNOWN_VARSHAPHALA_PENDING } from '../varshaphalaTables';
import { computeMuhurtaInputs, KNOWN_MUHURTA_PENDING, loadMuhurtaFixtures, verifyMuhurta, type MuhurtaInstant } from '../muhurtaTables';
import { KNOWN_BIRTH_PENDING, loadPanchangaFixtures, loadPanchangPrintouts, verifyBirthPanchanga, verifyPanchangPrintout, type BirthPanchangaLike } from '../panchangaTables';
import { verifyMonthCalendar } from '../monthCalendarTables';
import { computeVarshaClockInputs, KNOWN_VARSHA_CLOCK_PENDING, VARSHA_CLOCK_ALWAYS_PENDING, verifyVarshaAge, verifyVarshaClock, verifyVarshaLists, KNOWN_VARSHA_LISTS_PENDING } from '../varshaClockTables';
import { loadTransitFixtures, verifyCalendar, verifyEvents, verifyKota, verifyIngress, verifyPakshi, verifySbVb, verifySunrise, verifyVargas, verifyTransitSnapshot, type TransitFixture } from '../transitTables';
import { loadStrengthFixtures, verifyAshtakavarga, verifyBhavaBala, verifyShadbala, verifyShadbalaMemory, verifyVimshopaka, type ShadbalaMemoryFixture, type StrengthFixture } from '../strengthTables';

const TOLERANCE = 0.5;
// Stage 2 spec, criterion 3: the whole reference set with Lahiri, at least 30 charts for each other setting.
const MIN_CHARTS_LAHIRI = 380;
const MIN_CHARTS_OTHER = 30;
// Each kind of value read from PL9's screens has to be present in at least this many charts.
const MIN_TABLE_CHARTS = 30;
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const EXPECTED_SETS: AyanamshaName[] = ['sayana', 'yukteshwar', 'raman', 'bhasin', 'fagan', 'krishnamurti', 'krishnamurtiNew', 'trueChitra'];

interface SetResult { name: string; charts: number; verdicts: ChartVerdict[]; error?: string; fixtures?: Fixture[]; computed?: Chart[] }

const eph = await createSwissEphemeris();
function run(name: string, dir: string, options: Partial<CoreOptions>): SetResult {
  try {
    const fixtures = loadFixtures(dir);
    const computed = fixtures.map((fx) => computeChart(eph, fx.input, { ...options, fidelity: 'pl9' }));
    return { name, charts: fixtures.length, verdicts: fixtures.map((fx, i) => verifyChart(fx, computed[i]!, TOLERANCE)), fixtures, computed };
  } catch (e) {
    return { name, charts: 0, verdicts: [], error: (e as Error).message };
  }
}

const results: SetResult[] = [run('lahiri', 'fixtures', {})];
const ayDir = join(root, 'fixtures-ayanamsha');
const present = existsSync(ayDir) ? readdirSync(ayDir) : [];
for (const name of EXPECTED_SETS) {
  results.push(present.includes(name) ? run(name, `fixtures-ayanamsha/${name}`, { ayanamsha: name }) : { name, charts: 0, verdicts: [], error: 'no fixtures extracted yet' });
}
results.push(present.includes('lahiri-offset')
  ? run('lahiri + 1° offset', 'fixtures-ayanamsha/lahiri-offset', { ayanamshaOffsetDegrees: 1 })
  : { name: 'lahiri + 1° offset', charts: 0, verdicts: [], error: 'no fixtures extracted yet' });

const n3 = (v: number) => v.toFixed(3);
const worst = (vs: ChartVerdict[], p: string) => Math.max(0, ...vs.map((v) => v.maxAbsArcsec[p] ?? 0));
const lines: string[] = [
  '# Conformidade das posições com o PL9',
  '',
  'Gerado por `pnpm --filter @reverse/oracle verify`. Tolerância: 0,5" em longitude; signo, nakshatra e pada idênticos, salvo ponto a menos de 0,5" de uma fronteira.',
  '',
  'Nas tabelas de longitude abaixo, o signo, o nakshatra e o pada "esperados" são derivados da longitude do PL9 pela regra de `docs/spec/zodiaco.md`. Os valores lidos das telas do PL9 estão na última seção.',
  '',
  '## Resumo',
  '',
  '| Conjunto | Mapas | Campos | Falhas de longitude | Falhas categóricas | Casos de borda | Situação |',
  '|---|---|---|---|---|---|---|',
];
let failed = false;
for (const r of results) {
  const lon = r.verdicts.reduce((s, v) => s + v.longitudeFailures.length, 0);
  const cat = r.verdicts.reduce((s, v) => s + v.categoricalFailures.length, 0);
  const border = r.verdicts.reduce((s, v) => s + v.borderCases.length, 0);
  const problem = r.error ? `não verificado: ${r.error}` : setProblem({ charts: r.charts, minCharts: r.name === 'lahiri' ? MIN_CHARTS_LAHIRI : MIN_CHARTS_OTHER, longitudeFailures: lon, categoricalFailures: cat });
  const ok = problem === null;
  if (!ok) failed = true;
  lines.push(`| ${r.name} | ${r.charts} | ${r.charts * POINTS.length} | ${lon} | ${cat} | ${border} | ${problem ?? 'aprovado'} |`);
}
lines.push('', '## Maior diferença por ponto, em segundos de arco', '', `| Conjunto | ${POINTS.join(' | ')} |`, `|---|${POINTS.map(() => '---').join('|')}|`);
for (const r of results) if (r.charts) lines.push(`| ${r.name} | ${POINTS.map((p) => n3(worst(r.verdicts, p))).join(' | ')} |`);

const failures = results.flatMap((r) => r.verdicts.flatMap((v) => [
  ...v.longitudeFailures.map((f) => `| ${r.name} | ${v.chartId} | ${f.point} | longitude | ${n3(f.arcsec)}" |`),
  ...v.categoricalFailures.map((f) => `| ${r.name} | ${v.chartId} | ${f.point} | ${f.what} | esperado ${f.expected}, obtido ${f.actual} |`),
]));
lines.push('', '## Falhas', '');
if (failures.length) lines.push('| Conjunto | Mapa | Ponto | Tipo | Detalhe |', '|---|---|---|---|---|', ...failures);
else lines.push('Nenhuma nos conjuntos verificados.');

const borders = results.flatMap((r) => r.verdicts.flatMap((v) => v.borderCases.map((b) => `| ${r.name} | ${v.chartId} | ${b.point} | ${b.what} | ${n3(b.distanceArcsec)}" |`)));
lines.push('', '## Casos de borda', '');
if (borders.length) lines.push('Divergência categórica com a longitude do PL9 a menos de 0,5" da fronteira que a decide.', '', '| Conjunto | Mapa | Ponto | Divisão | Distância à fronteira |', '|---|---|---|---|---|', ...borders);
else lines.push('Nenhum.');

// Largest longitude difference per decade, over every point of the Lahiri set.
const lahiri = results[0]!;
const byDecade = new Map<number, number>();
(lahiri.fixtures ?? []).forEach((fx, i) => {
  const year = (fx.input.jdUt - 2451545) / 365.25 + 2000;
  const decade = Math.floor(year / 10) * 10;
  const worstHere = Math.max(0, ...Object.values(lahiri.verdicts[i]!.maxAbsArcsec).filter(Number.isFinite));
  byDecade.set(decade, Math.max(byDecade.get(decade) ?? 0, worstHere));
});
lines.push('', '## Maior diferença por década (Lahiri, todos os pontos), em segundos de arco', '', '| Década | Maior diferença |', '|---|---|');
for (const decade of [...byDecade.keys()].sort((a, b) => a - b)) lines.push(`| ${decade} | ${n3(byDecade.get(decade)!)} |`);

// Houses, vargas and the values read from PL9's own tables.
lines.push('', '## Casas, vargas e valores lidos das tabelas do PL9', '');
let tables: TableFixture[] = [];
let tableError = '';
try {
  tables = loadTableFixtures();
} catch (e) {
  tableError = 'nenhum gabarito de tabela extraído';
}
const tableVerdicts: TableVerdict[] = [];
if (tables.length) {
  const index = new Map((lahiri.fixtures ?? []).map((fx, i) => [fx.id, i]));
  for (const t of tables) {
    const i = index.get(t.id);
    if (i === undefined) { tableError = `${t.id}: sem gabarito de posições`; continue; }
    const fx = lahiri.fixtures![i]!;
    const chart = lahiri.computed![i]!;
    // Gulika by the other method is not a point of the chart: it comes in as an extra value.
    const extra: Record<string, number> = {};
    if (chart.points.gulika) extra.gulikaEnd = chart.points.gulika.longitude;
    if (t.pl9.longitudes?.gulikaBeginning) {
      const begin = computeChart(eph, fx.input, { fidelity: 'pl9', gulika: 'beginning' }).points.gulika;
      if (begin) extra.gulikaBeginning = begin.longitude;
    }
    tableVerdicts.push(verifyChartTables(t, fx, chart, TOLERANCE, extra));
  }
}
// Charts printed with PL9's other options: each is computed with the options it was printed with.
let optionTables: TableFixture[] = [];
const optionVerdicts: TableVerdict[] = [];
if (existsSync(join(root, 'fixtures-tables-options'))) optionTables = loadTableFixtures('fixtures-tables-options');
{
  const index = new Map((lahiri.fixtures ?? []).map((fx, i) => [fx.id, i]));
  for (const t of optionTables) {
    const i = index.get(t.id);
    if (i === undefined) { tableError = `${t.id}: sem gabarito de posições`; continue; }
    const fx = lahiri.fixtures![i]!;
    const chart = computeChart(eph, fx.input, { fidelity: 'pl9', ...(t.pl9.options as Partial<CoreOptions>) });
    const extra: Record<string, number> = {};
    if (chart.points.gulika) extra.gulikaEnd = chart.points.gulika.longitude;
    const begin = computeChart(eph, fx.input, { fidelity: 'pl9', ...(t.pl9.options as Partial<CoreOptions>), gulika: 'beginning' }).points.gulika;
    if (begin) extra.gulikaBeginning = begin.longitude;
    const v = verifyChartTables(t, fx, chart, TOLERANCE, extra);
    v.chartId = `${t.id} (${Object.entries(t.pl9.options).map(([k, x]) => `${k}=${x}`).join(', ')})`;
    optionVerdicts.push(v);
  }
}
let missing = missingKinds(tables, HOUSE_SYSTEMS, VARGAS, MIN_TABLE_CHARTS, SHOWN_LONGITUDES, true);
const allVerdicts = [...tableVerdicts, ...optionVerdicts];
const tableFailures = allVerdicts.flatMap((v) => v.failures.map((f) => `| ${v.chartId} | ${f.what} | ${f.key} | ${f.expected} | ${f.actual} |`));
const tableBorders = allVerdicts.reduce((sum, v) => sum + v.borderCases.length, 0);
lines.push(`Mapas com tabela: ${tables.length} de ${lahiri.charts}, mais ${optionTables.length} impressos com outras opções do PL9. Valores conferidos: ${allVerdicts.reduce((sum, v) => sum + v.checked, 0)}. Falhas: ${tableFailures.length}. Casos de borda: ${tableBorders}.`);
// The alternatives of "Karakas" and "Bhavapada calculation" need their own charts.
for (const [name, value] of [['karakas', 'eight'], ['bhavapada', 'knrao']] as const) {
  if (optionCoverage(optionTables, name, value) < MIN_TABLE_CHARTS) missing.push(`opção ${name}=${value}`);
}
// How many of those charts tell the alternative from the observed option at all.
const index = new Map(tables.map((t) => [t.id, t]));
const telling = (pick: (normal: TableFixture, other: TableFixture) => boolean) =>
  optionTables.filter((t) => index.has(t.id) && pick(index.get(t.id)!, t)).length;
const knrao = telling((a, b) => JSON.stringify(a.pl9.arudhas) !== JSON.stringify(b.pl9.arudhas));
const rahu = telling((_a, b) => (b.pl9.karakas?.['8']?.[0] ?? '') !== (b.pl9.karakas?.['7']?.[0] ?? ''));
lines.push('', `Opções alternativas: dos ${optionTables.length} mapas impressos com elas, ${knrao} têm algum pada diferente entre Parashara e K.N.Rao, e ${rahu} têm Rahu como AK com oito karakas — só nesses "Rahu too" muda o resultado.`);
lines.push('', 'Os valores vêm das telas do PL9 (etapa 2) e dos PDFs que ele imprime (etapa 2b), só com Lahiri. O signo e a varga D1 de um ponto são contados separadamente nesse total. As vargas são conferidas pelo signo do Lagna, dos nove grahas, de Mandi e do Bhrigu point. As casas entram pelo meio e pelo início de cada uma, que o PL9 mostra arredondados ao segundo. Mandi e Bhrigu point em graus só existem ao minuto, truncados; o Gulika pelos dois métodos, ao segundo, arredondado.');
if (tableError) lines.push('', `Não verificado: ${tableError}`);
if (missing.length) lines.push('', `Sem valores do PL9 em pelo menos ${MIN_TABLE_CHARTS} mapas para: ${missing.join(', ')}. Esses tipos **não foram verificados**.`);
if (tableFailures.length) lines.push('', '| Mapa | Tipo | Chave | PL9 | core |', '|---|---|---|---|---|', ...tableFailures);

// Coverage of each varga: in how many parts of the zodiac PL9's result was seen.
const fixtureById = new Map((lahiri.fixtures ?? []).map((fx, i) => [fx.id, i]));
const reference = (id: string, point: string): number | undefined => {
  const i = fixtureById.get(id);
  if (i === undefined) return undefined;
  return lahiri.fixtures![i]!.pl9.longitudes[point] ?? lahiri.computed![i]!.points[point as keyof Chart['points']]?.longitude;
};
lines.push('', '### Cobertura das vargas', '', 'Uma célula é uma parte de um signo. As regras foram lidas no executável; a cobertura diz em quantas células o resultado foi visto no PL9.', '',
  '| Varga | Mapas | Valores | Células observadas | Células |', '|---|---|---|---|---|');
for (const g of VARGAS) {
  const holding = tables.filter((t) => Object.keys(t.pl9.vargas[g] ?? {}).length > 0);
  const values = holding.reduce((sum, t) => sum + Object.keys(t.pl9.vargas[g]!).length, 0);
  const { seen, total } = vargaCoverage(tables, reference, g);
  lines.push(`| ${g} | ${holding.length} | ${values} | ${seen} | ${total} |`);
}
if (tableFailures.length || missing.length || tableError || tables.length === 0) failed = true;
lines.push('');

// The dashas PL9 printed, against computeDashas in the pl9 mode with the options they were printed with.
const dashasOf = (d: DashaFixture, input: Fixture['input']) => (system: DashaSystem) => {
  // The shortest length a cycle can have, with the shortest year: enough cycles whatever the options.
  // Rashi dashas: a run can be as short as twelve years.
  const years = system === 'kalachakra' ? KALACHAKRA_YEARS.reduce((a, b) => a + b, 0)
    : system in DASHA_SYSTEMS ? DASHA_SYSTEMS[system as keyof typeof DASHA_SYSTEMS].years.reduce((a, b) => a + b, 0) * DASHA_SYSTEMS[system as keyof typeof DASHA_SYSTEMS].scale
    : 12;
  const length = years * 327;
  const levels = (RASHI_DASHA_SYSTEMS as readonly string[]).includes(system) ? 2 : 4;
  // The Narayana, Kendradi and Drig are given for their first run only.
  const cycles = ['narayana', 'lagnaKendradi', 'drig'].includes(system) ? 1 : cyclesToCover(d, system, input.jdUt, length);
  return computeDashas(eph, input, { ...d.options, system, levels, cycles }, { fidelity: 'pl9' }).periods;
};
lines.push('## Dashas', '');
let dashaFixtures: DashaFixture[] = [];
let dashaError = '';
try {
  dashaFixtures = loadDashaFixtures();
} catch {
  dashaError = 'nenhum gabarito de dashas extraído';
}
const dashaVerdicts: DashaVerdict[] = [];
for (const d of dashaFixtures) {
  const i = fixtureById.get(d.id);
  if (i === undefined) { dashaError = `${d.id}: sem gabarito de posições`; continue; }
  dashaVerdicts.push(verifyDashas(d, dashasOf(d, lahiri.fixtures![i]!.input)));
}
lines.push(`Mapas com dashas: ${dashaFixtures.length}. Datas conferidas: ${dashaVerdicts.reduce((s, v) => s + v.checked, 0)}. Uma data mostrada só com o dia passa se o instante do core cai nesse dia, e fica "no limite" se cai a menos de ${DAY_EDGE_SLACK} dia dele; uma data com hora passa se o instante cai no minuto mostrado (o PL9 trunca), e fica "no limite" se cai a menos de um minuto dele com o mesmo deslocamento em todas as datas com hora do mapa.`, '',
  '| Sistema | Mapas | Datas | Falhas | No limite |', '|---|---|---|---|---|');
const dashaMissing: string[] = [];
for (const system of NAKSHATRA_DASHA_SYSTEMS) {
  const holding = dashaVerdicts.filter((v) => v.bySystem[system]);
  const sum = (k: 'periods' | 'failures' | 'atLimit') => holding.reduce((s, v) => s + v.bySystem[system]![k], 0);
  lines.push(`| ${system} | ${holding.length} | ${sum('periods')} | ${sum('failures')} | ${sum('atLimit')} |`);
  if (holding.length < MIN_TABLE_CHARTS) dashaMissing.push(system);
}
// The alternatives of PL9's dasha options, each printed on its own set of charts.
const optionDir = join(root, 'fixtures-dashas-options');
const alternatives = existsSync(optionDir) ? readdirSync(optionDir).sort() : [];
if (alternatives.length) lines.push('', '| Alternativa | Mapas | Datas | Falhas | No limite |', '|---|---|---|---|---|');
for (const alt of alternatives) {
  const set = loadDashaFixtures(`fixtures-dashas-options/${alt}`);
  const verdicts: DashaVerdict[] = [];
  for (const d of set) {
    const i = fixtureById.get(d.id);
    if (i === undefined) { dashaError = `${alt}/${d.id}: sem gabarito de posições`; continue; }
    const v = verifyDashas(d, dashasOf(d, lahiri.fixtures![i]!.input));
    v.chartId = `${d.id} (${alt})`;
    verdicts.push(v);
  }
  const sum = (k: 'periods' | 'failures' | 'atLimit') => verdicts.reduce((s, v) => s + Object.values(v.bySystem).reduce((t, x) => t + x[k], 0), 0);
  lines.push(`| ${alt} | ${verdicts.length} | ${sum('periods')} | ${sum('failures')} | ${sum('atLimit')} |`);
  if (verdicts.length < MIN_TABLE_CHARTS) dashaMissing.push(alt);
  dashaVerdicts.push(...verdicts);
}
const dashaFailures = dashaVerdicts.flatMap((v) => v.failures.map((f) => `| ${v.chartId} | ${f.system} | ${f.path} | ${f.shown} | ${f.offDays.toFixed(4)} |`));
if (dashaError) lines.push('', `Não verificado: ${dashaError}`);
if (dashaMissing.length) lines.push('', `Sem dashas do PL9 em pelo menos ${MIN_TABLE_CHARTS} mapas para: ${dashaMissing.join(', ')}. Esses sistemas **não foram verificados**.`);
if (dashaFailures.length) lines.push('', '| Mapa | Sistema | Período | PL9 | Fora por (dias) |', '|---|---|---|---|---|', ...dashaFailures);
if (dashaFailures.length || dashaMissing.length || dashaError) failed = true;

// The Kalachakra, against computeDashas, with its header: Deha, Jeeva and the sign whose balance runs at birth.
lines.push('', '## Kalachakra', '');
const kcSets: [string, string][] = [['opções do PL9 observadas', 'fixtures-kalachakra']];
const kcOptionDir = join(root, 'fixtures-kalachakra-options');
if (existsSync(kcOptionDir)) for (const alt of readdirSync(kcOptionDir).sort()) kcSets.push([alt, `fixtures-kalachakra-options/${alt}`]);
lines.push('| Conjunto | Mapas | Datas | Falhas | No limite | Cabeçalhos diferentes | Padas da Lua |', '|---|---|---|---|---|---|---|');
const kcFailures: string[] = [];
for (const [name, dir] of kcSets) {
  let set: DashaFixture[] = [];
  try {
    set = loadDashaFixtures(dir);
  } catch {
    lines.push(`| ${name} | 0 | — | — | — | — | — |`);
    kcFailures.push(`${name}: nenhum gabarito`);
    continue;
  }
  let periods = 0, failures = 0, atLimit = 0, headers = 0;
  const padas = new Set<number>();
  for (const d of set) {
    const i = fixtureById.get(d.id);
    if (i === undefined) { kcFailures.push(`${d.id}: sem gabarito de posições`); continue; }
    const input = lahiri.fixtures![i]!.input;
    const v = verifyDashas(d, dashasOf(d, input));
    const t = v.bySystem.kalachakra ?? { periods: 0, failures: 0, atLimit: 0 };
    periods += t.periods; failures += t.failures; atLimit += t.atLimit;
    kcFailures.push(...v.failures.map((f) => `| ${d.id} (${name}) | ${f.path} | ${f.shown} | ${f.offDays.toFixed(4)} |`));
    padas.add(divisionIndex(lahiri.computed![i]!.points.moon.longitude, 108));
    const h = d.pl9.kalachakra;
    const k = computeDashas(eph, input, { ...d.options, system: 'kalachakra', levels: 1, cycles: 1 }, { fidelity: 'pl9' });
    if (h && (SIGN_NAMES[k.kalachakra!.deha] !== h.deha || SIGN_NAMES[k.kalachakra!.jeeva] !== h.jeeva || k.periods[0]!.lord !== h.balance)) {
      headers++;
      kcFailures.push(`| ${d.id} (${name}) | cabeçalho | ${h.deha}/${h.jeeva}/${h.balance} | ${SIGN_NAMES[k.kalachakra!.deha]}/${SIGN_NAMES[k.kalachakra!.jeeva]}/${k.periods[0]!.lord} |`);
    }
  }
  lines.push(`| ${name} | ${set.length} | ${periods} | ${failures} | ${atLimit} | ${headers} | ${padas.size} de 108 |`);
  if (set.length < MIN_TABLE_CHARTS) kcFailures.push(`${name}: ${set.length} mapas, menos de ${MIN_TABLE_CHARTS}`);
}
lines.push('', 'Os relatórios do Kalachakra só têm a data: cada início passa se o instante do core cai no dia mostrado, e fica "no limite" a menos de ' + DAY_EDGE_SLACK + ' dia dele. O cabeçalho é o Deha, o Jeeva e o signo da mahadasha em curso no nascimento.');
if (kcFailures.length) lines.push('', '| Mapa | Período | PL9 | Fora por / core |', '|---|---|---|---|', ...kcFailures.map((f) => (f.startsWith('|') ? f : `| ${f} | | | |`)));
if (kcFailures.length) failed = true;

// The rashi dashas. PL9's second run of the Narayana, Lagna Kendradi and Drig comes out scrambled: only the first is
// checked for them, and the starts after it are counted apart.
lines.push('', '## Dashas de signo', '');
let rashiSet: DashaFixture[] = [];
try {
  rashiSet = loadDashaFixtures('fixtures-rashi');
} catch {
  lines.push('Nenhum gabarito extraído.');
  failed = true;
}
const FIRST_RUN_ONLY = new Set(['narayana', 'lagnaKendradi', 'drig']);
/** Known and unexplained differences, set apart from a date on: none now (REF 0090's was the nodes' dignity). */
const RASHI_KNOWN: Record<string, { systems: string[]; from: string; why: string }> = {};
const rashiKnown: string[] = [];
const NOT_MEASURED = new Set(['sreeLagnaKendradi']);
type RashiTally = Map<string, { charts: number; periods: number; failures: number; atLimit: number; apart: number; known: number }>;
const rashiTally: RashiTally = new Map();
const rashiFailures: string[] = [];
/** Checks a set of rashi dasha fixtures, printed with one set of options, into `tally` and `rashiFailures`. */
function checkRashi(set: DashaFixture[], tally: RashiTally, label: string): void {
for (const d of set) {
  const name = label ? `${d.id} (${label})` : d.id;
  const i = fixtureById.get(d.id);
  if (i === undefined) { rashiFailures.push(`| ${name} | sem gabarito de posições | | |`); continue; }
  const input = lahiri.fixtures![i]!.input;
  for (const system of RASHI_DASHA_SYSTEMS) {
    const own = d.pl9.dashas.filter((x) => x.startsWith(`${system} `));
    if (!own.length) continue;
    const t = tally.get(system) ?? { charts: 0, periods: 0, failures: 0, atLimit: 0, apart: 0, known: 0 };
    tally.set(system, t);
    t.charts++;
    if (NOT_MEASURED.has(system)) { t.apart += own.length; continue; }
    let kept = own;
    if (FIRST_RUN_ONLY.has(system)) {
      const first = computeDashas(eph, input, { ...d.options, system, levels: 1, cycles: 1 }, { fidelity: 'pl9' }).periods;
      const end = first.at(-1)!.end;
      // A start on the last day of the first run is the second's.
      kept = own.filter((x) => shownJd(x.split(' ')[2]!) < end - 1);
      t.apart += own.length - kept.length;
    }
    const known = RASHI_KNOWN[d.id];
    if (known && known.systems.includes(system)) {
      const apart = kept.filter((x) => x.split(' ')[2]! >= known.from);
      if (apart.length) rashiKnown.push(`${d.id} ${system}: ${apart.length} datas a partir de ${known.from} — ${known.why}`);
      t.known += apart.length;
      kept = kept.filter((x) => x.split(' ')[2]! < known.from);
    }
    const v = verifyDashas({ ...d, pl9: { dashas: kept } }, dashasOf(d, input));
    const s = v.bySystem[system as DashaSystem] ?? { periods: 0, failures: 0, atLimit: 0 };
    t.periods += s.periods; t.failures += s.failures; t.atLimit += s.atLimit;
    rashiFailures.push(...v.failures.map((f) => `| ${name} | ${f.system} ${f.path} | ${f.shown} | ${f.offDays.toFixed(4)} |`));
  }
}
}
checkRashi(rashiSet, rashiTally, '');
if (rashiSet.length) {
  lines.push(`Mapas: ${rashiSet.length}. Datas só com o dia, com a mesma tolerância do Kalachakra. "Não conferidas": as datas da segunda volta do Narayana, do Lagna Kendradi e do Drig (o PL9 a dá embaralhada, e o modo pl9 do core só dá a primeira), e as dos sistemas ainda não medidos. "Exceção": as datas postas à parte abaixo.`, '',
    '| Sistema | Mapas | Datas | Falhas | No limite | Não conferidas | Exceção |', '|---|---|---|---|---|---|---|');
  for (const system of RASHI_DASHA_SYSTEMS) {
    const t = rashiTally.get(system);
    if (t) lines.push(`| ${system}${NOT_MEASURED.has(system) ? ' (não medido)' : ''} | ${t.charts} | ${t.periods} | ${t.failures} | ${t.atLimit} | ${t.apart} | ${t.known} |`);
    // Each measured system needs its dates in enough charts.
    if (!NOT_MEASURED.has(system) && (t?.charts ?? 0) < MIN_TABLE_CHARTS) rashiFailures.push(`| — | ${system} sem datas em ${MIN_TABLE_CHARTS} mapas | | |`);
  }
}
// The sets printed with other options of the Dashas preferences, all the systems of the print model each.
const rashiOptionDir = join(root, 'fixtures-rashi-options');
if (existsSync(rashiOptionDir)) {
  lines.push('', 'Com outras opções da aba Dashas (todos os sistemas medidos do modelo de impressão, somados):', '',
    '| Conjunto | Mapas | Datas | Falhas | No limite | Não conferidas | Exceção |', '|---|---|---|---|---|---|---|');
  for (const alt of readdirSync(rashiOptionDir).sort()) {
    const set = loadDashaFixtures(`fixtures-rashi-options/${alt}`);
    const tally: RashiTally = new Map();
    checkRashi(set, tally, alt);
    const sum = (k: 'periods' | 'failures' | 'atLimit' | 'apart' | 'known') => [...tally.values()].reduce((a, t) => a + t[k], 0);
    lines.push(`| ${alt} | ${set.length} | ${sum('periods')} | ${sum('failures')} | ${sum('atLimit')} | ${sum('apart')} | ${sum('known')} |`);
    if (set.length < MIN_TABLE_CHARTS) rashiFailures.push(`| — | ${alt} com ${set.length} mapas, menos de ${MIN_TABLE_CHARTS} | | |`);
  }
}
if (rashiKnown.length) lines.push('', 'Exceções conhecidas, sem explicação, à parte:', '', ...rashiKnown.map((k) => `- ${k}`));
if (rashiFailures.length) {
  // One line per chart and system: the count and the first period that fails.
  const byChart = new Map<string, { n: number; first: string }>();
  for (const f of rashiFailures) {
    const [, chart, period, shown] = f.split('|').map((x) => x.trim());
    const key = `${chart} | ${period!.split(' ')[0]}`;
    const e = byChart.get(key) ?? { n: 0, first: `${period} ${shown}` };
    e.n++;
    byChart.set(key, e);
  }
  lines.push('', '| Mapa | Sistema | Falhas | Primeira |', '|---|---|---|---|', ...[...byChart].map(([k, e]) => `| ${k} | ${e.n} | ${e.first} |`));
}
if (rashiFailures.length) failed = true;
lines.push('');

// The Ashtakavarga PL9 printed, every value against computeAshtakavarga in the pl9 mode with the options printed with.
lines.push('## Ashtakavarga', '');
// Every alternative of PL9's three options must have its set: a missing one fails, it is not passed over.
const AV_OPTION_SETS = ['ekadhipatya-other', 'method-parashara', 'virgoMultiplier-5'];
const avSets: [string, string][] = [['opções do PL9 observadas', 'fixtures-ashtakavarga'], ...AV_OPTION_SETS.map((alt): [string, string] => [alt, `fixtures-ashtakavarga-options/${alt}`])];
const avOptionDir = join(root, 'fixtures-ashtakavarga-options');
const avUnexpected = existsSync(avOptionDir) ? readdirSync(avOptionDir).filter((alt) => !AV_OPTION_SETS.includes(alt)) : [];
lines.push('| Conjunto | Mapas | Valores | Falhas |', '|---|---|---|---|');
const avFailures: string[] = [];
let avCharts = 0;
for (const [name, dir] of avSets) {
  let set: StrengthFixture[] = [];
  try {
    set = loadStrengthFixtures(dir);
  } catch {
    lines.push(`| ${name} | 0 | — | — |`);
    avFailures.push(`| ${name} | nenhum gabarito | |`);
    continue;
  }
  let values = 0, failuresHere = 0;
  for (const d of set) {
    const i = fixtureById.get(d.id);
    if (i === undefined) { avFailures.push(`| ${d.id} (${name}) | sem gabarito de posições | |`); continue; }
    const v = verifyAshtakavarga(d.pl9.av ?? [], computeAshtakavarga(eph, lahiri.fixtures![i]!.input, (d.options ?? {}) as Partial<AshtakavargaOptions>, { fidelity: 'pl9' }));
    values += v.values;
    failuresHere += v.failures.length;
    if (v.failures.length) avFailures.push(`| ${d.id} (${name}) | ${v.failures.length} | ${v.failures[0]} |`);
  }
  if (name === avSets[0]![0]) avCharts = set.length;
  lines.push(`| ${name} | ${set.length} | ${values} | ${failuresHere} |`);
  if (set.length < MIN_TABLE_CHARTS) avFailures.push(`| ${name} | ${set.length} mapas, menos de ${MIN_TABLE_CHARTS} | |`);
}
for (const alt of avUnexpected) avFailures.push(`| ${alt} | conjunto não esperado | |`);
lines.push('', 'Cada valor impresso — os oito quadros antes e depois de cada redução, os pindas, o Prastara e o Samudaya — igual ao do core, sem tolerância.');
if (avFailures.length) lines.push('', '| Mapa | Falhas | Primeira |', '|---|---|---|', ...avFailures);
if (avFailures.length) failed = true;
lines.push('');

// The Shadbala PL9 printed, every value against computeShadbala in the pl9 mode. Charts whose birth falls outside
// PL9's series of Cheshta cycles are listed, not checked; the rank, whose rule is not found yet, is listed apart.
lines.push('## Shadbala', '');
const sbFailures: string[] = [];
const sbPending: string[] = [];
const sbOutside: string[] = [];
let sbSet: StrengthFixture[] = [];
let sbValues = 0;
try {
  sbSet = loadStrengthFixtures('fixtures-shadbala');
} catch {
  sbFailures.push('| fixtures-shadbala | nenhum gabarito | |');
}
for (const d of sbSet) {
  const i = fixtureById.get(d.id);
  if (i === undefined) { sbFailures.push(`| ${d.id} | sem gabarito de posições | |`); continue; }
  const sb = computeShadbala(eph, lahiri.fixtures![i]!.input, {}, { fidelity: 'pl9' });
  if (sb.cheshtaOutsideSeries.length) { sbOutside.push(d.id); continue; }
  const v = verifyShadbala(d.pl9.sb ?? [], sb);
  sbValues += v.values;
  if (v.failures.length) sbFailures.push(`| ${d.id} | ${v.failures.length} | ${v.failures[0]} |`);
  for (const p of v.pending) sbPending.push(`| ${d.id} | ${p} |`);
}
if (sbSet.length && sbSet.length < MIN_TABLE_CHARTS) sbFailures.push(`| fixtures-shadbala | ${sbSet.length} mapas, menos de ${MIN_TABLE_CHARTS} | |`);
lines.push('| Mapas | Conferidos | Valores | Falhas | Rank pendente |', '|---|---|---|---|---|',
  `| ${sbSet.length} | ${sbSet.length - sbOutside.length} | ${sbValues} | ${sbFailures.length} | ${sbPending.length} |`);
lines.push('', 'Cada parte impressa a meio centésimo do core; mínimos e forças fortes iguais. A classificação ainda difere onde o PL9 troca planetas de razões muito próximas (docs/spec/forcas/shadbala.md).');
if (sbOutside.length) lines.push('', `Fora das séries do Cheshta do PL9, não conferidos: ${sbOutside.join(', ')}.`);
// Every alternative of the five options must have its set, checked like the default one.
const SB_OPTION_SETS = ['digBala-kendras', 'drekkana-horaRatnam', 'jupiterMercuryDrik-quarter', 'mercuryDrik-benefic', 'mercuryPaksha-benefic'];
const sbOptionDir = join(root, 'fixtures-shadbala-options');
for (const alt of existsSync(sbOptionDir) ? readdirSync(sbOptionDir).filter((a) => !SB_OPTION_SETS.includes(a)) : []) sbFailures.push(`| ${alt} | conjunto não esperado | |`);
const sbOptionRows: string[] = [];
for (const alt of SB_OPTION_SETS) {
  let set: StrengthFixture[] = [];
  try {
    set = loadStrengthFixtures(`fixtures-shadbala-options/${alt}`);
  } catch {
    sbFailures.push(`| ${alt} | nenhum gabarito | |`);
    continue;
  }
  let values = 0, failuresHere = 0, pendingHere = 0;
  for (const d of set) {
    const i = fixtureById.get(d.id);
    if (i === undefined) { sbFailures.push(`| ${d.id} (${alt}) | sem gabarito de posições | |`); continue; }
    const v = verifyShadbala(d.pl9.sb ?? [], computeShadbala(eph, lahiri.fixtures![i]!.input, (d.options ?? {}) as Partial<ShadbalaOptions>, { fidelity: 'pl9' }));
    values += v.values; failuresHere += v.failures.length; pendingHere += v.pending.length;
    if (v.failures.length) sbFailures.push(`| ${d.id} (${alt}) | ${v.failures.length} | ${v.failures[0]} |`);
  }
  if (set.length < MIN_TABLE_CHARTS) sbFailures.push(`| ${alt} | ${set.length} mapas, menos de ${MIN_TABLE_CHARTS} | |`);
  sbOptionRows.push(`| ${alt} | ${set.length} | ${values} | ${failuresHere} | ${pendingHere} |`);
}
lines.push('', '| Opção | Mapas | Valores | Falhas | Rank pendente |', '|---|---|---|---|---|', ...sbOptionRows);

// The ten tables read from PL9's memory, at full precision.
const memDir = join(root, 'fixtures-shadbala-memory');
const memSet = existsSync(memDir) ? readdirSync(memDir).filter((f) => f.endsWith('.json')).sort().map((f) => JSON.parse(readFileSync(join(memDir, f), 'utf8')) as ShadbalaMemoryFixture) : [];
let memValues = 0;
for (const d of memSet) {
  const i = fixtureById.get(d.id);
  if (i === undefined) { sbFailures.push(`| ${d.id} (memória) | sem gabarito de posições | |`); continue; }
  const v = verifyShadbalaMemory(d.memory, computeShadbala(eph, lahiri.fixtures![i]!.input, {}, { fidelity: 'pl9' }));
  memValues += v.values;
  if (v.failures.length) sbFailures.push(`| ${d.id} (memória) | ${v.failures.length} | ${v.failures[0]} |`);
}
if (memSet.length < 10) sbFailures.push(`| fixtures-shadbala-memory | ${memSet.length} mapas, menos de 10 | |`);
lines.push('', `Memória do PL9: ${memSet.length} mapas, ${memValues} valores, cada um a um décimo de milésimo do core.`);
if (sbFailures.length) lines.push('', '| Mapa | Falhas | Primeira |', '|---|---|---|', ...sbFailures);
if (sbPending.length) lines.push('', '| Mapa | Rank pendente |', '|---|---|', ...sbPending);
if (sbFailures.length) failed = true;
lines.push('');

// The Bhava Bala PL9 printed, every value against computeBhavaBala in the pl9 mode, with the default options and with
// each alternative of the Shadbala's; the memory of REF 0010 at full precision.
lines.push('## Bhava Bala', '');
const bbFailures: string[] = [];
const bbRows: string[] = [];
const bbOutside = new Set<string>();
const bbSets: [string, string][] = [['opções padrão', 'fixtures-shadbala'], ...SB_OPTION_SETS.map((alt): [string, string] => [alt, `fixtures-shadbala-options/${alt}`])];
let bbCharts = 0;
for (const [name, dir] of bbSets) {
  let set: StrengthFixture[] = [];
  try { set = loadStrengthFixtures(dir); } catch { bbFailures.push(`| ${name} | nenhum gabarito | |`); continue; }
  let values = 0, checked = 0, failuresHere = 0;
  for (const d of set) {
    const i = fixtureById.get(d.id);
    if (i === undefined || !d.pl9.bb?.length) { bbFailures.push(`| ${d.id} (${name}) | sem gabarito | |`); continue; }
    const input = lahiri.fixtures![i]!.input;
    const options = (d.options ?? {}) as Partial<ShadbalaOptions>;
    const bb = computeBhavaBala(eph, input, options, { fidelity: 'pl9' });
    if (bb.cheshtaOutsideSeries.length) { bbOutside.add(d.id); continue; }
    const v = verifyBhavaBala(d.pl9.bb, bb);
    checked++; values += v.values; failuresHere += v.failures.length;
    if (v.failures.length) bbFailures.push(`| ${d.id} (${name}) | ${v.failures.length} | ${v.failures[0]} |`);
  }
  if (checked < MIN_TABLE_CHARTS) bbFailures.push(`| ${name} | ${checked} mapas conferidos, menos de ${MIN_TABLE_CHARTS} | |`);
  if (name === bbSets[0]![0]) bbCharts = checked;
  bbRows.push(`| ${name} | ${checked} | ${values} | ${failuresHere} |`);
}
let bbMemory = 0;
for (const d of memSet) {
  const held = (d as ShadbalaMemoryFixture & { memory_bhava?: Record<string, number[]> }).memory_bhava;
  if (!held) continue;
  const bb = computeBhavaBala(eph, lahiri.fixtures![fixtureById.get(d.id)!]!.input, {}, { fidelity: 'pl9' });
  for (const [part, xs] of Object.entries(held)) xs.forEach((v, h) => {
    bbMemory++;
    const c = bb.houses[h]![part as keyof BhavaRow];
    if (!(Math.abs(c - v) <= 1e-4)) bbFailures.push(`| ${d.id} (memória) | 1 | ${part} ${h + 1}: PL9 ${v}, core ${c} |`);
  });
}
lines.push('| Conjunto | Mapas | Valores | Falhas |', '|---|---|---|---|', ...bbRows, '',
  `Memória do PL9: ${bbMemory} valores, cada um a um décimo de milésimo do core. As partes como o PL9 as imprime, truncadas; o total e os rupas arredondados.`);
if (bbMemory < 72) bbFailures.push(`| fixtures-shadbala-memory | ${bbMemory} valores do Bhava Bala, menos de 72 | |`);
if (bbOutside.size) lines.push('', `Fora das séries do Cheshta do PL9, não conferidos: ${[...bbOutside].sort().join(', ')}.`);
if (bbFailures.length) lines.push('', '| Mapa | Falhas | Primeira |', '|---|---|---|', ...bbFailures);
if (bbFailures.length) failed = true;
lines.push('');

// The Vimshopaka PL9 printed: the four groups and the dignities in the 16 vargas of the nine, against computeVimshopaka.
lines.push('## Vimshopaka', '');
const vimFailures: string[] = [];
let vimSet: StrengthFixture[] = [];
let vimValues = 0, vimCharts = 0;
try { vimSet = loadStrengthFixtures('fixtures-vimshopaka'); } catch { vimFailures.push('| fixtures-vimshopaka | nenhum gabarito | |'); }
for (const d of vimSet) {
  const i = fixtureById.get(d.id);
  if (i === undefined || !d.pl9.vim?.length) { vimFailures.push(`| ${d.id} | sem gabarito | |`); continue; }
  const v = verifyVimshopaka(d.pl9.vim, computeVimshopaka(eph, lahiri.fixtures![i]!.input, { fidelity: 'pl9' }));
  vimCharts++; vimValues += v.values;
  if (v.failures.length) vimFailures.push(`| ${d.id} | ${v.failures.length} | ${v.failures[0]} |`);
}
if (vimCharts < MIN_TABLE_CHARTS) vimFailures.push(`| fixtures-vimshopaka | ${vimCharts} mapas conferidos, menos de ${MIN_TABLE_CHARTS} | |`);
lines.push('| Mapas | Valores | Falhas |', '|---|---|---|', `| ${vimCharts} | ${vimValues} | ${vimFailures.length} |`, '',
  'Os quatro grupos de cada um dos nove planetas, arredondados (um meio exato aceito para os dois lados), e as 144 dignidades nas vargas, exatas.');
if (vimFailures.length) lines.push('', '| Mapa | Falhas | Primeira |', '|---|---|---|', ...vimFailures);
if (vimFailures.length) failed = true;
lines.push('');

// The transits PL9 printed on the TEMPO model (stage 5A): two snapshots per chart and reference date, "muhurta" at the
// reference instant and "now" at the instant printed on the page (the VM's clock as Jaipur time), over the copies of
// the charts with the birth rounded to the second (refset-tempo.json); the sign entries of the year and the kaksha
// calendar of the month of "now".
lines.push('## Trânsitos', '');
const trFailures: string[] = [];
const JAIPUR = { latitude: 26.9166667, longitudeEast: 75.8277778 };
const REFERENCE = { '2000': 2451545 - 5.5 / 24, '2030': 2462667.75 - 5.5 / 24 } as const;
const localJaipurToUt = (text: string) => Date.UTC(+text.slice(0, 4), +text.slice(5, 7) - 1, +text.slice(8, 10), +text.slice(11, 13), +text.slice(14, 16), +text.slice(17, 19)) / 86400000 + 2440587.5 - 5.5 / 24;
const tempoNatal = new Map((JSON.parse(readFileSync(join(root, 'refset-tempo.json'), 'utf8')) as { id: string; jdUt: number; latitude: number; longitudeEast: number }[]).map((r) => [r.id, r]));
let trCharts = 0, trValues = 0;
const trBorders: string[] = [], trPending: string[] = [];
const ingressByYear = new Map<number, ReturnType<typeof signIngresses>>();
for (const date of ['2000', '2030'] as const) {
  let set: TransitFixture[] = [];
  try { set = loadTransitFixtures(join(root, 'fixtures-transits', date)); } catch { trFailures.push(`| fixtures-transits/${date} | nenhum gabarito | |`); }
  for (const fx of set) {
    const natal = tempoNatal.get(fx.id);
    if (!natal) { trFailures.push(`| ${fx.id} ${date} | sem nascimento em refset-tempo.json | |`); continue; }
    const failures: string[] = [];
    for (const snap of ['muhurta', 'now'] as const) {
      const shown = fx.pl9[snap];
      if (!shown?.at) { failures.push(`${snap}: sem instante`); continue; }
      const jdUt = snap === 'muhurta' ? REFERENCE[date] : localJaipurToUt(shown.at);
      const t = computeTransits(eph, natal, { jdUt, ...JAIPUR }, { fidelity: 'pl9' });
      const d = dashasAt(eph, natal, jdUt, { fidelity: 'pl9' });
      const v = verifyTransitSnapshot(shown, t, d);
      trValues += v.values;
      for (const f of v.failures) {
        // The "now" pages are drawn while the VM's clock runs: near a change of the Shadbala's hora, at sunrise for one,
        // PL9 can print a planet a few seconds either side of the instant it prints. Such a value, equal to the core's 30
        // seconds before or after, is a border case.
        const m = snap === 'now' ? /^sb (\w+):/.exec(f) : null;
        if (m) {
          const shownSb = shown.sb[m[1] as keyof typeof shown.sb]!;
          const near = [-30, 30].some((sec) => Math.abs((computeTransits(eph, natal, { jdUt: jdUt + sec / 86400, ...JAIPUR }, { fidelity: 'pl9' }).shadbalaRatio?.[m[1] as 'sun'] ?? NaN) - shownSb) <= 0.005 + 1e-9);
          if (near) { trBorders.push(`| ${fx.id} ${date} | ${f} (igual ao core 30 s antes ou depois) |`); continue; }
        }
        failures.push(`${snap} ${f}`);
      }
      if (snap === 'now' && shown.ingress) {
        const year = +shown.at.slice(0, 4);
        if (!ingressByYear.has(year)) {
          const y0 = Date.UTC(year, 0, 1) / 86400000 + 2440587.5;
          ingressByYear.set(year, signIngresses(eph, y0, y0 + 366, { fidelity: 'pl9' }));
        }
        const iv = verifyIngress(shown.ingress, ingressByYear.get(year)!);
        trValues += iv.values; failures.push(...iv.failures);
      }
      // The Events page (worksheet 120): both events at the reference date, 06:00 taken as UT (from the printouts).
      if (snap === 'muhurta' && shown.events) {
        const day = { '2000': '1 Jan 2000', '2030': '15 Jun 2030' }[date];
        trValues++;
        if (shown.events.date[0] !== day || shown.events.date[1] !== day) failures.push(`events date: PL9 ${shown.events.date.join(' / ')}, expected ${day}`);
        const ev = verifyEvents(shown.events, eventDashas(eph, natal, { jdUt, utcOffsetHours: 5.5 }, { fidelity: 'pl9' }));
        trValues += ev.values; failures.push(...ev.failures);
      }
      // The tables of the transit's D9 and D10 (worksheet 103).
      if (snap === 'now' && shown.vargas) {
        const lons = Object.fromEntries(Object.entries(t.points).map(([k, v]) => [k, v!.longitude]));
        const vv = verifyVargas(shown.vargas, { D9: vargaTable(lons, 'D9', 'pl9'), D10: vargaTable(lons, 'D10', 'pl9') });
        trValues += vv.values; failures.push(...vv.failures);
      }
      // The Varshaphala of the clock's year (worksheets 64-66, 74).
      if (snap === 'now' && shown.varsha) {
        const wv = verifyVarshaClock(shown.varsha, computeVarshaClockInputs(eph, natal, shown.varsha.years), [...VARSHA_CLOCK_ALWAYS_PENDING, ...(KNOWN_VARSHA_CLOCK_PENDING[fx.id] ?? [])]);
        trValues += wv.values; failures.push(...wv.failures);
        trPending.push(...wv.pending.map((x) => `| ${fx.id} ${date} | ${x} |`));
      }
      // The year of age at the clock (64) and the months and days of the monthly and daily returns (75, 81).
      if (snap === 'now' && shown.varsha) {
        const av = verifyVarshaAge(shown.varsha, natal.jdUt, jdUt);
        trValues += av.values; failures.push(...av.failures);
        trBorders.push(...av.borders.map((x) => `| ${fx.id} ${date} | ${x} |`));
      }
      // The dasha lists of worksheets 64, 65, 75, 81 and 89, and the monthly and daily returns.
      if (snap === 'now' && shown.varsha?.lists) {
        const r = shown.varsha.returns;
        const age = r?.monthly && r.daily ? { years: shown.varsha.years, monthly: r.monthly, daily: r.daily } : undefined;
        const dv = verifyVarshaLists(shown.varsha, worksheetDashaLists(eph, natal, { jdUt, utcOffsetHours: 5.5 }, age, { fidelity: 'pl9' }), KNOWN_VARSHA_LISTS_PENDING[fx.id] ?? []);
        trValues += dv.values; failures.push(...dv.failures);
        trPending.push(...dv.pending.map((x) => `| ${fx.id} ${date} | ${x} |`));
        trBorders.push(...dv.borders.map((x) => `| ${fx.id} ${date} | ${x} |`));
      }
      // The month's calendar (worksheet 104), in Jaipur's clock.
      if (snap === 'now' && shown.monthCalendar) {
        const [cy, cm] = shown.monthCalendar.month.split('-').map(Number) as [number, number];
        const mv = verifyMonthCalendar(shown.monthCalendar, monthCalendar(eph, natal, { year: cy, month: cm }, { utcOffsetHours: 5.5 }, { fidelity: 'pl9' }) ?? [], { utcOffsetHours: 5.5, nowJdUt: jdUt });
        trValues += mv.values; failures.push(...mv.failures);
      }
      // SB# and VB of the transit table (worksheet 106).
      if (snap === 'now' && shown.sbvb) {
        const sv = verifySbVb(shown.sbvb, t.shadbalaStrong, t.vimshopaka);
        trValues += sv.values; failures.push(...sv.failures);
        trPending.push(...sv.pending.map((x) => `| ${fx.id} ${date} | ${x} |`));
      }
      // The Panch Pakshi (worksheet 39), in Jaipur's clock.
      if (snap === 'now' && shown.pakshi) {
        const pk = panchPakshi(eph, natal, { jdUt, ...JAIPUR, utcOffsetHours: 5.5 }, { fidelity: 'pl9' });
        if (pk) { const pv = verifyPakshi(shown.pakshi, pk, 5.5); trValues += pv.values; failures.push(...pv.failures); } else failures.push('pakshi: core none');
      }
      // The Kota Chakra's places (worksheet 114), from the natal Moon.
      if (snap === 'now' && shown.kota) {
        const transit = Object.fromEntries(Object.entries(t.points).filter(([k]) => k !== 'lagna').map(([k, v]) => [k, v!.longitude]));
        const kv = verifyKota(shown.kota, kotaChakra(computePositions(eph, natal, { fidelity: 'pl9' }).points.moon.longitude, transit, 'pl9').places);
        trValues += kv.values; failures.push(...kv.failures);
      }
      // The sunrise chart of the birth (worksheet 8) and its Vimshottari rows from the print job's clock.
      if (snap === 'now' && shown.sunrise) {
        const sr = computeSunriseChart(eph, natal, { fidelity: 'pl9' });
        const periods = (sunriseDashaRows(eph, natal, { jdUt, utcOffsetHours: 5.5 }, 16, { fidelity: 'pl9' }) ?? []).map((r) => ({ chain: r.chain.join('-'), start: r.startJdUt }));
        const sv = verifySunrise(shown.sunrise, { points: sr ? computePositions(eph, { ...natal, jdUt: sr.jdUt }, { fidelity: 'pl9' }).points : {}, periods, utcOffsetHours: 0, startJdUt: jdUt + 5.5 / 24 });
        trValues += sv.values; failures.push(...sv.failures);
      }
      if (snap === 'now' && shown.calendar) {
        const [y, m] = shown.calendar.month.split('-').map(Number) as [number, number];
        const m0 = Date.UTC(y, m - 1, 1) / 86400000 + 2440587.5, m1 = Date.UTC(y, m, 1) / 86400000 + 2440587.5;
        const cv = verifyCalendar(shown.calendar.marks, kakshaCalendar(eph, natal, m0, m1, { fidelity: 'pl9' }), m0, m1);
        trValues += cv.values; failures.push(...cv.failures);
      }
    }
    trCharts++;
    if (failures.length) trFailures.push(`| ${fx.id} ${date} | ${failures.length} | ${failures[0]} |`);
  }
}
// Research → "Time of transits" on REF 0010: the first moment after a date, printed to the second in Jaipur time.
const TOT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], TOT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const jaipurText = (jdUt: number) => {
  const d = new Date(Math.round((jdUt - 2440587.5 + 5.5 / 24) * 86400) * 1000);
  const two = (n: number) => String(n).padStart(2, '0');
  return `${TOT_DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${TOT_MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())}`;
};
let totQueries = 0;
try {
  const tot = JSON.parse(readFileSync(join(root, 'fixtures-transits', 'time-of-transits.json'), 'utf8')) as { id: string; after: string; queries: { planet: string; event: TransitEvent; natal: string; shown: string; retrograde: boolean }[] };
  const natal = tempoNatal.get(tot.id)!;
  const points = computePositions(eph, natal, { fidelity: 'pl9' }).points;
  for (const q of tot.queries) {
    totQueries++; trValues++;
    const r = timeOfTransit(eph, q.planet as 'sun', q.event, points[q.natal as 'sun'].longitude, localJaipurToUt(tot.after), { fidelity: 'pl9' });
    // PL9 rounds the seconds: the second shown, one second either side (up to 1.5 s from the computed instant).
    const ok = r !== undefined && r.retrograde === q.retrograde && [-1, 0, 1].some((sec) => jaipurText(r.jdUt + sec / 86400) === q.shown);
    if (!ok) trFailures.push(`| ${tot.id} time of transits | 1 | ${q.planet} ${q.event} ${q.natal}: PL9 ${q.shown}${q.retrograde ? ' R' : ''}, core ${r ? jaipurText(r.jdUt) + (r.retrograde ? ' R' : '') : 'none'} |`);
  }
} catch (e) { trFailures.push(`| time-of-transits.json | ${(e as Error).message} | |`); }
if (trCharts < 2 * MIN_TABLE_CHARTS) trFailures.push(`| fixtures-transits | ${trCharts} mapas e datas conferidos, menos de ${2 * MIN_TABLE_CHARTS} | |`);
lines.push('| Mapas × datas | Valores | Falhas | Casos de fronteira | Pendentes |', '|---|---|---|---|---|', `| ${trCharts} | ${trValues} | ${trFailures.length} | ${trBorders.length} | ${trPending.length} |`, '',
  `Por mapa e data de referência: as posições, marcas R, kakshas, Shadbala, Tarabala, Chandrabala e os dashas Vimshottari, Narayana, Yogini e Ashtottari no instante de referência (a página do Muhurta) e no instante impresso nas páginas de trânsito, com os senhores KP dos dez pontos neste; o mapa do nascer do sol do nascimento e as 15 linhas do seu Vimshottari; os quatro dashas (com o Chara) dos dois eventos da página Events; as tabelas da D9 e da D10 do trânsito (sem a natureza funcional dos nós); o Varshaphala do ano do relógio (worksheets 64 a 66 e 74: retorno, tabela do mapa anual, kakshas, forças, ofícios, Muntha e os Sahams natais e anuais; as 12 listas de dashas de 64, 65, 75, 81 e 89 e os retornos mensal e diário, docs/spec/tempo/varshaphala.md); os eventos do calendário do mês (worksheet 104); as posições do Kota Chakra (sem a pontuação); o SB# e o VB da tabela do trânsito (worksheet 106; o VB dos nós pendente onde difere); o Panch Pakshi (worksheet 39: o pássaro, a quinzena, os pássaros que regem e que morrem, os dez yamas com as cinco partes, as horas a dois segundos); as entradas em signos do ano e o calendário de kakshas do mês. E ${totQueries} consultas de "Time of transits" no REF 0010, ao segundo.`);
if (trFailures.length) lines.push('', '| Mapa | Falhas | Primeira |', '|---|---|---|', ...trFailures);
if (trBorders.length) lines.push('', '| Mapa | Caso de fronteira |', '|---|---|', ...trBorders);
if (trPending.length) lines.push('', '| Mapa | Pendente |', '|---|---|', ...trPending);
if (trFailures.length) failed = true;
lines.push('');

// The panchanga PL9 printed (stage 5B): the birth pages of the 135 charts, the tithi, karana and yoga of the 540
// transit instants, and the Tithi Pravesh (its date: the instant printed on the page, the VM's clock).
lines.push('## Panchanga', '');
const pcFailures: string[] = [], pcPending: string[] = [];
let pcCharts = 0, pcValues = 0;
const MONTHS3 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dateText = (jdUt: number, tz = 0) => { const d = new Date(Math.round((jdUt + tz / 24 - 2440587.5) * 86400) * 1000); return `${d.getUTCDate()} ${MONTHS3[d.getUTCMonth()]} ${d.getUTCFullYear()} ${clockTime(jdUt, tz)}`; };
let pcSet: ReturnType<typeof loadPanchangaFixtures> = [];
try { pcSet = loadPanchangaFixtures(join(root, 'fixtures-panchanga')); } catch { pcFailures.push('| fixtures-panchanga | nenhum gabarito | |'); }
for (const fx of pcSet) {
  const natal = tempoNatal.get(fx.id);
  if (!natal) { pcFailures.push(`| ${fx.id} | sem nascimento em refset-tempo.json | |`); continue; }
  const p = computeBirthPanchanga(eph, natal, { fidelity: 'pl9' });
  if (p.missing.length) { pcFailures.push(`| ${fx.id} | 1 | sunrise missing (${p.missing[0]!.reason}) |`); continue; }
  const v = verifyBirthPanchanga(fx.pl9.birth, p as unknown as BirthPanchangaLike, { clock: (jd) => clockTime(jd), ghatis, date: (jd) => dateText(jd) }, natal.jdUt, (Math.floor(natal.jdUt + 0.5) + 1) % 7, KNOWN_BIRTH_PENDING[fx.id]);
  pcValues += v.values;
  const failures = [...v.failures, ...v.stale.map((k) => `${k}: pendente velho`)];
  pcPending.push(...v.pending.map((x) => `| ${fx.id} | ${x} |`));
  // The Tithi Pravesh, at the birth place (timezone 0) and in Jaipur time.
  const shownAt = (await import('node:fs')).existsSync(join(root, 'fixtures-transits', '2030', `${fx.id}.json`))
    ? (JSON.parse(readFileSync(join(root, 'fixtures-transits', '2030', `${fx.id}.json`), 'utf8')) as TransitFixture).pl9.now?.at : undefined;
  if (!shownAt) failures.push('Tithi Pravesh: no date (fixtures-transits/2030 without the instant printed)');
  else {
    const tp = tithiPravesh(eph, natal, localJaipurToUt(shownAt), { fidelity: 'pl9' });
    pcValues += 2;
    if (dateText(tp) !== fx.pl9.tithiPravesh.natal) failures.push(`Tithi Pravesh: PL9 ${fx.pl9.tithiPravesh.natal}, core ${dateText(tp)}`);
    if (dateText(tp, 5.5) !== fx.pl9.tithiPravesh.local) failures.push(`Tithi Pravesh (L): PL9 ${fx.pl9.tithiPravesh.local}, core ${dateText(tp, 5.5)}`);
  }
  pcCharts++;
  if (failures.length) pcFailures.push(`| ${fx.id} | ${failures.length} | ${failures[0]} |`);
}
// The 540 instants of the transit pages.
for (const date of ['2000', '2030'] as const) {
  let set: TransitFixture[] = [];
  try { set = loadTransitFixtures(join(root, 'fixtures-transits', date)); } catch { continue; }
  for (const fx of set) for (const snap of ['muhurta', 'now'] as const) {
    const g = fx.pl9[snap]?.gochara; const at = fx.pl9[snap]?.at;
    if (!g || !at) continue;
    const jdUt = snap === 'muhurta' ? REFERENCE[date] : localJaipurToUt(at);
    const pos = computePositions(eph, { jdUt, latitude: 0, longitudeEast: 0 }, { fidelity: 'pl9' }).points;
    const sun = pos.sun.longitude, moon = pos.moon.longitude;
    const core = { tithi: TITHIS[tithiOf(sun, moon) - 1], karana: karanaName(karanaOf(sun, moon)), yoga: YOGAS[yogaOf(sun, moon) - 1] };
    // The Gochara data spell Vishti "Visthi" and follow the yoga with a description.
    const shown = { tithi: g.tithi, karana: g.karana?.replace(/ \(.*/, '').replace('Visthi', 'Vishti'), yoga: g.yoga?.split(':')[0] };
    for (const k of ['tithi', 'karana', 'yoga'] as const) {
      pcValues++;
      if (shown[k] !== core[k]) pcFailures.push(`| ${fx.id} ${date} ${snap} | 1 | ${k}: PL9 ${shown[k]}, core ${core[k]} |`);
    }
  }
}
if (pcCharts < MIN_TABLE_CHARTS) pcFailures.push(`| fixtures-panchanga | ${pcCharts} mapas conferidos, menos de ${MIN_TABLE_CHARTS} | |`);
// The Print -> Panchang printouts of REF 0010 (Jaipur, the three calendar modes): each day's row and the header.
let pcPrintouts: ReturnType<typeof loadPanchangPrintouts> = [];
try { pcPrintouts = loadPanchangPrintouts(join(root, 'fixtures-panchanga', 'panchang')); } catch { /* reported below */ }
if (pcPrintouts.length < 6) pcFailures.push(`| fixtures-panchanga/panchang | ${pcPrintouts.length} impressões, menos de 6 | |`);
for (const pr of pcPrintouts) {
  const [, d, mon, y] = /^\w+ (\d+) (\w+) (\d+)$/.exec(pr.shown.header.from)!;
  const first = { year: Number(y), month: MONTHS3.indexOf(mon!) + 1, day: Number(d) };
  const table = computePanchangTable(eph, first, pr.shown.days.length, { ...JAIPUR, utcOffsetHours: 5.5 }, pr.mode, { fidelity: 'pl9' });
  const v = verifyPanchangPrintout(pr.shown, table, 5.5);
  pcValues += v.values;
  pcPending.push(...v.pending.map((x) => `| Panchang ${pr.name} | ${x} |`));
  if (v.failures.length) pcFailures.push(`| Panchang ${pr.name} | ${v.failures.length} | ${v.failures[0]} |`);
}
lines.push('| Mapas | Valores | Falhas | Pendentes |', '|---|---|---|---|', `| ${pcCharts} | ${pcValues} | ${pcFailures.length} | ${pcPending.length} |`, '',
  'As páginas de nascimento (os elementos ao nascer do sol e no nascimento com os seus fins e ghatis, o nascer e o pôr do sol, Ishtkaal, Bhayat, Bhabhog, as horas, os calendários, o Avakhada e o Ghat Chakra), o Tithi Pravesh nas duas variantes, o tithi, karana e yoga dos 540 instantes dos trânsitos, e as seis impressões Print → Panchang do REF 0010 (cada dia e o cabeçalho, nos três modos do calendário). Pendentes: o dia da semana védico, o mês Chaitradi junto a uma lua cheia e as buscas de pôr do sol que chegam a outro cruzamento (docs/spec/tempo/panchanga.md). Não comparados: o calendário tâmil e, no Panchang, o nascer e o pôr da Lua, os trânsitos, a marca de auspicioso, o Ratriman e a tabela dos signos.');
if (pcFailures.length) lines.push('', '| Mapa | Falhas | Primeira |', '|---|---|---|', ...pcFailures);
if (pcPending.length) lines.push('', '| Mapa | Pendente |', '|---|---|', ...pcPending);
if (pcFailures.length) failed = true;
lines.push('');

// The Varshaphala reports PL9 printed (stage 5C): the 72 returns (2030 set), the year's chart, strengths, lords,
// yogas, Sahams, the four dashas and the twelve months, at both reference dates, and "Mean solar return" in 30 charts.
lines.push('## Varshaphala', '');
const vsFailures: string[] = [], vsPending: string[] = [];
let vsReports = 0, vsValues = 0, vsOver120 = 0, vsReturnCharts = 0;
const vsSeen = new Set<string>();
for (const [set, dir, mode, min] of [['2030', 'fixtures-varshaphala/2030', 'true', 135], ['2000', 'fixtures-varshaphala/2000', 'true', 135], ['mean', 'fixtures-varshaphala-options/mean', 'mean', 30]] as const) {
  let fixtures: ReturnType<typeof loadVarshaphalaFixtures> = [];
  try { fixtures = loadVarshaphalaFixtures(join(root, dir)); } catch { /* reported below */ }
  if (fixtures.length < min) vsFailures.push(`| ${dir} | ${fixtures.length} relatórios, menos de ${min} | |`);
  for (const fx of fixtures) {
    const natal = tempoNatal.get(fx.id);
    if (!natal) { vsFailures.push(`| ${fx.id} ${set} | sem nascimento em refset-tempo.json | |`); continue; }
    const years = Number(fx.pl9.vsyear.passed);
    // Above 120 years PL9's reports print the age asked over a chart near the birth (docs/spec/tempo/varshaphala.md):
    // only the 72 returns, which depend on no date, are compared there.
    const over = years > 120;
    if (over) vsOver120++;
    if (over && set !== '2030') continue;
    vsSeen.add(`${fx.id} ${set}`);
    const v = verifyVarshaphala(fx.pl9, computeVarshaphalaInputs(eph, natal, over ? 0 : years, mode, set === '2030'), KNOWN_VARSHAPHALA_PENDING[`${fx.id} ${set}`] ?? [], { returnsOnly: over });
    if (!over) vsReports++;
    if (set === '2030') vsReturnCharts++;
    vsValues += v.values;
    vsPending.push(...v.pending.map((x) => `| ${fx.id} ${set} | ${x} |`));
    if (v.failures.length) vsFailures.push(`| ${fx.id} ${set} | ${v.failures.length} | ${v.failures[0]} |`);
    // A known difference that no longer happens is a stale entry of the list: it fails, to be taken out.
    for (const k of v.stale) vsFailures.push(`| ${fx.id} ${set} | pendente velho | ${k} |`);
  }
}
for (const k of pendingWithoutReport(KNOWN_VARSHAPHALA_PENDING, vsSeen)) vsFailures.push(`| ${k} | pendente velho | relatório não conferido |`);
if (vsReturnCharts < 135) vsFailures.push(`| fixtures-varshaphala/2030 | os 72 retornos de ${vsReturnCharts} mapas, menos de 135 | |`);
if (vsReports < 150) vsFailures.push(`| fixtures-varshaphala | ${vsReports} relatórios conferidos, menos de 150 | |`);
lines.push('| Relatórios | Valores | Falhas | Pendentes | Acima de 120 anos |', '|---|---|---|---|---|', `| ${vsReports} | ${vsValues} | ${vsFailures.length} | ${vsPending.length} | ${vsOver120} |`, '',
  'Os 72 retornos (data, hora, graus, senhor do ano, Muntha), o mapa do ano (signos, graus, nakshatras, senhores, dignidades, R/C), Harsha e Panchavargeeya, os ofícios e o senhor do ano, os yogas Tajika, os Sahams, os quatro dashas anuais, os 12 meses e o Tripataki Chakra (casas e vedhas). Não comparados: o Kutta e o Tambira, o SB do mapa anual e, nos relatórios acima de 120 anos, tudo menos os 72 retornos (docs/spec/tempo/varshaphala.md).');
if (vsFailures.length) lines.push('', '| Relatório | Falhas | Primeira |', '|---|---|---|', ...vsFailures);
if (vsPending.length) lines.push('', '| Relatório | Pendente |', '|---|---|', ...vsPending);
if (vsFailures.length) failed = true;
lines.push('');

// The Muhurta pages PL9 printed (stage 5D): the "Muhurta" event at both reference dates over the 135 charts, and the
// thermometer's general and marriage activities.
// See docs/spec/tempo/muhurta.md.
lines.push('## Muhurta', '');
const muFailures: string[] = [], muPending: string[] = [];
let muCharts = 0, muValues = 0;
// The thermometer's other two activities: the Muhurta worksheet alone printed on 2 July 2030, 30 charts each.
const muSets: [string, string, MuhurtaInstant, 'general' | 'travelling' | 'marriage', number][] = [
  ['2000', 'fixtures-muhurta/2000', '2000', 'travelling', 135], ['2030', 'fixtures-muhurta/2030', '2030', 'travelling', 135],
  ['general', 'fixtures-muhurta-options/general', '2030-07-02', 'general', 30], ['marriage', 'fixtures-muhurta-options/marriage', '2030-07-02', 'marriage', 30],
];
for (const [set, dir, date, activity, min] of muSets) {
  let fixtures: ReturnType<typeof loadMuhurtaFixtures> = [];
  try { fixtures = loadMuhurtaFixtures(join(root, dir)); } catch { /* reported below */ }
  if (fixtures.length < min) muFailures.push(`| ${dir} | ${fixtures.length} impressões, menos de ${min} | |`);
  for (const fx of fixtures) {
    const natal = tempoNatal.get(fx.id);
    if (!natal) { muFailures.push(`| ${fx.id} ${set} | sem nascimento em refset-tempo.json | |`); continue; }
    const v = verifyMuhurta(fx.pl9, computeMuhurtaInputs(eph, natal, date, activity), KNOWN_MUHURTA_PENDING, { someLists: set === 'general' || set === 'marriage' });
    muCharts++;
    muValues += v.values;
    muPending.push(...v.pending.map((x) => `| ${fx.id} ${set} | ${x} |`));
    if (v.failures.length) muFailures.push(`| ${fx.id} ${set} | ${v.failures.length} | ${v.failures[0]} |`);
  }
}
lines.push('| Impressões | Valores | Falhas | Pendentes |', '|---|---|---|---|', `| ${muCharts} | ${muValues} | ${muFailures.length} | ${muPending.length} |`, '',
  'O mapa do Muhurta e as suas vargas (D9, D10, D16, D24, D60), posições, nakshatras e sílabas, R/C, dignidade, SB% e SB#, a Vimshopaka, a Avastha, os kakshas, Tarabala, Chandrabala, tithi, karana e yoga, as cadeias de dasha do nativo, as listas de dasha do Muhurta e do nativo, a Bhava Bala e o termômetro. Não comparados: Mandi, "BP" e "eM" nos desenhos e os textos (docs/spec/tempo/muhurta.md).');
if (muFailures.length) lines.push('', '| Impressão | Falhas | Primeira |', '|---|---|---|', ...muFailures);
if (muPending.length) lines.push('', '| Impressão | Pendente |', '|---|---|', ...muPending);
if (muFailures.length) failed = true;
lines.push('');

eph.close();
const out = resolve(root, '../../docs/relatorios/conformidade-posicoes.md');
writeFileSync(out, lines.join('\n'));
const unverified = results.filter((r) => r.error).map((r) => r.name);
console.log(`${results.filter((r) => !r.error).length} sets verified, ${failures.length} failures, ${borders.length} border cases${unverified.length ? `; not verified: ${unverified.join(', ')}` : ''}; tables: ${tables.length} charts, ${tableFailures.length} failures, ${tableBorders} border cases${missing.length ? `, not verified: ${missing.join(', ')}` : ''}; dashas: ${dashaFixtures.length} charts, ${dashaFailures.length} failures; kalachakra: ${kcFailures.length} problems; rashi: ${rashiSet.length} charts, ${rashiFailures.length} failures; ashtakavarga: ${avCharts} charts, ${avFailures.length} problems; shadbala: ${sbSet.length - sbOutside.length} charts, ${sbFailures.length} problems, ${sbPending.length} ranks pending; bhava bala: ${bbCharts} charts, ${bbFailures.length} problems; vimshopaka: ${vimCharts} charts, ${vimFailures.length} problems; transits: ${trCharts} chart-dates, ${trFailures.length} problems, ${trBorders.length} border cases, ${trPending.length} pending; panchanga: ${pcCharts} charts, ${pcFailures.length} problems, ${pcPending.length} pending; varshaphala: ${vsReports} reports, ${vsFailures.length} problems, ${vsPending.length} pending; muhurta: ${muCharts} printouts, ${muFailures.length} problems, ${muPending.length} pending${dashaMissing.length ? `, not verified: ${dashaMissing.join(', ')}` : ''}; report: ${out}`);
process.exit(failed ? 1 : 0);
