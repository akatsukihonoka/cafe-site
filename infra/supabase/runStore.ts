import type { RunStore } from "@/core/workflow/runStore.port";
import { getSupabaseServiceClient } from "./client";

export function createSupabaseRunStore(): RunStore {
  return {
    async ensureRun(runId, projectId) {
      const supabase = getSupabaseServiceClient();
      const { error } = await supabase.from("runs").upsert(
        { id: runId, project_id: projectId, status: "interviewing", current_stage: "interview" },
        { onConflict: "id", ignoreDuplicates: true }
      );
      if (error) throw error;
      return { runId, projectId, status: "interviewing", currentStage: "interview" };
    },

    async updateRunStatus(runId, status) {
      const supabase = getSupabaseServiceClient();
      const { error } = await supabase
        .from("runs")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", runId);
      if (error) throw error;
    },

    async setCurrentStage(runId, stage) {
      const supabase = getSupabaseServiceClient();
      const { error } = await supabase
        .from("runs")
        .update({ current_stage: stage, updated_at: new Date().toISOString() })
        .eq("id", runId);
      if (error) throw error;
    },

    async upsertStageRecord(runId, record) {
      const supabase = getSupabaseServiceClient();
      const { error } = await supabase.from("stage_results").insert({
        run_id: runId,
        stage: record.stage,
        status: record.status,
        attempt: record.attempt,
        score: record.score,
        output: record.output,
      });
      if (error) throw error;
    },

    async completeRun(runId, finalScore, deployUrl) {
      const supabase = getSupabaseServiceClient();
      const { error } = await supabase
        .from("runs")
        .update({
          status: "completed",
          final_score: finalScore,
          deploy_url: deployUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", runId);
      if (error) throw error;
    },
  };
}
