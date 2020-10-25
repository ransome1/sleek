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
    windowBounds: { width: 800, height: 600 },
    sortAlphabetically: false,
    showCompleted: false,
    selectedFilters: new Array
  }
});

const createWindow = () => {
  // First we'll get our height and "width". This will be the defaults if there wasn't anything saved
  let { width, height } = store.get('windowBounds');

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
    icon: __dirname + '/icon.png',
    //frame: false,
    //fullscreen: true,
    //simpleFullscreen: true,
    //fullscreenWindowTitle: true,
    autoHideMenuBar: true,
    webPreferences: {
      //contextIsolation: true,
      //worldSafeExecuteJavaScript:true,
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
