const { app, BrowserWindow } = require('electron');
const path = require('path');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

const Store = require('./store.js');
let mainWindow; //do this so that the window object doesn't get GC'd

// First instantiate the class
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: 'user-preferences',
  defaults: {
    windowBounds: { width: 1025, height: 769, minWidth: 800, minHeight: 600 },
    sortAlphabetically: false,
    showCompleted: true,
    selectedFilters: new Array
  }
});

const createWindow = () => {
  let { width, height, minWidth, minHeight } = store.get('windowBounds');
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    minWidth: minWidth,
    minHeight: minHeight,
    //icon: __dirname + './icon.png',
    icon: path.join(__dirname, 'img/512x512.png'),
    //frame: false,
    //fullscreen: true,
    //simpleFullscreen: true,
    //fullscreenWindowTitle: true,
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: false,
      worldSafeExecuteJavaScript:true,
      nodeIntegration: true,
      enableRemoteModule: true
    }
  });

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
    /*{
      label: 'File',
      submenu: [
        {
          label: 'Open todo.txt file',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        },
        {
          role: 'close',
          label: 'Close sleek'
        }

      ]
    },*/
    {
      label: 'View',
      submenu: [
        {role: 'Reload'}
      ]
    },
    {
      id: 'helpMenu',
      role: 'help',
      submenu: [
        {
          label: 'sleek on Github',
          click: () => {require('electron').shell.openExternal('https://github.com/ransome1/sleek')}
        },
        {
          label: 'Developer Console',
          click: () => {
            mainWindow.webContents.toggleDevTools();
          }
        }
      ]
    }
  ];

  // Build menu from menuTemplate
  const menu = Menu.buildFromTemplate(menuTemplate);

  // Set menu to menuTemplate
  Menu.setApplicationMenu(menu)

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Store user data: save size after resize
  mainWindow.on('resize', () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set('windowBounds', { width, height });
    console.log('Saved new windows size in user preferences');
  });
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
