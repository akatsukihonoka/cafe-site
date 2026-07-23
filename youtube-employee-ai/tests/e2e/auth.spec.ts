import { test, expect } from '@playwright/test';

// 実Supabase/Googleプロジェクトが無い環境でも検証できる範囲(認証ガードとログイン画面)のみ。
// ログイン→YouTube連携→ダッシュボード表示までの本番相当のE2Eは、実際のSupabase/Google
// OAuth認証情報が用意でき次第、追加する。

test.describe('認証ガード', () => {
  test('未ログインで / にアクセスすると /login へリダイレクトされる', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/login$/);
  });

  test('/login にはGoogleログインボタンが表示される', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByRole('button', { name: 'Googleでログイン' })).toBeVisible();
  });

  test('未ログインで /settings にアクセスしても /login へリダイレクトされる', async ({ page }) => {
    await page.goto('/settings');
    await expect(page).toHaveURL(/\/login$/);
  });
});
