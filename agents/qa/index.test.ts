import { describe, expect, it } from "vitest";
import { runQa } from "./index";
import { DEMO_DESIGNER_OUTPUT, DEMO_FRONTEND_OUTPUT } from "@/components-library/demoData";

describe("runQa", () => {
  it("Phase7のデモデータ一式に対しては減点がなく満点になる", async () => {
    const ux = {
      sections: DEMO_FRONTEND_OUTPUT.sections.map((s) => ({ kind: s.kind, purpose: s.heading })),
    };
    const copywriter = {
      sections: DEMO_FRONTEND_OUTPUT.sections.map((s) => ({
        kind: s.kind,
        heading: s.heading,
        body: s.body,
        cta: s.cta,
      })),
    };

    const result = await runQa({
      requirement: {},
      outputs: {
        ux,
        designer: DEMO_DESIGNER_OUTPUT,
        copywriter,
        frontend: DEMO_FRONTEND_OUTPUT,
      },
    });

    expect(result.score).toBe(100);
    expect(result.findings).toEqual([]);
  });

  it("必要なステージ出力が欠けている場合はそのチェックだけスキップし、例外は投げない", async () => {
    const result = await runQa({ requirement: {}, outputs: {} });
    expect(result.score).toBe(100);
    expect(result.findings).toEqual([]);
  });
});
