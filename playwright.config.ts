import { defineConfig } from "@playwright/test";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * sleek E2E Testing Configuration
 *
 * Tests run against a built Electron app. Tests are sequential (no parallelization)
 * because Electron uses a single-instance lock. Each test gets isolated app data dir.
 */

export default defineConfig({
  testDir: `${__dirname}/src/e2e`,
  testMatch: "**/*.spec.ts",

  /* Run tests sequentially — Electron app uses single-instance lock */
  fullyParallel: false,
  workers: 1,

  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html", { open: "never" }],
    ["json", { outputFile: "test-results/results.json" }],
    ["junit", { outputFile: "test-results/junit.xml" }],
  ],

  /* Shared settings for all tests */
  use: {
    /* Collect trace on first retry for debugging */
    trace: "on-first-retry",

    /* Screenshot on failure */
    screenshot: "only-on-failure",

    /* Video on failure */
    video: "retain-on-failure",
  },

  /* Global timeout: 30 seconds per test (Electron apps are slower than web) */
  timeout: 30 * 1000,
});
