import { NextResponse } from "next/server";
import { z } from "zod";
import "@/agents/register";
import { getAgent } from "@/core/agent/registry";
import { hasPaidPlan } from "@/infra/supabase/billing";
import { getAnalyticsSummary } from "@/infra/supabase/analytics";
import { getLatestRequirement } from "@/infra/supabase/siteQuery";
import type { AnalyticsAdvisorOutput } from "@/agents/analyticsAdvisor/contract";

const requestSchema = z.object({
  projectId: z.string().min(1),
});

export interface AnalyticsAdviceApiResponse {
  status: "ok" | "error" | "payment_required";
  message: string;
  headline?: string;
  recommendations?: string[];
  pageviews?: number;
  totalCtaClicks?: number;
}

/**
 * サイト分析アドバイス。有料プラン限定の機能(projects.plan === 'paid')。
 * 課金連携(Stripe等)はまだ無いため、hasPaidPlanは現状projects.plan列を見るだけの
 * プレースホルダー。ここが将来の課金導線の差し込み口になる。
 */
export async function POST(req: Request) {
  const parsed = requestSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json<AnalyticsAdviceApiResponse>(
      { status: "error", message: "Invalid request body." },
      { status: 400 }
    );
  }
  const { projectId } = parsed.data;

  const isPaid = await hasPaidPlan(projectId);
  if (!isPaid) {
    return NextResponse.json<AnalyticsAdviceApiResponse>(
      {
        status: "payment_required",
        message: "サイト分析アドバイスは有料プラン限定の機能です。",
      },
      { status: 402 }
    );
  }

  let requirement;
  let summary;
  try {
    [requirement, summary] = await Promise.all([
      getLatestRequirement(projectId),
      getAnalyticsSummary(projectId),
    ]);
  } catch (error) {
    return NextResponse.json<AnalyticsAdviceApiResponse>(
      { status: "error", message: `データの取得に失敗しました: ${(error as Error).message}` },
      { status: 502 }
    );
  }

  if (!requirement) {
    return NextResponse.json<AnalyticsAdviceApiResponse>(
      { status: "error", message: "このプロジェクトの要件情報が見つかりません。" },
      { status: 404 }
    );
  }

  let advice: AnalyticsAdvisorOutput;
  try {
    const advisor = getAgent("analyticsAdvisor");
    advice = (await advisor({ requirement, summary })) as AnalyticsAdvisorOutput;
  } catch (error) {
    return NextResponse.json<AnalyticsAdviceApiResponse>(
      { status: "error", message: `Analytics Advisorの呼び出しに失敗しました: ${(error as Error).message}` },
      { status: 502 }
    );
  }

  return NextResponse.json<AnalyticsAdviceApiResponse>({
    status: "ok",
    message: advice.headline,
    headline: advice.headline,
    recommendations: advice.recommendations,
    pageviews: summary.pageviews,
    totalCtaClicks: summary.totalCtaClicks,
  });
}
