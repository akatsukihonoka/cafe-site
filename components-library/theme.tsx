import type { CSSProperties, ReactNode } from "react";
import type { DesignerOutput } from "@/agents/designer/contract";

interface ThemeProviderProps {
  designer: DesignerOutput;
  children: ReactNode;
}

/**
 * Designer Agentが決めた配色/タイポグラフィをCSSカスタムプロパティとして注入する。
 * Tailwindの静的クラスではなく`var(--site-*)`を参照させることで、
 * サイトごとに異なるテーマをビルド時ではなく実行時に反映できる。
 */
export function ThemeProvider({ designer, children }: ThemeProviderProps) {
  const style = {
    "--site-primary": designer.colorPalette.primary,
    "--site-secondary": designer.colorPalette.secondary,
    "--site-accent": designer.colorPalette.accent,
    "--site-bg": designer.colorPalette.background,
    "--site-text": designer.colorPalette.text,
    "--site-font-heading": designer.typography.heading,
    "--site-font-body": designer.typography.body,
  } as CSSProperties;

  return (
    <div style={style} className="bg-[var(--site-bg)] text-[var(--site-text)]">
      {children}
    </div>
  );
}
