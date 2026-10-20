import { ALL_POINTS, AV_CONTRIBUTORS, AV_PLANETS, CLASSICAL_VARGAS, SIGN_NAMES, VARGAS, calendarOf, type Ashtakavarga, type AshtakavargaOptions, type BhavaBala, type Chart, type Vimshopaka, VIMSHOPAKA_GROUPS, type Shadbala, type ShadbalaOptions, type Transits, type Panchanga, type BirthPanchanga, type PanchangTable, type VarshaphalaReport, type AnnualDashaSystem, clockTime, ghatis, type ShadbalaRow, type DashaPeriod, type Dashas, type Muhurta } from '@reverse/core';

const SIGNS = ['Ari', 'Tau', 'Gem', 'Can', 'Leo', 'Vir', 'Lib', 'Sco', 'Sag', 'Cap', 'Aqu', 'Pis'];
const REASON: Record<string, string> = {
  beyondPolarCircle: 'beyond the polar circle',
  sunriseNotFound: 'the sunrise search did not settle',
};
const two = (n: number) => String(n).padStart(2, '0');

/** Degrees, minutes and whole seconds within the sign, truncated, with the sign's abbreviation. */
/** A longitude as the Varshaphala shows it, sign then degrees to the second; rounded over the whole circle, so 29°59'59.6" is 0 of the next sign. */
export function signDms(longitude: number): string {
  const total = ((Math.round(longitude * 3600) % 1296000) + 1296000) % 1296000;
  const s = total % 108000;
  return `${SIGN_NAMES_FULL[Math.floor(total / 108000)]} ${two(Math.floor(s / 3600))}:${two(Math.floor(s / 60) % 60)}:${two(s % 60)}`;
}

export function dms(longitude: number): string {
  const sign = Math.min(11, Math.floor(longitude / 30));
  const totalSeconds = Math.min(30 * 3600 - 1, Math.floor((longitude - sign * 30) * 3600 + 1e-9));
  return `${two(Math.floor(totalSeconds / 3600))}°${two(Math.floor((totalSeconds % 3600) / 60))}'${two(totalSeconds % 60)}" ${SIGNS[sign]}`;
}

export function formatJson(chart: Chart): string {
  return JSON.stringify(chart, null, 1);
}

