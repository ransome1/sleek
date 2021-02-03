// https://dev.to/xxczaki/how-to-make-your-electron-app-faster-4ifb
require("v8-compile-cache");
const { app, BrowserWindow, nativeTheme, electron, ipcMain, session } = require("electron");
const { is } = require("electron-util");
const fs = require("fs");
const path = require("path");
const isMac = process.platform === "darwin";
const i18next = require("i18next");
const i18nextBackend = require("i18next-fs-backend");
const i18nextOptions = require('./configs/i18next.config');
// config setting
const Store = require("./configs/store.config.js");
const config = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 1025, height: 768 },
    showCompleted: true,
    selectedFilters: new Array,
    categoriesFiltered: new Array,
    dismissedNotifications: new Array,
    dismissedMessages: new Array,
    theme: null,
    matomoEvents: false,
    notifications: true,
    language: null,
    files: new Array,
    uid: null,
    filterDrawerWidth: "560px",
    useTextarea: false,
    filterDrawer: false,
  }
});
const createWindow = () => {
  let { width, height } = config.get("windowBounds");
  const mainWindow = new BrowserWindow(
  {
    width: width,
    height: height,
    minWidth: 800,
    minHeight: 600,
    simpleFullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      enableRemoteModule: false,
      worldSafeExecuteJavaScript:true,
      nodeIntegration: false,
      enableRemoteModule: true,
      spellcheck: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    }
  });
  if (process.platform === "win32") {
    mainWindow.setIcon(path.join(__dirname, "../assets/icons/sleek.ico"));
  } else {
    mainWindow.setIcon(path.join(__dirname, "../assets/icons/icon.png"));
  }
  // show dev tools if in dev mode
  if (is.development) mainWindow.webContents.openDevTools()
  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  // open links in external browser
  mainWindow.webContents.on("new-window", function(e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });
  // every 10 minutes sleek will reparse the data if app is not focused
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
          label: i18next.t("createFile"),
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
      label: i18next.t("edit"),
      submenu: [
      {
        label: i18next.t("settings"),
        accelerator: "CmdOrCtrl+,",
        click: function () {
          mainWindow.webContents.executeJavaScript("showContent(modalSettings)");
        }
      }]
    },
    {
      label: i18next.t("todos"),
      submenu: [
        {
          label: i18next.t("addTodo"),
          accelerator: "CmdOrCtrl+n",
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("showForm()");
          }
        },
        {
          label: i18next.t("find"),
          accelerator: "CmdOrCtrl+f",
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("todoTableSearch.focus()");
          }
        },
        {
          label: i18next.t("archive"),
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("archiveTodos()");
          }
        }
      ]
    },
    {
      label: i18next.t("view"),
      submenu: [
        {
          label: i18next.t("toggleFilter"),
          accelerator: "CmdOrCtrl+b",
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("showFilters(\"toggle\")");
          }
        },
        {
          label: i18next.t("toggleDarkMode"),
          accelerator: "CmdOrCtrl+d",
          click: function (item, focusedWindow) {
            mainWindow.webContents.executeJavaScript("setTheme(true)");
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
          click: function () {
            mainWindow.webContents.executeJavaScript("showContent(modalHelp)");
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










  // Send result back to renderer process
  ipcMain.on("getConfig", (event, args) => {
    mainWindow.webContents.send("getConfig", config.data)
  });
  // Write config to file
  ipcMain.on("setConfig", (event, args) => {
    config.set(args[0], args[1]);
  });
  // Send translations back to renderer process
  ipcMain.on("getTranslations", (event, args) => {
    mainWindow.webContents.send("sendTranslations", i18next.getDataByLanguage(config.get("language")).translation)
  });
  // Check if file exists and send content to renderer process
  ipcMain.on("getFileContent", (event, args) => {
    // read fresh data from file
    const fileContent = fs.readFileSync(config.get("file"), {encoding: 'utf-8'}, function(err,data) { return data; });
    mainWindow.webContents.send("getFileContent", fileContent)
  });
















};
app.on("ready", () => {
  // add sleeks path to config
  config.set("path", __dirname);
  switchLanguage().then(response => {
    console.log(response);
  }).catch(error => {
    console.log(error);
  });
  createWindow();
  if (process.platform === 'win32') {
    app.setAppUserModelId("RobinAhle.sleektodomanager");
  }
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
  app.show();
});
function switchLanguage() {
  if (config.get("language")) {
    var language = config.get("language");
  } else {
    var language = app.getLocale().substr(0,2);
  }
  i18next
  .use(i18nextBackend)
  .init(i18nextOptions);
  i18next.changeLanguage(language, (error) => {
    if (error) return console.log("Error in i18next.changeLanguage():", error);
  });
  config.set("language", language);
  return Promise.resolve("Success: Language set to: " + language.toUpperCase());
}
// COMM between contexts
ipcMain.on("synchronous-message", (event, arg) => {
  if(arg=="restart") {
    app.relaunch();
    app.exit();
  }
});
