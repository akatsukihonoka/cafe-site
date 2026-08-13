import type { FrontendOutput } from "@/agents/frontend/contract";
import type { DesignerOutput } from "@/agents/designer/contract";

/**
 * Interviewer〜Frontendがまだ実データを生成していない場合のプレビュー用サンプル。
 * SitePageの表示確認・スクリーンショット確認にも使う。
 */
export const DEMO_DESIGNER_OUTPUT: DesignerOutput = {
  colorPalette: {
    primary: "#3B2314",
    secondary: "#E9D8BE",
    accent: "#9A3412",
    background: "#FFFBF5",
    text: "#2B2118",
  },
  typography: {
    heading: '"Noto Serif JP", serif',
    body: '"Noto Sans JP", sans-serif',
  },
  moodKeywords: ["落ち着いた", "あたたかみ"],
};

export const DEMO_FRONTEND_OUTPUT: FrontendOutput = {
  pageTitle: "Cafe Lumière",
  sections: [
    {
      kind: "hero",
      layoutVariant: "b",
      heading: "ゆっくりとした時間を、あなたに。",
      body: "一杯ずつ丁寧に淹れるコーヒーと、静かな時間を過ごせる隠れ家カフェ。",
      cta: "席を予約する",
    },
    {
      kind: "about",
      layoutVariant: "c",
      heading: "私たちについて",
      body: "焙煎士が毎朝豆を選び、その日の気候に合わせて淹れ方を変えています。",
    },
    {
      kind: "menu",
      layoutVariant: "a",
      heading: "こだわりのメニュー",
      body: "シングルオリジンのハンドドリップから、季節のスイーツまで。",
    },
    {
      kind: "testimonials",
      layoutVariant: "b",
      heading: "お客様の声",
      body: "「毎週通いたくなる落ち着いた雰囲気」「コーヒーの香りに癒される」",
    },
    {
      kind: "contact",
      layoutVariant: "c",
      heading: "アクセス",
      body: "駅から徒歩5分。営業時間は8:00〜19:00(定休日: 月曜)。",
    },
    {
      kind: "cta",
      layoutVariant: "b",
      heading: "今日のひとときを、当店で。",
      body: "ご予約はオンラインから簡単に行えます。",
      cta: "予約ページへ",
    },
    {
      kind: "footer",
      layoutVariant: "a",
      heading: "Cafe Lumière",
      body: "© 2026 Cafe Lumière. All rights reserved.",
    },
  ],
};
