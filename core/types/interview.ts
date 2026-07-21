export interface InterviewMessage {
  role: "user" | "interviewer";
  content: string;
}

/**
 * Interviewer Agent(Phase6)が返すことを期待する出力の形。
 * status="question"ならmessageを追加質問として表示し、
 * status="complete"ならrequirementが確定した要件JSONとしてWorkflow Engineに渡される。
 */
export interface InterviewerOutput {
  status: "question" | "complete";
  message: string;
  requirement?: unknown;
}

export type ChatApiResponse =
  | { status: "question"; message: string }
  | { status: "complete"; message: string }
  | { status: "error"; message: string };
