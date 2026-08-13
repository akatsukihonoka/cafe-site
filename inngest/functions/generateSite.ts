import { z } from "zod";
import "@/agents/register";
import { inngest } from "@/infra/inngest/client";
import { createSupabaseRunStore } from "@/infra/supabase/runStore";
import { deploySite } from "@/infra/deploy/vercel";
import { getAgent } from "@/core/agent/registry";
import { SITE_GENERATE_REQUESTED } from "@/core/workflow/events";
import { PIPELINE_STAGES, stagesFrom, type PipelineStage } from "@/core/workflow/stages";
import { decideNextAction, MAX_RETRIES_PER_STAGE, type ReviewResult } from "@/core/workflow/scoring";
import type { RunStore } from "@/core/workflow/runStore.port";

const eventDataSchema = z.object({
  runId: z.string(),
  projectId: z.string(),
  requirement: z.unknown(),
});

function buildAgentInput(requirement: unknown, outputs: Partial<Record<PipelineStage, unknown>>) {
  return { requirement, ...outputs };
}

function mergeReviewResults(reviewerOutput: ReviewResult, qaOutput: ReviewResult): ReviewResult {
  return {
    score: Math.round((reviewerOutput.score + qaOutput.score) / 2),
    findings: [...reviewerOutput.findings, ...qaOutput.findings],
  };
}

async function runStage(
  stage: PipelineStage,
  attempt: number,
  requirement: unknown,
  outputs: Partial<Record<PipelineStage, unknown>>,
  runId: string,
  runStore: RunStore
) {
  await runStore.setCurrentStage(runId, stage);
  const agent = getAgent(stage);
  const input = buildAgentInput(requirement, outputs);
  const output = await agent(input);
  await runStore.upsertStageRecord(runId, {
    stage,
    status: "succeeded",
    attempt,
    output,
  });
  return output;
}

/**
 * Phase1で合意したワークフロー本体。
 * Director→Marketing→UX→Design→Copy→Frontend を実行し、
 * Reviewer+QAで採点。しきい値未達なら該当ステージ以降のみ最大2回まで再実行し、
 * それでも未達ならベスト版を採用してneeds_attentionとして完了する。
 */
export const generateSite = inngest.createFunction(
  { id: "generate-site", triggers: [{ event: SITE_GENERATE_REQUESTED }] },
  async ({ event, step }) => {
    const { runId, projectId, requirement } = eventDataSchema.parse(event.data);
    const runStore = createSupabaseRunStore();

    // requirementはこの時点までSupabaseに永続化されていない(イベントデータにのみ存在)ため、
    // Analytics Advisor等、後からrequirementを参照したい機能のために記録しておく。
    await step.run("record-requirement", () =>
      runStore.upsertStageRecord(runId, {
        stage: "interview",
        status: "succeeded",
        attempt: 1,
        output: requirement,
      })
    );

    await step.run("mark-run-planning", () => runStore.updateRunStatus(runId, "planning"));

    const outputs: Partial<Record<PipelineStage, unknown>> = {};
    const retryCountByStage: Partial<Record<PipelineStage, number>> = {};
    let stagesToRun: PipelineStage[] = [...PIPELINE_STAGES];

    // ステージ数 x (最大リトライ+1回) を超えたら必ず終了する安全弁
    const maxLoops = PIPELINE_STAGES.length * (MAX_RETRIES_PER_STAGE + 1);

    for (let loop = 0; loop < maxLoops; loop += 1) {
      for (const stage of stagesToRun) {
        const attempt = (retryCountByStage[stage] ?? 0) + 1;
        const output = await step.run(`${stage}-attempt-${attempt}`, () =>
          runStage(stage, attempt, requirement, outputs, runId, runStore)
        );
        outputs[stage] = output;
      }

      await step.run("mark-run-reviewing", async () => {
        await runStore.updateRunStatus(runId, "reviewing");
        await runStore.setCurrentStage(runId, "review_qa");
      });

      const review = await step.run(`review-loop-${loop}`, async () => {
        const reviewInput = { requirement, outputs };
        const reviewerOutput = (await getAgent("reviewer")(reviewInput)) as ReviewResult;
        const qaOutput = (await getAgent("qa")(reviewInput)) as ReviewResult;
        return mergeReviewResults(reviewerOutput, qaOutput);
      });

      const decision = decideNextAction(review, retryCountByStage);

      if (decision.type === "pass") {
        await step.run("mark-run-deploying", async () => {
          await runStore.updateRunStatus(runId, "deploying");
          await runStore.setCurrentStage(runId, "deploy");
        });
        const deployResult = await step.run("deploy", () =>
          deploySite({ projectId, siteOutputs: outputs })
        );
        await step.run("mark-run-completed", () =>
          runStore.completeRun(runId, review.score, deployResult.url)
        );
        return { status: "completed" as const, score: review.score, deployUrl: deployResult.url };
      }

      if (decision.type === "giveUp") {
        await step.run("mark-run-needs-attention", () =>
          runStore.updateRunStatus(runId, "needs_attention")
        );
        return { status: "needs_attention" as const, score: review.score, reason: decision.reason };
      }

      retryCountByStage[decision.stage] = (retryCountByStage[decision.stage] ?? 0) + 1;
      stagesToRun = stagesFrom(decision.stage);
    }

    await step.run("mark-run-needs-attention-maxloop", () =>
      runStore.updateRunStatus(runId, "needs_attention")
    );
    return { status: "needs_attention" as const, reason: "Exceeded maximum workflow loops." };
  }
);
