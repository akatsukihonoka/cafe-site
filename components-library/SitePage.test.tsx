import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { SitePage } from "./SitePage";
import { DEMO_FRONTEND_OUTPUT, DEMO_DESIGNER_OUTPUT } from "./demoData";

describe("SitePage", () => {
  it("全セクションの見出しと本文を描画する", () => {
    const html = renderToStaticMarkup(
      <SitePage frontend={DEMO_FRONTEND_OUTPUT} designer={DEMO_DESIGNER_OUTPUT} />
    );

    for (const section of DEMO_FRONTEND_OUTPUT.sections) {
      expect(html).toContain(section.heading);
      expect(html).toContain(section.body);
    }
    expect(html).toContain(DEMO_FRONTEND_OUTPUT.pageTitle);
  });

  it("ちょうど1つのh1を描画する(アクセシビリティ: 見出し階層の一貫性)", () => {
    const html = renderToStaticMarkup(
      <SitePage frontend={DEMO_FRONTEND_OUTPUT} designer={DEMO_DESIGNER_OUTPUT} />
    );
    const h1Count = (html.match(/<h1[ >]/g) ?? []).length;
    expect(h1Count).toBe(1);
  });
});
