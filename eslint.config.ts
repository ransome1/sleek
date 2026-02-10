import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintConfigPrettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["src/renderer/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx"],
    languageOptions: { globals: { ...globals.browser } },
  },
  {
    files: ["src/{main,preload}/**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx"],
    languageOptions: { globals: { ...globals.node } },
  },
  tseslint.configs.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  eslintConfigPrettier,
]);
