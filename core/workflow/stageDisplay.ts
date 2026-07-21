import type { RunStageName } from "../types/run";

/**
 * ユーザー向けの進捗表示は「🎤Interviewing… 📋Planning… 🎨Designing… 💻Coding…
 * 🔍Reviewing… 🚀Publishing…」という6段階のみ(元の仕様どおり)。
 * 内部の9ステージはこの6段階のいずれかにマッピングする。
 */
export type DisplayPhase =
  | "interviewing"
  | "planning"
  | "designing"
  | "coding"
  | "reviewing"
  | "publishing";

export const STAGE_TO_DISPLAY_PHASE: Record<RunStageName, DisplayPhase> = {
  interview: "interviewing",
  director: "planning",
  marketing: "planning",
  ux: "planning",
  designer: "designing",
  copywriter: "designing",
  frontend: "coding",
  review_qa: "reviewing",
  deploy: "publishing",
};

export const DISPLAY_PHASE_LABEL: Record<DisplayPhase, { emoji: string; label: string }> = {
  interviewing: { emoji: "🎤", label: "Interviewing…" },
  planning: { emoji: "📋", label: "Planning…" },
  designing: { emoji: "🎨", label: "Designing…" },
  coding: { emoji: "💻", label: "Coding…" },
  reviewing: { emoji: "🔍", label: "Reviewing…" },
  publishing: { emoji: "🚀", label: "Publishing…" },
};

export const DISPLAY_PHASE_ORDER: DisplayPhase[] = [
  "interviewing",
  "planning",
  "designing",
  "coding",
  "reviewing",
  "publishing",
];

export function displayPhaseForStage(stage: RunStageName | null): DisplayPhase | null {
  if (!stage) return null;
  return STAGE_TO_DISPLAY_PHASE[stage];
}
