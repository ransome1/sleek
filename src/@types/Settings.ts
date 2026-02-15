import { ChokidarOptions } from "chokidar";
import { File, Sorting } from ".";

export interface SettingStore {
  appendCreationDate: boolean;
  convertRelativeToAbsoluteDates: boolean;
  useHumanFriendlyDates: boolean;
  bulkTodoCreation: boolean;
  weekStart: 1 | 6 | 0;
  language: string;

  tray: boolean;
  invertTrayColor: boolean;
  startMinimized: boolean;

  notificationsAllowed: boolean;
  notificationThreshold: number;

  colorTheme: "system" | "light" | "dark";
  menuBarVisibility: boolean;
  disableAnimations: boolean;
  compact: boolean;
  zoom: number;
  matomo: boolean;

  showCompleted: boolean;
  showHidden: boolean;
  fileSorting: boolean;
  sortCompletedLast: boolean;
  dueDateInTheFuture: boolean;

  files: File[];
  sorting: Sorting[];
  windowDimensions: {
    width: number;
    height: number;
  } | null;
  windowMaximized: boolean;
  windowPosition: {
    x: number;
    y: number;
  } | null;
  isDrawerOpen: boolean;
  isNavigationOpen: boolean;
  isSearchOpen: boolean;
  accordionOpenState: boolean[];
  showFileTabs: boolean;
  shouldUseDarkColors: boolean;
  customStylesPath: string;
  excludeLinesWithPrefix: string[];
  chokidarOptions: ChokidarOptions;

  __internal__: {
    migrations: {
      version: string;
    };
  };
  channel: string;
  anonymousUserId: string;
}
