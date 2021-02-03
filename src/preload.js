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
window.fs = require('fs');
window.electron_util = require("electron-util");
// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld(
  "api", {
    send: (channel, data) => {
      // whitelist channels
      let validChannels = [
        "getConfig",
        "getTranslations",
        "getFileContent",
        "setConfig",
      ];
      if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
      }
    },
    receive: (channel, func) => {
      let validChannels = [
        "getConfig",
        "sendTranslations",
        "getFileContent",
        "setConfig",
      ];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    }
  }
);
