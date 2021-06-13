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

describe("Priority picker", function () {

  beforeEach(() => {
    process.env.CUSTOM_PREFERENCES_FOLDER = "preferences_existent"
    return app.start()
  })

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it("Todo is clicked and given priority is being pasted in priority picker input field", async () => {
    const modalForm = await app.client.$("#modalForm");
    const todoTableContainer = await app.client.$("#todoTableContainer");
    const todos = await todoTableContainer.$$(".todo");
    const todo = await todos[2];
    todo.click();
    return await modalForm.isDisplayed().then(async() => {
      const priorityPicker = await app.client.$("#priorityPicker");
      const value = await priorityPicker.getValue();
      assert.equal(value, "A")
    })
  })

  it("Todo is clicked, priority 'G' is selected and applied to todo input field", async () => {
    const modalForm = await app.client.$("#modalForm");
    const todoTableContainer = await app.client.$("#todoTableContainer");
    const todos = await todoTableContainer.$$(".todo");
    const todo = await todos[4];
    todo.click();

    const priorityPicker = await app.client.$("#priorityPicker");
    priorityPicker.click();
    const options = await priorityPicker.$$("option");
    options[7].click();

    const modalFormInput = await app.client.$("#modalFormInput");
    const value = await modalFormInput.getValue();

    assert.equal(value, "(G) ->Submit TPS report this task has no priority");

  })

})
