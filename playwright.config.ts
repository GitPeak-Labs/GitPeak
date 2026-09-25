import { defineConfig, devices } from '@playwright/test'

const DEV_SERVER_PORT = 5173
const DEV_SERVER_URL = `http://localhost:${DEV_SERVER_PORT}`
const DEV_SERVER_STARTUP_TIMEOUT_MILLISECONDS = 60_000

export default defineConfig({
  testDir: 'e2e',
  fullyParallel: true,
  workers: 2,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: DEV_SERVER_URL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'bun run dev',
    url: DEV_SERVER_URL,
    reuseExistingServer: !process.env.CI,
    timeout: DEV_SERVER_STARTUP_TIMEOUT_MILLISECONDS,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
