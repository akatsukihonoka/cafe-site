import type { ReviewFinding } from "@/core/workflow/scoring";
import type { UxOutput } from "@/agents/ux/contract";
import type { CopywriterOutput } from "@/agents/copywriter/contract";
import type { FrontendOutput } from "@/agents/frontend/contract";

/**
 * UXが決めたセクション構成が、Copywriter/Frontendの成果物まで
 * 欠落なく引き継がれているかを検査する(ステージ間の伝言ミスを検出する)。
 */
export function checkStructuralIntegrity(
  ux: UxOutput,
  copywriter: CopywriterOutput,
  frontend: FrontendOutput
): ReviewFinding[] {
  const findings: ReviewFinding[] = [];
  const uxKinds = ux.sections.map((s) => s.kind);
  const copyKinds = copywriter.sections.map((s) => s.kind);
  const frontendKinds = frontend.sections.map((s) => s.kind);

  const missingInCopy = uxKinds.filter((k) => !copyKinds.includes(k));
  if (missingInCopy.length > 0) {
    findings.push({
      stage: "copywriter",
      issue: `UXが決めたセクション(${missingInCopy.join(", ")})の文言が抜けています。`,
    });
  }

  const missingInFrontend = uxKinds.filter((k) => !frontendKinds.includes(k));
  if (missingInFrontend.length > 0) {
    findings.push({
      stage: "frontend",
      issue: `UXが決めたセクション(${missingInFrontend.join(", ")})がページに組み込まれていません。`,
    });
  }

  return findings;
}
