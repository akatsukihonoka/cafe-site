import { NextResponse } from "next/server";
import { z } from "zod";
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

  // まずエージェントの有無を確認する(I/Oを伴わない)。
  // Phase6で実装されるまでは、Supabase接続を試みる前にここで501を返す。
  let interviewer;
  try {
    interviewer = getAgent("interviewer");
  } catch {
    return NextResponse.json<ChatApiResponse>(
      { status: "error", message: "Interviewerはまだ実装されていません(Phase6で実装予定)。" },
      { status: 501 }
    );
  }

  const runStore = createSupabaseRunStore();
  await runStore.ensureRun(runId, projectId);

  const result = (await interviewer({
    history: [...history, { role: "user", content: message }],
  })) as InterviewerOutput;

  if (result.status === "complete") {
    await runStore.updateRunStatus(runId, "planning");
    await inngest.send({
      name: SITE_GENERATE_REQUESTED,
      data: { runId, projectId, requirement: result.requirement },
    });
  }

  return NextResponse.json<ChatApiResponse>({ status: result.status, message: result.message });
}
