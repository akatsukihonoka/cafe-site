const JST_OFFSET_MS = 9 * 60 * 60 * 1000;

/** JST(UTC+9)の暦日で「昨日」を返す(00:00 UTCに正規化した日付として)。 */
export function yesterdayInJST(now: Date = new Date()): Date {
  const nowJST = new Date(now.getTime() + JST_OFFSET_MS);
  return new Date(Date.UTC(nowJST.getUTCFullYear(), nowJST.getUTCMonth(), nowJST.getUTCDate() - 1));
}
