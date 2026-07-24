import { describe, expect, it, vi, afterEach } from 'vitest';
import { logger } from '@/lib/logger';

describe('logger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('info/warn/errorはそれぞれ対応するconsoleメソッドへJSON文字列を出力する', () => {
    const infoSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.info('info message', { channelId: 'chan_1' });
    logger.warn('warn message');
    logger.error('error message', { jobId: 'job_1' });

    expect(infoSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(errorSpy).toHaveBeenCalledTimes(1);

    const infoEntry = JSON.parse(infoSpy.mock.calls[0][0] as string);
    expect(infoEntry).toMatchObject({
      level: 'info',
      message: 'info message',
      channelId: 'chan_1',
    });
    expect(typeof infoEntry.timestamp).toBe('string');
  });

  it('accessToken/refreshToken/apiKey等のキーは値をマスキングする', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    logger.error('failed to refresh', {
      accessTokenEnc: 'super-secret-token',
      nested: { apiKey: 'sk-secret', safeValue: 'ok' },
    });

    const entry = JSON.parse(errorSpy.mock.calls[0][0] as string);
    expect(entry.accessTokenEnc).toBe('[REDACTED]');
    expect(entry.nested.apiKey).toBe('[REDACTED]');
    expect(entry.nested.safeValue).toBe('ok');
  });
});
