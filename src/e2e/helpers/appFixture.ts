/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable @typescript-eslint/no-unused-vars
import { test as base, _electron } from "@playwright/test";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { mkdirSync, rmSync, writeFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

type ElectronApplication = Awaited<ReturnType<typeof _electron.launch>>;
type Page = Awaited<ReturnType<ElectronApplication["firstWindow"]>>;

interface AppFixtures {
  app: ElectronApplication;
  page: Page;
}

/**
 * Factory function to create a fixture with configurable welcomeScreenShown setting
 * @param welcomeScreenShown - true = hide welcome screen, false = show welcome screen
 */
function buildAppFixture(welcomeScreenShown: boolean) {
  return base.extend<AppFixtures>({
    // eslint-disable-next-line no-empty-pattern
    app: async ({}, use) => {
      // Create unique test data directory
      const testDataDir = resolve(
        tmpdir(),
        `sleek-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      );
      mkdirSync(testDataDir, { recursive: true });

      console.log(`\n=== TEST FIXTURE DEBUG ===`);
      console.log(`Test data dir: ${testDataDir}`);

      // Get the project root (3 levels up: helpers -> e2e -> src -> root)
      const projectRoot = resolve(__dirname, "../../../");
      const mainEntry = resolve(projectRoot, "out/main/index.js");
      // electron-vite builds to out/, matching package.json "main" field

      const homeDir = resolve(testDataDir, "home");

      // On macOS, Electron looks in ~/Library/Application Support/{app-name}
      // We need to set HOME to redirect it
      // The app name appears to be "sleek" based on the old error path structure

      // Create the macOS-style structure
      const libAppSupportDir = resolve(
        homeDir,
        "Library",
        "Application Support",
      );
      const sleekUserDataDir = resolve(libAppSupportDir, "sleek", "userData");
      mkdirSync(sleekUserDataDir, { recursive: true });

      console.log(`Home dir: ${homeDir}`);
      console.log(`Sleek userData dir: ${sleekUserDataDir}`);

      // Create a fresh config.json with NO files loaded
      const freshConfig = {
        sorting: [
          { id: "1", value: "priority", invert: false },
          { id: "2", value: "projects", invert: false },
          { id: "3", value: "contexts", invert: false },
          { id: "4", value: "due", invert: false },
          { id: "5", value: "t", invert: false },
          { id: "6", value: "completed", invert: false },
          { id: "7", value: "created", invert: false },
          { id: "8", value: "rec", invert: false },
          { id: "9", value: "pm", invert: false },
        ],
        accordionOpenState: [
          true,
          true,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
        ],
        files: [], // EMPTY - no files loaded
        appendCreationDate: false,
        showCompleted: true,
        showHidden: false,
        windowMaximized: false,
        fileSorting: false,
        convertRelativeToAbsoluteDates: true,
        thresholdDateInTheFuture: true,
        colorTheme: "system",
        notificationsAllowed: true,
        notificationThreshold: 2,
        showFileTabs: true,
        isNavigationOpen: true,
        bulkTodoCreation: false,
        disableAnimations: false,
        useHumanFriendlyDates: false,
        excludeLinesWithPrefix: null,
        channel: "Test",
        menuBarVisibility: true,
        compact: false,
        sortCompletedLast: false,
        invertTrayColor: false,
        startMinimized: false,
        weekStart: 1,
        matomo: false, // DISABLE MATOMO FOR TESTS
        welcomeScreenShown, // Use the parameter
        chokidarOptions: {
          awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 100,
          },
        },
        __internal__: {
          migrations: {
            version: "999.0.0",
          },
        },
      };

      // Write the fresh config to config.json
      // Always use "userData" since app launches with NODE_ENV="test"
      const folderName = "userData";
      const actualConfigDir = resolve(sleekUserDataDir, folderName);
      mkdirSync(actualConfigDir, { recursive: true });
      const configPath = resolve(actualConfigDir, "config.json");
      writeFileSync(configPath, JSON.stringify(freshConfig, null, 2), "utf-8");
      console.log(`Config written to: ${configPath}`);

      const app = await _electron.launch({
        args: [
          mainEntry,
          `--user-data-dir=${sleekUserDataDir}`, // Force Electron to use test userData path
        ],
        cwd: projectRoot,
        env: {
          ...process.env,
          NODE_ENV: "test",
          ELECTRON_DISABLE_SANDBOX: "1",
          // Override HOME to redirect all config lookups to test directory
          HOME: homeDir,
          // Also set APPDATA and XDG paths for Windows/Linux
          APPDATA: resolve(testDataDir, "AppData"),
          XDG_CONFIG_HOME: resolve(testDataDir, "XDG_CONFIG"),
          XDG_CACHE_HOME: resolve(testDataDir, "XDG_CACHE"),
          XDG_DATA_HOME: resolve(testDataDir, "XDG_DATA"),
          USERPROFILE: homeDir,
          LANG: "en_US.UTF-8",
        },
      });

      console.log(`App launched with HOME=${homeDir}`);
      console.log(`=== END FIXTURE DEBUG ===\n`);

      await use(app);

      // Cleanup
      await app.close();

      // Clean up test directory
      try {
        rmSync(testDataDir, { recursive: true, force: true });
      } catch (e) {
        // Ignore cleanup errors
      }
    },

    page: async ({ app }, use) => {
      // Wait for the first window to open
      const page = await app.firstWindow();

      // Wait for the app to be ready
      await page.waitForLoadState("domcontentloaded");

      await use(page);
    },
  });
}

/**
 * Default fixture — welcome screen is HIDDEN (welcomeScreenShown: true)
 * Used by 95%+ of e2e tests
 */
export const test = buildAppFixture(true);

/**
 * Welcome-screen fixture — welcome screen is VISIBLE (welcomeScreenShown: false)
 * Used exclusively by welcome-screen.spec.ts
 */
export const appFixtureWithWelcome = buildAppFixture(false);

export { expect } from "@playwright/test";
