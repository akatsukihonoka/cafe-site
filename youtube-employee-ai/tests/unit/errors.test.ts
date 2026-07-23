import { describe, expect, it } from 'vitest';
import {
  AppError,
  AuthExpiredError,
  DomainError,
  ExternalApiError,
  QuotaExceededError,
  ValidationError,
  toExternalApiError,
} from '@/lib/errors';

describe('AppErrorクラス階層', () => {
  it('DomainError/ValidationErrorはAppErrorのインスタンスである', () => {
    expect(new DomainError('domain')).toBeInstanceOf(AppError);
    expect(new ValidationError('validation')).toBeInstanceOf(AppError);
  });

  it('AuthExpiredError/QuotaExceededErrorはExternalApiErrorのインスタンスである', () => {
    expect(new AuthExpiredError('auth', 401)).toBeInstanceOf(ExternalApiError);
    expect(new QuotaExceededError('quota', 429)).toBeInstanceOf(ExternalApiError);
  });

  it('nameプロパティがクラス名と一致する(ログでの判別用)', () => {
    expect(new AuthExpiredError('auth').name).toBe('AuthExpiredError');
  });
});

describe('toExternalApiError', () => {
  it('401はAuthExpiredErrorに変換する', async () => {
    const response = new Response('invalid_token', { status: 401 });
    const error = await toExternalApiError(response, 'test API');

    expect(error).toBeInstanceOf(AuthExpiredError);
    expect(error.statusCode).toBe(401);
    expect(error.message).toContain('invalid_token');
  });

  it('429はQuotaExceededErrorに変換する', async () => {
    const response = new Response('rate limited', { status: 429 });
    const error = await toExternalApiError(response, 'test API');

    expect(error).toBeInstanceOf(QuotaExceededError);
  });

  it('それ以外はExternalApiErrorに変換する', async () => {
    const response = new Response('server error', { status: 500 });
    const error = await toExternalApiError(response, 'test API');

    expect(error).toBeInstanceOf(ExternalApiError);
    expect(error).not.toBeInstanceOf(AuthExpiredError);
    expect(error).not.toBeInstanceOf(QuotaExceededError);
  });
});
