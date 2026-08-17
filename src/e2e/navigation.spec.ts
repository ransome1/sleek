import { test, expect } from "./helpers/appFixture";
import { clickButton } from "./helpers/navigationHelpers";

test.describe("Navigation Component - No File Loaded", () => {
  test("should display the sleek logo", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    const logo = page.locator("#navigation li.logo");
    await expect(logo).toBeVisible();
    const text = await logo.textContent();
    expect(text?.trim()).toBe("sleek");
  });

  test("should show exactly 4 visible items: logo + open-file + settings + hide-navigation", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    // Note: showNavigation button is in DOM but hidden by CSS (.showNavigation display:none)
    const visibleNavigationItems = page.locator(
      "#navigation li:not(.showNavigation)",
    );
    const count = await visibleNavigationItems.count();
    expect(count).toBe(4);
  });

  test("should have Open File button visible", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    const openFileButton = page.locator(
      "[data-testid='navigation-button-open-file']",
    );
    await expect(openFileButton).toBeVisible();
  });

  test("should have Settings button visible", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    const settingsButton = page.locator(
      "[data-testid='navigation-button-show-settings']",
    );
    await expect(settingsButton).toBeVisible();
  });

  test("should have Hide Navigation button visible", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");
    const hideButton = page.locator(
      "[data-testid='navigation-button-hide-navigation']",
    );
    await expect(hideButton).toBeVisible();
  });

  test("should NOT have Add Todo button when no file loaded", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    const addTodoButton = page.locator(
      "[data-testid='navigation-button-add-todo']",
    );
    await expect(addTodoButton).not.toBeVisible();
  });

  test("should NOT have Toggle Drawer button when no file loaded", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    const toggleDrawerButton = page.locator(
      "[data-testid='navigation-button-toggle-drawer']",
    );
    await expect(toggleDrawerButton).not.toBeVisible();
  });

  test("should NOT have Archive button when no file loaded", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    const archiveButton = page.locator(
      "[data-testid='navigation-button-archive-todos']",
    );
    await expect(archiveButton).not.toBeVisible();
  });

  test("should have all visible buttons with proper accessibility", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    // Only count visible buttons (excluding the hidden .showNavigation button)
    const buttons = page.locator(
      "#navigation li[role='button']:not(.showNavigation)",
    );
    const count = await buttons.count();
    expect(count).toBe(3); // open-file, settings, hide-navigation

    // All should have tabindex=0 for accessibility
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const tabIndex = await button.getAttribute("tabindex");
      expect(tabIndex).toBe("0");
    }
  });

  test("should have all visible buttons with data-testid attributes", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");
    // Count visible buttons with data-testid (excluding the hidden .showNavigation button)
    const buttons = page.locator(
      "#navigation li[role='button'][data-testid]:not(.showNavigation)",
    );
    const count = await buttons.count();
    expect(count).toBe(3);
  });
});

test.describe("Navigation Toggle - Hide/Show", () => {
  test("should hide navigation when Hide Navigation button clicked", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Click hide button
    const hideButton = page.locator(
      "[data-testid='navigation-button-hide-navigation']",
    );
    await hideButton.click();

    // Wait for animation to complete
    await page.waitForTimeout(500);

    // The flexContainer should have the hideNavigation class
    const flexContainer = page.locator(".flexContainer.hideNavigation");
    const count = await flexContainer.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should show Show Navigation button when navigation is hidden", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Click hide button
    const hideButton = page.locator(
      "[data-testid='navigation-button-hide-navigation']",
    );
    await hideButton.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Show button should now be visible
    const showButton = page.locator(
      "[data-testid='navigation-button-show-navigation']",
    );
    await expect(showButton).toBeVisible();
  });

  test("should show navigation again when Show Navigation button clicked", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Hide navigation
    const hideButton = page.locator(
      "[data-testid='navigation-button-hide-navigation']",
    );
    await hideButton.click();
    await page.waitForTimeout(500);

    // Get the show button and click it
    const showButton = page.locator(
      "[data-testid='navigation-button-show-navigation']",
    );
    await expect(showButton).toBeVisible();
    await showButton.click();

    // Wait for animation
    await page.waitForTimeout(500);

    // Navigation should be visible again (no hideNavigation class)
    const flexContainerWithoutHide = page.locator(
      ".flexContainer:not(.hideNavigation)",
    );
    const count = await flexContainerWithoutHide.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should restore Hide Navigation button visibility when navigation shown again", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Hide navigation
    const hideButton = page.locator(
      "[data-testid='navigation-button-hide-navigation']",
    );
    await hideButton.click();
    await page.waitForTimeout(500);

    // Show navigation again
    const showButton = page.locator(
      "[data-testid='navigation-button-show-navigation']",
    );
    await showButton.click();
    await page.waitForTimeout(500);

    // Hide button should be visible again
    await expect(hideButton).toBeVisible();
  });

  test("should allow toggling navigation hidden/visible state", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    const hideButton = page.locator(
      "[data-testid='navigation-button-hide-navigation']",
    );
    const showButton = page.locator(
      "[data-testid='navigation-button-show-navigation']",
    );

    // Initial state: nav is open
    await expect(hideButton).toBeVisible();

    // Hide navigation
    await hideButton.click();
    await page.waitForTimeout(500);

    // Show button should be visible
    await expect(showButton).toBeVisible();

    // Show navigation again
    await showButton.click();
    await page.waitForTimeout(500);

    // Hide button should be visible again
    await expect(hideButton).toBeVisible();
  });

  test("should open Settings dialog when Settings button clicked", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Click the Settings button
    await clickButton(page, "navigation-button-show-settings");
    await page.waitForTimeout(300);

    // Verify Settings dialog appears
    // Settings opens as a dialog with role='dialog'
    const settingsDialog = page.locator("[role='dialog']");
    await expect(settingsDialog.first()).toBeVisible({ timeout: 5000 });
  });
});
