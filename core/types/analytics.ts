export type AnalyticsEventType = "pageview" | "cta_click";

export interface AnalyticsEventInput {
  projectId: string;
  type: AnalyticsEventType;
  /** cta_clickの場合、どのセクション種別のCTAがクリックされたか。 */
  sectionKind?: string;
}

export interface AnalyticsSummary {
  pageviews: number;
  totalCtaClicks: number;
  ctaClicksByKind: Record<string, number>;
}
