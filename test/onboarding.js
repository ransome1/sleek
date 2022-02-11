const Application = require("spectron").Application
const assert = require("assert")
const electronPath = require("electron") // Require Electron from the binaries included in node_modules.
const path = require("path")
const app = new Application({
  path: electronPath,
  args: [path.join(__dirname, "..")],
  env: {
    NODE_ENV: "testing"
  }
})

describe("Onboarding", function () {
  beforeEach(() => {
    process.env.CUSTOM_PREFERENCES_FOLDER = "preferences_fresh"
    return app.start()
  })

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it("mainWindow is opening", function () {
    return app.client.getWindowCount().then(function (count) {
      assert.equal(count, 1)
    })
  })

  it("App title is 'sleek'", async function () {
    const title = await app.client.getTitle();
    assert.equal(title, "sleek");
  })

  it("Onboarding is shown", async () => {
    const onboardingContainer = await app.client.$("#onboardingContainer");
    await onboardingContainer.waitForDisplayed({ timeout: 3000 });
  })

  it("'Open todo.txt' is clickable", async () => {

    const btnOnboardingOpenTodoFile = await app.client.$("#btnOnboardingOpenTodoFile");
    await btnOnboardingOpenTodoFile.waitForClickable({ timeout: 3000 });

  })

  it("'Create todo.txt' is clickable", async () => {

    const btnOnboardingCreateTodoFile = await app.client.$("#btnOnboardingCreateTodoFile");
    await btnOnboardingCreateTodoFile.waitForClickable({ timeout: 3000 });

  })

  it("Filter button is not displayed", async () => {

    setTimeout(async () => {
      const navBtnFilter = await app.client.$("#navBtnFilter");
      const isDisplayed = await navBtnFilter.isDisplayed();
      if(isDisplayed) throw new Error("Filter button is clickable but not suppose to")
    }, 1000);

  })

  it("File button is clickable", async () => {

    const btnOpenTodoFile = await app.client.$("#btnOpenTodoFile");
    await btnOpenTodoFile.waitForClickable({ timeout: 3000 });

  })

  it("Settings button is clickable", async () => {

    const navBtnSettings = await app.client.$("#navBtnSettings");
    await navBtnSettings.waitForClickable({ timeout: 3000 });

  })

  it("Help button is clickable", async () => {

    const navBtnHelp = await app.client.$("#navBtnHelp");
    await navBtnHelp.waitForClickable({ timeout: 3000 });

  })

  it("Messages are visible", async () => {

    const messagesContainer = await app.client.$("#messages");
    const messages = await messagesContainer.$$(".message");

    await messages[0].waitForDisplayed({ timeout: 3000 });
    await messages[1].waitForDisplayed({ timeout: 3000 });

  })

})