export function formatTable(chart: Chart): string {
  const out: string[] = [`mode: ${chart.fidelity}`];
  if (chart.fidelity === 'corrected') out.push('note: PL9 with its known defects repaired — differs from PL9 where docs/spec/corrections.md says');
  if (!chart.verified) out.push('note: outside the dates and latitudes in which the pl9 mode was checked against PL9');
  out.push('', `ayanamsha ${chart.ayanamshaDegrees.toFixed(6)}`, '');
  out.push(`${'point'.padEnd(11)} ${'longitude'.padEnd(15)} R nak pada  ${CLASSICAL_VARGAS.map((v) => v.padStart(3)).join(' ')}`);
  for (const p of ALL_POINTS) {
    const v = chart.points[p];
    if (!v) {
      out.push(`${p.padEnd(11)} —`);
      continue;
    }
    const vargas = CLASSICAL_VARGAS.map((name) => {
      const sign = chart.vargas[name][p];
      return (sign === undefined ? '—' : SIGNS[sign]!).padStart(3);
    }).join(' ');
    out.push(`${p.padEnd(11)} ${dms(v.longitude).padEnd(15)} ${v.retrograde ? 'R' : ' '} ${String(v.nakshatra + 1).padStart(3)} ${String(v.pada).padStart(4)}  ${vargas}`);
  }
  // The other vargas of PL9, one line each: the sign of every point present, in the order of the points above.
  const others = VARGAS.filter((v) => !(CLASSICAL_VARGAS as readonly string[]).includes(v));
  const present = ALL_POINTS.filter((p) => chart.points[p] !== undefined);
  const width = Math.max(...others.map((v) => v.length));
  out.push('', `${'varga'.padEnd(width)}  ${present.map((p) => p.slice(0, 3).padStart(3)).join(' ')}`);
  for (const v of others) out.push(`${v.padEnd(width)}  ${present.map((p) => SIGNS[chart.vargas[v][p]!]!.padStart(3)).join(' ')}`);
  const j = chart.jaimini;
  const karakas = (list: typeof j.karakas.seven) => list.map((k) => `${k.name}:${k.planet}`).join(' ');
  const signs = (list: number[]) => list.map((s) => SIGNS[s]).join(' ');
  out.push('', 'jaimini');
  out.push(`  karakas 7   ${karakas(j.karakas.seven)}`, `  karakas 8   ${karakas(j.karakas.eight)}`, `  karakamsha  ${SIGNS[j.karakamsha]}`);
  if (j.arudhaPadas) for (const v of ['D1', 'D9', 'D10'] as const) out.push(`  padas ${v.padEnd(5)} ${signs(j.arudhaPadas[v])}`);
  if (j.arudhaLagna !== undefined) out.push(`  arudha lagna ${SIGNS[j.arudhaLagna]}  upapada ${SIGNS[j.upapada!]}  indu lagna ${SIGNS[j.induLagna!]}`);
  if (j.specialLagnas) out.push(`  lagnas      bhava ${dms(j.specialLagnas.bhava)}  hora ${dms(j.specialLagnas.hora)}  ghatika ${dms(j.specialLagnas.ghatika)}  jaimini hora ${dms(j.specialLagnas.jaiminiHora)}`);
  out.push(`  aspects     ${j.aspects.movableFixed.map(([a, b]) => `${a}-${b}`).join(' ') || '—'}`);
  if (j.aspects.dual.length) out.push(`  dual signs  ${j.aspects.dual.join(' ')}`);
  if (chart.houses && chart.pointHouses) {
    out.push('');
    for (const [system, h] of Object.entries(chart.houses)) {
      const placed = chart.pointHouses[system as keyof typeof chart.houses];
      out.push(`${system.padEnd(8)} ${h.middles.map((m) => dms(m)).join(' | ')}`);
      out.push(`${''.padEnd(8)} ${ALL_POINTS.filter((p) => placed[p] !== undefined).map((p) => `${p}:${placed[p]}`).join(' ')}`);
    }
  }
  if (chart.missing.length) {
    out.push('');
    for (const m of chart.missing) out.push(`missing: ${m.what} (${REASON[m.reason] ?? m.reason})`);
  }
  return out.join('\n') + '\n';
}

/** A Julian day as DD-MM-YYYY HH:MM on a clock `utcOffsetHours` ahead of UT, the minute truncated as PL9 shows it. */
export function calendarText(jdUt: number, utcOffsetHours: number): string {
  const c = calendarOf(jdUt + utcOffsetHours / 24);
  return `${two(c.day)}-${two(c.month)}-${String(c.year).padStart(4, '0')} ${two(c.hour)}:${two(c.minute)}`;
}

/** One line per period, indented by level, with its start and end on the chart's clock. */
export function formatDashas(dashas: Dashas, utcOffsetHours: number): string {
  const o = dashas.options;
  const out: string[] = [`mode: ${dashas.fidelity}`];
  if (dashas.fidelity === 'corrected') out.push('note: PL9 with its known defects repaired — differs from PL9 where docs/spec/corrections.md says');
  out.push(`system: ${dashas.system} (base ${o.base}, year ${o.yearDays}, ${o.levels} levels)`);
  if (dashas.kalachakra) {
    const k = dashas.kalachakra;
    out.push(`${k.savya ? 'savya' : 'apasavya'}, deha: ${SIGN_NAMES[k.deha]}, jeeva: ${SIGN_NAMES[k.jeeva]}`);
  }
  out.push(`clock: UT${utcOffsetHours >= 0 ? '+' : ''}${utcOffsetHours}`, '');
  const walk = (p: DashaPeriod) => {
    out.push(`${'  '.repeat(p.level - 1)}${p.lord}`.padEnd(20) + `${calendarText(p.start, utcOffsetHours)}  ${calendarText(p.end, utcOffsetHours)}`);
    p.sub?.forEach(walk);
  };
  dashas.periods.forEach(walk);
  return out.join('\n') + '\n';
}

