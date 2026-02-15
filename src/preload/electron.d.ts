/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference types="electron-vite/node" />
import { ElectronAPI } from "@electron-toolkit/preload";

declare global {
  interface Window {
    electron: ElectronAPI;
    api: any;
    _mtm: any[];
    _paq: any[];
  }
}
