import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

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
  | 'setShouldUseDarkColors';

interface ElectronStore {
  get: <T>(key: string) => T;
  set: (property: string, val: unknown) => void;
  setFilters: (val: unknown) => void;
}

interface ElectronIpcRenderer {
  send: (channel: Channels, ...args: unknown[]) => void;
  on: (channel: Channels, func: (...args: unknown[]) => void) => () => void;
  once: (channel: Channels, func: (...args: unknown[]) => void) => void;
}

const electronHandler: {
  store: ElectronStore;
  ipcRenderer: ElectronIpcRenderer;
} = {
  store: {
    get<T>(key: string): T {
      return ipcRenderer.sendSync('storeGetConfig', key);
    },
    set(property: string, val: unknown): void {
      ipcRenderer.send('storeSetConfig', property, val);
    },
    setFilters(val: unknown): void {
      ipcRenderer.send('storeSetFilters', val);
    },
  },
  ipcRenderer: {
    send(channel: Channels, ...args: unknown[]): void {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: Channels, func: (...args: unknown[]) => void): () => void {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);
      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void): void {
      ipcRenderer.once(
        channel,
        (_event: IpcRendererEvent, ...args: unknown[]) => func(...args)
      );
    },
    startDrag: (fileName) => {
      ipcRenderer.send('ondragstart', path.join(process.cwd(), fileName))
    }
  },
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
