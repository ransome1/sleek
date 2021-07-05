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

describe("Table", function () {
  beforeEach(() => {
    process.env.CUSTOM_PREFERENCES_FOLDER = "preferences_existent"
    return app.start()
  })

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it("Table lists 19 todos", async () => {
    const todoTableContainer = await app.client.$("#todoTable");
    console.log(todoTableContainer);
    const countRows = await todoTableContainer.$$(".todo");
    assert.equal(countRows.length, 18);
  })

  it("First todo can be clicked", async () => {
    const todoTableContainer = await app.client.$("#todoTable");
    const todos = await todoTableContainer.$$(".todo");
    const attribute = await todos[0].getAttribute("data-item");
    assert.equal(attribute, "(A) 2021-02-28 A task list with all possible task types comments due:2021-03-30 +todotxt @test");
  })

  it("Fourth todo has a specific context 'GroceryStore'", async () => {
    const todoTableContainer = await app.client.$("#todoTable");
    const todos = await todoTableContainer.$$(".todo");
    const todo = await todos[2];
    const contexts = await todo.$$(".contexts");
    const firstContext = await contexts[2].getText();
    assert.equal(firstContext, "GroceryStore");
  })

})
