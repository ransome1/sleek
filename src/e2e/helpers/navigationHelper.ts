import { Page } from "@playwright/test";

/**
 * Navigation component E2E test helpers
 * Provides utilities to interact with and verify navigation buttons
 */

/**
 * Click a navigation button by its test ID
 */
export async function clickNavigationButton(
  page: Page,
  buttonId: string,
): Promise<void> {
  const button = page.locator(`[data-testid="${buttonId}"]`);
  await button.click();
}

/**
 * Check if a navigation button is visible
 */
export async function isNavigationButtonVisible(
  page: Page,
  buttonId: string,
): Promise<boolean> {
  const button = page.locator(`[data-testid="${buttonId}"]`);
  return button.isVisible().catch(() => false);
}

/**
 * Get all visible navigation button IDs
 */
export async function getActiveNavigationButtons(
  page: Page,
): Promise<string[]> {
  const buttons = await page.locator("#navigation li[data-testid]").all();
  const ids: string[] = [];
  for (const button of buttons) {
    const testId = await button.getAttribute("data-testid");
    if (testId) ids.push(testId);
  }
  return ids;
}

/**
 * Check if a navigation button has the "active" class
 */
export async function isNavigationButtonActive(
  page: Page,
  buttonId: string,
): Promise<boolean> {
  return page
    .locator(`[data-testid="${buttonId}"]`)
    .evaluate((el) => el.classList.contains("active"));
}

/**
 * Wait for navigation button to appear
 */
export async function waitForNavigationButton(
  page: Page,
  buttonId: string,
  timeout = 5000,
): Promise<void> {
  await page.locator(`[data-testid="${buttonId}"]`).waitFor({ timeout });
}

/**
 * Wait for navigation button to disappear
 */
export async function waitForNavigationButtonHidden(
  page: Page,
  buttonId: string,
  timeout = 5000,
): Promise<void> {
  await page.locator(`[data-testid="${buttonId}"]`).waitFor({
    state: "hidden",
    timeout,
  });
}
