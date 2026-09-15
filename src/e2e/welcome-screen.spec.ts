import { _electron as electron } from "@playwright/test";
import { test as base, expect } from "@playwright/test";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { tmpdir } from "os";
import { mkdirSync, rmSync, writeFileSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

interface WelcomeScreenFixtures {
  app: Awaited<ReturnType<typeof electron.launch>>;
  page: Awaited<ReturnType<typeof electron.launch>>;
}

/**
 * Custom fixture for WelcomeScreen testing
 * Starts app with welcomeScreenShown: false to display the welcome screen
 */
export const test = base.extend<WelcomeScreenFixtures>({
  // eslint-disable-next-line no-empty-pattern
  app: async ({}, use) => {
    const testDataDir = resolve(
      tmpdir(),
      `sleek-welcome-test-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    );
    mkdirSync(testDataDir, { recursive: true });

    const projectRoot = resolve(__dirname, "../../");
    const mainEntry = resolve(projectRoot, "out/main/index.js");
    const homeDir = resolve(testDataDir, "home");

    const libAppSupportDir = resolve(homeDir, "Library", "Application Support");
    const sleekUserDataDir = resolve(libAppSupportDir, "sleek", "userData");
    mkdirSync(sleekUserDataDir, { recursive: true });

    // Config with welcomeScreenShown: false to show welcome screen
    const welcomeScreenConfig = {
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
      files: [],
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
      matomo: false,
      welcomeScreenShown: false,
      chokidarOptions: {
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100,
        },
      },
    };

    const configPath = resolve(sleekUserDataDir, "config.json");
    writeFileSync(
      configPath,
      JSON.stringify(welcomeScreenConfig, null, 2),
      "utf-8",
    );

    const app = await electron.launch({
      args: [mainEntry, `--user-data-dir=${sleekUserDataDir}`],
      cwd: projectRoot,
      env: {
        ...process.env,
        NODE_ENV: "test",
        ELECTRON_DISABLE_SANDBOX: "1",
        HOME: homeDir,
        APPDATA: resolve(testDataDir, "AppData"),
        XDG_CONFIG_HOME: resolve(testDataDir, "XDG_CONFIG"),
        XDG_CACHE_HOME: resolve(testDataDir, "XDG_CACHE"),
        XDG_DATA_HOME: resolve(testDataDir, "XDG_DATA"),
        USERPROFILE: homeDir,
        LANG: "en_US.UTF-8",
      },
    });

    await use(app);

    await app.close();

    try {
      rmSync(testDataDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors
    }
  },

  page: async ({ app }, use) => {
    const page = await app.firstWindow();
    await page.waitForLoadState("domcontentloaded");
    await use(page);
  },
});

test.describe("Welcome Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.waitForSelector("#welcomeScreen", { state: "visible" });
  });

  test("should display welcome screen with headline and description", async ({
    page,
  }) => {
    await expect(page.locator("#welcomeScreen")).toBeVisible();
    await expect(page.locator("#welcomeScreen h1")).toHaveText(
      "Welcome to sleek",
    );
    await expect(page.locator("#welcomeScreen .description")).toContainText(
      "Get started by opening",
    );
  });

  test("should display analytics section", async ({ page }) => {
    await expect(
      page.locator("#welcomeScreen .analyticsSection h2"),
    ).toHaveText("Help improve sleek");
    await expect(
      page.locator("#welcomeScreen .analyticsDescription"),
    ).toContainText("Allow anonymous analytics");
  });

  test("should display two action buttons", async ({ page }) => {
    const declineButton = page.locator(
      "[data-testid='welcome-button-decline']",
    );
    const acceptButton = page.locator("[data-testid='welcome-button-accept']");

    await expect(declineButton).toBeVisible();
    await expect(acceptButton).toBeVisible();
  });

  test("should have both buttons enabled and clickable", async ({ page }) => {
    const declineButton = page.locator(
      "[data-testid='welcome-button-decline']",
    );
    const acceptButton = page.locator("[data-testid='welcome-button-accept']");

    await expect(declineButton).toBeEnabled();
    await expect(acceptButton).toBeEnabled();
  });

  test("should close welcome screen when decline button is clicked", async ({
    page,
  }) => {
    const declineButton = page.locator(
      "[data-testid='welcome-button-decline']",
    );

    await declineButton.click();

    await expect(page.locator("#welcomeScreen")).not.toBeVisible();
  });

  test("should close welcome screen when accept button is clicked", async ({
    page,
  }) => {
    const acceptButton = page.locator("[data-testid='welcome-button-accept']");

    await acceptButton.click();

    await expect(page.locator("#welcomeScreen")).not.toBeVisible();
  });
});
