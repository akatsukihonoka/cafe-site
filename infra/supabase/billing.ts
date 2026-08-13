import { getSupabaseServiceClient } from "./client";

export type Plan = "free" | "paid";

/**
 * プロジェクトの課金プランを返す。決済(Stripe等)連携は無いため、現状は
 * `projects.plan`列を手動更新することでしか"paid"にならない。
 * プロジェクト行が見つからない・Supabase未設定などの場合は安全側に倒して"free"を返す
 * (有料機能は既定で無効、というfail-closed設計)。
 */
export async function getProjectPlan(projectId: string): Promise<Plan> {
  try {
    const supabase = getSupabaseServiceClient();
    const { data, error } = await supabase
      .from("projects")
      .select("plan")
      .eq("id", projectId)
      .maybeSingle();

    if (error || !data) return "free";
    return data.plan === "paid" ? "paid" : "free";
  } catch {
    return "free";
  }
}

export async function hasPaidPlan(projectId: string): Promise<boolean> {
  return (await getProjectPlan(projectId)) === "paid";
}
