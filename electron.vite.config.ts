/// <reference types="vitest/config" />
import { defineConfig, UserConfig } from "electron-vite";
import { UserConfig as ViteUserConfig } from "vite";
import react from "@vitejs/plugin-react";

export const config = {
  main: {},
  preload: {},
  renderer: {
    plugins: [react()],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/setupTests.ts"],
    exclude: ["**/node_modules/**", "**/src/e2e/**"],
  },
  plugins: [react()],
} satisfies UserConfig & ViteUserConfig;

export default defineConfig(config);
