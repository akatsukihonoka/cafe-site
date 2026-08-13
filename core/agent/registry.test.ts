import { afterEach, describe, expect, it } from "vitest";
import { clearAgentRegistry, getAgent, registerAgent } from "./registry";

describe("agent registry", () => {
  afterEach(() => {
    clearAgentRegistry();
  });

  it("未登録のエージェントを取得しようとすると未実装であることを伝えるエラーを投げる", () => {
    expect(() => getAgent("director")).toThrow(/not registered/);
  });

  it("登録したエージェントを取得できる", async () => {
    registerAgent("director", async (input: unknown) => ({ echoed: input }));
    const agent = getAgent("director");
    await expect(agent({ foo: "bar" })).resolves.toEqual({ echoed: { foo: "bar" } });
  });
});