/** The Ashtakavarga as text: twelve columns, Aries to Pisces, for each chart and each reduction; then the pindas. */
export function formatAshtakavarga(av: Ashtakavarga & { options: AshtakavargaOptions; fidelity: string }): string {
  const row = (name: string, xs: readonly (number | string)[]) => `${name.padEnd(22)}${xs.map((x) => String(x).padStart(4)).join('')}`;
  const lines = [`fidelity: ${av.fidelity}; method: ${av.options.method}; ekadhipatya: ${av.options.ekadhipatya}; virgo: ${av.options.virgoMultiplier}`, ''];
  lines.push(row('', SIGNS));
  for (const c of AV_CONTRIBUTORS) lines.push(row(c, av.bhinna[c]));
  lines.push(row('sarva', av.sarva), '');
  for (const p of AV_PLANETS) lines.push(row(`${p} trikona`, av.trikona[p]));
  for (const p of AV_PLANETS) lines.push(row(`${p} ekadhipatya`, av.ekadhipatya[p]));
  lines.push('', `${''.padEnd(10)}${['rashi', 'graha', 'sodhya'].map((x) => x.padStart(8)).join('')}`);
  for (const p of AV_PLANETS) lines.push(`${p.padEnd(10)}${[av.pindas[p].rashi, av.pindas[p].graha, av.pindas[p].sodhya].map((x) => String(x).padStart(8)).join('')}`);
  return lines.join('\n') + '\n';
}

const SB_ROWS: (keyof ShadbalaRow)[] = [
  'uchcha', 'saptavargaja', 'ojhayugma', 'kendradi', 'drekkana', 'sthana', 'dig', 'nathonnatha', 'paksha', 'tribhaga', 'varsha', 'masa',
  'vara', 'hora', 'ayana', 'yuddha', 'kala', 'cheshta', 'naisargika', 'drik', 'total', 'rupas', 'minimum', 'ratio', 'rank', 'ishta',
  'kashta', 'strong',
];
const SB_COUNTS = new Set<keyof ShadbalaRow>(['minimum', 'rank', 'strong']);

/** The Shadbala as text: a column per planet, a row per part, two decimals; then the planetary wars. */
export function formatShadbala(sb: Shadbala & { options: ShadbalaOptions; fidelity: string; cheshtaOutsideSeries: string[] }): string {
  const planets = Object.keys(sb.planets) as (keyof Shadbala['planets'])[];
  const o = sb.options;
  const lines = [`fidelity: ${sb.fidelity}; drekkana: ${o.drekkana}; dig: ${o.digBala}; mercury paksha: ${o.mercuryPaksha}; mercury drik: ${o.mercuryDrik}; jupiter and mercury drik: ${o.jupiterMercuryDrik}`, ''];
  lines.push(`${''.padEnd(14)}${planets.map((p) => p.padStart(9)).join('')}`);
  for (const part of SB_ROWS) {
    lines.push(`${part.padEnd(14)}${planets.map((p) => { const v = sb.planets[p][part]; return (SB_COUNTS.has(part) ? String(v) : v.toFixed(2)).padStart(9); }).join('')}`);
  }
  for (const w of sb.war) lines.push('', `war: ${w.planets.join(' and ')}, won by ${w.winner}`);
  if (sb.cheshtaOutsideSeries.length) lines.push('', `cheshta outside the series of cycles: ${sb.cheshtaOutsideSeries.join(', ')}`);
  return lines.join('\n') + '\n';
}

