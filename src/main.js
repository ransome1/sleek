const { app, BrowserWindow, nativeTheme, electron, ipcMain, session } = require("electron");
const { is } = require("electron-util");
const fs = require("fs");
const path = require("path");
const isMac = process.platform === "darwin";
const Store = require("./configs/store.config.js");
const store = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 1025, height: 768 },
  }
});
const i18next = require("i18next");
const i18nextBackend = require("i18next-fs-backend");
const i18nextOptions = require('./configs/i18next.config');
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
      preload: path.join(__dirname, "preload.js"),
    }
  });
  if (process.platform === "win32") {
    mainWindow.setIcon(path.join(__dirname, "../assets/icons/sleek.ico"));
  } else {
    mainWindow.setIcon(path.join(__dirname, "../assets/icons/icon.png"));
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
};
app.on("ready", () => {
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
ipcMain.on("synchronous-message", (event, arg) => {
  if(arg=="restart") {
    app.relaunch();
    app.exit();
  }
});
function switchLanguage() {
  if (store.get("language")) {
    var language = store.get("language");
  } else {
    var language = app.getLocale().substr(0,2);
  }
  i18next
  .use(i18nextBackend)
  .init(i18nextOptions);
  i18next.changeLanguage(language, (error) => {
    if (error) return console.log("Error in i18next.changeLanguage():", error);
  });
  return Promise.resolve("Success: Language set to: " + language.toUpperCase());
}
