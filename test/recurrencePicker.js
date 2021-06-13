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

describe("Recurrence picker", function () {
  beforeEach(() => {
    process.env.CUSTOM_PREFERENCES_FOLDER = "preferences_existent"
    return app.start()
  })

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it("Recurrence of 'Every 3 months' is set and added to recurrence input", async () => {
    const modalForm = await app.client.$("#modalForm");
    const todoTableContainer = await app.client.$("#todoTableContainer");
    const todos = await todoTableContainer.$$(".todo");
    const todo = await todos[3];
    todo.click();
    let recurrencePickerInput = await app.client.$("#recurrencePickerInput");
    recurrencePickerInput.click();
    const recurrencePickerIncrease = await app.client.$("#recurrencePickerIncrease");
    recurrencePickerIncrease.click();
    recurrencePickerIncrease.click();
    const recurrencePickerContainer = await app.client.$("#recurrencePickerContainer");
    const options = await recurrencePickerContainer.$$(".radio");
    options[3].click();
    recurrencePickerInput = await app.client.$("#recurrencePickerInput");
    const value = await recurrencePickerInput.getValue();
    assert.equal(value, "Every 3 months")
  })

  it("Recurrence is set to every 2 week and added to todo input", async () => {
    const modalForm = await app.client.$("#modalForm");
    const todoTableContainer = await app.client.$("#todoTableContainer");
    const todos = await todoTableContainer.$$(".todo");
    const todo = await todos[3];
    todo.click();
    let recurrencePickerInput = await app.client.$("#recurrencePickerInput");
    recurrencePickerInput.click();
    const recurrencePickerIncrease = await app.client.$("#recurrencePickerIncrease");
    recurrencePickerIncrease.click();
    const recurrencePickerContainer = await app.client.$("#recurrencePickerContainer");
    const options = await recurrencePickerContainer.$$(".radio");
    options[2].click();
    modalFormInput = await app.client.$("#modalFormInput");
    const value = await modalFormInput.getValue();
    if(value.includes("rec:2w")) return true;
    throw new Error("Recurrence not found in input field")
  })

})
