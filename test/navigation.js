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

describe("Navigation", function () {
  beforeEach(() => {
    process.env.CUSTOM_PREFERENCES_FOLDER = "preferences_existent"
    return app.start()
  })

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  // it("Show mainWindow", function () {
  //   return app.client.getWindowCount().then(function (count) {
  //     assert.equal(count, 1)
  //   })
  // })

  it("Add todo button opens add/edit window and puts focus on input field", async () => {

    const navBtnAddTodo = await app.client.$("#navBtnAddTodo");
    navBtnAddTodo.click();

    const modalForm = await app.client.$("#modalForm");
    await modalForm.waitForDisplayed({ timeout: 5000 });

    const modalFormInput = await app.client.$("#modalFormInput");
    const isFocused = await modalFormInput.isFocused();
    if(!isFocused) throw new Error("Could not put focus on input field");

  })

  it("Theme is switched to dark and back to light", async () => {

    const btnTheme = await app.client.$("#btnTheme");
    btnTheme.click();

    let themeLink = await app.client.$("#themeLink");
    let href = await themeLink.getAttribute("href");
    if(!href.includes("dark.css")) throw new Error("Could not switch to dark theme");

    btnTheme.click();

    themeLink = await app.client.$("#themeLink");
    href = await themeLink.getAttribute("href");

    if(href.includes("dark.css")) throw new Error("Could not switch to light theme");

  })

  it("Filter sidebar is being opened and closed", async () => {

    const navBtnFilter = await app.client.$("#navBtnFilter");
    navBtnFilter.click();

    let filterDrawer = await app.client.$("#filterDrawer");
    await filterDrawer.waitForDisplayed({ timeout: 3000 });

    navBtnFilter.click();

    filterDrawer = await app.client.$("#filterDrawer");
    const isDisplay = await filterDrawer.isDisplayed();

    if(isDisplay) throw new Error("Filter sidebar is still visible");

  })

  it("View sidebar is being opened and closed", async () => {

    const navBtnView = await app.client.$("#navBtnView");
    navBtnView.click();

    let viewDrawer = await app.client.$("#viewDrawer");
    await viewDrawer.waitForDisplayed({ timeout: 5000 });

    navBtnView.click();

    viewDrawer = await app.client.$("#viewDrawer");
    const isDisplay = await viewDrawer.isDisplayed();

    if(isDisplay) throw new Error("View sidebar is still visible");

  })

})
