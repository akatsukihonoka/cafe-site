"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EditApiResponse } from "@/app/api/edit/route";

interface EditPanelProps {
  projectId: string;
  disabled: boolean;
  disabledReason?: string;
}

interface LogEntry {
  role: "user" | "editor";
  content: string;
  warnings?: string[];
}

/**
 * 生成済みサイトに対して自然言語で修正を依頼するチャット。
 * 成功したらrouter.refresh()でプレビュー(Server Component)を再取得させ、
 * 上のSitePageにそのまま反映させる。
 */
export function EditPanel({ projectId, disabled, disabledReason }: EditPanelProps) {
  const router = useRouter();
  const [instruction, setInstruction] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);

  async function handleSubmit() {
    const content = instruction.trim();
    if (!content || isSending || disabled) return;

    setLog((prev) => [...prev, { role: "user", content }]);
    setInstruction("");
    setIsSending(true);

    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, instruction: content }),
      });
      const data = (await res.json()) as EditApiResponse;

      setLog((prev) => [...prev, { role: "editor", content: data.message, warnings: data.warnings }]);

      if (data.status === "ok") {
        router.refresh();
      }
    } catch {
      setLog((prev) => [
        ...prev,
        { role: "editor", content: "通信エラーが発生しました。もう一度お試しください。" },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <CardTitle>AIに修正を依頼する</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {disabled && disabledReason && (
            <p className="text-sm text-neutral-500">{disabledReason}</p>
          )}
          {log.length > 0 && (
            <div className="space-y-2 rounded-lg border border-neutral-200 p-3 text-sm">
              {log.map((entry, i) => (
                <div key={i}>
                  <span className="font-medium">{entry.role === "user" ? "あなた: " : "Editor: "}</span>
                  <span>{entry.content}</span>
                  {entry.warnings?.map((w, wi) => (
                    <p key={wi} className="mt-1 text-amber-700">
                      ⚠️ {w}
                    </p>
                  ))}
                </div>
              ))}
              {isSending && <div className="text-neutral-400">Editorが確認しています…</div>}
            </div>
          )}
          <div className="flex gap-2">
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              placeholder={disabled ? "修正はできません" : "例: 見出しをもっと短くして"}
              disabled={disabled || isSending}
            />
            <Button onClick={handleSubmit} disabled={disabled || isSending || !instruction.trim()}>
              依頼する
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
