export type BriefingStatus = 'PENDING' | 'COMPLETED' | 'FAILED';

export type SuggestionPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface BriefingSuggestion {
  title: string;
  description: string;
  priority: SuggestionPriority;
}

export interface BriefingContent {
  yesterdaySummary: Record<string, unknown>;
  todos: string[];
  suggestions: BriefingSuggestion[];
}

export interface Briefing {
  id: string;
  channelId: string;
  targetDate: Date;
  status: BriefingStatus;
  content: BriefingContent | null;
  rawMetrics: Record<string, unknown> | null;
  aiModel: string | null;
  generatedAt: Date | null;
  errorMessage: string | null;
}
