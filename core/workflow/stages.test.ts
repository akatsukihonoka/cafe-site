import { describe, expect, it } from "vitest";
import { PIPELINE_STAGES, isEarlierStage, stagesFrom } from "./stages";

describe("stagesFrom", () => {
  it("指定ステージ以降を返す", () => {
    expect(stagesFrom("ux")).toEqual(["ux", "designer", "copywriter", "frontend"]);
  });

  it("先頭ステージなら全ステージを返す", () => {
    expect(stagesFrom(PIPELINE_STAGES[0])).toEqual([...PIPELINE_STAGES]);
  });
});

describe("isEarlierStage", () => {
  it("上流のステージほど早いと判定する", () => {
    expect(isEarlierStage("director", "frontend")).toBe(true);
    expect(isEarlierStage("frontend", "director")).toBe(false);
  });
});
