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
