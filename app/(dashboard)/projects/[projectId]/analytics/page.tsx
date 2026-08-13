import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdviceButton } from "@/components/chat/AdviceButton";
import { getAnalyticsSummary } from "@/infra/supabase/analytics";
import { getProjectPlan } from "@/infra/supabase/billing";
import type { AnalyticsSummary } from "@/core/types/analytics";

interface AnalyticsPageProps {
  params: Promise<{ projectId: string }>;
}

const EMPTY_SUMMARY: AnalyticsSummary = {
  pageviews: 0,
  totalCtaClicks: 0,
  ctaClicksByKind: {},
};

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { projectId } = await params;

  let summary = EMPTY_SUMMARY;
  try {
    summary = await getAnalyticsSummary(projectId);
  } catch (error) {
    console.error("Failed to load analytics summary:", error);
  }

  // getProjectPlanはSupabase未設定/プロジェクト未存在時も例外を投げず"free"にfail-closedする
  const plan = await getProjectPlan(projectId);

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>アクセス状況</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>ページビュー: {summary.pageviews}</p>
          <p>CTAクリック合計: {summary.totalCtaClicks}</p>
          {Object.keys(summary.ctaClicksByKind).length > 0 && (
            <ul className="list-disc pl-5 text-neutral-600">
              {Object.entries(summary.ctaClicksByKind).map(([kind, count]) => (
                <li key={kind}>
                  {kind}: {count}
                </li>
              ))}
            </ul>
          )}
          {summary.pageviews === 0 && (
            <p className="text-neutral-400">
              まだ計測データがありません。サイトが公開され、訪問者が来ると表示されます。
            </p>
          )}
        </CardContent>
      </Card>

      <AdviceButton projectId={projectId} isPaidPlan={plan === "paid"} />
    </div>
  );
}
