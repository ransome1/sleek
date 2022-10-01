"use strict";
const { Tray, app, Notification, clipboard, Menu, ipcMain, BrowserWindow, nativeTheme, dialog } = require("electron");
const i18next = require("./configs/i18next.config");
const path = require("path");
const fs = require("fs");
const chokidar = require("chokidar");
const Store = require("./configs/store.config.js");
const { autoUpdaterAppImage, autoUpdaterMac } = require("./configs/autoUpdater.config.js");
//const dismissedNotificationsStorage = require("./configs/store.config.js");
const os = {
  darwin: "mac",
  win32: "windows",
  linux: "linux"
}
const appData = {
  version: app.getVersion(),
  environment: process.env.NODE_ENV,
  path: __dirname,
  appPath: app.getAppPath(),
  os: os[process.platform],
  channel: getChannel(),
  languages: i18next.options.preload
}
let
  stopAccessingSecurityScopedResource,
  userData = new Store({
    configName: "user-preferences",
    defaults: {}
  }),
  fileWatcher, 
  translations, 
  mainWindow,
  tray = null,
  menuTemplateApp,
  menuTemplateFile,
  menuTemplateEdit,
  menuTemplateTodos,
  menuTemplateView,
  menuTemplateAbout;

// ########################################################################################################################
// HOT RELOAD
// https://github.com/sindresorhus/electron-reloader
// ########################################################################################################################
try {
  if(appData.environment === "development") require("electron-reloader")(module)
} catch {}

// ########################################################################################################################
// SETUP PROCESS
// ########################################################################################################################
process.traceProcessWarnings = true;

