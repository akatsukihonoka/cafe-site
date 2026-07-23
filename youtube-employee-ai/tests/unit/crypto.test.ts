import { describe, expect, it } from 'vitest';
import { decryptToken, encryptToken } from '@/lib/crypto';

const SECRET = '01234567890123456789012345678901';

describe('encryptToken / decryptToken', () => {
  it('暗号化した文字列を復号すると元の文字列に戻る', () => {
    const original = 'ya29.dummy-access-token-value';

    const encrypted = encryptToken(original, SECRET);
    const decrypted = decryptToken(encrypted, SECRET);

    expect(decrypted).toBe(original);
  });

  it('暗号化結果は平文と異なる', () => {
    const original = 'ya29.dummy-access-token-value';

    const encrypted = encryptToken(original, SECRET);

    expect(encrypted).not.toBe(original);
  });

  it('毎回異なるIVを使うため、同じ平文でも暗号文は毎回変わる', () => {
    const original = 'ya29.dummy-access-token-value';

    const first = encryptToken(original, SECRET);
    const second = encryptToken(original, SECRET);

    expect(first).not.toBe(second);
  });

  it('誤ったシークレットで復号すると失敗する', () => {
    const original = 'ya29.dummy-access-token-value';
    const encrypted = encryptToken(original, SECRET);
    const wrongSecret = '99999999999999999999999999999999';

    expect(() => decryptToken(encrypted, wrongSecret)).toThrow();
  });
});