/** The Bhava Bala as text: a row per house, its sign and degree, the five parts, the total and the rupas. */
export function formatBhavaBala(bb: BhavaBala & { options: ShadbalaOptions; fidelity: string; cheshtaOutsideSeries: string[] }): string {
  const o = bb.options;
  const lines = [`fidelity: ${bb.fidelity}; drekkana: ${o.drekkana}; dig: ${o.digBala}; mercury paksha: ${o.mercuryPaksha}; mercury drik: ${o.mercuryDrik}; jupiter and mercury drik: ${o.jupiterMercuryDrik}`, ''];
  const head = ['lord', 'dig', 'drishti', 'planets', 'day-night', 'total', 'rupas'];
  lines.push(`${'house'.padEnd(6)}${'sign'.padEnd(6)}${'deg'.padStart(4)}${head.map((h) => h.padStart(11)).join('')}`);
  bb.houses.forEach((h, i) => {
    const values = [h.lord, h.dig, h.drishti, h.occupants, h.dayNight, h.total, h.rupas].map((v) => v.toFixed(2).padStart(11)).join('');
    lines.push(`${String(i + 1).padStart(5)} ${SIGNS[h.sign]!.padEnd(6)}${String(h.degree).padStart(4)}${values}`);
  });
  if (bb.cheshtaOutsideSeries.length) lines.push('', `cheshta outside the series of cycles (the lords' strength is not PL9's): ${bb.cheshtaOutsideSeries.join(', ')}`);
  return lines.join('\n') + '\n';
}

/** The Vimshopaka as text: a row per planet with the four groups, then the dignity of each planet in each of the 16 vargas. */
export function formatVimshopaka(v: Vimshopaka & { fidelity: string }): string {
  const planets = Object.keys(v.planets) as (keyof Vimshopaka['planets'])[];
  const lines = [`fidelity: ${v.fidelity}`, '', `${''.padEnd(10)}${VIMSHOPAKA_GROUPS.map((g) => g.padStart(15)).join('')}`];
  for (const p of planets) lines.push(`${p.padEnd(10)}${VIMSHOPAKA_GROUPS.map((g) => v.planets[p].scores[g].toFixed(2).padStart(15)).join('')}`);
  lines.push('', 'dignity: 1 exalted, 2 moolatrikona, 3 own, 4 great friend, 5 friend, 6 neutral, 7 enemy, 8 great enemy, 9 debilitated', '');
  lines.push(`${''.padEnd(6)}${planets.map((p) => p.slice(0, 3).padStart(5)).join('')}`);
  for (const varga of CLASSICAL_VARGAS) lines.push(`${varga.padEnd(6)}${planets.map((p) => String(v.planets[p].dignities[varga]).padStart(5)).join('')}`);
  return lines.join('\n') + '\n';
}

/** The transits as text: the positions, a row per planet with its kaksha, and the rest of PL9's Gochara data. */
export function formatTransits(t: Transits & { dashas: { vimshottari: string; yogini: string; ashtottari: string; narayana: string | null } }): string {
  const lines = [`fidelity: ${t.fidelity}`, `at: JD ${t.at.jdUt.toFixed(6)} UT, latitude ${t.at.latitude}, longitude ${t.at.longitudeEast} east`, ''];
  for (const [p, v] of Object.entries(t.points)) lines.push(`${p.padEnd(10)}${dms(v.longitude)}${v.retrograde ? ' R' : ''}`);
  lines.push('', `${''.padEnd(10)}${['sign', 'kaksha', 'lord', 'bindu', 'ash', 'sarva', 'shadbala'].map((h) => h.padStart(9)).join('')}`);
  for (const [p, k] of Object.entries(t.kakshas ?? {})) {
    const sb = t.shadbalaRatio?.[p as keyof typeof t.shadbalaRatio];
    lines.push(`${p.padEnd(10)}${[SIGNS[k.sign]!, String(k.kaksha), k.lord, String(k.bindu), String(k.ash), String(k.sarva), sb === undefined ? '—' : sb.toFixed(2)].map((x) => x.padStart(9)).join('')}`);
  }
  lines.push('', `tarabala    ${t.tarabala.count} ${t.tarabala.name} ${t.tarabala.good ? 'good' : 'bad'}`, `chandrabala ${t.chandrabala.house} ${t.chandrabala.good ? 'good' : 'bad'}`);
  for (const [s, v] of Object.entries(t.dashas)) lines.push(`${s.padEnd(12)}${v ?? '—'}`);
  for (const m of t.missing) lines.push(`missing     ${m.what} (${m.reason})`);
  return lines.join('\n') + '\n';
}

