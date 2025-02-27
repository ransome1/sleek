import { app, Menu, dialog, shell } from 'electron'
import { setFile } from './File/File'
import { mainWindow, handleCreateWindow } from './index'
import { openFile, createFile } from './File/Dialog'
import { handleRequestArchive } from './File/Archive'
import { SettingsStore, FiltersStore } from './Stores'
import { HandleTray } from './Tray'
import appPackage from '../../package.json'

function createMenu(files: FileObject[]) {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'sleek',
      type: 'submenu',
      submenu: [
        {
          label: 'About',
          click: async () => {
            const options = {
              title: 'About sleek',
              message: `sleek v${app.getVersion()}`,
              detail: appPackage.description,
              buttons: ['Close', 'Reveal configuration folder']
            }
            const buttonClicked = await dialog.showMessageBox(options)
            if (buttonClicked.response === 1) {
              const pathToReveal = app.getPath('userData')
              shell.showItemInFolder(pathToReveal)
            }
          }
        },
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => {
            mainWindow!.webContents.send('isSettingsOpen', true)
          }
        },
        ...(process.platform === 'darwin'
          ? [
              { type: 'separator' },
              {
                accelerator: 'Cmd+H',
                role: 'hide'
              }
            ]
          : []),
        { type: 'separator' },
        {
          role: 'quit',
          accelerator: 'CmdOrCtrl+Q'
        }
      ]
    },
    {
      id: 'fileMenu',
      label: 'File',
      submenu: [
        { type: 'separator' },
        {
          label: 'Open file',
          accelerator: 'CmdOrCtrl+O',
          click: async () => {
            await openFile(false)
          }
        },
        {
          label: 'Create file',
          click: async () => {
            await createFile(false)
          }
        },
        { type: 'separator' },
        ...(files?.length > 0
          ? files.map((file: FileObject, index: number) => ({
              label: file.todoFileName,
              accelerator: `CommandOrControl+${index + 1}`,
              click: () => {
                setFile(index)
              }
            }))
          : [])
      ]
    },
    {
      role: 'editMenu'
    },
    {
      label: 'View',
      submenu: [
        ...(files?.length > 0
          ? [
              {
                label: 'Toggle drawer',
                accelerator: 'CmdOrCtrl+B',
                click: () => {
                  const isDrawerOpen = SettingsStore.get('isDrawerOpen')
                  SettingsStore.set('isDrawerOpen', !isDrawerOpen)
                }
              },
              {
                label: 'Toggle file tabs',
                click: () => {
                  const showFileTabs = SettingsStore.get('showFileTabs')
                  SettingsStore.set('showFileTabs', !showFileTabs)
                }
              }
            ]
          : []),
        {
          label: 'Toggle navigation',
          accelerator: 'Ctrl+Alt+H',
          click: () => {
            const isNavigationOpen = SettingsStore.get('isNavigationOpen')
            SettingsStore.set('isNavigationOpen', !isNavigationOpen)
          }
        },
        {
          label: 'Toggle theme',
          accelerator: 'Ctrl+Alt+D',
          click: () => {
            const shouldUseDarkColors = SettingsStore.get('shouldUseDarkColors')
            SettingsStore.set('colorTheme', shouldUseDarkColors ? 'light' : 'dark')
          }
        },
        {
          label: 'Toggle compact mode',
          click: () => {
            const compact = SettingsStore.get('compact')
            SettingsStore.set('compact', !compact)
          }
        }        
      ]
    },
    ...(files?.length > 0
      ? [
          {
            label: 'Todos',
            submenu: [
              {
                label: 'Add new todo',
                accelerator: 'CmdOrCtrl+N',
                click: () => {
                  mainWindow?.webContents.send('isDialogOpen')
                }
              },
              {
                label: 'Find',
                accelerator: 'CmdOrCtrl+F',
                click: () => {
                  const isSearchOpen = SettingsStore.get('isSearchOpen')
                  SettingsStore.set('isSearchOpen', !isSearchOpen)
                }
              },
              {
                label: 'Toggle completed',
                accelerator: 'Ctrl+H',
                click: async () => {
                  const showCompleted = SettingsStore.get('showCompleted')
                  SettingsStore.set('showCompleted', !showCompleted)
                }
              },
              {
                label: 'Reset filters',
                accelerator: 'CmdOrCtrl+0',
                click: async () => {
                  FiltersStore.set('attributes', {})
                }
              },
              {
                label: 'Archive completed todos',
                accelerator: 'Ctrl+Alt+A',
                click: () => {
                  handleRequestArchive()
                }
              }
            ]
          }
        ]
      : []),
    {
      role: 'window',
      submenu: [
        {
          label: 'Close window',
          accelerator: 'CmdOrCtrl+W',
          role: 'close'
        },
        {
          label: 'Open window',
          click: () => {
            handleCreateWindow()
          }
        }
      ]
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'sleek wiki',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/wiki')
          }
        },
        {
          label: 'Changelog',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/blob/main/CHANGELOG.md')
          }
        },
        {
          label: 'Report bugs',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/issues')
          }
        },
        {
          label: 'Discuss new or existing features',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/discussions')
          }
        },
        {
          label: 'Contributing',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/blob/master/CONTRIBUTING.md')
          }
        },
        {
          label: 'Keyboard shortcuts',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/wiki/Keyboard-shortcuts#v2x')
          }
        },
        {
          label: 'Privacy policy',
          click: () => {
            shell?.openExternal('https://github.com/ransome1/sleek/blob/master/PRIVACY.md')
          }
        },
        ...(!process.mas
          ? [
              {
                label: 'Sponsoring',
                click: () => {
                  shell?.openExternal('https://github.com/sponsors/ransome1')
                }
              }
            ]
          : []),
        {
          role: 'toggleDevTools',
          label: 'Developer tools'
        },
        {
          role: 'reload'
        }
      ]
    }
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
  HandleTray()
}

export { createMenu }
