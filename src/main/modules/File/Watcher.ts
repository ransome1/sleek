import chokidar, { FSWatcher } from 'chokidar'
import { app } from 'electron'
import { dataRequest, searchString } from '../DataRequest/DataRequest'
import { config } from '../../config'
import { handleError } from '../../Util'
import { mainWindow, eventListeners } from '../../index'

let watcher: FSWatcher | null = null

function createFileWatcher(files: FileObject[]): void {
  if (watcher) {
    watcher?.close()
    console.log(`Destroyed old file watcher`)
  }

  const hasActiveEntry = files.some((file) => file.active)
  if (!hasActiveEntry && files.length > 0) {
    files[0].active = true
    config.set('files', files)
  }

  if (process.mas) {
    files.forEach((file) => {
      if (file.todoFileBookmark) {
        app.startAccessingSecurityScopedResource(file.todoFileBookmark)
      }
      if (file.doneFileBookmark) {
        app.startAccessingSecurityScopedResource(file.doneFileBookmark)
      }
    })
  }

  watcher = chokidar.watch(
    files.map((file) => file.todoFilePath),
    config.get('chokidarOptions')
  )

  watcher
    .on('add', (file) => {
      console.log(`Watching new file: ${file}`)
    })
    .on('change', (file) => {
      try {
        const requestedData = dataRequest(searchString)
        mainWindow!.webContents.send('requestData', requestedData)
        console.log(`${file} has been changed`)
      } catch (error: any) {
        handleError(error)
      }
    })
    .on('unlink', (file) => {
      console.log(`Unlinked file: ${file}`)
    })

  eventListeners.watcher = watcher
}

export { createFileWatcher, watcher }
