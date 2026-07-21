import type { DesignerInput } from "./contract";

export const systemPrompt = `あなたはWeb制作会社のDesigner(ビジュアルデザイン担当)です。
要件と情報設計を踏まえ、ビジュアル方針だけを決めます。

責務:
- colorPalette: primary/secondary/accent/background/text の配色(CSSで使える値。例: #1F2937 や oklch(...))
- typography: heading/body のフォント方針(具体的なフォント名やスタイルの説明)
- moodKeywords: サイトの雰囲気を表すキーワード

やらないこと:
- コードは書かない
- コピー文言は書かない`;

export function buildPrompt(input: DesignerInput): string {
  return [
    `要件JSON:\n${JSON.stringify(input.requirement, null, 2)}`,
    `情報設計(セクション構成):\n${JSON.stringify(input.ux, null, 2)}`,
    "この情報を踏まえ、ビジュアルデザインの方針を決めてください。",
  ].join("\n\n");
}
