"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalyticsAdviceApiResponse } from "@/app/api/analytics/advice/route";

interface AdviceButtonProps {
  projectId: string;
  /**
   * サーバー側で事前に判定したプラン(表示の出し分け用)。
   * 実際の課金判定は/api/analytics/advice側で必ず再チェックする(ここは表示上の最適化に過ぎない)。
   */
  isPaidPlan: boolean;
}

export function AdviceButton({ projectId, isPaidPlan }: AdviceButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalyticsAdviceApiResponse | null>(null);

  async function handleClick() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/analytics/advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const data = (await res.json()) as AnalyticsAdviceApiResponse;
      setResult(data);
    } catch {
      setResult({ status: "error", message: "通信エラーが発生しました。もう一度お試しください。" });
    } finally {
      setIsLoading(false);
    }
  }

  if (!isPaidPlan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>🔒 AIによる改善アドバイス</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-neutral-500">
            アクセス数・CTAクリック数からAIが改善案を提案する機能は、有料プラン限定です。
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>AIによる改善アドバイス</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button onClick={handleClick} disabled={isLoading}>
          {isLoading ? "分析中…" : "アドバイスを生成する"}
        </Button>

        {result?.status === "ok" && (
          <div className="text-sm">
            <p className="font-medium">{result.headline}</p>
            <ul className="mt-2 list-disc pl-5">
              {result.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        {result && result.status !== "ok" && (
          <p className="text-sm text-amber-700">{result.message}</p>
        )}
      </CardContent>
    </Card>
  );
}
