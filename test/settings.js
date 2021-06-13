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

describe("Settings", function () {

  beforeEach(() => {
    process.env.CUSTOM_PREFERENCES_FOLDER = "preferences_existent"
    return app.start()
  })

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it("Open settings", async () => {
    const navBtnSettings = await app.client.$("#navBtnSettings");
    navBtnSettings.click();

    const modalSettings = await app.client.$("#modalSettings");
    await modalSettings.waitForDisplayed({ timeout: 10000 });



    // const todoTableContainer = await app.client.$("#todoTableContainer");
    // const todos = await todoTableContainer.$$(".todo");
    // const todo = await todos[4];
    // todo.click();
    // let datePickerInput = await app.client.$("#datePickerInput");
    // datePickerInput.click();
    // const datePickerContainer = await app.client.$(".datepicker");
    // const dates = await datePickerContainer.$$(".datepicker-cell");
    // dates[7].click();
    // datePickerInput = await app.client.$("#datePickerInput");
    // const value = await datePickerInput.getValue();
    // if(value.includes("-06-06")) return true;
    // throw new Error("Due date not found in datepicker input field")
  })

})
