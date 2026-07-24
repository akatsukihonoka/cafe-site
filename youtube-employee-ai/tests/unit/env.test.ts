import { describe, expect, it } from 'vitest';
import { parseServerEnv, parsePublicEnv } from '@/lib/env';

const validServerEnv: Record<string, string | undefined> = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
  DIRECT_URL: 'postgresql://user:pass@localhost:5432/db',
  SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
  GOOGLE_CLIENT_ID: 'google-client-id',
  GOOGLE_CLIENT_SECRET: 'google-client-secret',
  YOUTUBE_OAUTH_REDIRECT_URI: 'https://example.com/api/channels/connect/callback',
  OPENAI_API_KEY: 'sk-test',
  TOKEN_ENCRYPTION_KEY: '01234567890123456789012345678901',
  CRON_SECRET: 'cron-secret',
};

const validPublicEnv: Record<string, string | undefined> = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-key',
};

function withoutKey(source: Record<string, string | undefined>, key: string) {
  const copy = { ...source };
  delete copy[key];
  return copy;
}

describe('parseServerEnv', () => {
  it('全ての必須変数が揃っていれば成功する', () => {
    expect(parseServerEnv(validServerEnv)).toEqual(validServerEnv);
  });

  it('必須変数が1つ欠けている場合、変数名を含む明確なエラーを投げる', () => {
    const missingOpenAiKey = withoutKey(validServerEnv, 'OPENAI_API_KEY');

    expect(() => parseServerEnv(missingOpenAiKey)).toThrow(/OPENAI_API_KEY/);
  });

  it('TOKEN_ENCRYPTION_KEYが短すぎる場合はエラーを投げる', () => {
    expect(() => parseServerEnv({ ...validServerEnv, TOKEN_ENCRYPTION_KEY: 'too-short' })).toThrow(
      /TOKEN_ENCRYPTION_KEY/,
    );
  });
});

describe('parsePublicEnv', () => {
  it('全ての必須変数が揃っていれば成功する', () => {
    expect(parsePublicEnv(validPublicEnv)).toEqual(validPublicEnv);
  });

  it('NEXT_PUBLIC_SUPABASE_URLが欠けている場合、明確なエラーを投げる', () => {
    const missingUrl = withoutKey(validPublicEnv, 'NEXT_PUBLIC_SUPABASE_URL');

    expect(() => parsePublicEnv(missingUrl)).toThrow(/NEXT_PUBLIC_SUPABASE_URL/);
  });
});
