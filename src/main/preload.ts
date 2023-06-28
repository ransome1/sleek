import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

export type Channels =
  | 'changeCompleteState'
  | 'receiveTodoTxtObjects'
  | 'requestTodoTxtObjects'
  | 'reloadGrid'
  | 'receiveFiles'
  | 'requestFiles'
  | 'showSplashScreen'
  | 'displayErrorFromMainProcess';

const electronHandler = {
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
