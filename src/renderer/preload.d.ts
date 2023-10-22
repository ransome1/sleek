declare global {
  interface Window {
    api: {
      store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
        setFilters: (val: any) => void;
      };
      ipcRenderer: {
        send: (channel: string, ...args: any[]) => void;
        on: (channel: string, listener: (...args: any[]) => void) => void;
      };
    };
  }
}

export {};
