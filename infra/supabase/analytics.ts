import { getSupabaseServiceClient } from "./client";
import { summarizeEvents, type RawEventRow } from "@/core/analytics/summarize";
import type { AnalyticsEventInput, AnalyticsSummary } from "@/core/types/analytics";

export async function recordAnalyticsEvent(event: AnalyticsEventInput): Promise<void> {
  const supabase = getSupabaseServiceClient();
  const { error } = await supabase.from("site_events").insert({
    project_id: event.projectId,
    event_type: event.type,
    section_kind: event.sectionKind ?? null,
  });
  if (error) throw error;
}

export async function getAnalyticsSummary(projectId: string): Promise<AnalyticsSummary> {
  const supabase = getSupabaseServiceClient();
  const { data, error } = await supabase
    .from("site_events")
    .select("event_type, section_kind")
    .eq("project_id", projectId);

  if (error) throw error;
  return summarizeEvents((data ?? []) as RawEventRow[]);
}
