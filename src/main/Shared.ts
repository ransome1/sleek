import { app } from 'electron'
import path from 'path'
import { mainWindow } from './index.js'

export const userDataDirectory: string =
  process.env.NODE_ENV === 'development'
    ? path.join(app.getPath('userData'), 'userData-Development')
    : path.join(app.getPath('userData'), 'userData')

export function handleError(error: Error): void {
  console.error(error)
  mainWindow!.webContents.send('responseFromMainProcess', error)
}