"use strict";

const { Tray, app, Notification, clipboard, Menu, ipcMain, BrowserWindow, nativeTheme, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const chokidar = require("chokidar");
const Store = require("./configs/store.config.js");
const autoUpdater = require("./configs/autoUpdater.config.js");
const Badge = require("electron-windows-badge");
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
  channel: getChannel()
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
  tray = null;

// ########################################################################################################################
// HOT RELOAD
// https://github.com/sindresorhus/electron-reloader
// ########################################################################################################################
try {
  require("electron-reloader")(module);
} catch {}

// ########################################################################################################################
// SETUP PROCESS
// ########################################################################################################################
process.traceProcessWarnings = true;

// ########################################################################################################################
// SETUP APPDATA
// ########################################################################################################################
// TODO: beautify this
function getChannel() {
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

function getContent(file) {
  try {

    // only for MAS (Sandboxed)
    // https://gist.github.com/ngehlert/74d5a26990811eed59c635e49134d669
    const activeFile = getActiveFile();
    if(process.mas) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(activeFile[3])


    if(!fs.existsSync(file)) {
      // TODO: understand what's happening here
      return Promise.resolve(fs.writeFile(file, "", function(error) {
        if(error) {
          return Promise.reject("Error: Could not create file");
        }
        return "";
      }));
    }
    return Promise.resolve(fs.readFileSync(file, {encoding: "utf-8"}, function(err,data) { 
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

        console.log(bookmark)

        if(fileWatcher) fileWatcher.close()
        
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
        if(fileWatcher) fileWatcher.close()

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

function refreshFiles() {
  try {

    // only for MAS (Sandboxed)
    // https://gist.github.com/ngehlert/74d5a26990811eed59c635e49134d669
    const activeFile = getActiveFile();
    if(process.mas) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(activeFile[3])

    // if a file is not found it will be removed from list and user will be informed
    userData.data.files.forEach(function(file, index, object) {
      if(!fs.existsSync(file[1])) {
        console.log("Info: Not found and removed from file list: " + file[1])
        object.splice(index, 1);

        // notify user about file not being found on disk
        const notification = {
          title: "File not found",
          body: "The currently selected todo file was not found: " + file[1],
          timeoutType: "never",
          silent: false
        }
        showNotification(notification);
      }

      if(process.mas) stopAccessingSecurityScopedResource()

    });

    userData.set("files", userData.data.files);

    return Promise.resolve("Success: Files refreshed");

  } catch (error) {
    return Promise.reject("Error in startFileWatcher(): " + error);
  }
}


function getActiveFile() {
  const index = userData.data.files.findIndex(file => file[0] === 1);
  if(index !==-1 ) {
    const file = userData.data.files[index];
    return file;
  }
  return false;
}

async function startFileWatcher(file, bookmark) {
  try {

    // TODO: consider doing this in store.config.js
    // skip persisted files and go with ENV if set
    if(process.env.SLEEK_CUSTOM_FILE && fs.existsSync(process.env.SLEEK_CUSTOM_FILE)) file = process.env.SLEEK_CUSTOM_FILE

    // check if any saved files are not existing anymore and remove them from config
    await refreshFiles().then(response => {
      console.info(response);
    }).catch(error => {
      console.error(error);
    });

    // TODO: Check windows start
    // electron "unbundled" app -- have to skip "electron" and script name arg eg: "."
    // electron "bundled" app -- skip only the app name, eg: "sleek"
    //let args;
    //(process.defaultApp) ? args = process.argv.slice(2) : args = process.argv.slice(1);

     // set the current file to not active
     // TODO: use getActiveFile()
    const indexOfActiveFile = userData.data.files.findIndex(file => file[0] === 1);
    if(indexOfActiveFile !== -1) userData.data.files[indexOfActiveFile][0] = 0;

    // if file is in array, get the index
    const index = userData.data.files.findIndex(element => element[1] === file);

    // this is a new file so it is pushed to array
    // or this is an existing file so it is just set active
    if(index === -1) {
      (process.mas && bookmark) ? userData.data.files.push([1, file, 1, bookmark]) : userData.data.files.push([1, file, 1])
    } else {
      userData.data.files[index][0] = 1;
      userData.data.files[index][2] = 1;
    }

    // persist the new file
    userData.set("files", userData.data.files);

    // an active filewatcher will be destroyed first
    if(fileWatcher) {
      fileWatcher.close().then(() => console.log("Info: Filewatcher instance closed"));
      await fileWatcher.unwatch();
    }

    // only for MAS (Sandboxed)
    // https://gist.github.com/ngehlert/74d5a26990811eed59c635e49134d669
    const activeFile = getActiveFile();
    if(process.mas) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(activeFile[3])

    // check if file exists, otherwise abort and call onbaording
    if(!fs.existsSync(file)) {
      mainWindow.webContents.send("triggerFunction", "showOnboarding", [true]);
      return Promise.reject("Info: File not found on disk, starting onboarding");
    }

    // create a new filewatcher
    fileWatcher = chokidar.watch(file);

    fileWatcher
      .on("add", async function() {

        const content = await getContent(file).then(content => {
          return content;
        }).catch(error => {
          console.log(error);
        });

        mainWindow.webContents.send("buildTable", [content])

        console.log("Info: File " + file + " has been added");

      })

      .on("unlink", async function() {

        startFileWatcher().then(response => {
          console.info(response);
        }).catch(error => {
          console.error(error);
        });

        console.log("Info: File " + file + " has been unlinked");

      })

      .on("change", async function() {

        // wait 10ms before rereading in case the file is being updated with a delay
        setTimeout(async function() {

          const content = await getContent(file).then(content => {
            return content;
          }).catch(error => {
            console.log(error);
          });

          mainWindow.webContents.send("buildTable", [content])

          console.log("Info: File " + file + " has changed");

        }, 10);
      })

    // change window title
    const title = path.basename(file) + " - sleek";
    mainWindow.title = title;
    mainWindow.webContents.on("did-finish-load",() => {
      mainWindow.setTitle(title);
    });

    if(process.mas) stopAccessingSecurityScopedResource()
    
    return Promise.resolve("Success: Filewatcher is watching: " + file);

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
    if(typeof userData.data.darkmode != "boolean") userData.set("darkmode", nativeTheme.shouldUseDarkColors);
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
    if(typeof userData.data.autoUpdate != "boolean") userData.data.autoUpdate = true;
    
    //TODO remove this after 1.1.7 has been fully distributed
    const indexOfDueString = userData.data.sortBy.indexOf("dueString");
    if(indexOfDueString !== -1) userData.data.sortBy[indexOfDueString] = "due";
    if(userData.data.path) delete userData.data["path"];
    
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
function getTranslations() {
  try {
    const i18next = require("./configs/i18next.config");
    appData.languages = i18next.options.preload;
    return Promise.resolve(i18next.getDataByLanguage(userData.data.language).translation);
  } catch (error) {
    return Promise.reject("Error in getTranslations(): " + error);
  }
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
      .webContents.on("new-window", function(event, url) {
        event.preventDefault();
        require("electron").shell.openExternal(url);
      });

    ipcMain
      .on("closeWindow", () => {
        mainWindow.close()
      })
      .on("userData", (event, args) => {
        if(args) {
          userData.set(args[0], args[1]);
          console.log("Success: " + args[0] + " persisted, value is: " + args[1]);
        }
        mainWindow.webContents.send("userData", userData.data);
      })
      .on("appData", () => {
        mainWindow.webContents.send("appData", appData);
      })
      .on("changeLanguage", async (event, language) => {
        event.preventDefault();
        await userData.set("language", language);
        app.relaunch();
        app.exit();
      })
      .on("writeToFile", function(event, args) {
        const content = args[0];
        let file = args[1];
        
        if(!file) {
          const index = userData.data.files.findIndex(file => file[0] ===1 );
          file = userData.data.files[index][1];
        }

        // only for MAS (Sandboxed)
        // https://gist.github.com/ngehlert/74d5a26990811eed59c635e49134d669
        const activeFile = getActiveFile();
        if(process.mas) stopAccessingSecurityScopedResource = app.startAccessingSecurityScopedResource(activeFile[3])

        if(file) fs.writeFileSync(file, content, {encoding: "utf-8"});

        if(process.mas) stopAccessingSecurityScopedResource()

      })
      .on("darkmode", (event, darkmode) => {
        (darkmode) ? nativeTheme.themeSource = "dark" : nativeTheme.themeSource = "light";
      })
      .on("openOrCreateFile", (event, args) => {
        openFileChooser(args).then(response => {
          console.log(response)
        }).catch(error => {
          console.error(error);
        });
      })
      .on("startFileWatcher", (event, file) => {
        console.log(file)
        startFileWatcher(file).then(response => {
          mainWindow.webContents.send("startFileWatcher", response);
        }).catch(error => {
          console.error(error);
        });
      })
      .on("getContent", (event, file) => {
        getContent(file).then(content => {
          mainWindow.webContents.send("getContent", content);
        }).catch(error => {
          console.error(error);
        });
      })
      .on("translations", () => {
        getTranslations().then(function(translations) {
          mainWindow.webContents.send("translations", translations)
        });
        // if(translations) {
        //   mainWindow.webContents.send("translations", translations);
        // } else {
        //   getTranslations(language).then(function(translations) {
        //     mainWindow.webContents.send("translations", translations)
        //   });
        // }
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
      })
      .on("restart", () => {
        app.relaunch();
        app.exit();
        app.quit();
      });

    return Promise.resolve("Success: Window events setup");

  } catch(error) {
    return Promise.reject("Error in configureWindowEvents(): " + error);
  }
}
function setupTray() {
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

  const trayIcon = (appData.os === "windows") ? path.join(appData.path, "../assets/icons/tray/tray.ico") : path.join(appData.path, "../assets/icons/tray/tray.png");
  tray = new Tray(trayIcon);

  let trayFiles = new Array;
  
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
  (trayFiles.length > 0) ? menu = Menu.buildFromTemplate(trayFiles.concat(contextMenu)) : menu = Menu.buildFromTemplate(contextMenu)

  tray.setContextMenu(menu)
  //tray.setTitle("sleek");
  tray.setToolTip("sleek");
  
  tray.on("click", function() {
    // don't do this on MacOS
    if(appData.os === "mac") return false;
    mainWindow.show();
  });
}

// ########################################################################################################################
// CREATE THE WINDOW
// #######################################################################################################################

async function createWindow() {
  try {
    userData = await getUserData();

    translations = await getTranslations();
    if(!translations) throw("Error: Translations could not be loaded");
    console.log("Success: Translations loaded for: " + userData.data.language);
    
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

    if(appData.os === "windows") {
      new Badge(mainWindow, {
        font: "10px arial"
      });
    }

    // ########################################################################################################################
    // MAIN MENU
    // ########################################################################################################################
    Menu.setApplicationMenu(Menu.buildFromTemplate(
      [
        {
          label: translations.file,
          submenu: [
            {
              label: translations.openFile,
              click: function () {
                openFileChooser("open").then(response => {
                  console.log(response);
                }).catch(error => {
                  console.error(error);
                });
              }
            },
            {
              label: translations.createFile,
              click: function () {
                openFileChooser("create").then(response => {
                  console.log(response);
                }).catch(error => {
                  console.error(error);
                });
              }
            },
            { type: "separator" },
            { role: "hide" },
            { type: "separator" },
            {
              label: translations.settings,
              click: function () {
                mainWindow.webContents.send("triggerFunction", "showModal", ["modalSettings"]);
              }
            },
            { type: "separator" },
            {
              click: function() {
                mainWindow.close();
              },
              label: translations.close
            },
            {
              role: "quit",
              accelerator: "Cmd+Q",
              click: function() {
                app.quit();
              }
            }
          ]
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
            { role: "selectAll", accelerator: "CmdOrCtrl+A" }
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

                // remove dark mode styling
                mainWindow.webContents.executeJavaScript("body.classList.remove(\"dark\");");
      
                const index = userData.data.files.findIndex(file => file[0] === 1);
                
                if(index === -1) return false
                
                mainWindow.webContents.send("buildTable", [null, true]);

                setTimeout(function() {
                  mainWindow.webContents.executeJavaScript("window.print()");
                }, 500);
                
              }
            },
            {
              label: translations.toggleTheme,
              click: function() {
                mainWindow.webContents.send("triggerFunction", "toggleDarkmode")
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
      ]
    ));

    // ########################################################################################################################
    // TRAY ICON
    // ########################################################################################################################
    if(userData.data.tray) setupTray();

    // ########################################################################################################################
    // INITIAL WINDOW CONFIGURATION
    // ########################################################################################################################
    if(userData.data.maximizeWindow) mainWindow.maximize()
    if(appData.environment==="development") mainWindow.webContents.openDevTools()

    // ########################################################################################################################
    // EVENTS
    // ########################################################################################################################
    configureWindowEvents().then(response => {
      console.info(response);
    }).catch(error => {
      console.error(error);
    });

    // ########################################################################################################################
    // REFRESH WHEN IN BACKGROUND
    // ########################################################################################################################
    setInterval(async () => {

      const index = userData.data.files.findIndex(file => file[0] === 1);

      if(index === -1 || mainWindow.isFocused()) return false;
  
      const content = await getContent(userData.data.files[index][1]).then(content => {
        return content;
      }).catch(error => {
        console.error(error);
      });

      mainWindow.webContents.send("buildTable", [content]);

    }, 600000);

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

    // TODO: check if this still works
    if(appData.channel === "AppImage" && userData.data.autoUpdate) autoUpdater.checkForUpdatesAndNotify()

    if(appData.os === "windows") {
      // identifier for windows store
      app.setAppUserModelId("RobinAhle.sleektodomanager")
    }
    
    if(BrowserWindow.getAllWindows().length === 0) {
      createWindow().then(function(response) {
        console.info(response);
      }).catch(function(error) {
        console.error(error);
      });
    }
      
  })
  .on("second-instance", () => {
    // Someone tried to run a second instance, we should focus our window.
    if(!mainWindow) return false
    if(mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    
  })
  .on("window-all-closed", () => {
    if(appData.os !== "mac") app.quit()
    mainWindow = null
  })
  .on("activate", () => {

    if(mainWindow) {
      if(!mainWindow.isVisible()) mainWindow.show();
      return false;
    }

    if(BrowserWindow.getAllWindows().length === 0) 
      createWindow().then(function(response) {
        console.info(response);
      }).catch(function(error) {
        console.error(error);
      })
    
  });
}