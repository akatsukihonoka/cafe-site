import { describe, expect, it } from "vitest";
import { checkStructuralIntegrity } from "./structuralIntegrity";
import type { UxOutput } from "@/agents/ux/contract";
import type { CopywriterOutput } from "@/agents/copywriter/contract";
import type { FrontendOutput } from "@/agents/frontend/contract";

const ux: UxOutput = {
  sections: [
    { kind: "hero", purpose: "第一印象" },
    { kind: "menu", purpose: "メニュー訴求" },
  ],
};

describe("checkStructuralIntegrity", () => {
  it("全セクションが揃っていれば指摘なし", () => {
    const copywriter: CopywriterOutput = {
      sections: [
        { kind: "hero", heading: "h", body: "b" },
        { kind: "menu", heading: "h", body: "b" },
      ],
    };
    const frontend: FrontendOutput = {
      pageTitle: "t",
      sections: [
        { kind: "hero", layoutVariant: "a", heading: "h", body: "b" },
        { kind: "menu", layoutVariant: "a", heading: "h", body: "b" },
      ],
    };
    expect(checkStructuralIntegrity(ux, copywriter, frontend)).toEqual([]);
  });

  it("Copywriterでセクションが抜けていれば指摘する", () => {
    const copywriter: CopywriterOutput = {
      sections: [{ kind: "hero", heading: "h", body: "b" }],
    };
    const frontend: FrontendOutput = {
      pageTitle: "t",
      sections: [
        { kind: "hero", layoutVariant: "a", heading: "h", body: "b" },
        { kind: "menu", layoutVariant: "a", heading: "h", body: "b" },
      ],
    };
    const findings = checkStructuralIntegrity(ux, copywriter, frontend);
    expect(findings).toEqual([
      { stage: "copywriter", issue: expect.stringContaining("menu") },
    ]);
  });

  it("Frontendでセクションが抜けていれば指摘する", () => {
    const copywriter: CopywriterOutput = {
      sections: [
        { kind: "hero", heading: "h", body: "b" },
        { kind: "menu", heading: "h", body: "b" },
      ],
    };
    const frontend: FrontendOutput = {
      pageTitle: "t",
      sections: [{ kind: "hero", layoutVariant: "a", heading: "h", body: "b" }],
    };
    const findings = checkStructuralIntegrity(ux, copywriter, frontend);
    expect(findings).toEqual([
      { stage: "frontend", issue: expect.stringContaining("menu") },
    ]);
  });
});
