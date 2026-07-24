import { defineConfig, devices } from '@playwright/test';

const PORT = 3400;
const BASE_URL = `http://localhost:${PORT}`;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        launchOptions: {
          executablePath: '/opt/pw-browsers/chromium',
        },
      },
    },
  ],
  webServer: {
    command: `npm run dev -- -p ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    env: {
      // 実Supabaseプロジェクトがなくても、認証ガード等のE2Eテストが動くようにするための
      // テスト専用ダミー値。.envには書かず、Playwright起動時にだけ注入する。
      NEXT_PUBLIC_SUPABASE_URL: 'https://dummy-project.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'dummy-anon-key',
    },
  },
});
