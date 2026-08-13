import type { AgentRunner } from "@/core/types/agent";
import { uxOutputSchema } from "@/agents/ux/contract";
import { designerOutputSchema } from "@/agents/designer/contract";
import { copywriterOutputSchema } from "@/agents/copywriter/contract";
import { frontendOutputSchema } from "@/agents/frontend/contract";
import { qaInputSchema, qaOutputSchema, type QaInput, type QaOutput } from "./contract";
import { checkColorContrast } from "./checks/colorContrast";
import { checkStructuralIntegrity } from "./checks/structuralIntegrity";
import { checkContentQuality } from "./checks/contentQuality";

const POINTS_PER_FINDING = 8;

/**
 * Phase6ではQAもLLM呼び出しだったが、Phase8で客観的なツール検査に置き換えた
 * (Phase1の設計どおり: Reviewerは主観的な講評=LLM、QAは客観指標=ツール検査)。
 * LLMは一切使わず、色コントラスト比(WCAG)・セクションの欠落・文言の最低限の
 * 長さを決定的に検査する。registryから見た型(AgentRunner)は変わらないため、
 * Workflow Engine側の変更は不要。
 *
 * 既知の制約: requirement.mustHaveSections(自由記述の日本語)と
 * SectionKind(英語のenum)を意味的に突き合わせるチェックは、単純な文字列比較では
 * できないため未実装(将来Interviewerの出力形式を見直すか、Reviewer側で
 * 意味的なマッチングを行う改善余地がある)。
 */
export const runQa: AgentRunner<QaInput, QaOutput> = async (rawInput) => {
  const input = qaInputSchema.parse(rawInput);

  const ux = uxOutputSchema.safeParse(input.outputs.ux);
  const designer = designerOutputSchema.safeParse(input.outputs.designer);
  const copywriter = copywriterOutputSchema.safeParse(input.outputs.copywriter);
  const frontend = frontendOutputSchema.safeParse(input.outputs.frontend);

  const findings = [
    ...(designer.success ? checkColorContrast(designer.data) : []),
    ...(ux.success && copywriter.success && frontend.success
      ? checkStructuralIntegrity(ux.data, copywriter.data, frontend.data)
      : []),
    ...(copywriter.success ? checkContentQuality(copywriter.data) : []),
  ];

  const score = Math.max(0, 100 - findings.length * POINTS_PER_FINDING);

  return qaOutputSchema.parse({ score, findings });
};
