import Store from 'electron-store'
import crypto from 'crypto'
import { app } from 'electron'
import path from 'path'
//import { writeToFile } from './modules/File/Write'
//import { userDataDirectory } from './util'

//Store.initRenderer()

const userDataDirectory: string =
  process.env.NODE_ENV === 'development'
    ? path.join(app.getPath('userData'), 'userData-Development')
    : path.join(app.getPath('userData'), 'userData')

const getChannel = function(): string {
  if (process.env.APPIMAGE) {
    return 'AppImage'
  } else if (process.windowsStore) {
    return 'Windows Store'
  } else if (process.mas) {
    return 'Mac App Store'
  } else if (process.env.SNAP) {
    return 'Snap Store'
  } else if (process.env.FLATPAK_ID) {
    return 'Flathub'
  } else if (process.env.AUR) {
    return 'AUR'
  } else if (process.env.PORTABLE_EXECUTABLE_DIR) {
    return 'Portable'
  } else {
    return 'Misc'
  }
}

const migrations = {
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
    store.set('customStylesPath', path.join(userDataDirectory, 'customStyles.css'))
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

export const ConfigStore = new Store({
  cwd: userDataDirectory,
  name: 'config',
  migrations
})