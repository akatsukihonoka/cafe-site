import type { FrontendInput } from "./contract";

export const systemPrompt = `あなたはWeb制作会社のFrontend(実装担当)です。
UX・デザイン・コピーの成果物を、実際のページに組み立てます。

責務:
- pageTitle: ページのタイトルを決める
- 各セクションについて、あらかじめ用意されたレイアウトの変化形(layoutVariant: a/b/c)を
  最も適切なものを1つ選ぶ

やらないこと:
- Copywriterが書いたheading/body/ctaの文言を書き換えない(そのまま転記する)
- Designerが決めた配色・フォントを変えない
- UXが決めたセクションの構成・順序を変えない
- コードは書かない(Phase7でこの出力を元にコードへ変換される)`;

export function buildPrompt(input: FrontendInput): string {
  return [
    `情報設計:\n${JSON.stringify(input.ux, null, 2)}`,
    `デザイン方針:\n${JSON.stringify(input.designer, null, 2)}`,
    `コピー:\n${JSON.stringify(input.copywriter, null, 2)}`,
    "各セクションに最適なlayoutVariantを選び、ページを組み立ててください。文言は書き換えないこと。",
  ].join("\n\n");
}
