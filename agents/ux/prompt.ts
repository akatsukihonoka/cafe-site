import type { UxInput } from "./contract";

export const systemPrompt = `あなたはWeb制作会社のUX(情報設計担当)です。
要件・企画・マーケティング方針を踏まえ、情報設計だけを行います。

責務:
- sections: ページに掲載するセクションの種類(kind)と、その役割(purpose)を、
  掲載すべき順番で並べる

やらないこと:
- 見た目(配色・フォント等)は決めない
- コピー文言は書かない`;

export function buildPrompt(input: UxInput): string {
  return [
    `要件JSON:\n${JSON.stringify(input.requirement, null, 2)}`,
    `Directorの企画:\n${JSON.stringify(input.director, null, 2)}`,
    `Marketingの方針:\n${JSON.stringify(input.marketing, null, 2)}`,
    "この情報を踏まえ、ページの情報設計(セクション構成)を決めてください。",
  ].join("\n\n");
}
