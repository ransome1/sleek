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

describe("Due date picker", function () {
  beforeEach(() => {
    process.env.CUSTOM_PREFERENCES_FOLDER = "preferences_existent"
    return app.start()
  })

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it("Due date picker adds due date to its input field", async () => {
    const modalForm = await app.client.$("#modalForm");
    const todoTableContainer = await app.client.$("#todoTableContainer");
    const todos = await todoTableContainer.$$(".todo");
    const todo = await todos[4];
    todo.click();
    let datePickerInput = await app.client.$("#datePickerInput");
    datePickerInput.click();
    const datePickerContainer = await app.client.$(".datepicker");
    const dates = await datePickerContainer.$$(".datepicker-cell");
    dates[7].click();
    datePickerInput = await app.client.$("#datePickerInput");
    const value = await datePickerInput.getValue();
    if(value.includes("-06-06")) return true;
    throw new Error("Due date not found in datepicker input field")
  })

  it("Due date picker adds due date to todo input field", async () => {
    const modalForm = await app.client.$("#modalForm");
    const todoTableContainer = await app.client.$("#todoTableContainer");
    const todos = await todoTableContainer.$$(".todo");
    const todo = await todos[4];
    todo.click();
    const datePickerInput = await app.client.$("#datePickerInput");
    datePickerInput.click();
    const datePickerContainer = await app.client.$(".datepicker");
    const dates = await datePickerContainer.$$(".datepicker-cell");
    dates[12].click();
    const modalFormInput = await app.client.$("#modalFormInput");
    const text = await modalFormInput.getValue();
    if(text.includes("due:20")) return true;
    throw new Error("Due date not found in input field")
  })

})
