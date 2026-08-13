import { describe, expect, it } from "vitest";
import { checkContentQuality } from "./contentQuality";
import type { CopywriterOutput } from "@/agents/copywriter/contract";

describe("checkContentQuality", () => {
  it("十分な長さの見出し・本文なら指摘なし", () => {
    const copywriter: CopywriterOutput = {
      sections: [{ kind: "hero", heading: "ゆっくりとした時間を", body: "本文がしっかりある文章です。" }],
    };
    expect(checkContentQuality(copywriter)).toEqual([]);
  });

  it("見出し・本文が短すぎれば指摘する", () => {
    const copywriter: CopywriterOutput = {
      sections: [{ kind: "hero", heading: "a", body: "b" }],
    };
    const findings = checkContentQuality(copywriter);
    expect(findings).toHaveLength(2);
    expect(findings.every((f) => f.stage === "copywriter")).toBe(true);
  });
});
