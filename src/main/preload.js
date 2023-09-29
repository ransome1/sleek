import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  store: {
    get(key) {
      return ipcRenderer.sendSync('storeGetConfig', key);
    },
    set(property, value) {
      ipcRenderer.send('storeSetConfig', property, value);
    },
    setFilters(value) {
      ipcRenderer.send('storeSetFilters', value);
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
    once(channel, func) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },
});
