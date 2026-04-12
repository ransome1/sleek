import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

// Mock window.api for renderer tests
Object.defineProperty(window, "api", {
  value: {
    store: {
      getConfig: vi.fn(),
      setConfig: vi.fn(),
      getFilters: vi.fn(),
      setFilters: vi.fn(),
    },
    ipcRenderer: {
      send: vi.fn(),
      on: vi.fn(),
      off: vi.fn(),
      invoke: vi.fn(),
    },
  },
  writable: true,
});

afterEach(() => {
  cleanup();
});
