"use client";

import { useEffect, useMemo, useState } from "react";
import { getSupabaseBrowserClient } from "@/infra/supabase/browserClient";
import type { RunStageName, RunStatus } from "@/core/types/run";

export interface RunRealtimeState {
  status: RunStatus | null;
  currentStage: RunStageName | null;
  finalScore: number | null;
  deployUrl: string | null;
  /** Realtime購読が確立できているか。falseの場合はSupabase未設定などで進捗が更新されない。 */
  connected: boolean;
  error: string | null;
}

interface RunRow {
  status: RunStatus;
  current_stage: RunStageName | null;
  final_score: number | null;
  deploy_url: string | null;
}

const initialState: RunRealtimeState = {
  status: null,
  currentStage: null,
  finalScore: null,
  deployUrl: null,
  connected: false,
  error: null,
};

function applyRow(row: RunRow): Partial<RunRealtimeState> {
  return {
    status: row.status,
    currentStage: row.current_stage,
    finalScore: row.final_score,
    deployUrl: row.deploy_url,
  };
}

/** 指定したrunの進捗(runs行)をSupabase Realtimeで購読するhook。 */
export function useRunRealtime(runId: string | null): RunRealtimeState {
  const [state, setState] = useState<RunRealtimeState>(initialState);
  // クライアント生成は環境変数を読むだけの同期処理なので、effectの外(レンダー時)で行う。
  const { client: supabase, error: clientError } = useMemo(() => {
    try {
      return { client: getSupabaseBrowserClient(), error: null as string | null };
    } catch (error) {
      return { client: null, error: (error as Error).message };
    }
  }, []);

  useEffect(() => {
    if (!runId || !supabase) {
      return;
    }

    let cancelled = false;

    supabase
      .from("runs")
      .select("status, current_stage, final_score, deploy_url")
      .eq("id", runId)
      .single()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (data) {
          setState((prev) => ({ ...prev, ...applyRow(data as RunRow), connected: true }));
        } else if (error) {
          setState((prev) => ({ ...prev, error: error.message }));
        }
      });

    const channel = supabase
      .channel(`run-${runId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "runs", filter: `id=eq.${runId}` },
        (payload) => {
          setState((prev) => ({
            ...prev,
            ...applyRow(payload.new as RunRow),
            connected: true,
          }));
        }
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setState((prev) => ({ ...prev, connected: true }));
        }
      });

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [runId, supabase]);

  if (clientError) {
    return { ...initialState, error: clientError };
  }

  if (!runId) {
    return initialState;
  }

  return state;
}
