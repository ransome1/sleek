let userData, defaultPath, _paq, fileWatcher, translations;
const { Tray, app, Notification, clipboard, Menu, ipcMain, BrowserWindow, nativeTheme } = require("electron");
const path = require("path");
const fs = require("fs");
const chokidar = require("chokidar");
const Store = require("./configs/store.config.js");
// ########################################################################################################################
// SETUP PROCESS
// ########################################################################################################################
process.traceProcessWarnings = true;
// ########################################################################################################################
// SETUP APPIMAGE AUTO UPDATER
// ########################################################################################################################
const { AppImageUpdater } = require("electron-updater");
const autoUpdater = new AppImageUpdater();
autoUpdater.on('update-available', () => {
  console.log("Update available");
})
.on('update-not-available', () => {
  console.log("No update");
})
.on('error', (error) => {
  console.log('Error in updater: ' + error);
})
.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
})
.on('update-downloaded', () => {
  console.log('Update downloaded');
});
// ########################################################################################################################
// SETUP APPDATA
// ########################################################################################################################
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
  } else if(process.env.PORTABLE_EXECUTABLE_DIR) {
    return "Portable";
  } else {
    return "Misc";
  }
}
const getIcon = function() {
  if(appData.os==="windows") return path.join(appData.path, "../assets/icons/sleek.ico");
  return path.join(appData.path, "../assets/icons/512x512.png")
}
const getOS = function() {
  switch(process.platform) {
    case "darwin":
      return "mac";
    case "win32":
      return "windows";
    default:
      return "linux";
  }
}
const appData = {
  version: app.getVersion(),
  environment: process.env.NODE_ENV,
  path: __dirname,
  appPath: app.getAppPath(),
  os: getOS(),
  channel: getChannel()
}
// don't move, needs to be done up here: https://stackoverflow.com/a/58597207
let tray = null;
let trayIcon = path.join(appData.path, "../assets/icons/tray/tray.png");
if(process.platform === "win32") trayIcon = path.join(appData.path, "../assets/icons/tray/tray.ico");
// ########################################################################################################################
// CREATE THE WINDOW
// ########################################################################################################################
let mainWindow = null;
const createWindow = async function() {
  const getContent = function(file) {
    try {
      if(!fs.existsSync(file)) {
        return Promise.resolve(fs.writeFile(file, "", function(error) {
          if(error) {
            return Promise.reject("Error: Could not create file");
          }
          return "";
        }));
      }
      return Promise.resolve(fs.readFileSync(file, {encoding: "utf-8"}, function(err,data) { return data; }));
    } catch (error) {
      // trigger matomo event
      if(userData.data.matomoEvents) _paq.push(["trackEvent", "Error", "getContent()", error])
      return Promise.reject("Error in getContent(): " + error);
    }
  }
  const openDialog = function(args) {
    const { dialog } = require("electron");
    // if a file is already active, it's directory will be chosen as default path
    if(userData.data.path) {
      defaultPath = userData.data.path;
    } else {
      defaultPath = path.join(app.getPath("home"))
    }
    switch(args) {
      case "open":
        dialog.showOpenDialog({
          title: translations.selectFile,
          defaultPath: defaultPath,
          buttonLabel: translations.windowButtonOpenFile,
          filters: [{
            name: translations.windowFileformat,
            extensions: ["txt", "md"]
          }],
          properties: ["openFile"]
        }).then(file => {
          if (!file.canceled) {
            file = file.filePaths[0].toString();
            // persist the path
            userData.data.path = path.dirname(file);
            userData.set("path", userData.data.path);
            console.info("Success: Opened file: " + file);
            startFileWatcher(file, 1).then(response => {
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
          title: translations.windowTitleCreateFile,
          defaultPath: defaultPath + "/todo.txt",
          buttonLabel: translations.windowButtonCreateFile,
          filters: [{
            name: translations.windowFileformat,
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
              console.info("Success: New file created: " + file.filePath);
              startFileWatcher(file.filePath, 1).then(response => {
                console.info(response);
                mainWindow.webContents.send("triggerFunction", "resetModal")
              }).catch(error => {
                console.error(error);
              });
            }
          });
        }).catch(error => {
          console.error(error);
        });
        break;
    }
  }
  const startFileWatcher = async function(file, isTabItem, resetTab) {
    try {
      if(!fs.existsSync(file)) throw("Error: File not found on disk")
      // skip persisted files and go with ENV if set
      if(process.env.SLEEK_CUSTOM_FILE && fs.existsSync(process.env.SLEEK_CUSTOM_FILE)) {
        file = process.env.SLEEK_CUSTOM_FILE;
      }
      if (process.defaultApp) {
        // electron "unbundled" app -- have to skip "electron" and script name arg eg: "."
        args = process.argv.slice(2);
      } else {
        // electron "bundled" app -- skip only the app name, eg: "sleek"
        args = process.argv.slice(1);
      }
      if (args.length > 0 && fs.existsSync(args[0])) {
        file = args[0];
      }
      // use the loop to check if the new path is already in the user data
      let fileFound = false;
      if(userData.data.files) {
        userData.data.files.forEach(function(element) {
          // if path is found it is set active
          if(element[1]===file) {
            element[0] = 1
            if(isTabItem) element[2] = 1;
            fileFound = true;
            // if this entry is not equal to the new path it is set 0
          } else {
            element[0] = 0;
          }
        });
      } else {
        userData.data.files = new Array;
      }
      // only push new path if it is not already in the user data
      if((!fileFound || !userData.data.files) && file) userData.data.files.push([1, file, 1]);
      userData.set("files", userData.data.files);
      // TODO describe
      if(fileWatcher) {
        fileWatcher.close().then(() => console.log("Info: Filewatcher instance closed"));
        await fileWatcher.unwatch();
      }
      fileWatcher = chokidar.watch(file);
      fileWatcher
      .on("add", function() {
        getContent(file).then(content => {
          mainWindow.webContents.send("refresh", [content])
        }).catch(error => {
          console.log(error);
        });
      })
      .on("unlink", function() {
        // Restart file watcher
        startFileWatcher(userData.data.file).then(response => {
          console.info(response);
        }).catch(error => {
          console.error(error);
        });
      })
      .on("change", function() {
        console.log("Info: File " + file + " has changed");
        // wait 10ms before rereading in case the file is being updated with a delay
        setTimeout(function() {
          getContent(file).then(content => {
            mainWindow.webContents.send("refresh", [content])
          }).catch(error => {
            console.log(error);
          });
        }, 10);
      });
      // change window title
      mainWindow.title = path.basename(file) + " - sleek";
      return Promise.resolve("Success: Filewatcher is watching: " + file);
    } catch (error) {
      // if something file related crashes, onboarding will be triggered
      mainWindow.webContents.send("triggerFunction", "showOnboarding", [true]);
      // trigger matomo event
      if(userData.data.matomoEvents) _paq.push(["trackEvent", "Error", "startFileWatcher()", error])
      return Promise.reject("Error in startFileWatcher(): " + error);
    }
  }
  const getUserData = function() {
    try {
      userData = new Store({
        configName: "user-preferences",
        defaults: {}
      });
      if(typeof userData.data.theme != "string") {
        const getTheme = function() {
          const { nativeTheme } = require("electron");
          if(nativeTheme.shouldUseDarkColors) return "dark"
          return "light";
        }
        userData.set("theme", getTheme());
      }
      if(typeof userData.data.width != "number") userData.set("width", 1100);
      if(typeof userData.data.height != "number") userData.set("height", 700);
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
      if(typeof userData.data.showHidden != "boolean") userData.set("showHidden", false);
      if(typeof userData.data.showCompleted != "boolean") userData.set("showCompleted", true);
      if(typeof userData.data.sortCompletedLast != "boolean") userData.set("sortCompletedLast", false);
      if(typeof userData.data.zoom != "string") userData.set("zoom", "100");
      if(typeof userData.data.tray != "boolean") userData.data.tray = false;
      if(typeof userData.data.showEmptyFilters != "boolean") userData.data.showEmptyFilters = true;
      if(!Array.isArray(userData.data.dismissedNotifications)) userData.set("dismissedNotifications", []);
      if(!Array.isArray(userData.data.dismissedMessages)) userData.set("dismissedMessages", []);
      if(!Array.isArray(userData.data.hideFilterCategories)) userData.set("hideFilterCategories", []);
      if(!Array.isArray(userData.data.sortBy)) userData.set("sortBy", ["priority", "dueString", "contexts", "projects"]);
      if(typeof userData.data.deferredTodos != "boolean") userData.data.deferredTodos = true;
      if(typeof userData.data.fileTabs != "boolean") userData.data.fileTabs = true;
      return Promise.resolve(userData);
    } catch(error) {
      error.functionName = getUserData.id;
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Error", "getUserData()", error])
      return Promise.reject("Error in getUserData(): " + error);
    }
  }
  const showNotification = function(config) {
    config.hasReply = false;
    config.urgency = "normal";
    config.closeButtonText = "Close";
    config.icon = path.join(appData.path, "../assets/icons/96x96.png");
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
  }
  const getTranslations = function(language) {
    try {
      const i18next = require("./configs/i18next.config");
      if(!language && !userData.data.language) {
        language = app.getLocale().substr(0,2);
      }
      appData.languages = i18next.options.preload;
      if(!appData.languages.includes(language)) language = "en";
      userData.set("language", language);
      return Promise.resolve(i18next.getDataByLanguage(language).translation);
    } catch (error) {
      // trigger matomo event
      if(userData.matomoEvents) _paq.push(["trackEvent", "Error", "getTranslations()", error])
      return Promise.reject("Error in getTranslations(): " + error);
    }
  }
  userData = await getUserData();
  translations = await getTranslations(userData.data.language);
  console.log("Success: Translation loaded for: " + userData.data.language);
  mainWindow = new BrowserWindow({
    width: userData.data.width,
    height: userData.data.height,
    x: userData.data.horizontal,
    y: userData.data.vertical,
    minWidth: 300,
    minHeight: 500,
    icon: getIcon(),
    simpleFullscreen: true,
    autoHideMenuBar: true,
    useContentSize: true,
    webPreferences: {
      worldSafeExecuteJavaScript: true,
      nodeIntegration: false,
      enableRemoteModule: true,
      spellcheck: false,
      contextIsolation: true,
      preload: appData.path + "/preload.js"
    }
  });

  // for Windows a separate node module is needed
  if(appData.os === "windows") {
    const Badge = require("electron-windows-badge");
    const badgeOptions = {
      font: "10px arial"
    }
    new Badge(mainWindow, badgeOptions);
  }

  mainWindow.loadFile(path.join(appData.path, "index.html"));
  // ########################################################################################################################
  // MAIN MENU
  // ########################################################################################################################
  let subMenu;
  if(appData.os==="mac") {
    subMenu = [
      {
        label: translations.openFile,
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
      { type: "separator" },
      {
        click: function () {
          mainWindow.close();
        },
        label: translations.close
      },
      {
        role: "quit",
        accelerator: "Command+Q",
        click: function() {
          app.quit();
        }
      }
    ];
  } else {
    subMenu = [
      {
        label: translations.openFile,
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
      { type: "separator" },
      {
        role: "print",
        accelerator: "CmdOrCtrl+P",
        label: "Print",
        click: function() {
          const options = {
            silent: false,
            printBackground: true,
            color: true,
            margin: {
              marginType: "printableArea"
            },
            landscape: false,
            pagesPerSheet: 1,
            collate: false,
            copies: 1,
            header: "Header of the Page",
            footer: "Footer of the Page"
          }
          mainWindow.webContents.executeJavaScript("body.classList.remove(\"dark\");");
          const index = userData.data.files.findIndex(file => file[0] === 1);
          if(index!==-1) {
            getContent(userData.data.files[index][1]).then(content => {
              mainWindow.webContents.send("refresh", [content, false, true]);
              mainWindow.webContents.print(options, (success, error) => {
                if(!success) {
                  console.log(error);
                  // trigger matomo event
                  if(userData.data.matomoEvents) _paq.push(["trackEvent", "Print", "Print error", error])
                } else {
                  console.log("Success: Print initiated");
                  // trigger matomo event
                  if(userData.data.matomoEvents) _paq.push(["trackEvent", "Print", "Print initiated"])
                }
              });
            }).catch(error => {
              console.log(error);
            });
          } else {
            console.log("Info: No todo file active, won't print");
            return false;
          }
        }
      },
      { type: "separator" },
      {
        click: function () {
          mainWindow.close();
        },
        label: translations.close
      }
    ];
  }

  const menuTemplate = [
    {
      label: translations.file,
      submenu: subMenu
    },
    {
      label: translations.edit,
      submenu: [
        { role: "undo", accelerator: "CmdOrCtrl+Z" },
        { role: "redo", accelerator: "CmdOrCtrl+Shift+Z" },
        { type: "separator" },
        { label: translations.cut, accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: translations.copy, accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: translations.paste, accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { role: "selectAll", accelerator: "CmdOrCtrl+A" },
        { type: "separator" },
        {
          label: translations.settings,
          click: function () {
            mainWindow.webContents.send("triggerFunction", "showContent", ["modalSettings"]);
          }
        }
      ]},
    {
      label: translations.todos,
      submenu: [
        {
          label: translations.addTodo,
          click: function() {
            mainWindow.webContents.send("triggerFunction", "showForm")
          }
        },
        {
          label: translations.find,
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
          click: function() {
            mainWindow.webContents.send("triggerFunction", "showDrawer", ["toggle", "navBtnFilter", "filterDrawer"])
          }
        },
        {
          label: translations.resetFilters,
          click: function() {
            mainWindow.webContents.send("triggerFunction", "resetFilters")
          }
        },
        {
          label: translations.toggleCompletedTodos,
          click: function() {
            mainWindow.webContents.send("triggerFunction", "toggle", ["showCompleted"])
          }
        },
        { type: "separator" },
        {
          label: translations.toggleDarkMode,
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
      mainWindow.hide();
    })
    .on("close", function (event) {
      if(!app.isQuiting){
        event.preventDefault();
        mainWindow.hide();
      }
      return false;
    })
    .setSkipTaskbar(true);
    tray = new Tray(trayIcon);
    let trayFiles = new Array;
    if(userData.data.files && userData.data.files.length > 1) {
      userData.data.files.forEach((file) => {
        const menuItem = {
          label: file[1],
          type: "radio",
          checked: false,
          click: function() {
            startFileWatcher(file[1], 1);
            mainWindow.show();
            mainWindow.setSkipTaskbar(true);
          }
        }
        if(file[0]) menuItem.checked = true;
        trayFiles.push(menuItem)
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
        }
      },
      {
        label: translations.addTodo,
        click: function() {
          mainWindow.show();
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
    // TODO macos exception
    tray.on("click", function() {
      mainWindow.show();
    });
  }
  if(userData.data.tray) setupTray();
  // ########################################################################################################################
  // INITIAL WINDOW CONFIGURATION
  // ########################################################################################################################
  if(userData.data.maximizeWindow) mainWindow.maximize()
  if(appData.environment==="development") mainWindow.webContents.openDevTools()
  // ########################################################################################################################
  // WINDOW EVENTS
  // ########################################################################################################################
  mainWindow
  .on("resize", function() {
    if(mainWindow.isMaximized()) {
      userData.set("maximizeWindow", true);
    } else if(mainWindow.isNormal()) {
      userData.set("maximizeWindow", false);
      userData.set("width", this.getBounds().width);
      userData.set("height", this.getBounds().height);
    }
  })
  .on("move", function() {
    userData.set("horizontal", this.getBounds().x);
    userData.set("vertical", this.getBounds().y);
  })
  .on("show", function() {
    if(userData.data.maximizeWindow) {
      mainWindow.maximize();
    } else if(!userData.data.maximizeWindow) {
      mainWindow.unmaximize();
    }
  })
  .webContents.on("new-window", function(event, url) {
    event.preventDefault();
    require("electron").shell.openExternal(url);
  });
  // ########################################################################################################################
  // IPC EVENTS
  // ########################################################################################################################
  const configureWindowEvents = function() {
    try {
      ipcMain
      .on("closeWindow", (event, args) => {
        mainWindow.close();
      })
      .on("userData", (event, args) => {
        if(args) userData.set(args[0], args[1]);
        mainWindow.webContents.send("userData", userData.data);
      })
      .on("appData", () => {
        mainWindow.webContents.send("appData", appData);
      })
      .on("changeLanguage", (event, language) => {
        userData.set("language", language);
        app.relaunch();
        app.exit();
      })
      .on("writeToFile", function(event, args) {
        try {
          let file;
          if(!args[1]) {
            const index = userData.data.files.findIndex(file => file[0] ===1 );
            file = userData.data.files[index][1];
          } else {
            file = args[1];
          }
          // Write content to file
          if(file) fs.writeFileSync(file, args[0], {encoding: "utf-8"});
        } catch(error) {
          console.error(error);
          error.functionName = "fs.writeFileSync";
          mainWindow.webContents.send("triggerFunction", "handleError", [error]);
        }
      })
      .on("setTheme", (event, args) => {
        nativeTheme.themeSource = args;
      })
      .on("openOrCreateFile", (event, args) => {
        openDialog(args);
      })
      .on("startFileWatcher", (event, data) => {
        startFileWatcher(data[0], data[1]).then(response => {
          console.info(response);
        }).catch(error => {
          console.error(error);
        });
      })
      .on("getContent", (event, file) => {
        getContent(file).then(content => {
          mainWindow.webContents.send("getContent", content)
        }).catch(error => {
          console.error(error);
        });
      })
      .on("translations", (event, language) => {
        if(translations) {
          mainWindow.webContents.send("translations", translations);
        } else {
          getTranslations(language).then(function(translations) {
            mainWindow.webContents.send("translations", translations)
          });
        }
      })
      .on("showNotification", (event, config) => {
        showNotification(config);
      })
      .on("copyToClipboard", (event, args) => {
        // Copy text to clipboard
        console.log(args[0]);
        clipboard.writeText(args[0], "selection")
      })
      .on("update-badge", (event, count) => {
        if(appData.os==="mac") app.setBadgeCount(count);
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
    console.error(error);
  });
  // ########################################################################################################################
  // REFRESH WHEN IN BACKGROUND
  // ########################################################################################################################
  setInterval(() => {
    if(userData.data.files.length > 0 && mainWindow && !mainWindow.isFocused()) {
      const index = userData.data.files.findIndex(file => file[0] === 1);
      if(index <= 0) return false;
      getContent(userData.data.files[index][1]).then(content => {
        mainWindow.webContents.send("refresh", [content])
      }).catch(error => {
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
  if(appData.os==="windows") app.setAppUserModelId("RobinAhle.sleektodomanager")
  createWindow();
  if(appData.channel==="AppImage") autoUpdater.checkForUpdatesAndNotify();
})
.on("window-all-closed", () => {
  if(process.platform !== "darwin") app.quit()
  mainWindow = null;
})
.on("activate", () => {
  if(BrowserWindow.getAllWindows().length===0) createWindow()
  app.show();
});
