let defaultPath, _paq, fileWatcher, translations, tray;
const { app, nativeTheme, Notification, dialog, clipboard, Menu, ipcMain, BrowserWindow, Tray } = require("electron");
const path = require("path");
const fs = require("fs");
const i18next = require("i18next");
const i18nextBackend = require("i18next-fs-backend");
const i18nextOptions = require("./configs/i18next.config");
const Store = require("./configs/store.config.js");
const getTheme = function() {
  if(!userData.data.theme && nativeTheme.shouldUseDarkColors) {
    return "dark";
  } else if(!userData.data.theme && !nativeTheme.shouldUseDarkColors) {
    return "light";
  }
}
const isDevelopment = function() {
  if(process.env.NODE_ENV==="development") {
    return true;
  } else {
    return false;
  }
}
const getChannel = function() {
  if(process.env.APPIMAGE) {
    return "AppImage";
  } else if(process.windowsStore) {
    return "Windows Store";
  } else if(process.mas) {
    return "Apple App Store";
  } else if(process.env.SNAP) {
    return "Snap Store";
  } else if(process.env.FLATPAK_ID) {
    return "Flathub";
  } else if(process.env.AUR) {
    return "AUR";
  } else {
    return "Misc";
  }
}
const getOS = function() {
  switch (process.platform) {
    case "darwin":
      return "mac";
      break;
    case "win32":
      return "windows";
      break;
    default:
      return "linux";
      break;
  }
}
const appData = {
  version: app.getVersion(),
  development: isDevelopment(),
  languages: i18nextOptions.supportedLngs,
  path: __dirname,
  os: getOS(),
  channel: getChannel()
}
const userData = new Store({
  configName: "user-preferences",
  defaults: {
    maximizeWindow: false,
    showCompleted: true,
    sortCompletedLast: true,
    showHidden: true,
    showDueIsToday: true,
    showDueIsFuture: true,
    showDueIsPast: true,
    selectedFilters: new Array,
    hideFilterCategories: new Array,
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
const configureUserData = function() {
  try {
    if(typeof userData.data.theme != "string") userData.set("theme", getTheme());
    if(typeof userData.data.horizontal != "number") userData.set("horizontal", 160);
    if(typeof userData.data.vertical != "number") userData.set("vertical", 240);
    if(typeof userData.data.maximizeWindow != "boolean") userData.set("maximizeWindow", false);
    if(typeof userData.data.notifications != "boolean") userData.set("notifications", true);
    if(typeof userData.data.useTextarea != "boolean") userData.set("useTextarea", false);
    if(typeof userData.data.compactView != "boolean") userData.set("compactView", false);
    if(typeof userData.data.matomoEvents != "boolean") userData.set("matomoEvents", false);
    if(typeof userData.data.drawerWidth != "string") userData.set("drawerWidth", "500");
    if(typeof userData.data.showDueIsPast != "boolean") userData.set("showDueIsPast", true);
    if(typeof userData.data.showDueIsFuture != "boolean") userData.set("showDueIsFuture", true);
    if(typeof userData.data.showDueIsToday != "boolean") userData.set("showDueIsToday", true);
    if(typeof userData.data.showHidden != "boolean") userData.set("showHidden", true);
    if(typeof userData.data.showCompleted != "boolean") userData.set("showCompleted", true);
    if(typeof userData.data.sortCompletedLast != "boolean") userData.set("sortCompletedLast", false);
    if(typeof userData.data.sortBy != "string") userData.set("sortBy", "priority");
    if(typeof userData.data.zoom != "string") userData.set("zoom", "100");
    if(typeof userData.data.tray != "boolean") userData.set("tray", false);
    if(!Array.isArray(userData.data.dismissedNotifications)) userData.set("dismissedNotifications", []);
    if(!Array.isArray(userData.data.dismissedMessages)) userData.set("dismissedMessages", []);
    if(!Array.isArray(userData.data.hideFilterCategories)) userData.set("hideFilterCategories", []);
    return Promise.resolve("Success: User data configured");
  } catch(error) {
    // trigger matomo event
    if(userData.matomoEvents) _paq.push(["trackEvent", "Error", "configureUserData()", error])
    return Promise.reject("Error in configureUserData(): " + error);
  }
}
configureUserData().then(response => {
  console.info(response);
}).catch(error => {
  mainWindow.webContents.send("triggerFunction", "handleError", [error]);
  console.error(error);
});
// ########################################################################################################################
// CREATE THE WINDOW
// ########################################################################################################################
const createWindow = function() {
  // ########################################################################################################################
  // SETUP LANGUAGE INITIALLY
  // ########################################################################################################################
  const setLanguageGetTranslations = function(language) {
    try {
      i18next
      .use(i18nextBackend)
      .init(i18nextOptions);
      if(!language && !userData.get("language") && i18nextOptions.supportedLngs.includes(app.getLocale().substr(0,2))) {
        language = app.getLocale().substr(0,2);
      } else if(!language && userData.get("language")) {
        language = userData.get("language");
      } else if(!language) {
        language = "en";
      }
      userData.set("language", language);
      i18next.changeLanguage(language, (error) => {
        if (error) return console.log("Error in setLanguageGetTranslations():", error);
        userData.set("language", language);
      });
      translations = i18next.getDataByLanguage(language).translation;
      //return translations;
      return Promise.resolve(translations);
    } catch (error) {
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Error", "setLanguageGetTranslations()", error])
      return Promise.reject("Error in setLanguageGetTranslations(): " + error);
    }
  }
  setLanguageGetTranslations().then(response => {
    translations = response;
  }).catch(error => {
    mainWindow.webContents.send("triggerFunction", "handleError", [error]);
    console.error(error);
  });
  const openDialog = function(args) {
    // if a file is already active, it's directory will be chosen as default path
    if(userData.data.path) {
      defaultPath = userData.data.path;
    } else {
      defaultPath = path.join(app.getPath("home"))
    }
    switch(args) {
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
            console.log("Success: Opened file: " + file);
            startFileWatcher(file).then(response => {
              console.info(response);
              mainWindow.webContents.send("triggerFunction", "resetModal")
            }).catch(error => {
              console.error(error);
            });
          }
        }).catch(error => {
          mainWindow.webContents.send("triggerFunction", "handleError", [error])
          console.error(error)
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
          // close filewatcher, otherwise the change of file will trigger a duplicate refresh
          if(fileWatcher) fileWatcher.close();
          fs.writeFile(file.filePath, "", function() {
            if (!file.canceled) {
              userData.data.path = path.dirname(file.filePath);
              userData.set("path", userData.data.path);
              console.log("Success: New file created: " + file.filePath);
              startFileWatcher(file.filePath).then(response => {
                console.info(response);
                mainWindow.webContents.send("triggerFunction", "resetModal")
              }).catch(error => {
                mainWindow.webContents.send("triggerFunction", "handleError", [error]);
                console.error(error);
              });
            }
          });
        }).catch(error => {
          mainWindow.webContents.send("triggerFunction", "handleError", [error]);
          console.error(error);
        });
        break;
    }
  }
  const fileContent = function(file) {
    try {
      if(!fs.existsSync(file)) {
        return Promise.resolve(fs.writeFile(file, "", function(error) {
          if(error) {
            mainWindow.webContents.send("triggerFunction", "handleError", [error]);
            return Promise.reject("Error: Could not create file");
          }
          return "";
        }));
      }
      return Promise.resolve(fs.readFileSync(file, {encoding: "utf-8"}, function(err,data) { return data; }));
    } catch (error) {
      // trigger matomo event
      if(userData.data.matomoEvents) _paq.push(["trackEvent", "Error", "fileContent()", error])
      return Promise.reject("Error in fileContent(): " + error);
    }
  }
  const startFileWatcher = function(newFile) {
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
      } else {
        userData.data.files = new Array;
      }
      // only push new path if it is not already in the user data
      if((!fileFound || !userData.data.files) && newFile) userData.data.files.push([1, newFile]);
      userData.set("files", userData.data.files);
      userData.data.file = newFile;
      userData.set("file", newFile);
      mainWindow.webContents.send("userData", userData.data);
      if(fs.existsSync(newFile)) {
        if(fileWatcher) fileWatcher.close();
        fileWatcher = fs.watch(newFile, (event, filename) => {
          console.log("Info: File " + filename + " has changed");
          setTimeout(function() {
            if(fs.existsSync(newFile)) {
              fileContent(newFile).then(content => {
                mainWindow.webContents.send("refresh", content)
              }).catch(error => {
                mainWindow.webContents.send("triggerFunction", "handleError", [error]);
                console.error(error);
              });
            } else {
              mainWindow.webContents.send("triggerFunction", "configureMainView");
            }
          }, 10);
        });
        fileContent(newFile).then(content => {
          mainWindow.webContents.send("refresh", content);
        }).catch(error => {
          mainWindow.webContents.send("triggerFunction", "handleError", [error]);
          console.error(error);
        });
        // return promise
        return Promise.resolve("Success: Filewatcher is watching: " + newFile);
      } else {
        mainWindow.webContents.send("refresh", false);
        return Promise.resolve("Error: File " + newFile + " not found.");
      }
    } catch (error) {
      // trigger matomo event
      if(userData.data.matomoEvents) _paq.push(["trackEvent", "Error", "startFileWatcher()", error])
      return Promise.reject("Error in startFileWatcher(): " + error);
    }
  }
  const mainWindow = new BrowserWindow({
    width: userData.data.width,
    height: userData.data.height,
    x: userData.data.horizontal,
    y: userData.data.vertical,
    icon: path.join(__dirname, "../assets/icons/sleek.png"),
    simpleFullscreen: true,
    autoHideMenuBar: true,
    webPreferences: {
      worldSafeExecuteJavaScript:true,
      nodeIntegration: false,
      enableRemoteModule: true,
      spellcheck: false,
      contextIsolation: true,
      preload: __dirname + "/preload.js"
    }
  });
  if(appData.os==="windows") mainWindow.setIcon(path.join(__dirname, "../assets/icons/sleek.ico"));
  if(isDevelopment()) mainWindow.webContents.openDevTools()
  if(userData.data.maximizeWindow) {
    mainWindow.maximize();
  } else if(!userData.data.maximizeWindow) {
    mainWindow.unmaximize();
  }
  mainWindow.loadFile(path.join(__dirname, "index.html"));
  mainWindow.webContents.on("new-window", function(e, url) {
    e.preventDefault();
    require("electron").shell.openExternal(url);
  });
  mainWindow.on("resize", function() {
    if(mainWindow.isMaximized()) {
      userData.set("maximizeWindow", true);
    } else if(mainWindow.isNormal()) {
      userData.set("maximizeWindow", false);
      userData.set("width", this.getBounds().width);
      userData.set("height", this.getBounds().height);
    }
  });
  // ########################################################################################################################
  // MAIN MENU
  // ########################################################################################################################
  const menuTemplate = [
    {
      label: translations.file,
      submenu: [
        {
          label: translations.openFile,
          accelerator: "CmdOrCtrl+o",
          click: function () {
            openDialog("open");
          }
        },
        {
          label: translations.createFile,
          click: function () {
            openDialog("create");
          }
        },
        appData.os==="mac" ? {
          role: "quit",
          label: translations.close
        } : {
          role: "close",
          label: translations.close
        }
      ]
    },
    {
      label: translations.edit,
      submenu: [
      {
        label: translations.settings,
        accelerator: "CmdOrCtrl+,",
        click: function () {
          mainWindow.webContents.send("triggerFunction", "showContent", ["modalSettings"]);
        }
      },
      { type: "separator" },
      { label: translations.cut, accelerator: "CmdOrCtrl+X", selector: "cut:" },
      { label: translations.copy, accelerator: "CmdOrCtrl+C", selector: "copy:" },
      { label: translations.paste, accelerator: "CmdOrCtrl+V", selector: "paste:" },
      { role: "selectAll", accelerator: "CmdOrCtrl+A" }
    ]},
    {
      label: translations.todos,
      submenu: [
        {
          label: translations.addTodo,
          accelerator: "CmdOrCtrl+n",
          click: function() {
            mainWindow.webContents.send("triggerFunction", "showForm")
          }
        },
        {
          label: translations.find,
          accelerator: "CmdOrCtrl+f",
          click: function() {
            mainWindow.webContents.executeJavaScript("todoTableSearch.focus()");
          }
        },
        {
          label: translations.archive,
          click: function() {
            mainWindow.webContents.send("triggerFunction", "archiveTodos")
          }
        }
      ]
    },
    {
      label: translations.view,
      submenu: [
        {
          label: translations.toggleFilter,
          accelerator: "CmdOrCtrl+b",
          click: function() {
            mainWindow.webContents.send("triggerFunction", "showDrawer", ["toggle", "navBtnFilter", "filterDrawer"])
          }
        },
        {
          label: translations.resetFilters,
          accelerator: "CmdOrCtrl+l",
          click: function() {
            mainWindow.webContents.send("triggerFunction", "resetFilters")
          }
        },
        {
          label: translations.toggleCompletedTodos,
          accelerator: "CmdOrCtrl+h",
          click: function() {
            mainWindow.webContents.send("triggerFunction", "toggleTodos", ["showCompleted"])
          }
        },
        { type: "separator" },
        {
          label: translations.toggleDarkMode,
          accelerator: "CmdOrCtrl+d",
          click: function() {
            mainWindow.webContents.send("triggerFunction", "setTheme", [true])
          }
        },
        {
          role: "reload",
          label: translations.reload
        }
      ]
    },
    {
      label: translations.about,
      submenu: [
        {
          label: translations.help,
          click: function () {
            mainWindow.webContents.send("triggerFunction", "showContent", ["modalHelp"])
          }
        },
        {
          label: translations.sleekOnGithub,
          click: () => {require("electron").shell.openExternal("https://github.com/ransome1/sleek")}
        },
        {
          role: "toggleDevTools",
          label: translations.devTools
        }
      ]
    }
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
  // ########################################################################################################################
  // TRAY ICON
  // ########################################################################################################################
  const setupTray = function() {
    mainWindow
    .on("minimize",function(event){
      event.preventDefault();
      mainWindow.minimize();
    })
    .on("close", function (event) {
      if(!app.isQuiting){
        event.preventDefault();
        mainWindow.minimize();
      }
      return false;
    })
    .setSkipTaskbar(true);
    let trayIcon = path.join(__dirname, "../assets/icons/tray/tray.png");
    if(process.platform === "win32") trayIcon = path.join(__dirname, "../assets/icons/tray/tray.ico");
    tray = new Tray(trayIcon);
    let trayFiles = new Array;
    if(userData.data.files.length > 1) {
      userData.data.files.forEach((file) => {
        trayFiles.push(
          {
            label: file[1],
            click: function() {
              startFileWatcher(file[1]);
              mainWindow.show();
              mainWindow.setSkipTaskbar(true);
            }
          }
        )
      });
      trayFiles.push(
        { type: "separator" },
      );
    }
    let contextMenu = [
      {
        label: translations.windowButtonOpenFile,
        click: function() {
          mainWindow.show();
          mainWindow.setSkipTaskbar(true);
        }
      },
      {
        label: translations.addTodo,
        click: function() {
          mainWindow.show();
          mainWindow.focus();
          mainWindow.webContents.send("triggerFunction", "showForm")
        }
      },
      { type: "separator" },
      {
        label: translations.close,
        click: function() {
          app.exit();
        }
      }
    ]
    let menu;
    if(trayFiles.length>0) {
      menu = Menu.buildFromTemplate(trayFiles.concat(contextMenu));
    } else {
      menu = Menu.buildFromTemplate(contextMenu);
    }
    tray.setContextMenu(menu)
    tray.setTitle("sleek");
    tray.setToolTip("sleek");
    tray.on("click", function() {
      if(mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.setSkipTaskbar(true);
      }
    });
  }
  if(userData.data.tray) setupTray();
  // ########################################################################################################################
  // IPC EVENTS
  // ########################################################################################################################
  const configureWindowEvents = function() {
    try {
      ipcMain
      .on("userData", (event, args) => {
        if(args) userData.set(args[0], args[1]);
        mainWindow.webContents.send("userData", userData.data);
      })
      .on("appData", () => {
        // Send result back to renderer process
        mainWindow.webContents.send("appData", appData);
      })
      .on("changeLanguage", (event, language) => {
        // Change language
        setLanguageGetTranslations(language).then(response => {
          if(response) {
            app.relaunch();
            app.exit();
          }
        }).catch(error => {
          mainWindow.webContents.send("triggerFunction", "handleError", [error]);
          console.error(error);
        });
      })
      .on("writeToFile", (event, args) => {
        // Write content to file
        fs.writeFileSync(args[1], args[0], {encoding: "utf-8"});
      })
      .on("openOrCreateFile", (event, args) => {
        // Open or create file
        openDialog(args);
      })
      .on("startFileWatcher", (event, file) => {
        startFileWatcher(file).then(response => {
          console.info(response);
        }).catch(error => {
          mainWindow.webContents.send("triggerFunction", "handleError", [error]);
          console.error(error);
        });
      })
      .on("fileContent", (event, file) => {
        fileContent(file).then(content => {
          mainWindow.webContents.send("fileContent", content)
        }).catch(error => {
          mainWindow.webContents.send("triggerFunction", "handleError", [error]);
          console.error(error);
        });
      })
      .on("translations", (event, language) => {
        // Send translations back to renderer process
        setLanguageGetTranslations(language).then(function(translations) {
          mainWindow.webContents.send("translations", translations)
        });
      })
      .on("showNotification", (event, config) => {
        // Show a notification in OS UI
        //config.icon = __dirname + "/../assets/icons/sleek.svg";
        config.icon = __dirname + "/../assets/icons/96x96.png";
        // send it to UI
        const notification = new Notification(config);
        notification.show();
        // click on button in notification
        notification.addListener("click", () => {
          // trigger matomo event
          if(userData.matomoEvents) _paq.push(["trackEvent", "Notification", "Click on notification"]);
          // bring mainWindow to foreground
          mainWindow.focus();
          // if another modal was open it needs to be closed first and then open the modal and fill it
          mainWindow.webContents.send("triggerFunction", "resetModal");
          mainWindow.webContents.send("triggerFunction", "showForm", [config.string, false]);
        },{
          // remove event listener after it is clicked once
          once: true
        });
      })
      .on("copyToClipboard", (event, args) => {
        // Copy text to clipboard
        if(args[0]) clipboard.writeText(args[0], "selection")
      })
      .on("restart", () => {
        app.relaunch();
        app.exit();
        app.quit();
      });
      return Promise.resolve("Success: Window events setup");
    } catch(error) {
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Error", "configureWindowEvents()", error])
      return Promise.reject("Error in configureWindowEvents(): " + error);
    }

  }
  configureWindowEvents().then(response => {
    console.info(response);
  }).catch(error => {
    mainWindow.webContents.send("triggerFunction", "handleError", [error]);
    console.error(error);
  });
  // ########################################################################################################################
  // REFRESH WHEN IN BACKGROUND
  // ########################################################################################################################
  // every 10 minutes sleek will reload data and send it to renderer if app is not focused
  setInterval(() => {
    if(!mainWindow.isFocused()) {
      fileContent(userData.data.file).then(content => {
        mainWindow.webContents.send("refresh", content)
      }).catch(error => {
        mainWindow.webContents.send("triggerFunction", "handleError", [error]);
        console.error(error);
      });
    }
  }, 600000);
}
// ########################################################################################################################
// APP EVENTS
// ########################################################################################################################
app
.on("ready", () => {
  if(process.platform === "win32") app.setAppUserModelId("RobinAhle.sleektodomanager")
  createWindow();
})
.on("window-all-closed", () => {
  if(process.platform !== "darwin") app.quit()
})
.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
  app.show();
});
