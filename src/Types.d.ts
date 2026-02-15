import { ChokidarOptions } from "chokidar";
import React from "react";

declare interface TodoObject {
  title: string;
  visible: boolean;
}

declare interface TodoData {}

declare interface Attributes {}

declare interface File {
  active: boolean;
  todoFileName: string;
  todoFilePath: string;
  todoFileBookmark: string | null;
  doneFilePath: string | null;
  doneFileBookmark: string | null;
}

declare interface SearchFilter {
  label?: string;
  inputValue?: string;
  title?: string;
  suppress?: boolean;
}

declare interface Badge {
  count: number;
}

declare interface HeadersObject {
  availableObjects: number;
  completedObjects: number;
  visibleObjects: number;
}

declare interface SettingStore {
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
  showFileTabs: boolean;
  showCompleted: boolean;
  shouldUseDarkColors: boolean;
  customStylesPath: string;
  excludeLinesWithPrefix: string[];
  chokidarOptions: ChokidarOptions;
}

declare type FiltersKeys =
  | "priority"
  | "due"
  | "t"
  | "contexts"
  | "projects"
  | "rec"
  | "pm"
  | "hidden";

declare interface Filters {
  [key: FiltersKeys]: Filter[];
}

declare interface Filter {
  value: string;
  exclude: boolean;
  groupedName?: string;
}

declare interface ContextMenu {
  event: React.MouseEvent<Element, MouseEvent>;
  items: ContextMenuItem[];
}

declare interface ContextMenuItem {
  id: string;
  label: string;
  promptItem?: PromptItem;
  function?: () => void;
}

declare interface PromptItem {
  id?: string;
  headline?: string;
  text?: string;
  button1?: string;
  onButton1?: React.MouseEventHandler<HTMLButtonElement>;
  button2?: string;
  onButton2?: React.MouseEventHandler<HTMLButtonElement>;
}
