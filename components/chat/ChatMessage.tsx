import { cn } from "@/lib/utils";

export interface ChatMessageData {
  role: "user" | "interviewer";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageData) {
  const isUser = role === "user";
  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2 text-sm",
          isUser ? "bg-neutral-900 text-neutral-50" : "bg-neutral-100 text-neutral-900"
        )}
      >
        {content}
      </div>
    </div>
  );
}
