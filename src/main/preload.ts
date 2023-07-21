import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'requestData'
  | 'showSplashScreen'
  | 'writeTodoToFile'
  | 'deleteFile'
  | 'openFile'
  | 'createFile'
  | 'storeGet'
  | 'storeSet'
  | 'selectedFilters'
  | 'applySearchString'
  | 'focusSearch';

const electronHandler = {
  store: {
    get(key) {
      return ipcRenderer.sendSync('storeGet', key);
    },
    set(property, val) {
      ipcRenderer.send('storeSet', property, val);
    },
  },  
  ipcRenderer: {
    send: (channel: Channels, ...args: unknown[]) => {
      ipcRenderer.send(channel, ...args);
    },
    on: (channel: Channels, func: (...args: unknown[]) => void) => {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once: (channel: Channels, func: (...args: unknown[]) => void) => {
      ipcRenderer.once(channel, (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args)
      );
    },
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
