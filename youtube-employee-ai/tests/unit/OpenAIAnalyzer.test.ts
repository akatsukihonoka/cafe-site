import { describe, expect, it, vi } from 'vitest';
import { OpenAIAnalyzer } from '@/infrastructure/ai/OpenAIAnalyzer';
import type { AIAnalysisContext } from '@/domain/ports/AIAnalyzer';

const context: AIAnalysisContext = {
  channelDisplayName: 'テストチャンネル',
  targetDate: new Date('2026-07-22T00:00:00Z'),
  stats: {
    date: new Date('2026-07-22T00:00:00Z'),
    totalViews: 100,
    totalWatchTimeMinutes: 50,
    subscribersGained: 2,
    subscribersLost: 0,
    videos: [],
  },
};

function createClientReturning(contents: Array<string | null>) {
  const create = vi.fn();
  contents.forEach((content) => {
    create.mockResolvedValueOnce({ choices: [{ message: { content } }] });
  });
  return { chat: { completions: { create } } };
}

describe('OpenAIAnalyzer', () => {
  it('1回目でスキーマに一致するJSONが返れば、そのまま解析結果を返す', async () => {
    const validJson = JSON.stringify({
      yesterdaySummary: { totalViews: 100 },
      todos: ['サムネイルを見直す'],
      suggestions: [{ title: '投稿頻度を上げる', description: '週3本を目標に', priority: 'HIGH' }],
    });
    const client = createClientReturning([validJson]);

    const analyzer = new OpenAIAnalyzer(client as never, 'gpt-test');
    const result = await analyzer.generateBriefing(context);

    expect(client.chat.completions.create).toHaveBeenCalledTimes(1);
    expect(result.todos).toEqual(['サムネイルを見直す']);
  });

  it('1回目が不正なJSONの場合、1回だけ再試行して成功すれば結果を返す', async () => {
    const validJson = JSON.stringify({
      yesterdaySummary: {},
      todos: ['todo'],
      suggestions: [{ title: 't', description: 'd', priority: 'LOW' }],
    });
    const client = createClientReturning(['not-json', validJson]);

    const analyzer = new OpenAIAnalyzer(client as never, 'gpt-test');
    const result = await analyzer.generateBriefing(context);

    expect(client.chat.completions.create).toHaveBeenCalledTimes(2);
    expect(result.todos).toEqual(['todo']);
  });

  it('リトライ後も不正なままなら例外を投げる', async () => {
    const client = createClientReturning(['not-json', 'still-not-json']);

    const analyzer = new OpenAIAnalyzer(client as never, 'gpt-test');

    await expect(analyzer.generateBriefing(context)).rejects.toThrow();
    expect(client.chat.completions.create).toHaveBeenCalledTimes(2);
  });

  it('スキーマの必須フィールド(todos)が欠けている場合はバリデーションエラーとして扱う', async () => {
    const invalidJson = JSON.stringify({ yesterdaySummary: {}, suggestions: [] });
    const client = createClientReturning([invalidJson, invalidJson]);

    const analyzer = new OpenAIAnalyzer(client as never, 'gpt-test');

    await expect(analyzer.generateBriefing(context)).rejects.toThrow();
  });
});
