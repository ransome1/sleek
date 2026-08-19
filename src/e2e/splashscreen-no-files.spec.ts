import { test, expect } from "./helpers/appFixture";
import { initTestDir, cleanupTestDir } from "./helpers/fileHelper";
import { isButtonVisible, getVisibleButtons } from "./helpers/navigationHelpers";

/**
 * E2E tests for the splash screen state when no files are loaded
 */
test.describe("Splash Screen - No Files State", () => {
  test.beforeEach(() => {
    initTestDir();
  });

  test.afterEach(() => {
    cleanupTestDir();
  });

    // Test case 1: Button Display & Correct Text
  test("should display buttons with correct text", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    // Verify Open File button
    const openFileBtn = page.locator("[data-testid='splashscreen-button-open-file']");
    await expect(openFileBtn).toBeVisible();
    const openFileText = await openFileBtn.textContent();
    expect(openFileText?.trim()).toBe("Open file"); // lowercase in translations

    // Verify Create File button
    const createFileBtn = page.locator("[data-testid='splashscreen-button-create-file']");
    await expect(createFileBtn).toBeVisible();
    const createFileText = await createFileBtn.textContent();
    expect(createFileText?.trim()).toBe("Create file"); // lowercase in translations

    // Verify buttons are clickable
    await expect(openFileBtn).toBeEnabled();
    await expect(createFileBtn).toBeEnabled();
  });

    // Test case 2: Help Link
  test("should display and verify help link", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    // Verify help link is visible in splash screen message
    const helpLink = page.locator("#splashScreen p a");
    await expect(helpLink).toBeVisible();

    // Verify link contains the help icon
    const helpIcon = helpLink.locator("svg");
    await expect(helpIcon).toBeVisible();

    // Verify link is clickable (has proper attributes for interaction)
    const linkRole = await helpLink.getAttribute("role");
    // Material-UI Link component should be interactive
    await expect(helpLink).toBeEnabled();
  });

    // Test case 3: Navigation Structure
  test("should display correct navigation items", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    // Count all visible navigation buttons (excluding showNavigation which is hidden)
    const visibleButtons = page.locator(
      "#navigation li[role='button']:not(.showNavigation)"
    );
    const count = await visibleButtons.count();
    expect(count).toBe(3); // open-file, settings, hide-navigation

    // Verify specific buttons are visible
    await expect(
      page.locator("[data-testid='navigation-button-open-file']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='navigation-button-show-settings']")
    ).toBeVisible();
    await expect(
      page.locator("[data-testid='navigation-button-hide-navigation']")
    ).toBeVisible();

    // Verify buttons that should NOT be visible
    const addTodoVisible = await page
      .locator("[data-testid='navigation-button-add-todo']")
      .isVisible()
      .catch(() => false);
    expect(addTodoVisible).toBe(false);

    const toggleDrawerVisible = await page
      .locator("[data-testid='navigation-button-toggle-drawer']")
      .isVisible()
      .catch(() => false);
    expect(toggleDrawerVisible).toBe(false);

    const archiveVisible = await page
      .locator("[data-testid='navigation-button-archive-todos']")
      .isVisible()
      .catch(() => false);
    expect(archiveVisible).toBe(false);
  });

    // Test case 4: Disabled Keyboard Shortcut: Ctrl+F (Find)
  test("should not open search field with Ctrl+F", async ({ page }) => {
    // Press Ctrl+F
    await page.keyboard.press("Control+F");

    // Verify search field is not visible
    await expect(page.locator("[data-testid='header-search-icon']")).not.toBeVisible();

    // Verify splash screen is still visible
    await expect(page.locator("#splashScreen")).toBeVisible();
  });

  // Test case 5: Disabled Keyboard Shortcut: Ctrl+Enter (Create Todo)
  test("should not create todo with Ctrl+Enter", async ({ page }) => {
    // Press Ctrl+Enter
    await page.keyboard.press("Control+Enter");

    // Verify no todo creation dialog appears
    await expect(page.locator("[data-testid='dialog-create-todo']")).not.toBeVisible();

    // Verify splash screen is still visible
    await expect(page.locator("#splashScreen")).toBeVisible();
  });

  // Test case 6: Disabled Keyboard Shortcut: Escape (Clear/Close)
  test("should not respond to Escape key", async ({ page }) => {
    // Press Escape
    await page.keyboard.press("Escape");

    // Verify splash screen is still visible
    await expect(page.locator("#splashScreen")).toBeVisible();
  });

    // Test case 7: Splash Screen Content
  test("should display splash screen content", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    // Verify splash screen is visible
    await expect(page.locator("#splashScreen")).toBeVisible();

    // Verify icon is displayed (FileOpenIcon renders as SVG)
    const icon = page.locator("#splashScreen svg").first();
    await expect(icon).toBeVisible();

    // Verify message text
    const message = await page.locator("#splashScreen p").first().textContent();
    expect(message).toContain("todo.txt");
  });

    // Test case 8: Drawer Hidden
  test("should not display drawer", async ({ page }) => {
    // Verify drawer is not visible
    await expect(page.locator("#drawer")).not.toBeVisible();

    // Verify left sidebar is not rendered
    await expect(page.locator("[data-testid='drawer-content']")).not.toBeVisible();
  });

    // Test case 9: Grid, Header, and FileTabs Hidden
  test("should not display grid, header, or file tabs", async ({ page }) => {
    // Verify todo grid is not visible
    await expect(page.locator(".MuiList-root")).not.toBeVisible();
    await expect(page.locator("[id='grid']")).not.toBeVisible();

    // Verify search header is not visible
    await expect(page.locator("[data-testid='header-search-icon']")).not.toBeVisible();

    // Verify file tabs are not visible
    await expect(page.locator("[data-testid='file-tabs']")).not.toBeVisible();
  });
});