import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default {
  main: {
    // vite config options
  },
  preload: {
    // vite config options
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/')
      }
    },
    plugins: [react()]
  }
}