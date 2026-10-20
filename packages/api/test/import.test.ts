import { describe, expect, it } from 'vitest';
import { buildServer } from '../src/server';
import { fakeSky } from '../../core/test/fakeSky';

const make = () => buildServer({ eph: fakeSky, keys: { k1: 'tester' }, rateLimitPerMinute: 100, sourceUrl: 'x' });
const chartFile = (longitude: string) => `<BirthData><BirthInfo>
  <FirstName>A</FirstName><LastName>B</LastName><BirthDate>2451545.0000000</BirthDate><Longitude>${longitude}</Longitude>
  <Latitude>28.6000000</Latitude><TimeZone>-5.5000000</TimeZone><DST>0.0000000</DST>
</BirthInfo></BirthData>`;
const post = (app: ReturnType<typeof make>, body: unknown, key: string | null = 'k1') =>
  app.inject({ method: 'POST', url: '/v1/import/pl9', payload: body as object, headers: key ? { 'x-api-key': key } : {} });

describe('POST /v1/import/pl9', () => {
  it('reads each file and keeps the order', async () => {
    const r = await post(make(), { files: [{ name: 'a.xml', text: chartFile('-77.2') }, { name: 'b.xml', text: chartFile('x') }, { name: 'c.xml', text: chartFile('10') }] });
    expect(r.statusCode).toBe(200);
    const results = r.json().results;
    expect(results.map((x: { ok: boolean }) => x.ok)).toEqual([true, false, true]);
    expect(results.map((x: { name: string }) => x.name)).toEqual(['a.xml', 'b.xml', 'c.xml']);
    expect(results[1].error).toMatch(/Longitude/);
    expect(results[0].chart.birth.longitudeEast).toBeCloseTo(77.2, 9);
    expect(results[2].chart.birth.longitudeEast).toBeCloseTo(-10, 9);
  });
  it('refuses an empty list or more than 1000 files', async () => {
    const app = make();
    const empty = await post(app, { files: [] });
    expect([empty.statusCode, empty.json().error.code]).toEqual([400, 'invalid-request']);
    const many = await post(app, { files: Array.from({ length: 1001 }, (_, i) => ({ name: `${i}.xml`, text: 'x' })) });
    expect([many.statusCode, many.json().error.code]).toEqual([400, 'invalid-request']);
  });
  it('asks for a key', async () => {
    expect((await post(make(), { files: [{ name: 'a.xml', text: chartFile('1') }] }, null)).statusCode).toBe(401);
  });
});
