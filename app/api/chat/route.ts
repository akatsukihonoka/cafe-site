import { NextResponse } from "next/server";
import { z } from "zod";
import "@/agents/register";
import { getAgent } from "@/core/agent/registry";
import { inngest } from "@/infra/inngest/client";
import { createSupabaseRunStore } from "@/infra/supabase/runStore";
import { SITE_GENERATE_REQUESTED } from "@/core/workflow/events";
import type { ChatApiResponse, InterviewerOutput } from "@/core/types/interview";

const requestSchema = z.object({
  runId: z.string(),
  projectId: z.string(),
  history: z.array(z.object({ role: z.enum(["user", "interviewer"]), content: z.string() })),
  message: z.string().min(1),
});

export async function POST(req: Request) {
  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json<ChatApiResponse>(
      { status: "error", message: "Invalid request body." },
      { status: 400 }
    );
  }
  const { runId, projectId, history, message } = parsed.data;

  let result: InterviewerOutput;
  try {
    const interviewer = getAgent("interviewer");
    result = (await interviewer({
      history: [...history, { role: "user", content: message }],
    })) as InterviewerOutput;
  } catch (error) {
    return NextResponse.json<ChatApiResponse>(
      { status: "error", message: `Interviewerの呼び出しに失敗しました: ${(error as Error).message}` },
      { status: 502 }
    );
  }

  // Supabase/Inngestへの永続化はベストエフォート。
  // 認証(Supabase Auth)がまだ無いため、projects行が存在せずFK制約で失敗し得る(Phase5の既知の制約)。
  // 失敗してもチャット自体の応答は返す。
  try {
    const runStore = createSupabaseRunStore();
    await runStore.ensureRun(runId, projectId);
    if (result.status === "complete") {
      await runStore.updateRunStatus(runId, "planning");
      await inngest.send({
        name: SITE_GENERATE_REQUESTED,
        data: { runId, projectId, requirement: result.requirement },
      });
    }
  } catch (error) {
    console.error("Failed to persist run state or trigger workflow:", error);
  }

  return NextResponse.json<ChatApiResponse>({ status: result.status, message: result.message });
}
