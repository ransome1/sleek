const { app, BrowserWindow } = require('electron');
const { is } = require('electron-util');
const path = require('path');
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}
const isMac = process.platform === "darwin";
const Store = require('./store.js');
let mainWindow; //do this so that the window object doesn't get GC'd

// First instantiate the class
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 1025, height: 768 }
  }
});

const createWindow = () => {
  let { width, height } = store.get('windowBounds');
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'img/512x512.png'),
    simpleFullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      worldSafeExecuteJavaScript:true,
      nodeIntegration: true,
      enableRemoteModule: true,
      spellcheck: false
    }
  });

  if (is.development) {
    mainWindow.webContents.openDevTools();
  }

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // open links in external browser
  mainWindow.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    require('electron').shell.openExternal(url);
  });

  // https://dev.to/abulhasanlakhani/conditionally-appending-developer-tools-menuitem-to-an-existing-menu-in-electron-236k
  // Modules to create application menu
  const Menu = require('electron').Menu;
  const MenuItem = require('electron').MenuItem;

  // Template for menu
  const menuTemplate = [
    {
      label: 'sleek',
      submenu: [
        {
          label: 'Open todo.txt file',
          accelerator: 'CmdOrCtrl+o',
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript('openFile()');
          }
        },
        {
          label: 'Create new todo.txt file',
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript('createFile(true, false)');
          }
        },
        isMac ? { role: "quit" } : { role: "close" }
      ]
    },
    {
      label: 'Todos',
      submenu: [
        {
          label: 'Add todo',
          accelerator: 'CmdOrCtrl+n',
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript('showForm(true)');
          }
        },
        {
          label: 'Toggle filters',
          accelerator: 'CmdOrCtrl+f',
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript('showFilters("toggle")');
          }
        },
        {
          label: 'Show or hide completed todos',
          accelerator: 'CmdOrCtrl+h',
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript('showCompletedTodos()');
          }
        },
        {role: 'reload'}
      ]
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle dark mode',
          accelerator: 'CmdOrCtrl+d',
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript('switchTheme("dark")');
          }
        }
      ]
    },
    {
      label: 'About',
      submenu: [
        {
          label: 'sleek on Github',
          click: () => {require('electron').shell.openExternal('https://github.com/ransome1/sleek')}
        },
        {role: 'toggleDevTools'}
      ]
    }
  ];
  // Build menu from menuTemplate
  const menu = Menu.buildFromTemplate(menuTemplate);
  // Set menu to menuTemplate
  Menu.setApplicationMenu(menu)
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
