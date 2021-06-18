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

describe("Add/Edit window", function () {
  beforeEach(() => {
    process.env.CUSTOM_PREFERENCES_FOLDER = "preferences_existent"
    return app.start()
  })

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it("Todo is clicked and value in input field is set accordingly", async () => {
    const modalForm = await app.client.$("#modalForm");
    const todoTableContainer = await app.client.$("#todoTableContainer");
    const todos = await todoTableContainer.$$(".todo");
    const todo = await todos[8];
    setTimeout(async () => {
      await todo.click();
      await modalForm.waitForDisplayed({ timeout: 10000 });
      const modalFormInput = await app.client.$("#modalFormInput");
      const value = await modalFormInput.getValue();
      assert.equal(value, "2021-04-03 Todo with due date tomorrow due:2021-06-11");
    }, 1000);
  })

  it("Modal is opened, autocomplete shown and third project added to todo input field", async () => {
    const navBtnAddTodo = await app.client.$("#navBtnAddTodo");
    let modalFormInput = await app.client.$("#modalFormInput");
    const autoCompleteContainer = await app.client.$("#autoCompleteContainer");
    setTimeout(async () => {
      navBtnAddTodo.click();
      await modalFormInput.setValue("+");
      const projects = await autoCompleteContainer.$$(".button");
      projects[2].click();
      modalFormInput = await app.client.$("#modalFormInput");
      const value = await modalFormInput.getValue();
      assert.equal(value, "+PeaceLoveAndHappiness ")
    }, 1000);
  })

  it("Modal is opened, input is resized, autocomplete shown and second context added to todo input field", async () => {
    const navBtnAddTodo = await app.client.$("#navBtnAddTodo");
    const autoCompleteContainer = await app.client.$("#autoCompleteContainer");
    let modalFormInput = await app.client.$("#modalFormInput");
    let modalFormInputResize = await app.client.$("#modalFormInputResize");
    setTimeout(async () => {
      navBtnAddTodo.click();
      modalFormInputResize.click();
      await modalFormInput.setValue("@");
      const contexts = await autoCompleteContainer.$$(".button");
      await contexts[2].click();
      modalFormInput = await app.client.$("#modalFormInput");
      const value = await modalFormInput.getValue();
      modalFormInputResize = await app.client.$("#modalFormInputResize");
      modalFormInputResize.click();
      assert.equal(value, "@phone ")
    }, 1000);
  })

})
