import { describe, expect, it } from "vitest";
import { summarizeEvents } from "./summarize";

describe("summarizeEvents", () => {
  it("空配列なら全て0", () => {
    expect(summarizeEvents([])).toEqual({
      pageviews: 0,
      totalCtaClicks: 0,
      ctaClicksByKind: {},
    });
  });

  it("pageviewとcta_clickを正しく集計する", () => {
    const result = summarizeEvents([
      { event_type: "pageview", section_kind: null },
      { event_type: "pageview", section_kind: null },
      { event_type: "cta_click", section_kind: "hero" },
      { event_type: "cta_click", section_kind: "hero" },
      { event_type: "cta_click", section_kind: "cta" },
    ]);

    expect(result).toEqual({
      pageviews: 2,
      totalCtaClicks: 3,
      ctaClicksByKind: { hero: 2, cta: 1 },
    });
  });

  it("section_kindが無いcta_clickは'unknown'に集計する", () => {
    const result = summarizeEvents([{ event_type: "cta_click", section_kind: null }]);
    expect(result.ctaClicksByKind).toEqual({ unknown: 1 });
  });
});
