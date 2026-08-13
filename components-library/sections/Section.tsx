import { cn } from "@/lib/utils";
import type { SectionKind } from "@/core/types/section";
import type { FrontendOutput } from "@/agents/frontend/contract";

type FrontendSection = FrontendOutput["sections"][number];

interface KindStyle {
  container: string;
  heading: string;
  body: string;
}

/**
 * kindごとの見た目の違い。現状の契約(heading/body/ctaのみ)で表現できる範囲に限定している。
 * メニュー写真やギャラリー画像など構造化されたコンテンツはまだエージェントの出力に無いため、
 * それらのkindも今はテキスト主体の表示になる(Phase改善時にcontract自体の拡張が必要)。
 */
function getKindStyle(kind: SectionKind): KindStyle {
  switch (kind) {
    case "hero":
      return {
        container: "py-24 md:py-32",
        heading: "text-4xl md:text-6xl font-bold leading-tight",
        body: "mt-4 text-lg md:text-xl max-w-2xl",
      };
    case "cta":
      return {
        container: "py-20 bg-[var(--site-accent)] text-white",
        heading: "text-3xl font-bold",
        body: "mt-3 max-w-xl",
      };
    case "footer":
      return {
        container: "py-10 border-t border-[var(--site-text)]/10 text-sm opacity-70",
        heading: "text-base font-semibold",
        body: "mt-2 max-w-xl",
      };
    default:
      return {
        container: "py-16 md:py-20 border-t border-[var(--site-text)]/5",
        heading: "text-2xl md:text-3xl font-bold",
        body: "mt-3 max-w-2xl",
      };
  }
}

interface LayoutClasses {
  wrapper: string;
  decorative: boolean;
}

/** Frontend Agentが選んだlayoutVariantを、実際の見た目の違いに変換する。 */
function getLayoutClasses(variant: FrontendSection["layoutVariant"]): LayoutClasses {
  switch (variant) {
    case "a":
      return { wrapper: "flex flex-col items-start text-left", decorative: false };
    case "b":
      return { wrapper: "flex flex-col items-center text-center mx-auto", decorative: false };
    case "c":
      return { wrapper: "grid md:grid-cols-2 gap-8 items-center text-left", decorative: true };
  }
}

interface SectionProps {
  section: FrontendSection;
}

export function Section({ section }: SectionProps) {
  const kindStyle = getKindStyle(section.kind);
  const layout = getLayoutClasses(section.layoutVariant);

  return (
    <section className={cn("px-6", kindStyle.container)} data-section-kind={section.kind}>
      <div className={cn("mx-auto max-w-5xl", layout.wrapper)}>
        <div>
          <h2 className={kindStyle.heading} style={{ fontFamily: "var(--site-font-heading)" }}>
            {section.heading}
          </h2>
          <p className={kindStyle.body} style={{ fontFamily: "var(--site-font-body)" }}>
            {section.body}
          </p>
          {section.cta && (
            <span className="mt-6 inline-block rounded-full bg-[var(--site-primary)] px-6 py-2 text-white">
              {section.cta}
            </span>
          )}
        </div>
        {layout.decorative && (
          <div
            className="aspect-video w-full rounded-xl bg-[var(--site-secondary)]"
            aria-hidden
          />
        )}
      </div>
    </section>
  );
}
