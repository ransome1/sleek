/*const { Menu } = require("electron");
const { appData, mainWindow } = require("../../main.js");
const { setLanguage } = require("./main.js");
const fs = require("fs");
let translations;
setLanguage().then(function(data) {
  translations = data;
});
const menuTemplate = [
  {
    label: translations.file,
    submenu: [
      {
        label: translations.openFile,
        accelerator: "CmdOrCtrl+o",
        click: function (item, focusedWindow) {
          openDialog("open");
        }
      },
      {
        label: translations.createFile,
        click: function (item, focusedWindow) {
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
    { label: translations.paste, accelerator: "CmdOrCtrl+V", selector: "paste:" }
  ]},
  {
    label: translations.todos,
    submenu: [
      {
        label: translations.addTodo,
        accelerator: "CmdOrCtrl+n",
        click: function (item, focusedWindow) {
          mainWindow.webContents.send("triggerFunction", "showForm")
        }
      },
      {
        label: translations.find,
        accelerator: "CmdOrCtrl+f",
        click: function (item, focusedWindow) {
          mainWindow.webContents.executeJavaScript("todoTableSearch.focus()");
        }
      },
      {
        label: translations.archive,
        click: function (item, focusedWindow) {
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
        click: function (item, focusedWindow) {
          mainWindow.webContents.send("triggerFunction", "showDrawer", ["toggle", "navBtnFilter", "filterDrawer"])
        }
      },
      {
        label: translations.resetFilters,
        accelerator: "CmdOrCtrl+l",
        click: function (item, focusedWindow) {
          mainWindow.webContents.send("triggerFunction", "resetFilters")
        }
      },
      {
        label: translations.toggleCompletedTodos,
        accelerator: "CmdOrCtrl+h",
        click: function (item, focusedWindow) {
          mainWindow.webContents.send("triggerFunction", "toggleTodos", ["showCompleted"])
        }
      },
      { type: "separator" },
      {
        label: translations.toggleDarkMode,
        accelerator: "CmdOrCtrl+d",
        click: function (item, focusedWindow) {
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
exports.menuTemplate = menuTemplate;*/
