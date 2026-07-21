import { describe, expect, it } from "vitest";
import { requirementSchema } from "@/core/types/requirement";
import { directorOutputSchema } from "@/agents/director/contract";
import { marketingInputSchema, marketingOutputSchema } from "@/agents/marketing/contract";
import { uxInputSchema, uxOutputSchema } from "@/agents/ux/contract";
import { designerInputSchema, designerOutputSchema } from "@/agents/designer/contract";
import { copywriterInputSchema, copywriterOutputSchema } from "@/agents/copywriter/contract";
import { frontendInputSchema, frontendOutputSchema } from "@/agents/frontend/contract";
import { reviewerInputSchema } from "@/agents/reviewer/contract";
import { qaInputSchema } from "@/agents/qa/contract";

/**
 * 各エージェントのZodスキーマを実際につないでみて、
 * 「Nの出力がN+1の入力として妥当か」をコンパイル時ではなく実行時にも検証する。
 * プロンプトやLLMは一切使わない、契約(スキーマ)だけのテスト。
 */
describe("agent pipeline contracts are chainable", () => {
  const requirement = requirementSchema.parse({
    siteType: "カフェ",
    goal: "来店予約を増やす",
    targetAudience: "近隣在住の20〜40代",
    mustHaveSections: ["メニュー", "アクセス"],
    tone: "落ち着いた",
  });

  const director = directorOutputSchema.parse({
    overview: "落ち着いた雰囲気のカフェサイト",
    pages: ["トップ"],
    priorities: ["メニュー訴求"],
  });

  it("director → marketing", () => {
    expect(() => marketingInputSchema.parse({ requirement, director })).not.toThrow();
  });

  const marketing = marketingOutputSchema.parse({
    targetSegments: ["近隣住民"],
    valueProposition: "落ち着ける空間と丁寧な一杯",
    ctaStrategy: "予約ボタンを目立たせる",
  });

  it("director + marketing → ux", () => {
    expect(() => uxInputSchema.parse({ requirement, director, marketing })).not.toThrow();
  });

  const ux = uxOutputSchema.parse({
    sections: [
      { kind: "hero", purpose: "第一印象" },
      { kind: "menu", purpose: "メニュー訴求" },
      { kind: "contact", purpose: "アクセス案内" },
    ],
  });

  it("ux → designer", () => {
    expect(() => designerInputSchema.parse({ requirement, ux })).not.toThrow();
  });

  const designer = designerOutputSchema.parse({
    colorPalette: {
      primary: "#3B2314",
      secondary: "#C9A66B",
      accent: "#E4572E",
      background: "#FFF8F0",
      text: "#2B2B2B",
    },
    typography: { heading: "Noto Serif JP", body: "Noto Sans JP" },
    moodKeywords: ["落ち着いた", "あたたかみ"],
  });

  it("ux + marketing + designer → copywriter", () => {
    expect(() =>
      copywriterInputSchema.parse({ requirement, ux, marketing, designer })
    ).not.toThrow();
  });

  const copywriter = copywriterOutputSchema.parse({
    sections: [
      { kind: "hero", heading: "ゆっくりとした時間を、あなたに。", body: "本文", cta: "予約する" },
      { kind: "menu", heading: "こだわりのメニュー", body: "本文" },
      { kind: "contact", heading: "アクセス", body: "本文" },
    ],
  });

  it("ux + designer + copywriter → frontend", () => {
    expect(() =>
      frontendInputSchema.parse({ requirement, ux, designer, copywriter })
    ).not.toThrow();
  });

  const frontend = frontendOutputSchema.parse({
    pageTitle: "Cafe Lumière",
    sections: [
      {
        kind: "hero",
        layoutVariant: "a",
        heading: "ゆっくりとした時間を、あなたに。",
        body: "本文",
        cta: "予約する",
      },
      { kind: "menu", layoutVariant: "b", heading: "こだわりのメニュー", body: "本文" },
      { kind: "contact", layoutVariant: "a", heading: "アクセス", body: "本文" },
    ],
  });

  it("全ステージの出力 → reviewer / qa", () => {
    const outputs = { director, marketing, ux, designer, copywriter, frontend };
    expect(() => reviewerInputSchema.parse({ requirement, outputs })).not.toThrow();
    expect(() => qaInputSchema.parse({ requirement, outputs })).not.toThrow();
  });
});
