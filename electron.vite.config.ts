import { resolve } from 'path'
import react from '@vitejs/plugin-react'

export default {
  main: {},
  preload: {},
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/')
      }
    },
    plugins: [react()]
  }
}
