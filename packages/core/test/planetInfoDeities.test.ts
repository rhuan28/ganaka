import { describe, expect, it } from 'vitest';
import { computePlanetInfo, computeYogaContext, shashtiamsha, vargaDegree, vargaDeity } from '../src';
import { BY_PADA_NAAMAKSHAR } from '../src/panchanga/tables';
import { fakeSky } from './fakeSky';

describe('the varga deities', () => {
  it("give the nakshatra's deity in the D1 and the part's in each varga, as REF 0010's page", () => {
    expect(vargaDeity(106.515, 'D1')).toBe('jiva'); // the Lagna in Pushya
    expect(vargaDeity(42.4, 'D1')).toBe('brahma'); // the Sun in Rohini
    expect(vargaDeity(42.4, 'D2')).toBe('pitar'); // Taurus, an even sign: the order reversed
    expect(vargaDeity(26.9, 'D2')).toBe('pitar'); // Aries, odd: the second half
    expect(vargaDeity(127.25, 'D3')).toBe('narada');
    expect(vargaDeity(42.4, 'D60')).toBe('kantaka');
  });
  it('start the cycles of the D9 and the D45 by the sign type', () => {
    expect(vargaDeity(1, 'D9')).toBe('deva'); // movable
    expect(vargaDeity(31, 'D9')).toBe('manushya'); // fixed
    expect(vargaDeity(61, 'D9')).toBe('rakshasa'); // dual
    expect(vargaDeity(60.5, 'D45')).toBe('vishnu'); // dual: the first part starts at the third
  });
  it("cut the Trimshamsha at the odd signs' limits in every sign, the list reversed in even signs", () => {
    expect(vargaDeity(5, 'D30')).toBe('agni'); // the end belongs to the part
    expect(vargaDeity(30 + 3, 'D30')).toBe('varuna'); // Taurus: the list reversed
    expect(vargaDeity(30 + 11, 'D30')).toBe('indra'); // Taurus 11°: the odd limit (10) puts it in the 3rd part, not the 2nd
  });
  it('number the Shashtiamshas backwards in even signs, with their nature', () => {
    expect(shashtiamsha(0.2)).toEqual({ number: 1, nature: 'malefic' });
    expect(shashtiamsha(30.2)).toEqual({ number: 60, nature: 'benefic' });
    expect(shashtiamsha(42.4)).toEqual({ number: 36, nature: 'malefic' }); // Kantaka
  });
  it('give the degree within an equal varga, none for the Trimshamsha', () => {
    expect(vargaDegree(106.515, 'D2')).toBeCloseTo(3.03, 9); // PL9's Special page: 03:01
    expect(vargaDegree(42.4, 'D30')).toBeNull();
  });
  it('give every point its deities, the Lagna only where it is defined', () => {
    const birth = { jdUt: 2449865.4694144, latitude: 44.2377, longitudeEast: 150.6744 };
    const info = computePlanetInfo(fakeSky, birth, {}, { fidelity: 'corrected' });
    expect(Object.keys(info.deities.sun!)).toHaveLength(16);
    expect(info.deities.lagna).toBeDefined();
    expect(computePlanetInfo(fakeSky, { ...birth, latitude: 89 }, {}, { fidelity: 'corrected' }).deities.lagna).toBeUndefined();
  });
});

describe('the navamsha grid', () => {
  it("gives the 108 navamshas' signs and numbers from the Lagna's, and each point's navamsha", () => {
    const info = computePlanetInfo(fakeSky, { jdUt: 2449865.4694144, latitude: 44.2377, longitudeEast: 150.6744 }, {}, { fidelity: 'corrected' });
    expect(info.navamshas).toHaveLength(108);
    expect(info.navamshas[0]!.sign).toBe(0); // Aries' first navamsha is Aries
    expect(info.navamshas[3]!.sign).toBe(3);
    expect(info.navamshas[info.navamshaOf.lagna!]!.number).toBe(1);
    expect(info.navamshas[info.navamshaOf.sun!]!.number).toBe(info.points.sun.navamshaNumber);
  });
  it("gives each point its pada's syllable, PL9's Nama", () => {
    const info = computePlanetInfo(fakeSky, { jdUt: 2449865.4694144, latitude: 44.2377, longitudeEast: 150.6744 }, {}, { fidelity: 'corrected' });
    for (const [pt, pada] of Object.entries(info.navamshaOf)) expect(info.nama[pt as keyof typeof info.nama]).toBe(BY_PADA_NAAMAKSHAR[pada!] ?? null);
    // As PL9's Animated transits I (capture 101): Ardra 4 "Cha", Uttara Bhadrapada 4 "Jya", Dhanishta 3 "Goo" and 4 "Gay".
    expect([5 * 4 + 3, 25 * 4 + 3, 22 * 4 + 2, 22 * 4 + 3].map((i) => BY_PADA_NAAMAKSHAR[i])).toEqual(['Cha', 'Jya', 'Goo', 'Gay']);
  });
  it("gives the nine's natures as the yogas read them, the functional ones none without the Lagna", () => {
    const birth = { jdUt: 2449865.4694144, latitude: 44.2377, longitudeEast: 150.6744 };
    const info = computePlanetInfo(fakeSky, birth, {}, { fidelity: 'corrected' });
    expect(info.natures.functional).toEqual(computeYogaContext(fakeSky, birth, { fidelity: 'corrected' }).natures.functional);
    expect(info.natures.natural.jupiter).toBe('benefic');
    expect(computePlanetInfo(fakeSky, { ...birth, latitude: 89 }, {}, { fidelity: 'corrected' }).natures.functional).toBeNull();
  });
  it("gives each varga's functional natures by its own Lagna, signs and degrees", async () => {
    const { computePositions, functionalNatures, resolveNatures, vargaSign } = await import('../src/index');
    const birth = { jdUt: 2449865.4694144, latitude: 44.2377, longitudeEast: 150.6744 };
    const info = computePlanetInfo(fakeSky, birth, {}, { fidelity: 'pl9' });
    const pos = computePositions(fakeSky, birth, { fidelity: 'pl9' });
    const at = (lon: number) => vargaSign(lon, 'D9', 'pl9') * 30 + vargaDegree(lon, 'D9')!;
    const lons = Object.fromEntries(Object.entries(pos.points).filter(([k]) => ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'rahu', 'ketu', 'lagna'].includes(k)).map(([k, p]) => [k, at(p!.longitude)]));
    expect(info.vargaNatures.D9).toEqual(functionalNatures(lons as never, resolveNatures(undefined)));
    expect(Object.keys(info.vargaNatures)).toHaveLength(15);
    expect(computePlanetInfo(fakeSky, { ...birth, latitude: 89 }, {}, { fidelity: 'pl9' }).vargaNatures.D9).toBeNull();
  });
});
