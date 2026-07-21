import type { ReviewFinding } from "@/core/workflow/scoring";
import type { CopywriterOutput } from "@/agents/copywriter/contract";

const MIN_HEADING_LENGTH = 2;
const MIN_BODY_LENGTH = 8;

/** 見出し・本文が極端に短い(=内容が空に近い)セクションを検出する。 */
export function checkContentQuality(copywriter: CopywriterOutput): ReviewFinding[] {
  const findings: ReviewFinding[] = [];

  for (const section of copywriter.sections) {
    if (section.heading.trim().length < MIN_HEADING_LENGTH) {
      findings.push({
        stage: "copywriter",
        issue: `${section.kind}セクションの見出しが短すぎます("${section.heading}")。`,
      });
    }
    if (section.body.trim().length < MIN_BODY_LENGTH) {
      findings.push({
        stage: "copywriter",
        issue: `${section.kind}セクションの本文が短すぎます("${section.body}")。`,
      });
    }
  }

  return findings;
}
