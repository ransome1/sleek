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

  // it("Open settings and switch tabs forth and back, then close modal", async () => {
  //   const navBtnSettings = await app.client.$("#navBtnSettings");
  //   const settingsTab1 = await app.client.$(".settingsTab1");
  //   const settingsTab2Content = await app.client.$("#settingsTab2");
  //   const settingsTab2 = await app.client.$(".settingsTab2");
  //   const modalClose = await app.client.$("#modalSettings .modal-close");
  //   const modalSettings = await app.client.$("#modalSettings");
  //   const settingsTabSettingsHeadline = await app.client.$("#settingsTabSettingsHeadline");
  //   const settingsTabAboutHeadline = await app.client.$("#settingsTabAboutHeadline");
  //
  //   navBtnSettings.click();
  //   await modalSettings.waitForDisplayed({ timeout: 10000 });
  //   let value = await settingsTabSettingsHeadline.getText();
  //   if(value!=="Settings") throw new Error("Headline is not 'Settings'")
  //   settingsTab2.click();
  //   await settingsTab2Content.waitForDisplayed({ timeout: 10000 });
  //   value = await settingsTabAboutHeadline.getText();
  //   if(value!=="About") throw new Error("Headline is not 'About'")
  //   modalClose.click();
  // })

  it("Open settings use language switcher, cancel confirmation, do it again and confirm", async () => {
    const navBtnSettings = await app.client.$("#navBtnSettings");
    const modalSettings = await app.client.$("#modalSettings");
    const settingsLanguage = await app.client.$("#settingsLanguage");
    const modalPrompt = await app.client.$("#modalPrompt");
    const modalPromptConfirm = await app.client.$("#modalPromptConfirm");
    const modalPromptCancel = await app.client.$("#modalPromptCancel");

    setTimeout(async () => {
      navBtnSettings.click();
    }, 1000);

    await modalSettings.waitForDisplayed({ timeout: 10000 });
    settingsLanguage.selectByIndex(2)
    await modalPrompt.waitForDisplayed({ timeout: 10000 });
    modalPromptCancel.click();
    settingsLanguage.selectByIndex(4)
    await modalPrompt.waitForDisplayed({ timeout: 10000 });
    modalPromptCancel.click();

  })

})
