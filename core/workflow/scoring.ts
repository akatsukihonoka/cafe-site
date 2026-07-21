import { type PipelineStage, isEarlierStage } from "./stages";

/**
 * MVPの合格ライン。Phase1合意: 95点は将来目標として残しつつ、
 * まずは80〜85点のレンジで開始し、実運用しながら調整する設定値。
 */
export const PASS_THRESHOLD = 82;

/** 1ステージあたりの改善リトライ上限。無限ループ・コスト青天井を防ぐ。 */
export const MAX_RETRIES_PER_STAGE = 2;

export interface ReviewFinding {
  stage: PipelineStage;
  issue: string;
}

export interface ReviewResult {
  score: number;
  findings: ReviewFinding[];
}

export type NextAction =
  | { type: "pass" }
  | { type: "retryFrom"; stage: PipelineStage }
  | { type: "giveUp"; reason: string };

/**
 * Reviewer/QAの採点結果から、次のアクションを決める純粋関数。
 *
 * - スコアがしきい値以上、または指摘なし → pass
 * - 指摘の中で最も上流のステージから再実行(下流は前提が変わるため道連れになる)
 * - そのステージの再試行回数が上限に達していたら giveUp（ベスト版を採用しレポートする）
 */
export function decideNextAction(
  review: ReviewResult,
  retryCountByStage: Partial<Record<PipelineStage, number>>,
  threshold: number = PASS_THRESHOLD,
  maxRetries: number = MAX_RETRIES_PER_STAGE
): NextAction {
  if (review.score >= threshold || review.findings.length === 0) {
    return { type: "pass" };
  }

  const earliest = review.findings.reduce((a, b) => (isEarlierStage(b.stage, a.stage) ? b : a));

  const attempts = retryCountByStage[earliest.stage] ?? 0;
  if (attempts >= maxRetries) {
    return {
      type: "giveUp",
      reason: `"${earliest.stage}" did not reach the score threshold (${review.score} < ${threshold}) after ${maxRetries} retries.`,
    };
  }

  return { type: "retryFrom", stage: earliest.stage };
}
