const { app, BrowserWindow, nativeTheme, electron } = require("electron");
const { is } = require("electron-util");
const path = require("path");
const isMac = process.platform === "darwin";
const Store = require("./configs/store.config.js");
const i18next = require("./configs/i18next.config");
let mainWindow; //do this so that the window object doesn"t get GC"d

console.log("DARK MODE ON?: " + nativeTheme.shouldUseDarkColors);

const store = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 1025, height: 768 }
  }
});
const createWindow = () => {
  let { width, height } = store.get("windowBounds");
  const mainWindow = new BrowserWindow(
  {
    width: width,
    height: height,
    minWidth: 800,
    minHeight: 600,
    simpleFullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      worldSafeExecuteJavaScript:true,
      nodeIntegration: true,
      enableRemoteModule: true,
      spellcheck: false,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js")
    }
  });
  if (process.platform === "win32") {
    mainWindow.setIcon(path.join(__dirname, "../assets/icons/sleek.ico"));
  } else {
    mainWindow.setIcon(path.join(__dirname, "../assets/icons/512x512.png"));
  }
  if (is.development) {
    mainWindow.webContents.openDevTools();
  }
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // open links in external browser
  mainWindow.webContents.on("new-window", function(e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });

  // every 60 seconds sleek will reparse the data if app is not focused
  // important for notifications to show up if sleek is running for a long time in background
  let timerId = setInterval(() => {
    if(!mainWindow.isFocused()) {
      mainWindow.webContents.executeJavaScript("parseDataFromFile()");
    }
  }, 120000);

  // https://dev.to/abulhasanlakhani/conditionally-appending-developer-tools-menuitem-to-an-existing-menu-in-electron-236k
  // Modules to create application menu
  const Menu = require("electron").Menu;
  const MenuItem = require("electron").MenuItem;
  // Template for menu
  const menuTemplate = [
    {
      label: i18next.t("file"),
      submenu: [
        {
          label: i18next.t("openFile"),
          accelerator: "CmdOrCtrl+o",
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("openFile()");
          }
        },
        {
          label: i18next.t("onboardingContainerBtnCreate"),
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("createFile(true, false)");
          }
        },
        isMac ? {
          role: "quit",
          label: i18next.t("close")
        } : {
          role: "close",
          label: i18next.t("close")
        }
      ]
    },
    {
      label: i18next.t("todos"),
      submenu: [
        {
          label: i18next.t("addTodo"),
          accelerator: "CmdOrCtrl+n",
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("showForm(true)");
          }
        },
        {
          label: i18next.t("find"),
          accelerator: "CmdOrCtrl+f",
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("todoTableSearch.focus()");
          }
        }
      ]
    },
    {
      label: i18next.t("view"),
      submenu: [
        {
          label: i18next.t("toggleDarkMode"),
          accelerator: "CmdOrCtrl+d",
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("switchTheme(\"dark\")");
          }
        },
        {
          label: i18next.t("toggleCompletedTodos"),
          accelerator: "CmdOrCtrl+h",
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("showCompletedTodos()");
          }
        },
        {
          role: "reload",
          label: i18next.t("reload")
        }
      ]
    },
    {
      label: i18next.t("about"),
      submenu: [
        {
          label: i18next.t("help"),
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("showHelp()");
          }
        },
        {
          label: i18next.t("sleekOnGithub"),
          click: () => {require("electron").shell.openExternal("https://github.com/ransome1/sleek")}
        },
        {
          role: "toggleDevTools",
          label: i18next.t("devTools")
        }
      ]
    }
  ];
  // Set menu to menuTemplate
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();
  if (process.platform === 'win32') {
    app.setAppUserModelId("RobinAhle.sleektodomanager");
  }
});
// Quit when all windows are closed, except on macOS. There, it"s common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
  app.show();
});
