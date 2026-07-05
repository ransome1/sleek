import { app, Menu, dialog, shell, MenuItemConstructorOptions } from "electron";
import { activateFile } from "./File/File";
import { mainWindow, HandleCreateWindow } from "./index";
import { openFile, createFile } from "./File/Dialog";
import { checkArchiveReadiness } from "./File/Archive";
import { SettingsStore, FiltersStore } from "./Stores";
import { File } from "../@types";
import appPackage from "../../package.json";
import { TranslateMain } from "./I18n";

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
  const language = SettingsStore.get("language");
  const t = (key: Parameters<typeof TranslateMain>[0]) =>
    TranslateMain(key, language);

  return [
    {
      label: "sleek",
      type: "submenu",
      submenu: [
        {
          label: t("menu.about"),
          click: async () => {
            const options = {
              title: t("menu.aboutSleek"),
              message: `sleek v${app.getVersion()}`,
              detail: appPackage.description,
              buttons: [t("close"), t("menu.revealConfigurationFolder")],
            };
            const { response } = await dialog.showMessageBox(options);
            if (response === 1) {
              const pathToReveal = app.getPath("userData");
              shell.showItemInFolder(pathToReveal);
            }
          },
        },
        {
          label: t("settings"),
          accelerator: "CmdOrCtrl+,",
          click: () => {
            mainWindow!.webContents.send("isSettingsOpen", true);
          },
        },
        ...(process.platform === "darwin"
          ? ([
              { type: "separator" },
              {
                label: t("menu.hide"),
                accelerator: "Cmd+H",
                role: "hide",
              },
            ] as MenuItemConstructorOptions[])
          : []),
        { type: "separator" },
        {
          label: t("menu.quitSleek"),
          role: "quit",
          accelerator: "CmdOrCtrl+Q",
        },
      ],
    },
    {
      id: "fileMenu",
      label: t("menu.file"),
      submenu: [
        { type: "separator" },
        {
          label: t("openFile"),
          accelerator: "CmdOrCtrl+O",
          click: async () => {
            await openFile(false);
          },
        },
        {
          label: t("createFile"),
          click: async () => {
            await createFile(false);
          },
        },
        { type: "separator" },
        ...GetFileMenuEntries(files),
      ],
    },
    {
      label: t("menu.edit"),
      submenu: [
        { label: t("menu.undo"), role: "undo" },
        { label: t("menu.redo"), role: "redo" },
        { type: "separator" },
        { label: t("menu.cut"), role: "cut" },
        { label: t("copy"), role: "copy" },
        { label: t("menu.paste"), role: "paste" },
        { label: t("menu.selectAll"), role: "selectAll" },
      ],
    },
    {
      label: t("menu.view"),
      submenu: [
        ...(files?.length > 0
          ? [
              {
                label: t("menu.toggleDrawer"),
                accelerator: "CmdOrCtrl+B",
                click: () => {
                  const isDrawerOpen = SettingsStore.get("isDrawerOpen");
                  SettingsStore.set("isDrawerOpen", !isDrawerOpen);
                },
              },
              {
                label: t("menu.toggleFileTabs"),
                click: () => {
                  const showFileTabs = SettingsStore.get("showFileTabs");
                  SettingsStore.set("showFileTabs", !showFileTabs);
                },
              },
            ]
          : []),
        {
          label: t("menu.toggleNavigation"),
          accelerator: "Ctrl+Alt+H",
          click: () => {
            const isNavigationOpen = SettingsStore.get("isNavigationOpen");
            SettingsStore.set("isNavigationOpen", !isNavigationOpen);
          },
        },
        {
          label: t("menu.toggleTheme"),
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
          label: t("menu.toggleCompactMode"),
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
            label: t("menu.todos"),
            submenu: [
              {
                label: t("menu.addNewTodo"),
                accelerator: "CmdOrCtrl+N",
                click: () => {
                  mainWindow?.webContents.send("isDialogOpen");
                },
              },
              {
                label: t("menu.find"),
                accelerator: "CmdOrCtrl+F",
                click: () => {
                  const isSearchOpen = SettingsStore.get("isSearchOpen");
                  SettingsStore.set("isSearchOpen", !isSearchOpen);
                },
              },
              {
                label: t("menu.toggleCompleted"),
                accelerator: "Ctrl+H",
                click: async () => {
                  const showCompleted = SettingsStore.get("showCompleted");
                  SettingsStore.set("showCompleted", !showCompleted);
                },
              },
              {
                label: t("splashscreen.noTodosVisible.reset"),
                accelerator: "CmdOrCtrl+0",
                click: async () => {
                  FiltersStore.set("attributes", {});
                },
              },
              {
                label: t("prompt.archive.headline"),
                accelerator: "Ctrl+Alt+A",
                click: () => {
                  checkArchiveReadiness();
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
          label: t("menu.closeWindow"),
          accelerator: "CmdOrCtrl+W",
          role: "close",
        },
        {
          label: t("menu.openWindow"),
          click: () => {
            HandleCreateWindow();
          },
        },
      ],
    },
    {
      label: t("menu.help"),
      submenu: [
        {
          label: "sleek wiki",
          click: () => {
            shell?.openExternal("https://github.com/ransome1/sleek/wiki");
          },
        },
        {
          label: t("menu.changelog"),
          click: () => {
            shell?.openExternal(
              "https://github.com/ransome1/sleek/blob/main/CHANGELOG.md",
            );
          },
        },
        {
          label: t("menu.reportBugs"),
          click: () => {
            shell?.openExternal("https://github.com/ransome1/sleek/issues");
          },
        },
        {
          label: t("menu.discussFeatures"),
          click: () => {
            shell?.openExternal(
              "https://github.com/ransome1/sleek/discussions",
            );
          },
        },
        {
          label: t("menu.contributing"),
          click: () => {
            shell?.openExternal(
              "https://github.com/ransome1/sleek/blob/master/CONTRIBUTING.md",
            );
          },
        },
        {
          label: t("menu.keyboardShortcuts"),
          click: () => {
            shell?.openExternal(
              "https://github.com/ransome1/sleek/wiki/Keyboard-shortcuts#v2x",
            );
          },
        },
        {
          label: t("menu.privacyPolicy"),
          click: () => {
            shell?.openExternal(
              "https://github.com/ransome1/sleek/blob/master/PRIVACY.md",
            );
          },
        },
        ...(!process.mas
          ? [
              {
                label: t("menu.sponsoring"),
                click: () => {
                  shell?.openExternal("https://github.com/sponsors/ransome1");
                },
              },
            ]
          : []),
        {
          role: "toggleDevTools",
          label: t("menu.developerTools"),
        },
        {
          role: "reload",
          label: t("menu.reload"),
        },
      ],
    },
  ];
};

export function CreateMenu(files: File[]): void {
  const menu = Menu.buildFromTemplate(GetMenuTemplate(files));
  Menu.setApplicationMenu(menu);
}
