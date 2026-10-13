import { appFixtureWithWelcome, expect } from "./helpers/appFixture";

const test = appFixtureWithWelcome;

test.describe("Welcome Screen", () => {
  test.beforeEach(async ({ page }) => {
    await page.waitForSelector("#welcomeScreen", { state: "visible" });
  });

  test("should display welcome screen with headline and description", async ({
    page,
  }) => {
    await expect(page.locator("#welcomeScreen")).toBeVisible();
    await expect(
      page.locator("#welcomeScreen .analyticsSection"),
    ).toBeVisible();
  });

  test("should display analytics section", async ({ page }) => {
    await expect(
      page.locator("#welcomeScreen .analyticsSection h2"),
    ).toHaveText("Help improve sleek");
    await expect(
      page.locator("#welcomeScreen .analyticsSection p"),
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
