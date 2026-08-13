import { describe, expect, it } from "vitest";
import { frontendOutputSchema } from "@/agents/frontend/contract";
import { designerOutputSchema } from "@/agents/designer/contract";
import { DEMO_FRONTEND_OUTPUT, DEMO_DESIGNER_OUTPUT } from "./demoData";

describe("demoData", () => {
  it("DEMO_FRONTEND_OUTPUTはfrontendOutputSchemaを満たす", () => {
    expect(() => frontendOutputSchema.parse(DEMO_FRONTEND_OUTPUT)).not.toThrow();
  });

  it("DEMO_DESIGNER_OUTPUTはdesignerOutputSchemaの色/タイポグラフィ部分を満たす", () => {
    expect(() =>
      designerOutputSchema.pick({ colorPalette: true, typography: true, moodKeywords: true }).parse(DEMO_DESIGNER_OUTPUT)
    ).not.toThrow();
  });
});
