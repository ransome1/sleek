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

describe("Todo creation", function () {
  beforeEach(() => {
    process.env.CUSTOM_PREFERENCES_FOLDER = "preferences_empty"
    return app.start()
  })

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it("Apps title is 'todo.txt - sleek'", function () {
    setTimeout(async () => {
      const title = await app.client.getTitle();
      assert.equal(title, "todo.txt - sleek");
    }, 1000);
  })

  it("Create and delete todo using context menu", async () => {
    const navBtnAddTodo = await app.client.$("#navBtnAddTodo");
    navBtnAddTodo.click();

    const modalFormInput = await app.client.$("#modalFormInput");
    await modalFormInput.setValue("test todo, to be deleted");

    const btnSave = await app.client.$("#btnSave");
    btnSave.click();

    const todoTableContainer = await app.client.$("#todoTableContainer");
    const todos = await todoTableContainer.$$(".todo");
    const todo = await todos[0];
    todo.click({ button: "right" });

    const todoContextDelete = await app.client.$("#todoContextDelete");
    await todoContextDelete.waitForDisplayed({ timeout: 10000 });
    todoContextDelete.click();
  })

  it("Create todo and use it as template to create a new one, then delete both", async () => {
    const todoContextUseAsTemplate = await app.client.$("#todoContextUseAsTemplate");
    const todoContextDelete = await app.client.$("#todoContextDelete");
    const navBtnAddTodo = await app.client.$("#navBtnAddTodo");
    const btnSave = await app.client.$("#btnSave");
    const todoContextEdit = await app.client.$("#todoContextEdit");

    await navBtnAddTodo.click();

    let modalFormInput = await app.client.$("#modalFormInput");
    await modalFormInput.setValue("(A) test todo, to be deleted +project @context due:2012-12-12");

    await btnSave.click();

    let todoTableContainer = await app.client.$("#todoTableContainer");
    let todos = await todoTableContainer.$$(".todo");
    let todo = await todos[0];
    await todo.click({ button: "right" });

    await todoContextUseAsTemplate.waitForDisplayed({ timeout: 10000 });
    await todoContextUseAsTemplate.click();

    modalFormInput = await app.client.$("#modalFormInput");
    await btnSave.click();

    todoTableContainer = await app.client.$("#todoTableContainer");
    todos = await todoTableContainer.$$(".todo");
    todo = await todos[1];
    await todo.click({ button: "right" });

    await todoContextEdit.click();
    modalFormInput = await app.client.$("#modalFormInput");
    const result = await modalFormInput.getValue();

    await btnSave.click();

    todo = await todos[0];
    await todo.click({ button: "right" });
    await todoContextDelete.click();

    todo = await todos[0];
    await todo.click({ button: "right" });
    await todoContextDelete.click();

    if(result.includes("____________ due:2012-12-12 +project @context")) return;
    return false;
  })

  it("Create todo and archive it", async () => {
    const navBtnSettings = await app.client.$("#navBtnSettings");
    const modalSettings = await app.client.$("#modalSettings");
    const navBtnAddTodo = await app.client.$("#navBtnAddTodo");
    const modalFormInput = await app.client.$("#modalFormInput");
    const btnSave = await app.client.$("#btnSave");
    const btnArchiveTodos = await app.client.$("#btnArchiveTodos");
    const modalPromptConfirm = await app.client.$("#modalPromptConfirm");

    navBtnAddTodo.click();

    modalFormInput.setValue("test todo, to be archived");

    await btnSave.waitForClickable({ timeout: 10000 });
    btnSave.click();

    const checkbox = await app.client.$("#todoTableContainer .todo .checkbox a");

    checkbox.click();

    await navBtnSettings.waitForClickable({ timeout: 10000 });
    navBtnSettings.click();

    await btnArchiveTodos.waitForClickable({ timeout: 10000 });
    btnArchiveTodos.click();

    await modalPromptConfirm.waitForClickable({ timeout: 10000 });
    modalPromptConfirm.click();

    const todoTableContainer = await app.client.$("#todoTableContainer");
    const content = await todoTableContainer.getHTML();
    if(content!=="<div id=\"todoTableContainer\"></div>") throw new Error("Still todos present")

  })

})
