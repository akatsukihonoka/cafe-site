import { describe, expect, it } from "vitest";
import { displayPhaseForStage } from "./stageDisplay";

describe("displayPhaseForStage", () => {
  it("nullはnullを返す", () => {
    expect(displayPhaseForStage(null)).toBeNull();
  });

  it("director/marketing/uxはplanningにまとまる", () => {
    expect(displayPhaseForStage("director")).toBe("planning");
    expect(displayPhaseForStage("marketing")).toBe("planning");
    expect(displayPhaseForStage("ux")).toBe("planning");
  });

  it("designer/copywriterはdesigningにまとまる", () => {
    expect(displayPhaseForStage("designer")).toBe("designing");
    expect(displayPhaseForStage("copywriter")).toBe("designing");
  });

  it("frontendはcoding、review_qaはreviewing、deployはpublishing", () => {
    expect(displayPhaseForStage("frontend")).toBe("coding");
    expect(displayPhaseForStage("review_qa")).toBe("reviewing");
    expect(displayPhaseForStage("deploy")).toBe("publishing");
  });
});
