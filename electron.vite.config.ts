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
  },
  plugins: [react()],
} satisfies UserConfig & ViteUserConfig;

export default defineConfig(config);
