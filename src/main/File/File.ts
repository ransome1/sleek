import fs from 'fs'
import { app } from 'electron'
import { SettingsStore } from '../Stores/SettingsStore'
import path from 'path'
import { mainWindow } from '../index'

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

  const files: FileObject[] = SettingsStore.get('files')
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

  SettingsStore.set('files', files)

  return 'File added'
}

function addDoneFile(filePath: string, bookmark: string | null) {
  const files: FileObject[] = SettingsStore.get('files')
  const activeIndex: number = files.findIndex((file) => file.active)

  if (activeIndex === -1) return false

  files[activeIndex].doneFilePath = filePath
  files[activeIndex].doneFileBookmark = bookmark

  SettingsStore.set('files', files)

  mainWindow!.webContents.send('triggerArchiving', true)
}

function removeFile(index: number) {
  let files: FileObject[] = SettingsStore.get('files')

  files.splice(index, 1)
  const activeIndex: number = files.findIndex((file) => file.active)

  if (files.length > 0 && activeIndex === -1) {
    files[0].active = true
  } else if (activeIndex !== -1) {
    files[activeIndex].active = true
  } else {
    files = []
  }

  SettingsStore.set('files', files)

  return 'File removed'
}

function setFile(index: number) {
  const files: FileObject[] = SettingsStore.get('files')

  if (files.length > 0) {
    files.forEach((file) => {
      file.active = false
    })
  }

  files[index].active = true

  SettingsStore.set('files', files)

  return 'File changed'
}

export { setFile, removeFile, addFile, addDoneFile, readFileContent }
