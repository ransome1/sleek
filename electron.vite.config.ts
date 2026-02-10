/// <reference types="vitest/config" />
import { defineConfig, UserConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";

export const config = {
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        "@renderer": resolve("src/renderer/"),
      },
    },
    plugins: [react()],
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/setupTests.ts"],
  },
  plugins: [react()],
} satisfies UserConfig;

export default defineConfig(config);
