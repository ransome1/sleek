import { app, Menu, dialog, shell, MenuItemConstructorOptions } from "electron";
import { activateFile } from "./File/File";
import { mainWindow, HandleCreateWindow } from "./index";
import { openFile, createFile } from "./File/Dialog";

import { SettingsStore, FiltersStore } from "./Stores";
import { File } from "../@types";
import appPackage from "../../package.json";
import i18n from "./i18n";

export const GetFileMenuEntries = (files: File[]) => {
  return files.map((file: File, index: number) => ({
    label: file.todoFileName,
    accelerator: `CommandOrControl+${index + 1}`,
    click: () => {
      activateFile(index);
    },
  }));
};

const GetMenuTemplate = (
  files: File[],
): Electron.MenuItemConstructorOptions[] => {
  return [
    {
      label: "sleek",
      type: "submenu",
      submenu: [
        {
          label: i18n.t("menu.about"),
          click: async () => {
            const options = {
              title: i18n.t("menu.aboutSleek"),
              message: `sleek v${app.getVersion()}`,
              detail: appPackage.description,
              buttons: [
                i18n.t("close"),
                i18n.t("menu.revealConfigurationFolder"),
              ],
            };
            const { response } = await dialog.showMessageBox(options);
            if (response === 1) {
              const pathToReveal = app.getPath("userData");
              shell.showItemInFolder(pathToReveal);
            }
          },
        },
        {
          label: i18n.t("settings"),
          accelerator: "CmdOrCtrl+,",
          click: () => {
            mainWindow!.webContents.send("isSettingsOpen", true);
          },
        },
        ...(process.platform === "darwin"
          ? ([
              { type: "separator" },
              {
                label: i18n.t("menu.hide"),
                accelerator: "Cmd+H",
                role: "hide",
              },
            ] as MenuItemConstructorOptions[])
          : []),
        { type: "separator" },
        {
          label: i18n.t("menu.quitSleek"),
          role: "quit",
          accelerator: "CmdOrCtrl+Q",
        },
      ],
    },
    {
      id: "fileMenu",
      label: i18n.t("menu.file"),
      submenu: [
        { type: "separator" },
        {
          label: i18n.t("openFile"),
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            await openFile(false);
          },
        },
        {
          label: i18n.t("createFile"),
          click: async () => {
            await createFile(false);
          },
        },
        { type: "separator" },
        ...GetFileMenuEntries(files),
      ],
    },
    {
      label: i18n.t("menu.edit"),
      submenu: [
        { label: i18n.t("menu.undo"), role: "undo" },
        { label: i18n.t("menu.redo"), role: "redo" },
        { type: "separator" },
        { label: i18n.t("menu.cut"), role: "cut" },
        { label: i18n.t("copy"), role: "copy" },
        { label: i18n.t("menu.paste"), role: "paste" },
        { label: i18n.t("menu.selectAll"), role: "selectAll" },
      ],
    },
    {
      label: i18n.t("menu.view"),
      submenu: [
        ...(files?.length > 0
          ? [
              {
                label: i18n.t("menu.toggleDrawer"),
                accelerator: "CmdOrCtrl+B",
                click: () => {
                  const isDrawerOpen = SettingsStore.get("isDrawerOpen");
                  SettingsStore.set("isDrawerOpen", !isDrawerOpen);
                },
              },
              {
                label: i18n.t("menu.toggleFileTabs"),
                click: () => {
                  const showFileTabs = SettingsStore.get("showFileTabs");
                  SettingsStore.set("showFileTabs", !showFileTabs);
                },
              },
            ]
          : []),
        {
          label: i18n.t("menu.toggleNavigation"),
          accelerator: "Ctrl+Alt+H",
          click: () => {
            const isNavigationOpen = SettingsStore.get("isNavigationOpen");
            SettingsStore.set("isNavigationOpen", !isNavigationOpen);
          },
        },
        {
          label: i18n.t("menu.toggleTheme"),
          accelerator: "Ctrl+Alt+D",
          click: () => {
            const shouldUseDarkColors = SettingsStore.get(
              "shouldUseDarkColors",
            );
            SettingsStore.set(
              "colorTheme",
              shouldUseDarkColors ? "light" : "dark",
            );
          },
        },
        {
          label: i18n.t("menu.toggleCompactMode"),
          click: () => {
            const compact = SettingsStore.get("compact");
            SettingsStore.set("compact", !compact);
          },
        },
      ],
    },
    ...(files?.length > 0
      ? [
          {
            label: i18n.t("menu.todos"),
            submenu: [
              {
                label: i18n.t("menu.addNewTodo"),
                accelerator: "CmdOrCtrl+N",
                click: () => {
                  mainWindow?.webContents.send("isDialogOpen");
                },
              },
              {
                label: i18n.t("menu.find"),
                accelerator: "CmdOrCtrl+F",
                click: () => {
                  const isSearchOpen = SettingsStore.get("isSearchOpen");
                  SettingsStore.set("isSearchOpen", !isSearchOpen);
                },
              },
              {
                label: i18n.t("menu.toggleCompleted"),
                accelerator: "Ctrl+H",
                click: async () => {
                  const showCompleted = SettingsStore.get("showCompleted");
                  SettingsStore.set("showCompleted", !showCompleted);
                },
              },
              {
                label: i18n.t("splashscreen.noTodosVisible.reset"),
                accelerator: "CmdOrCtrl+0",
                click: async () => {
                  FiltersStore.set("attributes", {});
                },
              },
              {
                label: i18n.t("menu.archiveCompletedTodos"),
                accelerator: "Ctrl+Alt+A",
                click: () => {
                  mainWindow?.webContents.send("requestArchive");
                },
              },
            ],
          },
        ]
      : []),
    {
      role: "window",
      submenu: [
        {
          label: i18n.t("menu.closeWindow"),
          accelerator: "CmdOrCtrl+W",
          role: "close",
        },
        {
          label: i18n.t("menu.openWindow"),
          click: () => {
            HandleCreateWindow();
          },
        },
      ],
    },
    {
      label: i18n.t("menu.help"),
      submenu: [
        {
          label: "sleek wiki",
          click: () => {
            shell?.openExternal("https://github.com/ransome1/sleek/wiki");
          },
        },
        {
          label: i18n.t("menu.changelog"),
          click: () => {
            shell?.openExternal(
              "https://github.com/ransome1/sleek/blob/main/CHANGELOG.md",
            );
          },
        },
        {
          label: i18n.t("menu.reportBugs"),
          click: () => {
            shell?.openExternal("https://github.com/ransome1/sleek/issues");
          },
        },
        {
          label: i18n.t("menu.discussFeatures"),
          click: () => {
            shell?.openExternal(
              "https://github.com/ransome1/sleek/discussions",
            );
          },
        },
        {
          label: i18n.t("menu.contributing"),
          click: () => {
            shell?.openExternal(
              "https://github.com/ransome1/sleek/blob/master/CONTRIBUTING.md",
            );
          },
        },
        {
          label: i18n.t("menu.keyboardShortcuts"),
          click: () => {
            shell?.openExternal(
              "https://github.com/ransome1/sleek/wiki/Keyboard-shortcuts#v2x",
            );
          },
        },
        {
          label: i18n.t("menu.privacyPolicy"),
          click: () => {
            shell?.openExternal(
              "https://github.com/ransome1/sleek/blob/master/PRIVACY.md",
            );
          },
        },
        ...(!process.mas
          ? [
              {
                label: i18n.t("menu.sponsoring"),
                click: () => {
                  shell?.openExternal("https://github.com/sponsors/ransome1");
                },
              },
            ]
          : []),
        {
          role: "toggleDevTools",
          label: i18n.t("menu.developerTools"),
        },
        {
          role: "reload",
          label: i18n.t("menu.reload"),
        },
      ],
    },
  ];
};

export function CreateMenu(files: File[]): void {
  const menu = Menu.buildFromTemplate(GetMenuTemplate(files));
  Menu.setApplicationMenu(menu);
}
