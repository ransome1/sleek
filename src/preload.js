//const electron = require('electron');
const { electron, contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
      let validChannels = [
        "appData",
        "userData",
        "fileContent",
        "getTranslations",
        "showNotification",
        "writeToFile",
        "startFileWatcher",
        "changeLanguage",
        "openOrCreateFile",
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = [
        "sendTranslations",
        "fileContent",
        "userData",
        "appData",
        "reloadContent",
        "triggerFunction"
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);