// ########################################################################################################################
// SETUP APPDATA
// ########################################################################################################################
function getChannel() {
  if(process.env.APPIMAGE) {
    return "AppImage";
  } else if(process.windowsStore) {
    return "Windows Store";
  } else if(process.mas) {
    return "Mac App Store";
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
function getContent(file) {
  try {

    if(!file) return false;

    // only for MAS (Sandboxed)
    // https://gist.github.com/ngehlert/74d5a26990811eed59c635e49134d669
    const activeFile = getActiveFile();
    if(process.mas) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(activeFile[3])

    return Promise.resolve(fs.readFileSync(file, {encoding: "utf-8"}, function(error, data) { 
      if(process.mas) stopAccessingSecurityScopedResource()

      return data;
    }));

  } catch (error) {
    return Promise.reject("Error in getContent(): " + error);
  }
}
function openFileChooser(args) {
  try {
    let 
      defaultPath,
      index = -1;

    if(typeof userData.data.files === "object") index = userData.data.files.findIndex(file => file[0] === 1);
    
    // this makes the path to the currently active file as the default path for file chooser
    (index === -1) ? defaultPath = path.join(app.getPath("home")) : defaultPath = path.dirname(userData.data.files[index][1])

    if(args === "open") {

      return dialog.showOpenDialog({
        title: translations.selectFile,
        securityScopedBookmarks: true,
        defaultPath: defaultPath,
        buttonLabel: translations.windowButtonOpenFile,
        filters: [{
          name: translations.windowFileformat,
          extensions: ["txt", "md", "todo"]
        }],
        properties: ["openFile"]

      }).then(({ canceled, filePaths, bookmarks }) => {

        if(canceled || filePaths.length === 0) return false;
        
        const bookmark = bookmarks ? bookmarks[0] : undefined
        
        startFileWatcher(filePaths[0].toString(), bookmark).then(response => {
          console.info(response);
        }).catch(error => {
          console.error(error);
        });

        return Promise.resolve("Success: File chooser opened file: " + filePaths[0]);

      }).catch(error => {
        console.error(error)
      });

    } else if(args === "create") {

      return dialog.showSaveDialog({
        title: translations.windowTitleCreateFile,
        securityScopedBookmarks: true,
        defaultPath: defaultPath + "/todo.txt",
        buttonLabel: translations.windowButtonCreateFile,
        filters: [{
          name: translations.windowFileformat,
          extensions: ["txt", "md", "todo"]
        }],
        properties: ["openFile", "createDirectory"]

      }).then(({ canceled, filePath, bookmark }) => {

        if(canceled || !filePath) return false;

        // https://gist.github.com/ngehlert/74d5a26990811eed59c635e49134d669
        //if(process.mas && bookmark) userData.set("securityBookmark", bookmark);

        // close filewatcher, otherwise the change of file will trigger a duplicate refresh
        //if(fileWatcher) fileWatcher.close()

        fs.writeFile(filePath, "", function() {
          startFileWatcher(filePath, bookmark).then(response => {
            console.info(response);
          }).catch(error => {
            console.error(error);
          });        
        });

        return Promise.resolve("Success: File chooser created file: " + filePath);

      }).catch(error => {
        console.error(error);
      });
    }

  } catch (error) {
    return Promise.reject("Error in openFileChooser(): " + error);
  }
}
function getActiveFile() {
  const index = userData.data.files.findIndex(file => file[0] === 1);
  if(index === -1) return false
  return userData.data.files[index];
}
async function startFileWatcher(pathToFile, bookmark) {
  try {

    // TODO: consider doing this in store.config.js
    // skip persisted files and go with ENV if set
    if(process.env.SLEEK_CUSTOM_FILE && fs.existsSync(process.env.SLEEK_CUSTOM_FILE)) pathToFile = process.env.SLEEK_CUSTOM_FILE

    // if requested file is not found on disk, this function will be aborted
    if(!fs.existsSync(pathToFile)) {
      showNotification({
        title: "File not found on disk",
        body: "The requested file cannot be found on disk: " + pathToFile,
        timeoutType: "never",
        silent: false
      });
      return Promise.reject("Error: The requested file cannot be found on disk: " + pathToFile);
    }

     // set the current file to not active
    const indexOfActiveFile = userData.data.files.findIndex(file => file[0] === 1);
    if(indexOfActiveFile !== -1) userData.data.files[indexOfActiveFile][0] = 0;

    // if file is in array, get the index
    const index = userData.data.files.findIndex(element => element[1] === pathToFile);

    // this is a new file so it is pushed to array
    if(index === -1) {
      (process.mas && bookmark) ? userData.data.files.push([1, pathToFile, 1, bookmark]) : userData.data.files.push([1, pathToFile, 1])
    // or this is an existing file so it is just set active
    } else {
      userData.data.files[index][0] = 1;
      userData.data.files[index][2] = 1;
    }

    // get activ file and its attributes
    const file = getActiveFile();

    // only for MAS (Sandboxed)
    // https://gist.github.com/ngehlert/74d5a26990811eed59c635e49134d669
    if(process.mas) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(file[3])

    if(fileWatcher) await fileWatcher.close().then(() => console.log("Info: Filewatcher closed"));
    fileWatcher = await chokidar.watch(file[1])
    fileWatcher
    .on("add", async function(fileToLink) {
  
      const content = await getContent(fileToLink);
      mainWindow.webContents.send("buildTable", [content])

      // change window title
      const title = path.basename(fileToLink) + " - sleek";
      mainWindow.setTitle(title);
      
      console.log("Info: File " + fileToLink + " has been added");

    })

    .on("unlink", function(unlinkedFile) {
      
      showNotification({
        title: "File not found on disk",
        body: "Currently watched file not found on disk: " + unlinkedFile,
        timeoutType: "never",
        silent: false
      });

      // set unlinked file inactive
      const index = userData.data.files.findIndex(element => element[1] === unlinkedFile);
      if(index !== -1) {
        userData.data.files[index][0] = 0;
        userData.data.files[index][2] = 0;
      }

      userData.set("files", userData.data.files);

      mainWindow.webContents.send("triggerFunction", "showOnboarding", [true]);
      
      console.log("Info: File " + unlinkedFile + " has been unlinked");

    })

    .on("error", function(error) {
      console.error("Error: " + error);
    })

    .on("change", async function(linkedFile) {

      const content = await getContent(linkedFile);
      mainWindow.webContents.send("buildTable", [content])

      console.log("Info: File " + linkedFile + " has changed");

    })

    // remove access to secure ressource
    if(process.mas) stopAccessingSecurityScopedResource()

    // persist
    userData.set("files", userData.data.files);
    
    return Promise.resolve("Success: Filewatcher is watching: " + file[1]);

  } catch (error) {
    // if some file related crash occurs, onboarding will be triggered
    mainWindow.webContents.send("triggerFunction", "showOnboarding", [true]);
    return Promise.reject("Error in startFileWatcher(): " + error);
  }
}
function getUserData() {
  try {

    // TODO: finish putting this into a sparate storage
    // dismissedNotifications = new dismissedNotificationsStorage({
    //   configName: "dismissed-notifications",
    //   defaults: {}
    // });

    // feed custom file if env is set
    if(process.env.SLEEK_CUSTOM_FILE) userData.set("files", [[1, process.env.SLEEK_CUSTOM_FILE, 1]]);

    // set the default if those havn't been set already
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
    if(typeof userData.data.invertSorting != "boolean") userData.set("invertSorting", false);
    if(typeof userData.data.zoom != "string") userData.set("zoom", "100");
    if(typeof userData.data.tray != "boolean") userData.data.tray = false;
    if(typeof userData.data.showEmptyFilters != "boolean") userData.data.showEmptyFilters = true;
    if(typeof userData.data.sortByFile != "boolean") userData.data.sortByFile = false;
    if(!Array.isArray(userData.data.dismissedNotifications)) userData.set("dismissedNotifications", []);
    if(!Array.isArray(userData.data.dismissedMessages)) userData.set("dismissedMessages", []);
    if(!Array.isArray(userData.data.hideFilterCategories)) userData.set("hideFilterCategories", []);
    if(!Array.isArray(userData.data.files)) userData.set("files", []);
    if(!Array.isArray(userData.data.sortBy)) userData.set("sortBy", ["priority", "due", "contexts", "projects", "date"]);
    if(!Array.isArray(userData.data.selectedFilters)) userData.set("selectedFilters", []);
    if(typeof userData.data.deferredTodos != "boolean") userData.data.deferredTodos = true;
    if(typeof userData.data.fileTabs != "boolean") userData.data.fileTabs = true;
    if(typeof userData.data.appendStartDate != "boolean") userData.data.appendStartDate = false;
    if(typeof userData.data.language != "string") userData.data.language = app.getLocale().substr(0,2);
    if(typeof userData.data.autoUpdate != "boolean") userData.data.autoUpdate = false;
    if(typeof userData.data.theme != "string") userData.set("theme", "system");
    if(typeof userData.data.getPageTitles != "boolean") userData.data.getPageTitles = true;
    
    //TODO remove this after 1.1.7 has been fully distributed
    const indexOfDueString = userData.data.sortBy.indexOf("dueString");
    if(indexOfDueString !== -1) userData.data.sortBy[indexOfDueString] = "due";
    if(userData.data.path) delete userData.data["path"];

    //TODO remove this after 1.1.8 has been fully distributed
    if(userData.data.darkmode) delete userData.data["darkmode"];
    
    //TODO remove this after 1.1.4 has been fully distributed
    if(userData.data.sortBy.length === 4) userData.set("sortBy", ["priority", "due", "contexts", "projects", "date"]);

    return Promise.resolve(userData);

  } catch(error) {
    error.functionName = getUserData.id;
    return Promise.reject("Error in getUserData(): " + error);
  }
}
function showNotification(config) {
  config.hasReply = false;
  config.urgency = "normal";
  config.closeButtonText = "Close";
  config.icon = path.join(appData.path, "../assets/icons/96x96.png");
  // send it to UI
  const notification = new Notification(config);
  notification.show();
  // stop here if there is no button in notification
  if(typeof config.actions !== "object") return false;
  // click on button in notification
  notification.addListener("click", () => {
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
function configureWindowEvents() {
  try {
    mainWindow
    .on("resize", function() {
      userData.set("width", this.getBounds().width);
      userData.set("height", this.getBounds().height);
    })
    .on("maximize", function() {
      userData.set("maximizeWindow", true);
    })
    .on("unmaximize", function() {
      userData.set("maximizeWindow", false);
      userData.set("width", this.getBounds().width);
      userData.set("height", this.getBounds().height);
    })
    .on("move", function() {
      userData.set("horizontal", this.getBounds().x);
      userData.set("vertical", this.getBounds().y);
    })
    .on("show", function(event) {
      event.preventDefault();
      (userData.data.maximizeWindow) ? mainWindow.maximize() : mainWindow.unmaximize()
    })

    .webContents
    .on("new-window", function(event, url) {
      event.preventDefault();
      require("electron").shell.openExternal(url);
    })
    .on("did-finish-load", function() {
      nativeTheme.themeSource = userData.data.theme;
    });

    ipcMain.handle("userData", (event, args) => {
      if(args) {
        userData.set(args[0], args[1]);
        console.log("Success: " + args[0] + " persisted, value is: " + args[1]);
      }
      return userData.data;
    });
  
    ipcMain.handle("appData", () => {
      return appData;
    });

    ipcMain.handle("translations", async () => {
      return translations
    });

    ipcMain.handle("getContent", async (event, file) => {
      const content = await getContent(file);
      return content;
    })

    ipcMain
      .once("closeWindow", () => {
        mainWindow.close()
      })
      .once("restart", () => {
        app.relaunch();
        app.exit();
        app.quit();
      })
      .once("changeLanguage", async (event, language) => {
        event.preventDefault();
        await userData.set("language", language);
        app.relaunch();
        app.exit();
      });

    ipcMain
      .on("setTheme", (event, theme) => {
        if(!theme) theme = (nativeTheme.shouldUseDarkColors) ? "light" : "dark"
        nativeTheme.themeSource = theme;
        userData.set("theme", nativeTheme.themeSource);
      })
      .on("replaceFileContent", async function(event, args) {

        const content = args[0];
        const file = args[1];

        if(process.mas) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(getActiveFile()[3])

        fs.writeFileSync(file, content, {encoding: "utf-8"});

        if(process.mas) stopAccessingSecurityScopedResource()
      })
      .on("writeToFile", async function(event, args) {
        
        const index = args[1];
        const data = args[0];
        const file = (args[2]) ? args[2] : await getActiveFile()[1];
        const fileContent = await getContent(file);
        let fileAsArray = fileContent.split("\n");

        // adding a new line or replacing an existing one
        (index === -1 && data) ? fileAsArray.push(data) : fileAsArray.splice(index, 1, data);

        // delete element in array
        if(index >= 0 && !data) fileAsArray.splice(index, 1);

        //if(index === undefined && data) contentToWrite = data;

        // building string to write in file
        // when file is defined, but no index, it will be an archiving operation

        // remove empty elements from array
        const fileAsArrayCleanedUp = fileAsArray.filter(function (obj) { return !["", null, undefined].includes(obj) })

        const contentToWrite = fileAsArrayCleanedUp.join("\n");

        // only for MAS (Sandboxed)
        // https://gist.github.com/ngehlert/74d5a26990811eed59c635e49134d669
        if(process.mas) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(getActiveFile()[3])

        fs.writeFileSync(file, contentToWrite, {encoding: "utf-8"});

        if(process.mas) stopAccessingSecurityScopedResource()

      })
      .on("openOrCreateFile", (event, args) => {
        openFileChooser(args).then(response => {
          console.log(response)
        }).catch(error => {
          console.error(error);
        });
      })
      .on("startFileWatcher", (event, file) => {
        startFileWatcher(file).then(response => {
          console.log(response)
        }).catch(error => {
          console.error(error);
        });
      })
      .on("showNotification", (event, config) => {
        showNotification(config);
      })
      .on("copyToClipboard", (event, args) => {
        // Copy text to clipboard
        clipboard.writeText(args[0])
      })
      .on("update-badge", (event, count) => {
        if(appData.os === "mac") app.setBadgeCount(count);
      });

    return Promise.resolve("Success: Window events setup");

  } catch(error) {
    return Promise.reject("Error in configureWindowEvents(): " + error);
  }
}
function setupTray() {
  mainWindow
    .on("close", function (event) {
      event.preventDefault();
      if(app.isQuiting) return false;
      mainWindow.hide();
      app.dock.hide();
    })
    .on("show", function () {
      app.dock.show();
    })

  const trayIcon = (appData.os === "windows") ? path.join(appData.path, "../assets/icons/tray/tray.ico") : path.join(appData.path, "../assets/icons/tray/tray.png");
  tray = new Tray(trayIcon);

  
  
  tray.on("click", function() {

    let trayFiles = new Array;
  
    // build file selection
    if(userData.data.files && userData.data.files.length > 1) {
      userData.data.files.forEach((file) => {
        const menuItem = {
          label: file[1],
          type: "radio",
          checked: false,
          click: function() {
            startFileWatcher(file[1]);
            mainWindow.show();
            mainWindow.setSkipTaskbar(true);
          }
        }
        if(file[0]) menuItem.checked = true;
        trayFiles.push(menuItem)
      });
      trayFiles.push({ type: "separator" });
    }

    const contextMenu = [
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
    let menu = (trayFiles.length > 0) ? Menu.buildFromTemplate(trayFiles.concat(contextMenu)) : Menu.buildFromTemplate(contextMenu)
    this.setContextMenu(menu)
    this.setToolTip("sleek")
    mainWindow.show()
  });
}

// ########################################################################################################################
// CREATE THE WINDOW
// #######################################################################################################################

async function createWindow() {
  try {
    // load the user data from preferences file
    userData = await getUserData();

    mainWindow = new BrowserWindow({
      width: userData.data.width,
      height: userData.data.height,
      x: userData.data.horizontal,
      y: userData.data.vertical,
      minWidth: 300,
      minHeight: 500,
      icon: (appData.os === "windows") ? path.join(appData.path, "../assets/icons/sleek.ico") : path.join(appData.path, "../assets/icons/512x512.png"),
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
    mainWindow.loadFile(path.join(appData.path, "index.html"));

    
    // load the translations
    // make sure language is supported, otherwise load translations from fallback language
    if(!i18next.options.supportedLngs.includes(userData.data.language)) await userData.set("language", i18next.options.fallbackLng[0])
    translations = await i18next.getDataByLanguage(userData.data.language).translation
    if(!translations) throw("Error: Translations could not be loaded")
    console.log("Success: Translations loaded for: " + userData.data.language)

    // create badge for Windows build
    if(appData.os === "windows") {
      const Badge = await require("electron-windows-badge");
      new Badge(mainWindow, {
        font: "10px arial"
      });
    }

    // create menu
    menuTemplateApp = {
      label: "sleek",
      submenu: 
      [{
        label: translations.open,
        click: function() {
          if(mainWindow) {
            if(!mainWindow.isVisible()) mainWindow.show();
            return Promise.resolve("Success: Main window has been reopened");
          }
          createWindow().then(function(response) {
            console.info(response);
          }).catch(function(error) {
            console.error(error);
          })
        }
      },
      { role: "hide" },
      { type: "separator" },
      {
        id: "settings",
        label: translations.settings,
        click: async function() {
          mainWindow.webContents.send("triggerFunction", "showModal", ["modalSettings"]);                      
        }
      },
      { type: "separator" },
      { 
        label: translations.close,
        click: function() {
          mainWindow.close();
        }
      },
      {
        id: "quit",
        label: "Quit",
        accelerator: "CmdOrCtrl+Q",
        click: function() {
          app.exit();
        }
      }]
    }
    menuTemplateFile = {
      label: translations.file,
      submenu: 
      [{
        label: translations.openFile,
        click: function() {
          openFileChooser("open").then(response => {
            console.log(response);
          }).catch(error => {
            console.error(error);
          });
        }
      },
      {
        label: translations.createFile,
        click: function() {
          openFileChooser("create").then(response => {
            console.log(response);
          }).catch(error => {
            console.error(error);
          });
        }
      }]
    }
    menuTemplateEdit = {
      label: translations.edit,
      submenu: [
        { role: "undo", accelerator: "CmdOrCtrl+Z" },
        { role: "redo", accelerator: "CmdOrCtrl+Shift+Z" },
        { type: "separator" },
        { label: translations.cut, accelerator: "CmdOrCtrl+X", selector: "cut:" },
        { label: translations.copy, accelerator: "CmdOrCtrl+C", selector: "copy:" },
        { label: translations.paste, accelerator: "CmdOrCtrl+V", selector: "paste:" },
        { role: "selectAll", accelerator: "CmdOrCtrl+A" }
      ]
    }
    menuTemplateTodos = {
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
            if(process.mas) {
              mainWindow.webContents.send("triggerFunction", "showGenericMessage", ["This feature is being worked on at this moment and will be released soon", 3])  
              return false;
            }
            mainWindow.webContents.send("triggerFunction", "archiveTodos")        
          }
        }
      ]
    }
    menuTemplateView = {
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
            mainWindow.webContents.send("triggerFunction", "resetFilters", [true])      
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
          role: "print",
          accelerator: "CmdOrCtrl+P",
          label: translations.printCurrentView,
          click: function() {
            if(!getActiveFile()) return false
            mainWindow.webContents.executeJavaScript("body.classList.remove(\"dark\");");
            mainWindow.webContents.send("buildTable", [null, true]);
            setTimeout(function() {
              mainWindow.webContents.executeJavaScript("window.print()");
            }, 500);
          }
        },
        {
          label: translations.toggleTheme,
          click: function() {
            nativeTheme.themeSource = (nativeTheme.shouldUseDarkColors) ? "light" : "dark"
          }
        },
        {
          role: "reload",
          label: translations.reload
        }
      ]
    }
    menuTemplateAbout = {
      label: translations.about,
      submenu: [
        {
          label: translations.help,
          click: function() {
            mainWindow.webContents.send("triggerFunction", "showModal", ["modalHelp"])
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
    const menuTemplate = (getActiveFile()) ? [menuTemplateApp, menuTemplateFile, menuTemplateEdit, menuTemplateTodos, menuTemplateView, menuTemplateAbout] : [menuTemplateApp, menuTemplateFile, menuTemplateEdit]
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate))
    // hide quit menu item on all platforms but macos
    if(appData.os !== "mac") Menu.getApplicationMenu().getMenuItemById("quit").visible = false;

    // setup tray icon
    if(userData.data.tray) setupTray();

    // setup window
    if(userData.data.maximizeWindow) mainWindow.maximize()
    if(appData.environment === "development") mainWindow.webContents.openDevTools()

    // load window events
    configureWindowEvents().then(response => {
      console.info(response);
    }).catch(error => {
      console.error(error);
    });

    // setup reload intervall (reload every 10 minutes)
    setInterval(async () => {

      if(mainWindow.isFocused()) return false;
      if(!getActiveFile()) return false;
      
      const content = await getContent(getActiveFile()[1]);
      mainWindow.webContents.send("buildTable", [content]);

    }, 60000);

    return Promise.resolve("Success: Renderer window created");

  } catch(error) {
    error.functionName = createWindow.name;
    return Promise.reject(error);
  }
}

// ########################################################################################################################
// APP EVENTS
// ########################################################################################################################

// prevent multiple instances based on https://stackoverflow.com/questions/35916158/how-to-prevent-multiple-instances-in-electron
if(!process.mas && (!app.requestSingleInstanceLock() && process.env.SLEEK_MULTIPLE_INSTANCES !== "true")) {

  app.quit();

} else {

  app.on("ready", () => {

    // in tray mode, dock icon is hidden
    //if(userData.data.tray) app.dock.hide()

    // setup autoupdater for AppImage build
    if(appData.channel === "AppImage" && userData.data.autoUpdate) autoUpdaterAppImage.checkForUpdatesAndNotify()

    // setup autoupdater for Mac builds
    if(appData.os === "mac" && appData.channel !== "Mac App Store" && userData.data.autoUpdate) autoUpdaterMac.checkForUpdatesAndNotify()

    // identifier for windows store
    if(appData.os === "windows") app.setAppUserModelId("RobinAhle.sleektodomanager")

    createWindow().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      console.error(error);
    })

  })
  .on("second-instance", () => {
    // Someone tried to run a second instance, we should focus our window.
    if(!mainWindow) return false
    if(mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
  })
  .on("window-all-closed", () => {
    if(appData.os !== "mac") app.quit()
    mainWindow = null;
    // remove filewatcher
    if(fileWatcher) fileWatcher.unwatch();
    // reduce menu to bare minimum
    Menu.setApplicationMenu(Menu.buildFromTemplate([menuTemplateApp]))
    // disable settings because it would provoke errors
    Menu.getApplicationMenu().getMenuItemById("settings").enabled = false;

  })
  .on("activate", () => {
    if(mainWindow) {
      if(!mainWindow.isVisible()) mainWindow.show();
      return Promise.resolve("Success: Main window has been reopened");
    }
    createWindow().then(function(response) {
      console.info(response);
    }).catch(function(error) {
      console.error(error);
    })
  });
}
