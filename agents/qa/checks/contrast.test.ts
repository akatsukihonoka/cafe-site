import { describe, expect, it } from "vitest";
import { contrastRatio } from "./contrast";

describe("contrastRatio", () => {
  it("白と黒は21:1", () => {
    expect(contrastRatio("#FFFFFF", "#000000")).toBeCloseTo(21, 0);
  });

  it("同じ色は1:1", () => {
    expect(contrastRatio("#336699", "#336699")).toBeCloseTo(1, 5);
  });

  it("引数の順序に依存しない", () => {
    const a = contrastRatio("#FFFFFF", "#333333");
    const b = contrastRatio("#333333", "#FFFFFF");
    expect(a).toBeCloseTo(b!, 5);
  });

  it("hexとして解釈できない値はnullを返す", () => {
    expect(contrastRatio("oklch(0.5 0.1 30)", "#FFFFFF")).toBeNull();
  });
});
