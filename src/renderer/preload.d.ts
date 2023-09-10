import { ElectronHandler } from 'main/preload';

declare global {
  interface Window {
    electron: ElectronHandler;
  }
}

declare global {
  interface Window {
    electron: {
      store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
      };
    };
  }
}

export {};
