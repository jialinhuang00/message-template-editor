import { defineConfig, devices } from '@playwright/test'

// PW_SLOWMO adds a per-action pause so a headed run is watchable; unset (0) in CI
// and normal runs so they stay fast.
const slowMo = Number(process.env.PW_SLOWMO) || 0

export default defineConfig({
  testDir: './e2e',
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    launchOptions: { slowMo },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
