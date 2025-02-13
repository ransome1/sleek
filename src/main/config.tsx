import Store from 'electron-store'
import path from 'path'
import { app, nativeTheme } from 'electron'
import fs from 'fs'
import { mainWindow } from './index'
import { createFileWatcher } from './modules/File/Watcher'
import { writeToFile } from './modules/File/Write'
import { createTray } from './modules/Tray'
import { dataRequest, searchString } from './modules/DataRequest/DataRequest'
import handleTheme from './modules/Theme'
import { getChannel, handleError } from './util'
import crypto from 'crypto'

Store.initRenderer()

const userDataDirectory: string =
  process.env.NODE_ENV === 'development'
    ? path.join(app.getPath('userData'), 'userData-Development')
    : path.join(app.getPath('userData'), 'userData')

if (!fs.existsSync(userDataDirectory)) fs.mkdirSync(userDataDirectory)

console.log('config.ts: sleek userdata is located at: ' + userDataDirectory)

const customStylesPath: string = path.join(userDataDirectory, 'customStyles.css')
if (!fs.existsSync(customStylesPath)) {
  writeToFile('', customStylesPath, null)
}

const config: Store<Settings> = new Store<Settings>({
  cwd: userDataDirectory,
  name: 'config',
  migrations: {
    '2.0.0': (store) => {
      console.log('Creating new default configuration for v2.0.0')
      store.set('sorting', [
        { id: '1', value: 'priority', invert: false },
        { id: '2', value: 'projects', invert: false },
        { id: '3', value: 'contexts', invert: false },
        { id: '4', value: 'due', invert: false },
        { id: '5', value: 't', invert: false },
        { id: '6', value: 'completed', invert: false },
        { id: '7', value: 'created', invert: false },
        { id: '8', value: 'rec', invert: false },
        { id: '9', value: 'pm', invert: false }
      ])
      store.set('accordionOpenState', [true, true, true, false, false, false, false, false, false])
      store.set('files', [])
      store.set('appendCreationDate', false)
      store.set('showCompleted', true)
      store.set('showHidden', false)
      store.set('windowMaximized', false)
      store.set('fileSorting', false)
      store.set('convertRelativeToAbsoluteDates', true)
      store.set('thresholdDateInTheFuture', true)
      store.set('colorTheme', 'system')
      store.set('shouldUseDarkColors', false)
      store.set('notificationsAllowed', true)
      store.set('notificationThreshold', 2)
      store.set('showFileTabs', true)
      store.set('isNavigationOpen', true)
      store.set('customStylesPath', customStylesPath)
      store.set('tray', false)
      store.set('zoom', 100)
      store.set('multilineTextField', false)
      store.set('useMultilineForBulkTodoCreation', false)
      store.set('matomo', true)
    },
    '2.0.1': (store) => {
      console.log('Migrating from 2.0.0 → 2.0.1')
      store.set('anonymousUserId', crypto.randomUUID())
    },
    '2.0.2': (store) => {
      console.log('Migrating from 2.0.1 → 2.0.2')
      store.set('dueDateInTheFuture', true)
    },
    '2.0.4': (store) => {
      console.log('Migrating from 2.0.2 → 2.0.4')
      store.delete('multilineTextField')
      store.delete('isDrawerOpen')
      store.delete('useMultilineForBulkTodoCreation')
      store.set('bulkTodoCreation', false)
      store.set('disableAnimations', false)
    },
    '2.0.10': (store) => {
      console.log('Migrating from 2.0.4 → 2.0.10')
      store.set('useHumanFriendlyDates', false)
      store.set('excludeLinesWithPrefix', null)
    },
    '2.0.12': (store) => {
      console.log('Migrating from 2.0.11 → 2.0.12')
      store.set('channel', getChannel())
      store.set('fileWatcherAtomic', 1000)
      store.set('fileWatcherPolling', false)
      store.set('fileWatcherPollingInterval', 100)
    },
    '2.0.13': (store) => {
      console.log('Migrating from 2.0.12 → 2.0.13')
      store.set('weekStart', 1)
      store.delete('fileWatcherAtomic')
      store.delete('fileWatcherPolling')
      store.delete('fileWatcherPollingInterval')
      store.delete('language')
      store.set('chokidarOptions', {
        awaitWriteFinish: {
          stabilityThreshold: 100,
          pollInterval: 100
        }
      })
    },
    '2.0.14': (store) => {
      console.log('Migrating from 2.0.13 → 2.0.14')
      store.set('menuBarVisibility', true)
    },
    '2.0.17': (store) => {
      console.log('Migrating from 2.0.14 → 2.0.17')
      store.set('compact', false)
      store.set('sortCompletedLast', false)
    }
  }
})

const filter = new Store<Filters>({ cwd: userDataDirectory, name: 'filters' })

if (!filter.has('search')) {
  filter.set('search', [])
} else if (!filter.has('attributes')) {
  filter.set('attributes', {})
}

const notifiedTodoObjectsPath = path.join(userDataDirectory, 'notifiedTodoObjects.json')
const notifiedTodoObjectsStorage = new Store<{}>({
  cwd: userDataDirectory,
  name: 'notifiedTodoObjects'
})

if (!fs.existsSync(notifiedTodoObjectsPath)) {
  const defaultNotifiedTodoObjectsData = {}
  writeToFile(JSON.stringify(defaultNotifiedTodoObjectsData), notifiedTodoObjectsPath, null)
}

filter.onDidChange('attributes', () => {
  try {
    const requestedData = dataRequest(searchString)
    mainWindow!.webContents.send('requestData', requestedData)
  } catch (error: any) {
    handleError(error)
  }
})

config.onDidAnyChange((settings) => {
  try {
    if (mainWindow && mainWindow.webContents) {
      const requestedData = dataRequest(searchString)
      mainWindow.webContents.send('requestData', requestedData)
      mainWindow.webContents.send('settingsChanged', settings)
    } else {
      console.warn('The window is not available, skipping setting change.')
    }
  } catch (error: any) {
    handleError(error)
  }
})

config.onDidChange('files', (newValue: FileObject[] | undefined) => {
  try {
    if (newValue !== undefined) {
      createFileWatcher(newValue)
    }
  } catch (error: any) {
    handleError(error)
  }
})

config.onDidChange('colorTheme', (colorTheme) => {
  try {
    if (colorTheme === 'system' || colorTheme === 'light' || colorTheme === 'dark') {
      nativeTheme.themeSource = colorTheme
    }
  } catch (error: any) {
    handleError(error)
  }
})

config.onDidChange('menuBarVisibility', (menuBarVisibility) => {
  if (mainWindow) {
    mainWindow.setMenuBarVisibility(menuBarVisibility)
  } else {
    console.warn('The window is not available, skipping setting change.')
  }
})

config.onDidChange('tray', () => {
  try {
    createTray()
  } catch (error: any) {
    console.error(error)
  }
})

nativeTheme.on('updated', handleTheme)

export { config, filter, notifiedTodoObjectsStorage }
