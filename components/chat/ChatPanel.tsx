"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ChatMessage, type ChatMessageData } from "./ChatMessage";
import type { ChatApiResponse } from "@/core/types/interview";

interface ChatPanelProps {
  runId: string;
  projectId: string;
  onGenerationStarted?: () => void;
}

const INITIAL_MESSAGE: ChatMessageData = {
  role: "interviewer",
  content: "こんにちは。どんなサイトを作りたいですか？",
};

export function ChatPanel({ runId, projectId, onGenerationStarted }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessageData[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isDone, setIsDone] = useState(false);

  async function handleSend() {
    const content = input.trim();
    if (!content || isSending || isDone) return;

    const nextMessages: ChatMessageData[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ runId, projectId, history: messages, message: content }),
      });
      const data = (await res.json()) as ChatApiResponse;

      setMessages((prev) => [...prev, { role: "interviewer", content: data.message }]);

      if (data.status === "complete") {
        setIsDone(true);
        onGenerationStarted?.();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "interviewer", content: "通信エラーが発生しました。もう一度お試しください。" },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex-1 space-y-3 overflow-y-auto rounded-lg border border-neutral-200 p-4">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} content={m.content} />
        ))}
        {isSending && <ChatMessage role="interviewer" content="…" />}
      </div>
      <div className="flex gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder={isDone ? "ヒアリングは完了しました" : "メッセージを入力…"}
          disabled={isSending || isDone}
        />
        <Button onClick={handleSend} disabled={isSending || isDone || !input.trim()}>
          送信
        </Button>
      </div>
    </div>
  );
}
