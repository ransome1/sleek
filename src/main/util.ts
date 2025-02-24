import { mainWindow } from './index.js'

export function handleError(error: Error): void {
  console.error(error)
  mainWindow!.webContents.send('responseFromMainProcess', error)
}