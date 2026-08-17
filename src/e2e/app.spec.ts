import { test, expect } from "./helpers/appFixture";

test.describe("App Startup", () => {
  test("should launch the app", async ({ page }) => {
    // Check window title contains 'sleek'
    const title = await page.title();
    expect(title.toLowerCase()).toContain("sleek");

    // Verify HTML element renders (app is loaded)
    const htmlElement = page.locator("html");
    await expect(htmlElement).toBeVisible({ timeout: 5000 });

    // Verify body has content
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});
