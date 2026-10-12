import { defineConfig, devices } from '@playwright/test'
import 'dotenv/config'

const port = Number(process.env.E2E_PORT || 3000)
const baseURL = process.env.E2E_BASE_URL || `http://localhost:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL,
    trace: 'retain-on-failure',
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : undefined,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: 'pnpm dev',
        reuseExistingServer: !process.env.CI,
        url: `${baseURL}/api/health`,
        timeout: 180_000,
      },
})
