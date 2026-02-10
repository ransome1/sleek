/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import { resolve } from "path";
import { config } from "./electron.vite.config.js";

export default defineConfig({
  test: config.test,
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "src/renderer/index.html"),
      },
    },
  },
  ...config.renderer,
});
