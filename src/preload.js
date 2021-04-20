//const electron = require('electron');
const { electron, contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
      let validChannels = [
        "appData",
        "userData",
        "fileContent",
        "translations",
        "showNotification",
        "writeToFile",
        "startFileWatcher",
        "changeLanguage",
        "openOrCreateFile",
        "copyToClipboard",
        "triggerFunction"
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = [
        "translations",
        "fileContent",
        "userData",
        "appData",
        "refresh",
        "triggerFunction"
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);
