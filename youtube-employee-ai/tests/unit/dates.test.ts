import { describe, expect, it } from 'vitest';
import { yesterdayInJST } from '@/lib/dates';

describe('yesterdayInJST', () => {
  it('JSTで日付が変わる直前(UTC 14:59 = JST 23:59)は、JSTの前日を返す', () => {
    const now = new Date('2026-07-22T14:59:00Z');
    const result = yesterdayInJST(now);

    expect(result.toISOString().slice(0, 10)).toBe('2026-07-21');
  });

  it('JSTで日付が変わった直後(UTC 15:00 = JST 翌0:00)は、変わった日のJSTの前日を返す', () => {
    const now = new Date('2026-07-22T15:00:00Z');
    const result = yesterdayInJST(now);

    expect(result.toISOString().slice(0, 10)).toBe('2026-07-22');
  });
});
