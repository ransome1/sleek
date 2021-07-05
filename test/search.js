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

describe("Full-text search", function () {
  beforeEach(() => {
    process.env.CUSTOM_PREFERENCES_FOLDER = "preferences_existent"
    return app.start()
  })

  afterEach(() => {
    if (app && app.isRunning()) {
      return app.stop()
    }
  })

  it("'learn' finds a specific result", async () => {
    const todoTableContainer = await app.client.$("#todoTable");
    const todoTableSearch = await app.client.$("#todoTableSearch");
    todoTableSearch.setValue("learn");
    await app.client.waitUntil(async () => {
      const todo = await todoTableContainer.$$(".todo");
      const attribute = await todo[0].getAttribute("data-item");
      return attribute === "Learn how to add 2+2";
    }, 10000, "Expected value to be different after 5s");
  })

})
