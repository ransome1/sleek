const electron = require('electron');
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
      let validChannels = [
        "getUserData",
        "getTranslations",
        "getFileContent",
        "setUserData",
        "getAppData",
        "showNotification",
        "writeToFile",
        "startFileWatcher",
        "changeLanguage",
        "openOrCreateFile"
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = [
        "sendTranslations",
        "getFileContent",
        "getUserData",
        "setUserData",
        "getAppData",
        "reloadContent",
        "changeFile",
        "startOnboarding",
        "setTheme"
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);
