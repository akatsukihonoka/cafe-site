import OpenAI from 'openai';
import type { AIAnalysisContext, AIAnalyzer } from '@/domain/ports/AIAnalyzer';
import type { BriefingContent } from '@/domain/entities/Briefing';
import {
  AuthExpiredError,
  ExternalApiError,
  QuotaExceededError,
  ValidationError,
} from '@/lib/errors';
import { SYSTEM_PROMPT, buildUserPrompt } from './promptTemplate';
import { briefingContentSchema } from './briefingContentSchema';

const DEFAULT_MODEL = 'gpt-4o-mini';
const MAX_ATTEMPTS = 2;

const RETRY_NOTE =
  '\n\n前回の出力はスキーマに一致しませんでした。yesterdaySummary/todos/suggestionsの形式を守り、JSON以外の文章を含めないでください。';

type ChatCompletionsClient = Pick<OpenAI, 'chat'>;

function toAnalyzerError(error: unknown, attempts: number): Error {
  const prefix = `AI response invalid after ${attempts} attempt(s)`;

  if (error instanceof OpenAI.APIError) {
    const message = `${prefix}: ${error.message}`;
    if (error.status === 401) {
      return new AuthExpiredError(message, error.status, { cause: error });
    }
    if (error.status === 429) {
      return new QuotaExceededError(message, error.status, { cause: error });
    }
    return new ExternalApiError(message, error.status, { cause: error });
  }

  const message = `${prefix}: ${error instanceof Error ? error.message : String(error)}`;
  return new ValidationError(message, { cause: error instanceof Error ? error : undefined });
}

export class OpenAIAnalyzer implements AIAnalyzer {
  constructor(
    private readonly client: ChatCompletionsClient,
    private readonly model: string = DEFAULT_MODEL,
  ) {}

  async generateBriefing(context: AIAnalysisContext): Promise<BriefingContent> {
    const userPrompt = buildUserPrompt(context);
    let lastError: unknown;

    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const isRetry = attempt > 0;

      try {
        const completion = await this.client.chat.completions.create({
          model: this.model,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'developer', content: SYSTEM_PROMPT },
            { role: 'user', content: isRetry ? `${userPrompt}${RETRY_NOTE}` : userPrompt },
          ],
        });

        const raw = completion.choices[0]?.message?.content;
        if (!raw) {
          lastError = new Error('OpenAI response did not include message content');
          continue;
        }

        return briefingContentSchema.parse(JSON.parse(raw));
      } catch (error) {
        lastError = error;
      }
    }

    throw toAnalyzerError(lastError, MAX_ATTEMPTS);
  }
}

export function createOpenAIAnalyzer(
  apiKey: string,
  model: string = DEFAULT_MODEL,
): OpenAIAnalyzer {
  return new OpenAIAnalyzer(new OpenAI({ apiKey }), model);
}
