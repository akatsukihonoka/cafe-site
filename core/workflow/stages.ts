/**
 * ヒアリング(interview)とデプロイ(deploy)を除いた、企画〜実装までのパイプライン。
 * 順序が「上流→下流の依存関係」を表す。あるステージをやり直す場合、
 * それより下流の全ステージも前提が変わるためやり直しが必要になる。
 */
export const PIPELINE_STAGES = [
  "director",
  "marketing",
  "ux",
  "designer",
  "copywriter",
  "frontend",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export function stageIndex(stage: PipelineStage): number {
  const index = PIPELINE_STAGES.indexOf(stage);
  if (index === -1) {
    throw new Error(`Unknown pipeline stage: ${stage}`);
  }
  return index;
}

/** 指定ステージ以降(自分自身を含む)を返す。再実行の対象範囲を決めるのに使う。 */
export function stagesFrom(stage: PipelineStage): PipelineStage[] {
  return PIPELINE_STAGES.slice(stageIndex(stage));
}

export function isEarlierStage(a: PipelineStage, b: PipelineStage): boolean {
  return stageIndex(a) < stageIndex(b);
}
