/**
 * ワークフロー全体で使うInngestイベント名。文字列リテラルで一元管理する。
 */
export const SITE_GENERATE_REQUESTED = "site/generate.requested" as const;

export interface SiteGenerateRequestedEventData {
  runId: string;
  projectId: string;
  /**
   * Interviewer Agentが確定した要件JSON。
   * 具体的なスキーマはPhase6でInterviewer Agentの出力契約として定義する。
   */
  requirement: unknown;
}
