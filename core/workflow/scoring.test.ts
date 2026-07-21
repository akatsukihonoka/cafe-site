import { describe, expect, it } from "vitest";
import { decideNextAction } from "./scoring";

describe("decideNextAction", () => {
  it("指摘がなければpass", () => {
    const result = decideNextAction({ score: 70, findings: [] }, {});
    expect(result).toEqual({ type: "pass" });
  });

  it("しきい値以上ならpass", () => {
    const result = decideNextAction(
      { score: 90, findings: [{ stage: "designer", issue: "minor" }] },
      {}
    );
    expect(result).toEqual({ type: "pass" });
  });

  it("複数の指摘があれば最も上流のステージから再実行する", () => {
    const result = decideNextAction(
      {
        score: 60,
        findings: [
          { stage: "frontend", issue: "layout broken" },
          { stage: "marketing", issue: "weak CTA" },
        ],
      },
      {}
    );
    expect(result).toEqual({ type: "retryFrom", stage: "marketing" });
  });

  it("上限回数に達していたらgiveUp", () => {
    const result = decideNextAction(
      { score: 60, findings: [{ stage: "designer", issue: "colors clash" }] },
      { designer: 2 }
    );
    expect(result.type).toBe("giveUp");
  });

  it("上限回数未満ならretryFrom", () => {
    const result = decideNextAction(
      { score: 60, findings: [{ stage: "designer", issue: "colors clash" }] },
      { designer: 1 }
    );
    expect(result).toEqual({ type: "retryFrom", stage: "designer" });
  });
});