/** The panchanga of an instant as text: the sunrise, sunset and next sunrise, the elements at sunrise with their ends and at the instant. */
export function formatPanchanga(p: Panchanga): string {
  const tz = p.at.utcOffsetHours ?? 0;
  const clock = (jd: number | null) => (jd === null ? '—' : clockTime(jd, tz));
  const lines = [`fidelity: ${p.fidelity}`, `clock: UT${tz >= 0 ? '+' : ''}${tz}`, '', `sunrise    ${clock(p.sunrise)}`, `sunset     ${clock(p.sunset)}`, `next       ${p.nextSunrise === null ? '—' : `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][(Math.floor(p.nextSunrise + 0.5 + tz / 24) + 1) % 7]} ${clock(p.nextSunrise)}`}`, ''];
  for (const k of ['tithi', 'karana', 'yoga', 'nakshatra'] as const) {
    const s = p.atSunrise?.[k];
    if (!s || p.sunrise === null) { lines.push(`${k.padEnd(10)} ${'—'.padEnd(22)} at birth ${p.now[k].name}`); continue; }
    let g = s.endJdUt - p.sunrise;
    if (g < 0) g += 1;
    lines.push(`${k.padEnd(10)} ${s.name.padEnd(22)} ends ${clockTime(s.endJdUt, tz)}  ${ghatis(g)} ghatis  at birth ${p.now[k].name}`);
  }
  lines.push('', `vara       ${p.vara === null ? '—' : ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][p.vara]}`, `paksha     ${p.paksha}`);
  for (const m of p.missing) lines.push(`missing    ${m.what} (${m.reason})`);
  return lines.join('\n') + '\n';
}

/** The panchanga of a birth as text: that of the instant, then the times, calendars, Avakhada and Ghat Chakra. */
export function formatBirthPanchanga(p: BirthPanchanga): string {
  const lines = [formatPanchanga(p).trimEnd(), '', `ishtkaal   ${p.ishtkaalDays === null ? '—' : `${ghatis(p.ishtkaalDays)} ghatis`}`, `bhayat     ${ghatis(p.at.jdUt - p.moonNakEntry)} ghatis`, `bhabhog    ${ghatis(p.moonNakExit - p.moonNakEntry)} ghatis`,
    `chaitradi  ${p.chaitradi.samvat} ${p.chaitradi.name}`, `kartikadi  ${p.kartikadi.samvat} ${p.kartikadi.name}`, `saka       ${p.saka}`, `season     ${p.season}`, `ayana      ${p.ayana}/${p.gola}`, ''];
  for (const [k, v] of Object.entries(p.avakhada)) lines.push(`${k.padEnd(14)} ${v ?? '-'}`);
  lines.push('');
  for (const [k, v] of Object.entries(p.ghat)) lines.push(`ghat ${k.padEnd(9)} ${v ?? '-'}`);
  return lines.join('\n') + '\n';
}

/** The Print -> Panchang table as text: the header, then a row a day (times in the clock of the place, the ends
 * counted from the day's midnight, "..." past the next sunrise) and a line for a tithi wholly inside the day. */
