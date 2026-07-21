import type { ReviewFinding } from "@/core/workflow/scoring";
import type { DesignerOutput } from "@/agents/designer/contract";
import { contrastRatio, WCAG_AA_NORMAL_TEXT_MIN_RATIO } from "./contrast";

/** WCAG AAのコントラスト基準を、本文色とCTAボタンの2箇所について検査する。 */
export function checkColorContrast(designer: DesignerOutput): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const { text, background, accent } = designer.colorPalette;

  const textRatio = contrastRatio(text, background);
  if (textRatio !== null && textRatio < WCAG_AA_NORMAL_TEXT_MIN_RATIO) {
    findings.push({
      stage: "designer",
      issue: `本文色(${text})と背景色(${background})のコントラスト比が${textRatio.toFixed(2)}:1で、WCAG AA基準(4.5:1)を下回っています。`,
    });
  }

  const ctaRatio = contrastRatio("#FFFFFF", accent);
  if (ctaRatio !== null && ctaRatio < WCAG_AA_NORMAL_TEXT_MIN_RATIO) {
    findings.push({
      stage: "designer",
      issue: `CTAボタンの白文字とアクセントカラー(${accent})のコントラスト比が${ctaRatio.toFixed(2)}:1で、WCAG AA基準(4.5:1)を下回っています。`,
    });
  }

  return findings;
}
