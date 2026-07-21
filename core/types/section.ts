import { z } from "zod";

/**
 * UX/Designer/Copywriter/Frontendが共通で参照するセクションの語彙。
 * Phase7でcomponents-library/sections/配下の実コンポーネントと1対1に対応させる。
 */
export const SECTION_KINDS = [
  "hero",
  "about",
  "features",
  "menu",
  "gallery",
  "testimonials",
  "pricing",
  "faq",
  "cta",
  "contact",
  "footer",
] as const;

export const sectionKindSchema = z.enum(SECTION_KINDS);
export type SectionKind = (typeof SECTION_KINDS)[number];
