import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-neutral-50 p-8 text-center">
      <h1 className="text-3xl font-semibold tracking-tight">AI Web Studio</h1>
      <p className="max-w-md text-neutral-600">
        「こういうサイトが欲しい」と伝えるだけ。あとはAI制作会社が企画・設計・デザイン・実装・レビューまで担当します。
      </p>
      <Button asChild size="default">
        <Link href={`/projects/${crypto.randomUUID()}`}>チャットを始める（デモ）</Link>
      </Button>
    </div>
  );
}
