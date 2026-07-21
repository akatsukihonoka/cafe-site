import { describe, expect, it } from "vitest";
import { checkColorContrast } from "./colorContrast";
import { DEMO_DESIGNER_OUTPUT } from "@/components-library/demoData";
import type { DesignerOutput } from "@/agents/designer/contract";

describe("checkColorContrast", () => {
  it("Phase7のデモパレットはWCAG AAを満たす", () => {
    expect(checkColorContrast(DEMO_DESIGNER_OUTPUT)).toEqual([]);
  });

  it("本文と背景がほぼ同じ色なら指摘する", () => {
    const badDesigner: DesignerOutput = {
      colorPalette: {
        primary: "#000000",
        secondary: "#000000",
        accent: "#CCCCCC",
        background: "#FFFFFF",
        text: "#EEEEEE",
      },
      typography: { heading: "sans-serif", body: "sans-serif" },
      moodKeywords: ["test"],
    };
    const findings = checkColorContrast(badDesigner);
    expect(findings.length).toBeGreaterThan(0);
    expect(findings[0].stage).toBe("designer");
  });
});
