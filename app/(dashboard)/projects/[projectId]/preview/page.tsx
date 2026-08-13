import { SitePage } from "@/components-library/SitePage";
import { DEMO_FRONTEND_OUTPUT, DEMO_DESIGNER_OUTPUT } from "@/components-library/demoData";
import { getLatestGeneratedSite } from "@/infra/supabase/siteQuery";
import { EditPanel } from "@/components/chat/EditPanel";

interface PreviewPageProps {
  params: Promise<{ projectId: string }>;
  searchParams: Promise<{ demo?: string }>;
}

export default async function PreviewPage({ params, searchParams }: PreviewPageProps) {
  const { projectId } = await params;
  const { demo } = await searchParams;

  if (demo !== "1") {
    // Supabase未設定(このサンドボックス含む)や、まだ生成が完了していない場合は
    // 例外を投げずにフォールバックする。
    let generated = null;
    try {
      generated = await getLatestGeneratedSite(projectId);
    } catch (error) {
      console.error("Failed to load generated site:", error);
    }
    if (generated) {
      return (
        <div>
          <SitePage frontend={generated.frontend} designer={generated.designer} />
          <EditPanel projectId={projectId} disabled={false} />
        </div>
      );
    }
  }

  return (
    <div>
      <div className="bg-amber-100 px-4 py-2 text-center text-sm text-amber-900">
        デモデータを表示しています(このプロジェクトの生成結果はまだありません)
      </div>
      <SitePage frontend={DEMO_FRONTEND_OUTPUT} designer={DEMO_DESIGNER_OUTPUT} />
      <EditPanel
        projectId={projectId}
        disabled
        disabledReason="デモ表示中は修正できません。実際にサイトを生成してからお試しください。"
      />
    </div>
  );
}
