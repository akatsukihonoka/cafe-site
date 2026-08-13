import { NextResponse } from "next/server";
import { z } from "zod";
import { recordAnalyticsEvent } from "@/infra/supabase/analytics";

const requestSchema = z.object({
  projectId: z.string().min(1),
  type: z.enum(["pageview", "cta_click"]),
  sectionKind: z.string().optional(),
});

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

/**
 * デプロイ済みの生成サイト(このアプリとは別オリジンのVercel上の静的サイト)から
 * 計測ビーコンとして叩かれるエンドポイント。個人を特定する情報は受け取らない。
 * 訪問者の体験を壊さないよう、失敗しても常に200を返す(計測の欠落は許容する)。
 */
export async function POST(req: Request) {
  const parsed = requestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ status: "ignored" }, { status: 200, headers: CORS_HEADERS });
  }

  try {
    await recordAnalyticsEvent(parsed.data);
  } catch (error) {
    console.error("Failed to record analytics event:", error);
  }

  return NextResponse.json({ status: "ok" }, { status: 200, headers: CORS_HEADERS });
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
