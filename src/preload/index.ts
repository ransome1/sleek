import { contextBridge, ipcRenderer } from 'electron'

interface StoreReply {
  [key: string]: object
}

contextBridge.exposeInMainWorld('api', {
  store: {
    getConfig(key): StoreReply {
      return ipcRenderer.sendSync('storeGetConfig', key)
    },
    setConfig(property, value, rerender): StoreReply {
      return ipcRenderer.send('storeSetConfig', property, value, rerender)
    },
    setFilters(property, value): StoreReply {
      return ipcRenderer.send('storeSetFilters', property, value)
    },
    getFilters(key): StoreReply {
      return ipcRenderer.sendSync('storeGetFilters', key)
    },
    notifiedTodoObjects(value): StoreReply {
      return ipcRenderer.send('storeSetNotifiedTodoObjects', value)
    }
  },
  ipcRenderer: {
    send(channel, ...args) {
      ipcRenderer.send(channel, ...args)
    },
    on(channel, func) {
      const subscription = (_event, ...args) => func(...args)
      ipcRenderer.on(channel, subscription)

      return () => {
        ipcRenderer.removeListener(channel, subscription)
      }
    },
    off(channel, func) {
      const subscription = (_event, ...args) => func(...args)
      ipcRenderer.removeListener(channel, subscription)
    }
  }
})
