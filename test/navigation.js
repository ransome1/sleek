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

  it("Add todo button opens add/edit window and puts focus on input field", async () => {
    const modalForm = await app.client.$("#modalForm");
    const navBtnAddTodo = await app.client.$("#navBtnAddTodo a");
    const modalFormInput = await app.client.$("#modalFormInput");

    setTimeout(async () => {
      navBtnAddTodo.click();
      await modalForm.waitForDisplayed({ timeout: 10000 });
      const isFocused = await modalFormInput.isFocused();
      if(!isFocused) throw new Error("Could not put focus on input field");
    }, 1000);
  })

  it("Theme is switched to dark and back to light", async () => {
    let themeLink = await app.client.$("#themeLink");
    const btnTheme = await app.client.$("#btnTheme");
    await btnTheme.waitForClickable({ timeout: 10000 });
    btnTheme.click();
    let body = await app.client.$("body");
    let bodyClassList = await body.getAttribute("class");
    if(bodyClassList.search("dark")===-1) throw new Error("Could not switch to dark theme");
    btnTheme.click();
    body = await app.client.$("body");
    bodyClassList = await body.getAttribute("class");
    if(bodyClassList.search("dark")!==-1) throw new Error("Could not switch to light theme");
  })

  it("Filter sidebar is being opened and closed", async () => {
    const navBtnFilter = await app.client.$("#navBtnFilter a");
    let filterDrawer = await app.client.$("#filterDrawer");

    setTimeout(async () => {
      navBtnFilter.click();
      await filterDrawer.waitForDisplayed({ timeout: 3000 });
      navBtnFilter.click();
      filterDrawer = await app.client.$("#filterDrawer");
      const isDisplay = await filterDrawer.isDisplayed();
      if(isDisplay) throw new Error("Filter sidebar is still visible");
    }, 1000);
  })

  it("View sidebar is being opened and closed", async () => {
    const navBtnView = await app.client.$("#navBtnView");
    let viewDrawer = await app.client.$("#viewDrawer");

    setTimeout(async () => {
      navBtnView.click();
      await viewDrawer.waitForDisplayed({ timeout: 10000 });
      navBtnView.click();
      viewDrawer = await app.client.$("#viewDrawer");
      const isDisplay = await viewDrawer.isDisplayed();
      if(isDisplay) throw new Error("View sidebar is still visible");
    }, 1000);
  })

})
