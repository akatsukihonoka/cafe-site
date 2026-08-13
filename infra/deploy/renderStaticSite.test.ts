import { describe, expect, it } from "vitest";
import { renderStaticSiteHtml } from "./renderStaticSite";
import { DEMO_DESIGNER_OUTPUT, DEMO_FRONTEND_OUTPUT } from "@/components-library/demoData";

describe("renderStaticSiteHtml", () => {
  const html = renderStaticSiteHtml(DEMO_FRONTEND_OUTPUT, DEMO_DESIGNER_OUTPUT);

  it("有効なHTML文書として出力する", () => {
    expect(html).toMatch(/^<!doctype html>/);
    expect(html).toContain("<html lang=\"ja\">");
  });

  it("pageTitleをtitleとh1に含める", () => {
    expect(html).toContain(`<title>${DEMO_FRONTEND_OUTPUT.pageTitle}</title>`);
    expect(html).toContain(`>${DEMO_FRONTEND_OUTPUT.pageTitle}</h1>`);
  });

  it("全セクションの見出し・本文を含める", () => {
    for (const section of DEMO_FRONTEND_OUTPUT.sections) {
      expect(html).toContain(section.heading);
      expect(html).toContain(section.body);
    }
  });

  it("HTML特殊文字をエスケープする", () => {
    const escaped = renderStaticSiteHtml(
      { pageTitle: "A & B <script>", sections: [{ kind: "hero", layoutVariant: "a", heading: "H<1>", body: "b" }] },
      DEMO_DESIGNER_OUTPUT
    );
    expect(escaped).not.toContain("<script>");
    expect(escaped).toContain("A &amp; B &lt;script&gt;");
  });

  it("Tailwindクラスに依存しない(styleのみで表現されている)", () => {
    expect(html).not.toMatch(/class="/);
  });

  it("analyticsを渡さない場合は計測タグを含まない", () => {
    expect(html).not.toContain("/api/analytics/track");
  });

  it("analyticsを渡すと計測タグ(pageview送信・CTAクリック計測)を埋め込む", () => {
    const withAnalytics = renderStaticSiteHtml(DEMO_FRONTEND_OUTPUT, DEMO_DESIGNER_OUTPUT, {
      projectId: "proj-123",
      studioOrigin: "https://studio.example.com",
    });

    expect(withAnalytics).toContain("https://studio.example.com/api/analytics/track");
    expect(withAnalytics).toContain("proj-123");
    expect(withAnalytics).toContain('send("pageview")');
    expect(withAnalytics).toContain("data-cta=\"true\"");
  });

  it("projectIdに</script>相当の文字列が含まれてもスクリプトタグを閉じない", () => {
    const withAnalytics = renderStaticSiteHtml(DEMO_FRONTEND_OUTPUT, DEMO_DESIGNER_OUTPUT, {
      projectId: "</script><script>alert(1)</script>",
      studioOrigin: "https://studio.example.com",
    });
    expect(withAnalytics).not.toContain("</script><script>alert(1)</script>");
  });
});
