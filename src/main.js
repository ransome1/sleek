// ########################################################################################################################
// FUNCTIONS
// ########################################################################################################################
function switchLanguage() {
  try {
    if(userData.get("language")) {
      var language = userData.get("language");
    } else {
      var language = app.getLocale().substr(0,2);
    }
    i18next
    .use(i18nextBackend)
    .init(i18nextOptions);
    i18next.changeLanguage(language, (error) => {
      if (error) return console.log("Error in switchLanguage():", error);
    });
    userData.set("language", language);
    return Promise.resolve("Success: Language set to: " + language);
  } catch (error) {
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Error", "switchLanguage()", error])
    return Promise.reject("Error in switchLanguage(): " + error);
  }
}
function getFileContent(file) {
  if(!fs.existsSync(file)) return false;
  return fs.readFileSync(file, {encoding: 'utf-8'}, function(err,data) { return data; });
}
function getCurrentFile() {
  try {
    let files = new Array;
    // in case somebody updates from a very old version where pathToFile was still in use
    if((!userData.get("files") || userData.get("files").length===0) && userData.get("pathToFile")) {
      files.push([1, userData.get("pathToFile")]);
    } else {
      files = userData.get("files");
    }
    // remove files that don't exist at the given path
    files = files.filter(function(file) { return fs.existsSync(file[1]) === true });
    // persist
    userData.set("files", files);
    // select the entry that is current
    const file = files.filter(function(file) { return file[0] === 1 });
    // return path
    if(file.length>0) return Promise.resolve(file[0][1])
    // return no path if there is no current file
    return Promise.resolve()
  } catch (error) {
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Error", "getCurrentFile()", error])
    return Promise.reject("Error in getCurrentFile(): " + error);
  }
}
const { app, BrowserWindow, nativeTheme, electron, ipcMain, session, Notification, dialog } = require("electron");
const { is } = require("electron-util");
const fs = require("fs");
const path = require("path");
const i18next = require("i18next");
const i18nextBackend = require("i18next-fs-backend");
const i18nextOptions = require('./configs/i18next.config');
const Store = require("./configs/store.config.js");
const userData = new Store({
  configName: "user-preferences",
  defaults: {
    windowBounds: { width: 1025, height: 768 },
    maximizeWindow: false,
    showCompleted: true,
    sortCompletedLast: true,
    showHidden: true,
    showDueIsToday: true,
    showDueIsFuture: true,
    showDueIsPast: true,
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
    drawerWidth: "560",
    useTextarea: false,
    filterDrawer: false,
    compactView: false,
    sortBy: "priority",
    zoom: 100
  }
});
const appData = {
  version: app.getVersion(),
  development: is.development,
  languages: i18nextOptions.supportedLngs,
  path: __dirname
}
const createWindow = () => {
  let fileWatcher;
  let { width, height } = userData.get("windowBounds");
  const mainWindow = new BrowserWindow({
    width: width,
    height: height,
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
  // ########################################################################################################################
  // INITIAL CONFIGURATION
  // ########################################################################################################################
  if(userData.data.maximizeWindow) mainWindow.maximize()
  if(userData.data.windowPosition) mainWindow.setPosition(userData.data.windowPosition[0], userData.data.windowPosition[1])
  if(userData.data.language) {
    var language = userData.data.language;
  } else {
    var language = app.getLocale().substr(0,2);
  }
  if(!userData.data.files) userData.set("files", new Array);
  if(!userData.data.sortBy) userData.set("sortBy", "priority")
  if(!userData.data.zoom) userData.set("zoom", 100)
  if(!userData.data.sortCompletedLast) userData.set("sortCompletedLast", true)
  if(!userData.data.showHidden) userData.set("showHidden", true)
  if(!userData.data.showDueIsToday) userData.set("showDueIsToday", true)
  if(!userData.data.showDueIsFuture) userData.set("showDueIsFuture", true)
  if(!userData.data.showDueIsPast) userData.set("showDueIsPast", true)
  if(!userData.data.theme && nativeTheme.shouldUseDarkColors) {
    userData.set("theme", "dark");
  } else if(!userData.data.theme && !nativeTheme.shouldUseDarkColors) {
    userData.set("theme", "light");
  }
  // ########################################################################################################################
  // MAINWINDOW CONFIGURATION
  // ########################################################################################################################
  // define OS and use ico on Windows and png on all other OS
  switch (process.platform) {
    case "darwin":
      appData.os = "mac";
      mainWindow.setIcon(path.join(__dirname, "../assets/icons/sleek.png"));
      break;
    case "win32":
      appData.os = "windows";
      mainWindow.setIcon(path.join(__dirname, "../assets/icons/sleek.ico"));
      break;
    default:
      appData.os = "linux";
      mainWindow.setIcon(path.join(__dirname, "../assets/icons/sleek.png"));
      break;
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
  // every 10 minutes sleek will reload renderer if app is not focused
  // important for notifications to show up if sleek is running for a long time in background
  let timerId = setInterval(() => {
    if(!mainWindow.isFocused()) {
      mainWindow.webContents.send("triggerFunction", "generateTodoData")
    }
  }, 600000);
  mainWindow.on('move', function() {
    userData.set("windowPosition", this.getPosition());
  });
  mainWindow.on('maximize', function() {
    userData.set("maximizeWindow", true);
  });
  mainWindow.on('unmaximize', function() {
    userData.set("maximizeWindow", false);
  });
  // ########################################################################################################################
  // MENU CONFIGURATION (https://dev.to/abulhasanlakhani/conditionally-appending-developer-tools-menuitem-to-an-existing-menu-in-electron-236k)
  // ########################################################################################################################
  // Modules to create application menu
  const Menu = require("electron").Menu;
  const menuTemplate = [
    {
      label: i18next.t("file"),
      submenu: [
        {
          label: i18next.t("openFile"),
          accelerator: "CmdOrCtrl+o",
          click: function (item, focusedWindow) {
            openFile();
          }
        },
        {
          label: i18next.t("createFile"),
          click: function (item, focusedWindow) {
            createFile();
          }
        },
        appData.os==="mac" ? {
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
      },
      { type: "separator" },
      { label: i18next.t("cut"), accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: i18next.t("copy"), accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: i18next.t("paste"), accelerator: "CmdOrCtrl+V", selector: "paste:" }
    ]},
    {
      label: i18next.t("todos"),
      submenu: [
        {
          label: i18next.t("addTodo"),
          accelerator: "CmdOrCtrl+n",
          click: function (item, focusedWindow) {
            mainWindow.webContents.send("triggerFunction", "showForm")
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
            mainWindow.webContents.send("triggerFunction", "archiveTodos")
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
            mainWindow.webContents.send("triggerFunction", "showFilterDrawer", ["toggle"])
          }
        },
        {
          label: i18next.t("resetFilters"),
          accelerator: "CmdOrCtrl+l",
          click: function (item, focusedWindow) {
            mainWindow.webContents.send("triggerFunction", "resetFilters")
          }
        },
        {
          label: i18next.t("toggleCompletedTodos"),
          accelerator: "CmdOrCtrl+h",
          click: function (item, focusedWindow) {
            mainWindow.webContents.send("triggerFunction", "toggleTodos", ["showCompleted"])
          }
        },
        { type: "separator" },
        {
          label: i18next.t("toggleDarkMode"),
          accelerator: "CmdOrCtrl+d",
          click: function (item, focusedWindow) {
            mainWindow.webContents.send("triggerFunction", "setTheme", [true])
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
  // ########################################################################################################################
  // FUNCTIONS THAT NEED TO ACCESS MAINWINDOW
  // ########################################################################################################################
  function startFileWatcher(file) {
    try {
      if (fs.existsSync(file)) {
        if(fileWatcher) fileWatcher.close();
        fileWatcher = fs.watch(file, (event, filename) => {
          console.log("Info: File has changed");
          // only update content if file still exists
          setTimeout(function() {
            if(fs.existsSync(file)) {
              mainWindow.webContents.send("reloadContent", getFileContent(file))
            }
            // start onboarding if file cannot be found anymore
            /*} else {
              mainWindow.webContents.send("triggerFunction", "showOnboarding", [true])
            }*/
          }, 300);
        });
      }
      // return promise
      return Promise.resolve("Success: Filewatcher is watching: " + file);
    } catch (error) {
      // trigger matomo event
      if(userData.data.matomoEvents) _paq.push(["trackEvent", "Error", "startFileWatcher()", error])
      return Promise.reject("Error in startFileWatcher(): " + error);
    }
  }
  function changeFile(newFile) {
    try {
      // use the loop to check if the new path is already in the user data
      let fileFound = false;
      if(userData.data.files) {
        userData.data.files.forEach(function(file) {
          // if path is found it is set active
          if(file[1]===newFile) {
            file[0] = 1
            fileFound = true;
          // if this entry is not equal to the new path it is set 0
          } else {
            file[0] = 0;
          }
        });
      }
      // only push new path if it is not already in the user data
      if(!fileFound || !userData.data.files) userData.data.files.push([1, newFile]);
      userData.set("files", userData.data.files);
      userData.data.file = newFile;
      userData.set("file", newFile);
      startFileWatcher(newFile).then(response => {
        console.log(response);
        mainWindow.webContents.send("triggerFunction", "getUserData")
        mainWindow.webContents.send("reloadContent", getFileContent(newFile));
      }).catch(error => {
        console.log(error);
      });
      // return promise
      return Promise.resolve("Success: File has been changed to: " + newFile);
    } catch (error) {
      // trigger matomo event
      if(userData.data.matomoEvents) _paq.push(["trackEvent", "Error", "changeFile()", error])
      return Promise.reject("Error in changeFile(): " + error);
    }
  }
  // ########################################################################################################################
  // LISTEN TO REQUESTS FROM RENDERER CONTEXT
  // ########################################################################################################################
  // Send result back to renderer process
  ipcMain.on("getUserData", (event, args) => {
    mainWindow.webContents.send("getUserData", userData.data);
  });
  // Write config to file
  ipcMain.on("setUserData", (event, args) => {
    userData.set(args[0], args[1]);
    mainWindow.webContents.send("getUserData", userData.data);
  });
  // Send result back to renderer process
  ipcMain.on("getAppData", (event, args) => {
    mainWindow.webContents.send("getAppData", appData);
  });
  ipcMain.on("changeFile", (event, file) => {
    changeFile(file).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
  });
  // Change language
  ipcMain.on("changeLanguage", (event, language) => {
    i18next
    .use(i18nextBackend)
    .init(i18nextOptions);
    i18next.changeLanguage(language, (error) => {
      if (error) return console.log("Error in i18next.changeLanguage():", error);
      app.relaunch();
      app.exit();
    });
  });
  // Write content to file
  ipcMain.on("writeToFile", (event, args) => {
    fs.writeFileSync(args[1], args[0], {encoding: 'utf-8'});
  });
  // Open or create file
  ipcMain.on("openOrCreateFile", (event, args) => {
    // if a file is already active, it's directory will be chosen as default path
    if(userData.data.path) {
      var defaultPath = userData.data.path;
    } else {
      var defaultPath = path.join(app.getPath('home'))
    }
    let file;
    switch (args) {
      case "open":
        dialog.showOpenDialog({
          title: i18next.t("selectFile"),
          defaultPath: defaultPath,
          buttonLabel: i18next.t("windowButtonOpenFile"),
          filters: [{
            name: i18next.t("windowFileformat"),
            extensions: ["txt", "md"]
          }],
          properties: ["openFile"]
        }).then(file => {
          if (!file.canceled) {
            file = file.filePaths[0].toString();
            // persist the path
            userData.data.path = path.dirname(file);
            userData.set("path", userData.data.path);
            console.log("Success: Storage file updated by new path and filename: " + file);
            changeFile(file).then(response => {
              console.log(response);
            }).catch(error => {
              console.log(error);
            });
          }
        }).catch(err => {
            console.log("Error: " + err)
        });
        break;
      case "create":
        dialog.showSaveDialog({
          title: i18next.t("windowTitleCreateFile"),
          defaultPath: defaultPath + "/todo.txt",
          buttonLabel: i18next.t("windowButtonCreateFile"),
          filters: [{
            name: i18next.t("windowFileformat"),
            extensions: ["txt", "md"]
          }],
          properties: ["openFile", "createDirectory"]
        }).then(file => {
          // close filewatcher, otherwise the change of file will trigger a duplicate reloadContent
          if(fileWatcher) fileWatcher.close();
          fs.writeFile(file.filePath, "", function (error) {
            if (!file.canceled) {
              // persist the path
              userData.data.path = path.dirname(file.filePath);
              userData.set("path", userData.data.path);
              console.log("Success: New todo.txt file created: " + file.filePath);
              changeFile(file.filePath).then(response => {
                console.log(response);
              }).catch(error => {
                console.log(error);
              });
            }
          });
        }).catch(error => {
          console.log("Error: " + error)
        });
        break;
    }
  });

  ipcMain.on("startFileWatcher", (event, file) => {
    startFileWatcher(file).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
  });
  // Send translations back to renderer process
  ipcMain.on("getTranslations", (event, args) => {
    mainWindow.webContents.send("sendTranslations", i18next.getDataByLanguage(userData.get("language")).translation)
  });
  // Check if file exists and send content to renderer process
  ipcMain.on("getFileContent", (event, file) => {
    // read fresh data from file
    mainWindow.webContents.send("getFileContent", getFileContent(file))
  });
  // Show a notification in OS UI
  ipcMain.on("showNotification", (event, config) => {
    config.icon = __dirname + "/../assets/icons/96x96.png";
    // send it to UI
    const notification = new Notification(config);
    notification.show();
    // click on button in notification
    notification.addListener('click', () => {
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Notification", "Click on notification"]);
      // bring mainWindow to foreground
      mainWindow.focus();
      // if another modal was open it needs to be closed first and then open the modal and fill it
      mainWindow.webContents.executeJavaScript("clearModal(); showForm(\"" + config.string + "\", false);");
    },{
      // remove event listener after it is clicked once
      once: true
    });
  });
  // check whether there are any available updates once the main window is ready
  // https://medium.com/@johndyer24/creating-and-deploying-an-auto-updating-electron-app-for-mac-and-windows-using-electron-builder-6a3982c0cee6
  /*mainWindow.once('ready-to-show', () => {
    autoUpdater.checkForUpdatesAndNotify();
  });*/
};
app.on("ready", () => {
  switchLanguage().then(response => {
    console.log(response);
    if(process.platform === 'win32') app.setAppUserModelId("RobinAhle.sleektodomanager")
    createWindow();
  }).catch(error => {
    console.log(error);
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
});
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
  app.show();
});