export function formatPanchangTable(t: PanchangTable, utcOffsetHours: number): string {
  const hms = (seconds: number) => `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor(seconds / 60) % 60).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  const a = Math.round(t.ayanamshaDegrees * 3600);
  const paksha = t.month.paksha === 'shukla' ? 'Shukla' : 'Krishna';
  const lines = [`${t.month.name} ${paksha}, Vikram ${t.vikram}, Saka ${t.saka}, ayanamsha -${hms(a)}`, ''];
  for (const r of t.rows) {
    const midnight = Date.UTC(r.year, r.month - 1, r.day) / 86400000 + 2440587.5 - utcOffsetHours / 24;
    const since = (jd: number) => hms(Math.round((jd - midnight) * 86400));
    const end = (jd: number) => (jd >= r.nextSunrise ? '...' : since(jd));
    const date = `${String(r.day).padStart(2, '0')}-${String(r.month).padStart(2, '0')}-${r.year}`;
    const s = r.atSunrise;
    lines.push(`${date} ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][r.vara]}  ${since(r.sunrise)} ${since(r.sunset)}  ${s.tithi.name.padEnd(20)} ${end(s.tithi.endJdUt).padEnd(8)}  ${s.nakshatra.name.padEnd(14)} ${end(s.nakshatra.endJdUt).padEnd(8)}  ${s.yoga.name.padEnd(10)} ${end(s.yoga.endJdUt).padEnd(8)}  ${s.karana.name.padEnd(11)} ${end(s.karana.endJdUt)}`);
    if (r.extraTithi) lines.push(`${' '.repeat(35)}then ${r.extraTithi.name.padEnd(15)} ${since(r.extraTithi.endJdUt)}`);
  }
  return lines.join('\n') + '\n';
}

const SIGN_NAMES_FULL = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** The Varshaphala report as text: the return, Muntha and lords, strengths, yogas, Sahams and one annual dasha. */
export function formatVarshaphala(r: VarshaphalaReport, dasha: AnnualDashaSystem, utcOffsetHours: number): string {
  const v = r.varshaphala;
  const two = (n: number) => String(n).padStart(2, '0');
  const at = (jd: number) => {
    // Seconds cut, as PL9 prints the return.
    const d = new Date(Math.floor((jd + utcOffsetHours / 24 - 2440587.5) * 86400) * 1000);
    return `${d.getUTCDate()} ${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())}:${two(d.getUTCSeconds())}`;
  };
  const short = (jd: number) => {
    const d = new Date(Math.floor((jd + utcOffsetHours / 24 - 2440587.5) * 1440) * 60000);
    return `${two(d.getUTCDate())}-${two(d.getUTCMonth() + 1)}-${d.getUTCFullYear()} ${two(d.getUTCHours())}:${two(d.getUTCMinutes())}`;
  };
  const dms = signDms;
  const clock = utcOffsetHours === 0 ? 'UT' : `UT${utcOffsetHours > 0 ? '+' : ''}${utcOffsetHours}`;
  const lines = [`fidelity: ${v.fidelity}`, `years      ${v.years}`, `return     ${at(v.jdUt)} ${clock}`, `muntha     ${v.munthaLongitude === null ? '—' : dms(v.munthaLongitude)}`];
  if (r.lords) {
    lines.push(`year lord  ${r.lords.yearLord}`, '');
    for (const [k, p] of Object.entries(r.lords.panchadhikaris)) lines.push(`${k.padEnd(16)} ${p}`);
  }
  lines.push('', 'planet     graha  uchcha hudda drekk. nav.   total  harsha');
  for (const [p, b] of Object.entries(r.panchavargeeya)) {
    lines.push(`${p.padEnd(10)} ${[b.graha, b.uchcha, b.hudda, b.drekkana, b.navamsha, b.total].map((x) => x.toFixed(2).padStart(6)).join(' ')} ${(r.harsha ? String(r.harsha[p as keyof typeof r.harsha].total) : '—').padStart(6)}`);
  }
  lines.push('', 'yogas');
  for (const y of r.yogas.filter((x) => x.present)) lines.push(`  ${y.name}${y.planets.length ? ': ' + y.planets.map((p) => p.join(' and ')).join(', ') : ''}`);
  if (r.sahams) {
    lines.push('');
    for (const s of r.sahams) lines.push(`${s.name.padEnd(12)} ${s.english.padEnd(18)} ${dms(s.longitude).padEnd(20)} ${s.lord}`);
  }
  lines.push('');
  for (const p of r.dashas[dasha]) lines.push(`${dasha.padEnd(10)} ${String(p.lord).padEnd(8)} ${short(Math.max(p.startJdUt, v.jdUt))}  to ${short(p.endJdUt)}`);
  if (r.tripataki) {
    lines.push('');
    for (const [k, cell] of Object.entries(r.tripataki.cell)) {
      lines.push(`tripataki  ${k.padEnd(8)} ${SIGN_NAMES_FULL[cell - 1]!.padEnd(12)} ${(r.tripataki.vedha[k as keyof typeof r.tripataki.vedha] ?? []).join(' ')}`.trimEnd());
    }
  }
  lines.push('', 'month lord');
  for (const m of r.missing) lines.splice(4, 0, `missing    ${m.what} (${m.reason})`);
  for (const m of r.months) lines.push(`${String(m.months + 1).padStart(2)}  ${at(m.jdUt)}  ${m.monthLord ?? '—'}`);
  return lines.join('\n') + '\n';
}

/** The Muhurta of an instant as text: the points with dignity, strengths and Avastha, the kakshas, the Gochara data, the thermometer. */
export function formatMuhurta(m: Muhurta): string {
  const DIG = ['', 'exalted', 'moolatrikona', 'own', 'great friend', 'friend', 'neutral', 'enemy', 'great enemy', 'debilitated'];
  const lines = [`fidelity: ${m.fidelity}`, `at: JD ${m.at.jdUt.toFixed(6)} UT, latitude ${m.at.latitude}, longitude ${m.at.longitudeEast} east`, ''];
  lines.push(`${''.padEnd(10)}${''.padEnd(18)}   ${'dignity'.padEnd(13)} ${'SB%'.padStart(5)} ${'SB#'.padStart(3)} ${'VB'.padStart(5)} avastha`);
  if (m.points.lagna) lines.push(`${'lagna'.padEnd(10)}${dms(m.points.lagna.longitude)}`);
  for (const [p, q] of Object.entries(m.planets)) {
    const pos = m.points[p as keyof typeof m.points]!;
    const sb = q.shadbalaRatio === null ? '—' : q.shadbalaRatio.toFixed(2);
    // PL9 never marks the nodes retrograde.
    const retro = q.retrograde && p !== 'rahu' && p !== 'ketu';
    lines.push(`${p.padEnd(10)}${dms(pos.longitude)}${retro ? ' R' : '  '}${q.combust ? 'c' : ' '} ${DIG[q.dignity]!.padEnd(13)} ${sb.padStart(5)} ${(q.shadbalaStrong ?? '—').toString().padStart(3)} ${q.vimshopaka.shadvarga.toFixed(1).padStart(5)} ${q.avastha}`);
  }
  if (m.kakshas) {
    lines.push('', `${''.padEnd(10)}${['sign', 'kaksha', 'lord', 'bindu', 'ash', 'sarva'].map((h) => h.padStart(9)).join('')}`);
    for (const [p, k] of Object.entries(m.kakshas)) lines.push(`${p.padEnd(10)}${[SIGNS[k.sign]!, String(k.kaksha), k.lord, String(k.bindu), String(k.ash), String(k.sarva)].map((x) => x.padStart(9)).join('')}`);
  }
  const g = m.gochara;
  lines.push('', `tarabala    ${g.tarabala.count} ${g.tarabala.name} ${g.tarabala.good ? 'good' : 'bad'}`, `chandrabala ${g.chandrabala.house} ${g.chandrabala.good ? 'good' : 'bad'}`,
    `tithi       ${g.tithi.name}`, `karana      ${g.karana.name}`, `yoga        ${g.yoga.name}`, `nakshatra   ${g.nakshatra.name}`);
  for (const [s, v] of Object.entries(g.dashas)) lines.push(`${s.padEnd(12)}${v ?? '—'}`);
  lines.push('', `thermometer ${m.thermometer.activity} ${m.thermometer.score} of 13.5`);
  for (const x of m.missing) lines.push(`missing     ${x.what} (${x.reason})`);
  return lines.join('\n') + '\n';
}
