"use strict";
const { contextBridge, ipcRenderer } = require("electron");
contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
      let validChannels = [
        "appData",
        "userData",
        "getContent",
        "translations",
        "showNotification",
        "writeToFile",
        "startFileWatcher",
        "changeLanguage",
        "openOrCreateFile",
        "copyToClipboard",
        "update-badge",
        "triggerFunction",
        "restart",
        "setTheme",
        "closeWindow",
        "changeWindowTitle"
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = [
        "translations",
        "update-badge",
        "getContent",
        "userData",
        "appData",
        "refresh",
        "triggerFunction",
        "setTheme"
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);
