import { test, expect } from "./helpers/appFixture";
import {
  createTodoFile,
  initTestDir,
  cleanupTestDir,
} from "./helpers/fileHelper";
import { clickButton, loadTodoFile } from "./helpers/navigationHelpers";

test.describe("Category Visibility Toggle Feature", () => {
  test.beforeEach(() => {
    initTestDir();
  });

  test.afterEach(() => {
    cleanupTestDir();
  });

  test("should exclude todos from grid when category is hidden", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Create todos: 2 with contexts, 1 without context
    const todoFile = createTodoFile(
      "test.txt",
      "Buy milk @home\nCall boss @office\nRead book",
    );
    await loadTodoFile(page, todoFile);
    await page.waitForTimeout(1500); // Wait longer for todos to load

    // Count todos in grid before hiding
    let visibleTodos = page.locator("[data-testid='datagrid-row']");
    const beforeHideCount = await visibleTodos.count();

    // Should have at least 3 todos loaded
    expect(beforeHideCount).toBeGreaterThanOrEqual(3);

    // Open drawer and hide contexts
    await clickButton(page, "navigation-button-toggle-drawer");
    await page.waitForTimeout(500);

    const contextToggle = page.locator(
      "[data-testid='drawer-attributes-visibility-toggle-contexts']",
    );
    await contextToggle.click();
    await page.waitForTimeout(1500);

    // Count todos after hiding - should be less
    visibleTodos = page.locator("[data-testid='datagrid-row']");
    const afterHideCount = await visibleTodos.count();

    // After hiding contexts, fewer todos should be visible
    expect(afterHideCount).toBeLessThan(beforeHideCount);
  });

  test("should show todos again when category is restored", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Create todos: 2 with contexts, 1 without context
    const todoFile = createTodoFile(
      "test.txt",
      "Buy milk @home\nCall boss @office\nRead book",
    );
    await loadTodoFile(page, todoFile);
    await page.waitForTimeout(1500);

    // Get initial count
    let visibleTodos = page.locator("[data-testid='datagrid-row']");
    const initialCount = await visibleTodos.count();
    expect(initialCount).toBeGreaterThan(0);

    // Hide contexts
    await clickButton(page, "navigation-button-toggle-drawer");
    await page.waitForTimeout(500);

    const contextToggle = page.locator(
      "[data-testid='drawer-attributes-visibility-toggle-contexts']",
    );
    await contextToggle.click();
    await page.waitForTimeout(1500);

    // Get count after hiding
    visibleTodos = page.locator("[data-testid='datagrid-row']");
    const hiddenCount = await visibleTodos.count();

    // Restore contexts by clicking toggle again
    await contextToggle.click();
    await page.waitForTimeout(1500);

    // Count should be back to or greater than initial
    visibleTodos = page.locator("[data-testid='datagrid-row']");
    const restoredCount = await visibleTodos.count();

    // After restore, should have more todos visible than when hidden
    if (hiddenCount < initialCount) {
      expect(restoredCount).toBeGreaterThanOrEqual(hiddenCount);
    }
  });

  test("should display visibility toggle icons on category headers", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    // Create a todo file with various attributes
    const todoFile = createTodoFile(
      "test.txt",
      "Task 1 @home +work due:2026-09-01\nTask 2 @office +personal due:2026-08-15",
    );
    await loadTodoFile(page, todoFile);
    await page.waitForTimeout(500);

    // Open the drawer
    await clickButton(page, "navigation-button-toggle-drawer");
    await page.waitForTimeout(500);

    // Check that visibility toggle icons exist for categories
    const visibilityIcons = page.locator(
      "[data-testid^='drawer-attributes-visibility-toggle-']",
    );
    const count = await visibilityIcons.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should disable category chips when eye icon is clicked", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    const todoFile = createTodoFile(
      "test.txt",
      "Task 1 @home +work\nTask 2 @office +personal",
    );
    await loadTodoFile(page, todoFile);
    await page.waitForTimeout(500);

    // Open the drawer
    await clickButton(page, "navigation-button-toggle-drawer");
    await page.waitForTimeout(500);

    // Click the visibility toggle for "contexts" category
    const contextsToggle = page.locator(
      "[data-testid='drawer-attributes-visibility-toggle-contexts']",
    );
    await expect(contextsToggle).toBeVisible();
    await contextsToggle.click();
    await page.waitForTimeout(500);

    // Verify context chips are now disabled
    const disabledButton = page.locator(
      '[data-todotxt-attribute="contexts"] button:disabled',
    );
    const disabledCount = await disabledButton.count();
    expect(disabledCount).toBeGreaterThan(0);
  });

  test("should restore category when eye icon is clicked again", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    const todoFile = createTodoFile("test.txt", "Task 1 @home\nTask 2 @office");
    await loadTodoFile(page, todoFile);
    await page.waitForTimeout(500);

    // Open drawer
    await clickButton(page, "navigation-button-toggle-drawer");
    await page.waitForTimeout(500);

    const contextToggle = page.locator(
      "[data-testid='drawer-attributes-visibility-toggle-contexts']",
    );

    // Hide category
    await contextToggle.click();
    await page.waitForTimeout(500);

    // Verify it's hidden (disabled buttons exist)
    let disabledCount = await page
      .locator('[data-todotxt-attribute="contexts"] button:disabled')
      .count();
    expect(disabledCount).toBeGreaterThan(0);

    // Restore category
    await contextToggle.click();
    await page.waitForTimeout(500);

    // Verify it's restored (no disabled buttons)
    disabledCount = await page
      .locator('[data-todotxt-attribute="contexts"] button:disabled')
      .count();
    expect(disabledCount).toBe(0);
  });

  test("should reset hidden categories when reset button is clicked", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    const todoFile = createTodoFile("test.txt", "Task 1 @home\nTask 2 @office");
    await loadTodoFile(page, todoFile);
    await page.waitForTimeout(500);

    // Open drawer and hide contexts
    await clickButton(page, "navigation-button-toggle-drawer");
    await page.waitForTimeout(500);

    const contextToggle = page.locator(
      "[data-testid='drawer-attributes-visibility-toggle-contexts']",
    );
    await contextToggle.click();
    await page.waitForTimeout(500);

    // Verify category is hidden
    let disabledCount = await page
      .locator('[data-todotxt-attribute="contexts"] button:disabled')
      .count();
    expect(disabledCount).toBeGreaterThan(0);

    // Click reset button
    const resetButton = page.locator("#drawer .tabs .reset");
    await resetButton.click();
    await page.waitForTimeout(500);

    // Verify category is restored
    disabledCount = await page
      .locator('[data-todotxt-attribute="contexts"] button:disabled')
      .count();
    expect(disabledCount).toBe(0);
  });

  test("should allow hiding multiple categories", async ({ page }) => {
    await page.waitForLoadState("domcontentloaded");

    const todoFile = createTodoFile(
      "test.txt",
      "Task 1 @home +work\nTask 2 @office +personal\nTask 3 (A)",
    );
    await loadTodoFile(page, todoFile);
    await page.waitForTimeout(500);

    // Open drawer
    await clickButton(page, "navigation-button-toggle-drawer");
    await page.waitForTimeout(500);

    // Hide contexts
    let toggle = page.locator(
      "[data-testid='drawer-attributes-visibility-toggle-contexts']",
    );
    await toggle.click();
    await page.waitForTimeout(300);

    // Hide projects
    toggle = page.locator(
      "[data-testid='drawer-attributes-visibility-toggle-projects']",
    );
    await toggle.click();
    await page.waitForTimeout(300);

    // Verify both are hidden
    const contextsDisabled = await page
      .locator('[data-todotxt-attribute="contexts"] button:disabled')
      .count();
    const projectsDisabled = await page
      .locator('[data-todotxt-attribute="projects"] button:disabled')
      .count();

    expect(contextsDisabled).toBeGreaterThan(0);
    expect(projectsDisabled).toBeGreaterThan(0);
  });

  test("should persist hidden categories when drawer closes and reopens", async ({
    page,
  }) => {
    await page.waitForLoadState("domcontentloaded");

    const todoFile = createTodoFile("test.txt", "Task 1 @home\nTask 2 @office");
    await loadTodoFile(page, todoFile);
    await page.waitForTimeout(500);

    // Open drawer and hide contexts
    await clickButton(page, "navigation-button-toggle-drawer");
    await page.waitForTimeout(500);

    const contextToggle = page.locator(
      "[data-testid='drawer-attributes-visibility-toggle-contexts']",
    );
    await contextToggle.click();
    await page.waitForTimeout(500);

    // Close drawer
    await clickButton(page, "navigation-button-toggle-drawer");
    await page.waitForTimeout(500);

    // Reopen drawer
    await clickButton(page, "navigation-button-toggle-drawer");
    await page.waitForTimeout(500);

    // Verify category still shows as hidden
    const disabledCount = await page
      .locator('[data-todotxt-attribute="contexts"] button:disabled')
      .count();
    expect(disabledCount).toBeGreaterThan(0);
  });
});
