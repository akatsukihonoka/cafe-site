import { getSupabaseServiceClient } from "./client";
import { frontendOutputSchema, type FrontendOutput } from "@/agents/frontend/contract";
import { designerOutputSchema, type DesignerOutput } from "@/agents/designer/contract";

export interface GeneratedSite {
  runId: string;
  frontend: FrontendOutput;
  designer: DesignerOutput;
}

async function getLatestStageOutput<T>(
  runId: string,
  stage: "frontend" | "designer",
  schema: { parse: (v: unknown) => T }
): Promise<T | null> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("stage_results")
    .select("output")
    .eq("run_id", runId)
    .eq("stage", stage)
    .eq("status", "succeeded")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return schema.parse(data.output);
}

/**
 * 指定したプロジェクトの、最新のrunにおけるFrontend/Designerの成果物を取得する。
 * 該当データが無い場合(Interviewer〜Frontendがまだ実行されていない等)はnullを返す。
 */
export async function getLatestGeneratedSite(projectId: string): Promise<GeneratedSite | null> {
  const supabase = getSupabaseServiceClient();
  const { data: run, error } = await supabase
    .from("runs")
    .select("id")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !run) return null;

  const [frontend, designer] = await Promise.all([
    getLatestStageOutput(run.id, "frontend", frontendOutputSchema),
    getLatestStageOutput(run.id, "designer", designerOutputSchema),
  ]);

  if (!frontend || !designer) return null;

  return { runId: run.id, frontend, designer };
}
