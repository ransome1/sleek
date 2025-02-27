import { app, BrowserWindow, nativeImage } from 'electron'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'
import { SettingsStore } from './Stores.js'
import { createMenu } from './Menu.js'
import { createFileWatcher, watcher } from './File/Watcher'
import { addFile } from './File/File'
import { HandleTray } from './Tray'
import macIcon from '../../resources/icon.icns?asset'
import windowsIcon from '../../resources/icon.ico?asset'
import linuxIcon from '../../resources/icon.png?asset'
import { handleTheme } from './Theme.js'
import './IpcMain.js'

let startTime
const environment: string | undefined = process.env.NODE_ENV
let mainWindow: BrowserWindow | null = null
const eventListeners: Record<string, any | undefined> = {}
let resizeTimeout: NodeJS.Timeout | undefined

const handleCreateWindow = () => {
  if (mainWindow) {
    mainWindow.show()
  } else {
    createMainWindow()
  }
}

const handleClosed = async () => {
  if (watcher) await watcher.close()
  mainWindow = null
  eventListeners.handleClosed = undefined
  eventListeners.handleResize = undefined
  eventListeners.handleMove = undefined
  eventListeners.handleShow = undefined
  eventListeners.handleMaximize = undefined
  eventListeners.handleUnmaximize = undefined
  eventListeners.handleCreateWindow = undefined
  eventListeners.handleWindowAllClosed = undefined
  eventListeners.handleWillQuit = undefined
  eventListeners.handleBeforeQuit = undefined
  eventListeners.watcher = undefined
}

const handleResize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    const rectangle = mainWindow?.getBounds() as WindowRectangle
    const width = rectangle.width
    const height = rectangle.height
    SettingsStore.set('windowDimensions', { width, height })
    SettingsStore.set('windowMaximized', false)
  }, 500)
}

const handleMove = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    const rectangle = mainWindow?.getBounds() as WindowRectangle
    const x = rectangle.x
    const y = rectangle.y
    SettingsStore.set('windowPosition', { x, y })
    SettingsStore.set('windowMaximized', false)
  }, 500)
}

const handleUnmaximize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    SettingsStore.set('windowMaximized', false)
  }, 500)
}

const handleMaximize = () => {
  clearTimeout(resizeTimeout)
  resizeTimeout = setTimeout(() => {
    SettingsStore.set('windowMaximized', true)
  }, 500)
}

const handleShow = () => {
  app.dock?.show()
}

const handleWindowSizeAndPosition = () => {
  const isMaximized = SettingsStore.get('windowMaximized')
  if (isMaximized) {
    mainWindow?.maximize()
    return
  }

  const windowDimensions: { width: number; height: number } | null = SettingsStore.get(
    'windowDimensions'
  ) as { width: number; height: number } | null

  if (windowDimensions) {
    const { width, height } = windowDimensions
    mainWindow?.setSize(width, height)

    const windowPosition: { x: number; y: number } | null = SettingsStore.get('windowPosition') as {
      x: number
      y: number
    } | null
    if (windowPosition) {
      const { x, y } = windowPosition
      mainWindow?.setPosition(x, y)
    }
  }
}

const createMainWindow = () => {
  const shouldUseDarkColors: boolean = SettingsStore.get('shouldUseDarkColors')
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 1000,
    backgroundColor: shouldUseDarkColors ? '#212224' : '#fff',
    icon:
      process.platform === 'win32'
        ? nativeImage.createFromPath(windowsIcon)
        : process.platform === 'darwin'
          ? nativeImage.createFromPath(macIcon)
          : nativeImage.createFromPath(linuxIcon),
    webPreferences: {
      spellcheck: false,
      contextIsolation: true,
      nodeIntegration: false,
      preload: fileURLToPath(new URL('../preload/index.mjs', import.meta.url)),
      sandbox: false
    }
  })

  mainWindow.once('ready-to-show', () => {
    const endTime = performance.now()
    console.log(`Startup time: ${(endTime - startTime).toFixed(2)} ms`)
  })

  mainWindow
    .on('resize', handleResize)
    .on('move', handleMove)
    .on('show', handleShow)
    .on('closed', handleClosed)
    .on('maximize', handleMaximize)
    .on('unmaximize', handleUnmaximize)

  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(fileURLToPath(new URL('../renderer/index.html', import.meta.url)))
  }

  const files: FileObject[] = (SettingsStore.get('files') as FileObject[]) || []
  if (files) {
    createFileWatcher(files)
  }

  createMenu(files)

  handleWindowSizeAndPosition()

  const colorTheme: string = SettingsStore.get('colorTheme')
  handleTheme(colorTheme);

  eventListeners.handleClosed = handleClosed
  eventListeners.handleResize = handleResize
  eventListeners.handleMove = handleMove
  eventListeners.handleShow = handleShow
  eventListeners.handleMaximize = handleMaximize
  eventListeners.handleUnmaximize = handleUnmaximize

  //HandleTray(SettingsStore.get('tray'))

  const customStylesPath: string = SettingsStore.get('customStylesPath')
  if (customStylesPath) {
    fs.readFile(customStylesPath, 'utf8', (error: Error | null, data) => {
      if (!error) {
        mainWindow?.webContents.insertCSS(data)
        console.error('Styles injected found in CSS file:', customStylesPath)
      } else {
        console.error('Could not read custom CSS file. More info: https://github.com/ransome1/sleek/wiki/Custom-CSS')
      }
    })
  }

  if (environment === 'development') {
    mainWindow.webContents.openDevTools()
  }
}

const handleWindowAllClosed = () => {
  const tray = SettingsStore.get('tray')
  if (process.platform !== 'darwin' && !tray) {
    app.quit()
  } else if (process.platform === 'darwin' && tray) {
    app.dock?.hide()
  } else {
    mainWindow?.hide()
  }
}

const handleBeforeQuit = () => {
  app.releaseSingleInstanceLock()
}

const handleOpenFile = (path) => {
  try {
    if (path) addFile(path, null)
  } catch (error) {
    console.error(error)
  }
}

app
  .whenReady()
  .then(() => {
    startTime = performance.now()
    createMainWindow()
    eventListeners.handleCreateWindow = handleCreateWindow
    eventListeners.handleWindowAllClosed = handleWindowAllClosed
    eventListeners.handleBeforeQuit = handleBeforeQuit
    eventListeners.handleOpenFile = handleOpenFile
  })
  .catch(console.error)

// do we need open-file event?
app
  .on('window-all-closed', handleWindowAllClosed)
  .on('before-quit', handleBeforeQuit)
  .on('activate', handleCreateWindow)
  .on('open-file', (event, path) => {
    event.preventDefault();
      setTimeout(() => {
        handleOpenFile(path);
      }, 1000);
  });
export { mainWindow, handleCreateWindow, eventListeners }
