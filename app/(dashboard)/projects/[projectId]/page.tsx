"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { StageProgress } from "@/components/chat/StageProgress";
import { useRunRealtime } from "@/components/chat/useRunRealtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProjectPage() {
  const params = useParams<{ projectId: string }>();
  const projectId = params.projectId;
  const [runId] = useState(() => crypto.randomUUID());
  const realtime = useRunRealtime(runId);

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col gap-4 p-6">
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>AI Web Studio</CardTitle>
          <Button asChild variant="outline" size="sm">
            <Link href={`/projects/${projectId}/preview?demo=1`}>プレビューを見る</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <StageProgress status={realtime.status} currentStage={realtime.currentStage} />
        </CardContent>
      </Card>
      <div className="min-h-0 flex-1">
        <ChatPanel runId={runId} projectId={projectId} />
      </div>
    </div>
  );
}
