const electron = require('electron');
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = [
        "getUserData",
        "getTranslations",
        "getFileContent",
        "setUserData",
        "getAppData",
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
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);
