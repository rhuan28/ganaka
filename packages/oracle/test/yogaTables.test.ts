import { describe, expect, it } from 'vitest';
import { parseYogas, verifyYogas } from '../src/yogaTables';

describe('the raw yoga file', () => {
  it('is read by chart, with the charts that have none', () => {
    const y = parseYogas('yoga\tREF 0010\t50\tbenefic\nyoga\tREF 0010\t102\tmalefic\nnone\tREF 0011\n');
    expect(y.get('REF 0010')).toEqual([{ number: 50, section: 'benefic' }, { number: 102, section: 'malefic' }]);
    expect(y.get('REF 0011')).toEqual([]);
  });

  it('refuses a malformed line and a number twice in a chart', () => {
    expect(() => parseYogas('yoga\tREF 0010\tfifty\tbenefic\n')).toThrow();
    expect(() => parseYogas('yoga\tREF 0010\t50\tgood\n')).toThrow();
    expect(() => parseYogas('yoga\tREF 0010\t50\tbenefic\nyoga\tREF 0010\t50\tmixed\n')).toThrow(/twice/);
  });
});

describe('the comparison', () => {
  it('names each yoga found by one side only, among the numbers checked', () => {
    const shown = [{ number: 50, section: 'benefic' as const }, { number: 65, section: 'benefic' as const }];
    expect(verifyYogas(shown, new Set([50, 56, 300]), [50, 56, 65])).toEqual([
      '56: the engine finds it, PL9 does not',
      '65: PL9 finds it, the engine does not',
    ]);
  });
});
