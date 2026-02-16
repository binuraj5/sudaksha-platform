import "dotenv/config";
import { defineConfig } from "@playwright/test";

/**
 * Playwright E2E config for assessment flow.
 * Run: npm run test:e2e (starts dev server if not running)
 * Optional: set E2E_TEST_EMAIL and E2E_TEST_PASSWORD in .env to run authenticated tests.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "smoke", testMatch: /smoke\.spec\.ts/ },
    { name: "assessments", testMatch: /assessments\.spec\.ts/ },
  ],
  webServer: {
    command: "npm run dev",
    url: process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "ignore",
    stderr: "pipe",
  },
});
