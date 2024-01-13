import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  store: {
    get(key) {
      return ipcRenderer.sendSync('storeGetConfig', key);
    },
    set(property, value) {
      ipcRenderer.send('storeSetConfig', property, value);
    },
    setFilters(property, value) {
      ipcRenderer.send('storeSetFilters', property, value);
    },
    getFilters(key) {
      return ipcRenderer.sendSync('storeGetFilters', key);
    },
    notifiedTodoObjects(value) {
      ipcRenderer.send('storeSetNotifiedTodoObjects', value);
    },
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
