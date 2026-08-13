import type { FrontendOutput } from "@/agents/frontend/contract";
import type { DesignerOutput } from "@/agents/designer/contract";
import { ThemeProvider } from "./theme";
import { Section } from "./sections/Section";

interface SitePageProps {
  frontend: FrontendOutput;
  designer: DesignerOutput;
}

/**
 * Frontend Agentの出力(どのセクションをどのレイアウトで、という決定)と
 * Designer Agentの出力(配色/タイポグラフィ)を受け取り、実際のページとして描画する。
 * これがPhase1で決めた「コンポーネントライブラリから選択・合成する」フロントエンド生成の実体。
 */
export function SitePage({ frontend, designer }: SitePageProps) {
  return (
    <ThemeProvider designer={designer}>
      <h1 className="sr-only">{frontend.pageTitle}</h1>
      <main>
        {frontend.sections.map((section, index) => (
          <Section key={`${section.kind}-${index}`} section={section} />
        ))}
      </main>
    </ThemeProvider>
  );
}
