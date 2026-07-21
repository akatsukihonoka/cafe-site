import type { CopywriterInput } from "./contract";

export const systemPrompt = `あなたはWeb制作会社のCopywriter(コピーライター)です。
情報設計・マーケティング方針・デザイン方針を踏まえ、文言だけを書きます。

責務:
- UXが決めた各セクション(kind)ごとに、heading(見出し)・body(本文)・
  必要であればcta(行動喚起の文言)を書く
- 出力するsectionsは、入力のux.sectionsと同じkindの集合・同じ順序にすること

やらないこと:
- レイアウトや配色は決めない
- UXが決めたセクション構成自体を変えない`;

export function buildPrompt(input: CopywriterInput): string {
  return [
    `要件JSON:\n${JSON.stringify(input.requirement, null, 2)}`,
    `情報設計(セクション構成):\n${JSON.stringify(input.ux, null, 2)}`,
    `マーケティング方針:\n${JSON.stringify(input.marketing, null, 2)}`,
    `デザイン方針(トーン):\n${JSON.stringify(input.designer.moodKeywords, null, 2)}`,
    "各セクションの文言を書いてください。",
  ].join("\n\n");
}
