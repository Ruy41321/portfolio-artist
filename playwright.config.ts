import { defineConfig, devices } from '@playwright/test'

import { E2E_BASE_URL, E2E_PORT, e2eEnv } from './tests/e2e/env'

const externalServer = Boolean(process.env.E2E_BASE_URL)

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.e2e.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  globalSetup: externalServer ? undefined : './tests/e2e/global-setup.ts',
  use: {
    baseURL: E2E_BASE_URL,
    locale: 'it-IT',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : undefined,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], locale: 'it-IT' } }],
  // Production build served on a dedicated port against the seeded test database.
  webServer: externalServer
    ? undefined
    : {
        command: process.env.E2E_SKIP_BUILD
          ? `pnpm start -p ${E2E_PORT}`
          : `pnpm build && pnpm start -p ${E2E_PORT}`,
        url: `${E2E_BASE_URL}/api/health`,
        env: e2eEnv(),
        reuseExistingServer: false,
        timeout: 600_000,
        stdout: 'pipe',
      },
})
