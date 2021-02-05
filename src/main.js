// https://dev.to/xxczaki/how-to-make-your-electron-app-faster-4ifb
let fileWatcher;
const { app, BrowserWindow, nativeTheme, electron, ipcMain, session, Notification } = require("electron");
const { is } = require("electron-util");
const fs = require("fs");
const path = require("path");

const isMac = process.platform === "darwin";
const i18next = require("i18next");
const i18nextBackend = require("i18next-fs-backend");
const i18nextOptions = require('./configs/i18next.config');
// config setting
const Store = require("./configs/store.config.js");
const userData = new Store({
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
const appData = {
  version: app.getVersion(),
  development: is.development
}
const createWindow = () => {
  let { width, height } = userData.get("windowBounds");
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
  // every 10 minutes sleek will reload renderer if app is not focused
  // important for notifications to show up if sleek is running for a long time in background
  let timerId = setInterval(() => {
    if(!mainWindow.isFocused()) {
      mainWindow.reload();
    }
  }, 600000);
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
            mainWindow.webContents.executeJavaScript("toggleCompletedTodos().then(function(result) { console.log(result); }).catch(function(error) { console.log(error); });");
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
  // FUNCTIONS
  // ########################################################################################################################
  function startFileWatcher(file) {
    try {
      if (fs.existsSync(file)) {
        if(fileWatcher) fileWatcher.close();
        fileWatcher = fs.watch(file, (event, filename) => {
          console.log("Info: File has changed");
          mainWindow.webContents.send("reloadContent", getFileContent(file))
          //mainWindow.webContents.executeJavaScript("generateItemsObject(\"" + getFileContent(file) + "\")");
          });
        return Promise.resolve("Success: File watcher started, is watching: " + file);
      } else {
        return Promise.reject("Info: File watcher did not start as file was not found at: " + file);
      }
    } catch (error) {
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Error", "startFileWatcher()", error])
      return Promise.reject("Error in startFileWatcher(): " + error);
    }
  }
  function getFileContent(file) {
    return fs.readFileSync(file, {encoding: 'utf-8'}, function(err,data) { return data; });
  }
  function getCurrentFile() {
    try {
      // remove files that don't exist ant the given path
      userData.data.files = userData.data.files.filter(function(file) { return fs.existsSync(file[1]) === true });
      // select the entry that is current
      const file = userData.data.files.filter(function(file) { return file[0] === 1 });
      // return path
      if(file.length>0) return Promise.resolve(file[0][1])
      // return no path if there is no current file
      return Promise.reject()
    } catch (error) {
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Error", "getCurrentFile()", error])
      return Promise.reject("Error in getCurrentFile(): " + error);
    }
  }
  /*function appendTodoToFile(todo) {
    // stop filewatcher to avoid loops
    if(fileWatcher) fileWatcher.close();
    //append todo as string to file in a new line
    fs.open(file, 'a', 666, function(error, id) {
      if(error) {
        // trigger matomo event
        if(window.userData.matomoEvents) _paq.push(["trackEvent", "Error", "fs.open()", error])
        return "Error in fs.open(): " + error;
      }
      fs.write(id, "\n"+todo, null, 'utf8', function() {
        fs.close(id, function() {
          // only start the file watcher again after new todo has been appended
          startFileWatcher().then(response => {
            console.log(response);
          }).catch(error => {
            console.log(error);
          });
          console.log("Success: Recurring todo written to file: " + todo);
        });
      });
    });
  }*/
  // ########################################################################################################################
  // LISTEN TO REQUESTS FROM RENDERER CONTEXT
  // ########################################################################################################################
  // Send result back to renderer process
  ipcMain.on("getUserData", (event, args) => {
    getCurrentFile().then(response => {
      userData.data.file = response;
      mainWindow.webContents.send("getUserData", userData.data);
    }).catch(error => {
      console.log(error);
    });
  });
  // Send result back to renderer process
  ipcMain.on("getAppData", (event, args) => {
    mainWindow.webContents.send("getAppData", appData);
  });
  // Write config to file
  ipcMain.on("setUserData", (event, args) => {
    userData.set(args[0], args[1]);
  });
  // Write content to file
  ipcMain.on("writeToFile", (event, args) => {
    fs.writeFileSync(args[1], args[0], {encoding: 'utf-8'});
  });
  /*
  // Append content to file
  ipcMain.on("appendToFile", (event, args) => {
    fs.appendFile(args[1], "\n" + args[0], error => {
      if (error) return Promise.reject("Error in appendFile(): " + error)
    });
  });
  */
  /*
  // Write content to file
  ipcMain.on("archiveTodos", (event, args) => {
    archiveTodos(JSON.parse(args[0]), JSON.parse(args[1]), args[2]).then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error);
    });
  });
  */
  // Start the filewatcher
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
    config.icon = __dirname + "/../assets/icons/icon.png";
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
  // COMM between contexts
  ipcMain.on("synchronous-message", (event, arg) => {
    if(arg=="restart") {
      app.relaunch();
      app.exit();
    }
  });
};



function switchLanguage() {
  if(userData.get("language")) {
    var language = userData.get("language");
  } else {
    var language = app.getLocale().substr(0,2);
  }
  i18next
  .use(i18nextBackend)
  .init(i18nextOptions);
  i18next.changeLanguage(language, (error) => {
    if (error) return console.log("Error in i18next.changeLanguage():", error);
  });
  userData.set("language", language);
  return Promise.resolve("Success: Language set to: " + language.toUpperCase());
}



app.on("ready", () => {
  // add sleeks path to config
  appData.path = __dirname;
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
