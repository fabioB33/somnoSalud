import { defineConfig, devices } from '@playwright/test';

/**
 * Config Playwright para tests E2E del webapp-somnosalud.
 *
 * webServer: lanza `next dev` automaticamente antes de los tests
 * (timeout 60s para warmup). Tests corren contra http://localhost:3000.
 *
 * Solo Chromium headless por ahora (Sprint 13). Firefox/Safari cuando
 * Pablo lo pida o haya bug reportado cross-browser.
 *
 * Tests viven en tests/e2e/*.spec.ts.
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // false porque comparten sessionStorage cookie
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // singleton para no pisar el dev server compartido
  reporter: process.env.CI ? 'github' : 'list',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: './node_modules/.bin/next dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});
