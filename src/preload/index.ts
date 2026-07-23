import { contextBridge, ipcRenderer } from "electron";

interface StoreReply {
  [key: string]: object;
}

contextBridge.exposeInMainWorld("api", {
  store: {
    getConfig(key): StoreReply {
      return ipcRenderer.sendSync("storeGetConfig", key);
    },
    setConfig(property, value, rerender) {
      return ipcRenderer.send("storeSetConfig", property, value, rerender);
    },
    setFilters(property, value) {
      return ipcRenderer.send("storeSetFilters", property, value);
    },
    getFilters(key): StoreReply {
      return ipcRenderer.sendSync("storeGetFilters", key);
    },
    getColors(key): StoreReply {
      return ipcRenderer.sendSync("storeGetColors", key);
    },
    notifiedTodoObjects(value) {
      return ipcRenderer.send("storeSetNotifiedTodoObjects", value);
    },
   },
  deleteFilterValue(params: { attrType: string; valueToDelete: string }) {
    return ipcRenderer.send("deleteFilterValue", params.attrType, params.valueToDelete);
  },
  renameFilterValue(params: { attrType: string; oldValue: string; newValue: string }) {
    return ipcRenderer.send("renameFilterValue", params.attrType, params.oldValue, params.newValue);
  },
  ipcRenderer: {
    send(channel, ...args) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel, func) {
      const subscription = (_event, ...args) => func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    off(channel, func) {
      const subscription = (_event, ...args) => func(...args);
      ipcRenderer.removeListener(channel, subscription);
    },
  },
});
