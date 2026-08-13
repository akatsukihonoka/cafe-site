import type { AnalyticsEventType, AnalyticsSummary } from "../types/analytics";

export interface RawEventRow {
  event_type: AnalyticsEventType;
  section_kind: string | null;
}

/** Supabaseから取得した生イベント行を、Advisorエージェントが読める集計値に変換する純粋関数。 */
export function summarizeEvents(rows: RawEventRow[]): AnalyticsSummary {
  const summary: AnalyticsSummary = {
    pageviews: 0,
    totalCtaClicks: 0,
    ctaClicksByKind: {},
  };

  for (const row of rows) {
    if (row.event_type === "pageview") {
      summary.pageviews += 1;
      continue;
    }
    if (row.event_type === "cta_click") {
      summary.totalCtaClicks += 1;
      const kind = row.section_kind ?? "unknown";
      summary.ctaClicksByKind[kind] = (summary.ctaClicksByKind[kind] ?? 0) + 1;
    }
  }

  return summary;
}
