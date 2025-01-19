import fs from 'fs'
import { app } from 'electron'
import { config } from '../../config'
import { createTray } from '../Tray'
import { createMenu } from '../Menu'
import path from 'path'
import { mainWindow } from '../../index'

function readFileContent(filePath: string, bookmark: string | null): string | Error {
  const fileContent = fs.readFileSync(filePath, 'utf8')
  return fileContent
}

function addFile(filePath: string, bookmark: string | null) {
  if (process.mas && !bookmark) {
    mainWindow!.webContents.send(
      'responseFromMainProcess',
      'The Mac App Store release requires you to open files from within the app'
    )
    throw new Error('The Mac App Store release requires you to open files from within the app')
  }

  const files: FileObject[] = config.get('files')
  const existingFileIndex = files.findIndex((file) => file.todoFilePath === filePath)

  files.forEach((file) => (file.active = false))

  if (existingFileIndex === -1) {
    files.push({
      active: true,
      todoFileName: path.basename(filePath),
      todoFilePath: filePath,
      todoFileBookmark: bookmark,
      doneFilePath: null,
      doneFileBookmark: null
    })
  } else {
    files[existingFileIndex].active = true
  }

  config.set('files', files)

  createMenu(files)

  if (config.get('tray')) {
    createTray()
  }

  return 'File added'
}

function addDoneFile(filePath: string, bookmark: string | null) {
  const files: FileObject[] = config.get('files')
  const activeIndex: number = files.findIndex((file) => file.active)

  if (activeIndex === -1) return false

  files[activeIndex].doneFilePath = filePath
  files[activeIndex].doneFileBookmark = bookmark

  config.set('files', files)

  mainWindow!.webContents.send('triggerArchiving', true)
}

function removeFile(index: number) {
  let files: FileObject[] = config.get('files')

  files.splice(index, 1)
  const activeIndex: number = files.findIndex((file) => file.active)

  if (files.length > 0 && activeIndex === -1) {
    files[0].active = true
  } else if (activeIndex !== -1) {
    files[activeIndex].active = true
  } else {
    files = []
  }

  config.set('files', files)

  createMenu(files)

  const tray = config.get('tray')

  if (tray) {
    createTray()
  }
  return 'File removed'
}

function setFile(index: number) {
  const files: FileObject[] = config.get('files')

  if (files.length > 0) {
    files.forEach((file) => {
      file.active = false
    })
  }

  files[index].active = true

  config.set('files', files)

  return 'File changed'
}

export { setFile, removeFile, addFile, addDoneFile, readFileContent }
