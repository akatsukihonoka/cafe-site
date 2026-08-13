import type { Requirement } from "./requirement";

export interface InterviewMessage {
  role: "user" | "interviewer";
  content: string;
}

/**
 * Interviewer Agent(Phase6)が返す出力の形。実体は agents/interviewer/contract.ts の
 * interviewerOutputSchema (zod)。ここではAPIルート等が使う軽量なTS型として再掲する。
 */
export interface InterviewerOutput {
  status: "question" | "complete";
  message: string;
  requirement?: Requirement;
}

export type ChatApiResponse =
  | { status: "question"; message: string }
  | { status: "complete"; message: string }
  | { status: "error"; message: string };
