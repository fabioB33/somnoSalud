import { defineConfig, devices } from '@playwright/test';
import { config as loadEnv } from 'dotenv';
import { resolve } from 'path';

/**
 * Config Playwright para tests E2E del webapp-somnosalud.
 *
 * Sprint 9.D (2026-05-26): cargamos .env.local explicitamente porque los
 * helpers necesitan SUPABASE_SECRET_KEY + URL para crear test users
 * efimeros via admin API. Next dev carga .env.local automaticamente, pero
 * los tests Node (helpers.ts) no — corren en process aparte.
 *
 * webServer: lanza `next dev` automaticamente antes de los tests
 * (timeout 60s para warmup). Tests corren contra http://localhost:3000.
 *
 * Solo Chromium headless por ahora (Sprint 13). Firefox/Safari cuando
 * Pablo lo pida o haya bug reportado cross-browser.
 *
 * Tests viven en tests/e2e/*.spec.ts.
 */

loadEnv({ path: resolve(__dirname, '.env.local') });

export default defineConfig({
  testDir: './tests/e2e',
  globalTeardown: './tests/e2e/global-teardown.ts',
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
