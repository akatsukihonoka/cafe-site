import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RunStageName, RunStatus } from "@/core/types/run";
import {
  DISPLAY_PHASE_LABEL,
  DISPLAY_PHASE_ORDER,
  displayPhaseForStage,
} from "@/core/workflow/stageDisplay";

interface StageProgressProps {
  status: RunStatus | null;
  currentStage: RunStageName | null;
}

export function StageProgress({ status, currentStage }: StageProgressProps) {
  if (status === "completed") {
    return (
      <Badge variant="success" className="text-sm">
        ✅ 公開完了！
      </Badge>
    );
  }

  if (status === "needs_attention") {
    return (
      <Badge variant="warning" className="text-sm">
        ⚠️ ご確認ください
      </Badge>
    );
  }

  const activePhase = displayPhaseForStage(currentStage);
  const activeIndex = activePhase ? DISPLAY_PHASE_ORDER.indexOf(activePhase) : -1;

  return (
    <div className="flex flex-wrap items-center gap-2" aria-live="polite">
      {DISPLAY_PHASE_ORDER.map((phase, index) => {
        const { emoji, label } = DISPLAY_PHASE_LABEL[phase];
        const isActive = index === activeIndex;
        const isDone = activeIndex >= 0 && index < activeIndex;

        return (
          <span
            key={phase}
            className={cn(
              "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              isActive && "border-neutral-900 bg-neutral-900 text-neutral-50",
              isDone && !isActive && "border-neutral-200 bg-neutral-100 text-neutral-500",
              !isActive && !isDone && "border-neutral-200 text-neutral-400"
            )}
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </span>
        );
      })}
    </div>
  );
}
