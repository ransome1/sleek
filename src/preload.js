const electron = require('electron');
const { contextBridge, ipcRenderer } = require('electron');
window.os = require("os");
window.session = electron.session;
window.ipcRenderer = electron.ipcRenderer;
window.getCurrentWindow = electron.remote.getCurrentWindow;
window.notification = electron.remote.Notification;
window.dialog = electron.remote.dialog;
window.nativeTheme = electron.remote.nativeTheme;
window.app = electron.remote.app;
window.md5 = require('md5');
window.path = require("path");
//window.config = require("./configs/store.config.js");
//window.i18nextOptions = require('./configs/i18next.config');
//window.i18next = require("i18next");
//window.i18nextBackend = require("i18next-fs-backend");
//window.i18nextBrowserLanguageDetector = require("i18next-browser-languagedetector");
window.fs = require('fs');
window.electron_util = require("electron-util");

/*const Store = require("./configs/store.config.js");
const config = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 1025, height: 768 },
    showCompleted: true,
    selectedFilters: new Array,
    categoriesFiltered: new Array,
    dismissedNotifications: new Array,
    dismissedMessages: new Array,
    theme: null,
    matomoEvents: false,
    notifications: true,
    language: null,
    files: new Array,
    uid: null,
    filterDrawerWidth: "560px",
    useTextarea: false,
    filterDrawer: false
  }
});*/

/*contextBridge.exposeInMainWorld(
  "app",
  {
    sendConfigToMain: () => ipcRenderer.send("sendConfigToMain", config)
  }
)*/

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = [
        "getConfig",
        "getTranslations",
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = [
        "getConfig",
        "getTranslations",
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);
