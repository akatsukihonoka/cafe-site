import { NextResponse } from "next/server";
import { z } from "zod";
import "@/agents/register";
import { getAgent } from "@/core/agent/registry";
import { getLatestGeneratedSite } from "@/infra/supabase/siteQuery";
import { createSupabaseRunStore } from "@/infra/supabase/runStore";
import { checkColorContrast } from "@/agents/qa/checks/colorContrast";
import type { EditorOutput } from "@/agents/editor/contract";

const requestSchema = z.object({
  projectId: z.string(),
  instruction: z.string().min(1),
});

export interface EditApiResponse {
  status: "ok" | "error";
  message: string;
  frontend?: EditorOutput["frontend"];
  designer?: EditorOutput["designer"];
  warnings?: string[];
}

export async function POST(req: Request) {
  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json<EditApiResponse>(
      { status: "error", message: "Invalid request body." },
      { status: 400 }
    );
  }
  const { projectId, instruction } = parsed.data;

  let current;
  try {
    current = await getLatestGeneratedSite(projectId);
  } catch (error) {
    return NextResponse.json<EditApiResponse>(
      { status: "error", message: `生成結果の取得に失敗しました: ${(error as Error).message}` },
      { status: 502 }
    );
  }
  if (!current) {
    return NextResponse.json<EditApiResponse>(
      { status: "error", message: "まだ生成結果がありません。先にサイトを生成してください。" },
      { status: 404 }
    );
  }

  let result: EditorOutput;
  try {
    const editor = getAgent("editor");
    result = (await editor({
      instruction,
      frontend: current.frontend,
      designer: current.designer,
    })) as EditorOutput;
  } catch (error) {
    return NextResponse.json<EditApiResponse>(
      { status: "error", message: `Editorの呼び出しに失敗しました: ${(error as Error).message}` },
      { status: 502 }
    );
  }

  // 編集の永続化はベストエフォート(Supabase未設定でも修正結果自体はユーザーに返す)。
  try {
    const runStore = createSupabaseRunStore();
    await runStore.upsertStageRecord(current.runId, {
      stage: "frontend",
      status: "succeeded",
      attempt: 0,
      output: result.frontend,
    });
    await runStore.upsertStageRecord(current.runId, {
      stage: "designer",
      status: "succeeded",
      attempt: 0,
      output: result.designer,
    });
  } catch (error) {
    console.error("Failed to persist edit:", error);
  }

  // QAのコントラスト検査(LLMを使わない決定論的チェック)を編集後の配色にも適用し、
  // 新たにアクセシビリティ上の問題を持ち込んでいないかを警告として返す。
  const warnings = checkColorContrast(result.designer).map((f) => f.issue);

  return NextResponse.json<EditApiResponse>({
    status: "ok",
    message: result.summary,
    frontend: result.frontend,
    designer: result.designer,
    warnings: warnings.length > 0 ? warnings : undefined,
  });
}
