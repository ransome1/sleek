import { contextBridge, ipcRenderer } from 'electron';

export type Channels =
  | 'requestData'
  | 'showSplashScreen'
  | 'writeTodoToFile'
  | 'removeFile'
  | 'openFile'
  | 'createFile'
  | 'updateFiles'
  | 'storeGetConfig'
  | 'storeSetConfig'
  | 'storeSetFilters'
  | 'archiveTodos'
  | 'setIsNavigationOpen'
  | 'setShowFileTabs'
  | 'setIsSettingsOpen'
  | 'setShouldUseDarkColors'
  | 'saveToClipboard'
  | 'revealFile'
  | 'changeDoneFilePath';

contextBridge.exposeInMainWorld('api', {
  store: {
    get(key: string): void {
      return ipcRenderer.sendSync('storeGetConfig', key);
    },
    set(property: string, value: unknown): void {
      ipcRenderer.send('storeSetConfig', property, value);
    },
    setFilters(value: unknown): void {
      ipcRenderer.send('storeSetFilters', value);
    },
  },
  ipcRenderer: {
    send(channel: Channels, ...args): void {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args) => void): () => void {
      const subscription = (_event, ...args) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    off(channel: Channels, func: (...args) => void): () => void {
      const subscription = (_event, ...args) =>
        func(...args);
      ipcRenderer.removeListener(channel, subscription);
    },    
    once(channel: Channels, func: (...args) => void): void {
      ipcRenderer.once(
        channel,
        (_event, ...args) => func(...args)
      );
    },
  }
});