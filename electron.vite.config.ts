/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/')
      }
    },
    plugins: [react()]
  },
  test: {
    // ... Specify options here.
  },  
})