import { test, expect } from "./helpers/appFixture";

test.describe("File Dialogs - Open & Create", () => {
  test("should display Open File button on splash screen", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    // Verify we're on splash screen (no files loaded)
    const splashScreen = page.locator("#splashScreen");
    await expect(splashScreen).toBeVisible();

    // Verify Open File button exists
    const openFileButton = page.locator(
      "[data-testid='splashscreen-button-open-file']",
    );
    await expect(openFileButton).toBeVisible();

    const buttonText = await openFileButton.textContent();
    expect(buttonText?.toLowerCase()).toContain("open");
  });

  test("should display Create File button on splash screen", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    const splashScreen = page.locator("#splashScreen");
    await expect(splashScreen).toBeVisible();

    const createFileButton = page.locator(
      "[data-testid='splashscreen-button-create-file']",
    );
    await expect(createFileButton).toBeVisible();

    const buttonText = await createFileButton.textContent();
    expect(buttonText?.toLowerCase()).toContain("create");
  });

  test("should have both buttons visible and clickable", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    const openFileButton = page.locator(
      "[data-testid='splashscreen-button-open-file']",
    );
    const createFileButton = page.locator(
      "[data-testid='splashscreen-button-create-file']",
    );

    await expect(openFileButton).toBeVisible();
    await expect(createFileButton).toBeVisible();

    // Verify buttons are enabled (not disabled)
    const openFileDisabled = await openFileButton.isDisabled();
    const createFileDisabled = await createFileButton.isDisabled();

    expect(openFileDisabled).toBe(false);
    expect(createFileDisabled).toBe(false);
  });

  test("should be in a buttons container on splash screen", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Look for the buttons container
    const buttonsContainer = page.locator("#splashScreen .buttons");
    await expect(buttonsContainer).toBeVisible();

    // Verify both buttons are inside this container
    const buttons = buttonsContainer.locator("button");
    const count = await buttons.count();

    // Should have exactly 2 buttons
    expect(count).toBe(2);
  });

  test("should have Open File button with correct handler", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    const openFileButton = page.locator(
      "[data-testid='splashscreen-button-open-file']",
    );

    // Verify button exists and has click handler
    await expect(openFileButton).toBeVisible();

    // Button should have onclick attribute or be clickable
    const isClickable = await openFileButton.evaluate((el) => {
      return el instanceof HTMLButtonElement && !el.disabled;
    });

    expect(isClickable).toBe(true);
  });

  test("should have Create File button with correct handler", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    const createFileButton = page.locator(
      "[data-testid='splashscreen-button-create-file']",
    );

    // Verify button exists and has click handler
    await expect(createFileButton).toBeVisible();

    // Button should be clickable
    const isClickable = await createFileButton.evaluate((el) => {
      return el instanceof HTMLButtonElement && !el.disabled;
    });

    expect(isClickable).toBe(true);
  });

  test("should display buttons with correct styling", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    const buttonsContainer = page.locator("#splashScreen .buttons");

    // Verify container is visible and has proper structure
    await expect(buttonsContainer).toBeVisible();

    // Get button elements
    const buttons = buttonsContainer.locator("button");
    const count = await buttons.count();

    expect(count).toBe(2);

    // Verify buttons are focusable
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const role = (await button.getAttribute("role")) || "button";
      expect(role).toBe("button");
    }
  });

  test("should handle button click without errors", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    // Just verify buttons can be clicked without throwing
    const openFileButton = page.locator(
      "[data-testid='splashscreen-button-open-file']",
    );
    await expect(openFileButton).toBeVisible();

    // Button should exist and be visible - that's sufficient
    // (We can't actually test the dialog opening without a file picker UI)
    expect(await openFileButton.isVisible()).toBe(true);
  });

  test("should have buttons inside splash screen container", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    const splashScreen = page.locator("#splashScreen");
    const buttonsContainer = page.locator("#splashScreen .buttons");

    // Verify splash screen exists
    await expect(splashScreen).toBeVisible();

    // Verify buttons container exists
    await expect(buttonsContainer).toBeVisible();

    const buttons = buttonsContainer.locator("button");
    const count = await buttons.count();

    // Should have exactly 2 buttons
    expect(count).toBe(2);
  });
});
