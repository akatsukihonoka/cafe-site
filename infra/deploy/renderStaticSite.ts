import type { FrontendOutput } from "@/agents/frontend/contract";
import type { DesignerOutput } from "@/agents/designer/contract";

type FrontendSection = FrontendOutput["sections"][number];

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * components-library/sections/Section.tsx と同じ見た目の意図(kind/layoutVariantによる
 * 違い)を、Tailwindのビルドに依存しないインラインCSSだけで再現する。
 * デプロイ先(Vercel等)は本アプリのCSSビルドを持たない独立した静的サイトになるため、
 * ライブプレビュー用コンポーネントをそのまま使うことができず、別実装になっている。
 */
function renderSection(section: FrontendSection, designer: DesignerOutput): string {
  const isHero = section.kind === "hero";
  const isCta = section.kind === "cta";
  const isFooter = section.kind === "footer";
  const align = section.layoutVariant === "b" ? "center" : "left";

  const containerStyleParts = [
    `padding:${isHero ? "6rem 1.5rem" : isFooter ? "2.5rem 1.5rem" : "4rem 1.5rem"}`,
  ];
  if (isCta) {
    containerStyleParts.push(`background:${designer.colorPalette.accent}`, "color:#ffffff");
  } else if (!isFooter) {
    containerStyleParts.push(`border-top:1px solid ${designer.colorPalette.text}1a`);
  }

  const headingStyle = [
    `font-family:${designer.typography.heading}`,
    "font-weight:700",
    `font-size:${isHero ? "2.5rem" : "1.75rem"}`,
    "margin:0",
  ].join(";");

  const bodyStyle = [
    `font-family:${designer.typography.body}`,
    "margin-top:0.75rem",
    "max-width:42rem",
    align === "center" ? "margin-left:auto;margin-right:auto" : "",
  ]
    .filter(Boolean)
    .join(";");

  const ctaHtml = section.cta
    ? `<span style="display:inline-block;margin-top:1.5rem;border-radius:9999px;padding:0.5rem 1.5rem;background:${designer.colorPalette.primary};color:#ffffff;">${escapeHtml(section.cta)}</span>`
    : "";

  return [
    `<section style="${containerStyleParts.join(";")}" data-section-kind="${section.kind}">`,
    `<div style="max-width:64rem;margin:0 auto;text-align:${align};">`,
    `<h2 style="${headingStyle}">${escapeHtml(section.heading)}</h2>`,
    `<p style="${bodyStyle}">${escapeHtml(section.body)}</p>`,
    ctaHtml,
    "</div>",
    "</section>",
  ].join("");
}

/**
 * FrontendOutput/DesignerOutputから、依存ライブラリ無しで開ける
 * 単一の静的HTML文書を生成する。Vercelデプロイ用の成果物として使う。
 */
export function renderStaticSiteHtml(frontend: FrontendOutput, designer: DesignerOutput): string {
  const sectionsHtml = frontend.sections.map((s) => renderSection(s, designer)).join("");

  return [
    "<!doctype html>",
    '<html lang="ja">',
    "<head>",
    '<meta charset="utf-8" />',
    '<meta name="viewport" content="width=device-width, initial-scale=1" />',
    `<title>${escapeHtml(frontend.pageTitle)}</title>`,
    "</head>",
    `<body style="margin:0;background:${designer.colorPalette.background};color:${designer.colorPalette.text};">`,
    `<h1 style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);">${escapeHtml(frontend.pageTitle)}</h1>`,
    sectionsHtml,
    "</body>",
    "</html>",
  ].join("");
}
