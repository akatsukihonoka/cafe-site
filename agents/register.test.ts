import { describe, expect, it } from "vitest";
import "@/agents/register";
import { getAgent, type RegisteredAgentName } from "@/core/agent/registry";

const ALL_AGENTS: RegisteredAgentName[] = [
  "interviewer",
  "director",
  "marketing",
  "ux",
  "designer",
  "copywriter",
  "frontend",
  "reviewer",
  "qa",
];

describe("agents/register", () => {
  it.each(ALL_AGENTS)("%sが登録されている", (name) => {
    expect(() => getAgent(name)).not.toThrow();
  });
});
