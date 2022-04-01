"use strict";
const { contextBridge, ipcRenderer } = require("electron");
const validChannels = [
  "appData",
  "userData",
  "getContent",
  "translations",
  "showNotification",
  "writeToFile",
  "startFileWatcher",
  "buildTable",
  "changeLanguage",
  "openOrCreateFile",
  "copyToClipboard",
  "update-badge",
  "triggerFunction",
  "restart",
  "closeWindow",
  "changeWindowTitle",
  "darkmode"
];
contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
      if(validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      if(validChannels.includes(channel)) {
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    invoke: (channel, data) => {
      if(validChannels.includes(channel)) {
        return ipcRenderer.invoke(channel, data);
      }
    }
  }
);
