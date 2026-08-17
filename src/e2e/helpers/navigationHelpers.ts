import { Page } from "@playwright/test";

/**
 * Navigation component E2E test helpers
 * Provides utilities to interact with and verify navigation buttons
 */

/**
 * Click a button by its test ID
 */
export async function clickButton(page: Page, buttonId: string): Promise<void> {
  const button = page.locator(`[data-testid="${buttonId}"]`);
  await button.click();
}

/**
 * Check if a button is visible
 */
export async function isButtonVisible(
  page: Page,
  buttonId: string,
): Promise<boolean> {
  const button = page.locator(`[data-testid="${buttonId}"]`);
  return button.isVisible().catch(() => false);
}

/**
 * Get all visible button test IDs in the navigation
 */
export async function getVisibleButtons(page: Page): Promise<string[]> {
  const buttons = await page.locator("#navigation li[data-testid]").all();
  const ids: string[] = [];
  for (const button of buttons) {
    const testId = await button.getAttribute("data-testid");
    if (testId) ids.push(testId);
  }
  return ids;
}

/**
 * Check if a button has the "active" class
 */
export async function isButtonActive(
  page: Page,
  buttonId: string,
): Promise<boolean> {
  return page
    .locator(`[data-testid="${buttonId}"]`)
    .evaluate((el) => el.classList.contains("active"));
}

/**
 * Wait for button to appear
 */
export async function waitForButton(
  page: Page,
  buttonId: string,
  timeout = 5000,
): Promise<void> {
  await page.locator(`[data-testid="${buttonId}"]`).waitFor({ timeout });
}

/**
 * Wait for button to disappear
 */
export async function waitForButtonHidden(
  page: Page,
  buttonId: string,
  timeout = 5000,
): Promise<void> {
  await page.locator(`[data-testid="${buttonId}"]`).waitFor({
    state: "hidden",
    timeout,
  });
}

/**
 * Load a todo file via IPC addFile channel
 * This simulates adding a file to sleek programmatically
 */
export async function loadTodoFile(
  page: Page,
  filePath: string,
): Promise<void> {
  // Send addFile IPC message to load the file
  await page.evaluate((path) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).api.ipcRenderer.send("addFile", path);
  }, filePath);

  // Wait for the app to process the file and update state
  await page.waitForTimeout(500);
}
