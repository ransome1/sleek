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
    const todoTableContainer = await app.client.$("#todoTable");
    const todos = await todoTableContainer.$$(".todo");
    const todo = await todos[8];
    await todo.click();
    await modalForm.waitForDisplayed({ timeout: 10000 });
    const modalFormInput = await app.client.$("#modalFormInput");
    const value = await modalFormInput.getValue();
    assert.equal(value, "2021-04-03 Todo with due date tomorrow due:2021-06-11");
  })

  it("Todo is clicked and a context is appended", async () => {
    const modalForm = await app.client.$("#modalForm");
    const todoTableContainer = await app.client.$("#todoTable");
    const todos = await todoTableContainer.$$(".todo");
    const todo = await todos[8];
    await todo.click();
    await modalForm.waitForDisplayed({ timeout: 10000 });
    let modalFormInput = await app.client.$("#modalFormInput");
    let value = await modalFormInput.getValue();
    if(value!=="2021-04-03 Todo with due date tomorrow due:2021-06-11") throw new Error("Value differs from what is expected");
    await modalFormInput.setValue(value + " @");
    const autoCompleteContainer = await app.client.$("#autoCompleteContainer");
    const contexts = await autoCompleteContainer.$$("button");
    await contexts[2].click();
    modalFormInput = await app.client.$("#modalFormInput");
    value = await modalFormInput.getValue();
    if(value!=="2021-04-03 Todo with due date tomorrow due:2021-06-11 @phone ") throw new Error("Value differs from what is expected");
  })

  it("Modal is opened, autocomplete shown and third project added to todo input field", async () => {
    const navBtnAddTodo = await app.client.$("#navBtnAddTodo");
    let modalFormInput = await app.client.$("#modalFormInput");
    const autoCompleteContainer = await app.client.$("#autoCompleteContainer");
    navBtnAddTodo.click();
    await modalFormInput.setValue("+");
    const projects = await autoCompleteContainer.$$("button");
    projects[2].click();
    modalFormInput = await app.client.$("#modalFormInput");
    const value = await modalFormInput.getValue();
    assert.equal(value, "+PeaceLoveAndHappiness ")
  })
  //
  it("Modal is opened, input is resized, autocomplete shown and second context added to todo input field", async () => {
    const navBtnAddTodo = await app.client.$("#navBtnAddTodo");
    const autoCompleteContainer = await app.client.$("#autoCompleteContainer");
    let modalFormInput = await app.client.$("#modalFormInput");
    let modalFormInputResize = await app.client.$("#modalFormInputResize");
    navBtnAddTodo.click();
    modalFormInputResize.click();
    await modalFormInput.setValue("@");
    const contexts = await autoCompleteContainer.$$("button");
    await contexts[2].click();
    modalFormInput = await app.client.$("#modalFormInput");
    const value = await modalFormInput.getValue();
    modalFormInputResize = await app.client.$("#modalFormInputResize");
    modalFormInputResize.click();
    assert.equal(value, "@phone ")
  })

  it("Modal is opened, input field is resized to textarea, multi lined content is inserted, switched back to input and checked for correct replacement", async () => {
    const modalForm = await app.client.$("#modalForm");
    const navBtnAddTodo = await app.client.$("#navBtnAddTodo");
    await navBtnAddTodo.waitForClickable({ timeout: 10000 });
    navBtnAddTodo.click();
    await modalForm.waitForDisplayed({ timeout: 10000 });
    let modalFormInputResize = await app.client.$("#modalFormInputResize");
    modalFormInputResize.click();
    let modalFormInput = await app.client.$("#modalFormInput");
    let tag = await modalFormInput.getProperty("tagName");
    if(tag!=="TEXTAREA") throw new Error("Input has not switched to textarea");
    await modalFormInput.setValue("line1\nline2\nline3\nline4");
    modalFormInputResize.click();
    modalFormInput = await app.client.$("#modalFormInput");
    let value = await modalFormInput.getValue();
    if(value!=="line1line2line3line4") throw new Error("Switch did no replace with correct value");
  })

  // it("Modal is opened, footer buttons are clicked", async () => {
  //   const modalForm = await app.client.$("#modalForm");
  //   const todoTableContainer = await app.client.$("#todoTable");
  //   let todos = await todoTableContainer.$$(".todo");
  //   let todo = await todos[8];
  //   todo.click();
  //
  //   const btnSave = await app.client.$("#btnSave");
  //   btnSave.click();
  //
  //   todo.click();
  //   await modalForm.waitForDisplayed({ timeout: 10000 });
  //
  //   const btnCancel = await app.client.$("#btnCancel");
  //   btnCancel.click();
  //
  //   todo.click();
  //   await modalForm.waitForDisplayed({ timeout: 10000 });
  //
  //   let btnItemStatus = await app.client.$("#btnItemStatus");
  //   btnItemStatus.click();
  //
  //   todo.click();
  //   //await modalForm.waitForDisplayed({ timeout: 10000 });
  //
  //   let modalFormInput = await app.client.$("#modalFormInput");
  //   let value = await modalFormInput.getValue();
  //
  //   console.log(modalFormInput);
  //
  //   if(value.search("x 202" >= 0)) throw new Error("1Got an unexpected value in input field");
  //
  //   btnItemStatus.click();
  //
  //   todos = await todoTableContainer.$$(".todo");
  //   todo = await todos[8];
  //
  //   todo.click();
  //   await modalForm.waitForDisplayed({ timeout: 10000 });
  //
  //   modalFormInput = await app.client.$("#modalFormInput");
  //   value = await modalFormInput.getValue();
  //
  //   if(value.search("x 202" === -1)) throw new Error("2Got an unexpected value in input field");
  // })

})
