import { MouseEvent } from 'react';

declare global {
  interface Window {
    _mtm?: any[];
    _paq?: any[];
    api: {
      store: {
        getConfig: (key: string) => any;
        setConfig: (key: string, val: any) => void;
        getFilters: (key: string) => any;
        setFilters: (key: string, val: any) => void;
      };
      ipcRenderer: {
        off: any;
        send: (channel: string, ...args: any[]) => void;
        on: (channel: string, listener: (...args: any[]) => void) => void;
      };
    };
  }
  
  interface ContextMenu {
    event: MouseEvent;
    items: ContextMenuItem[];
  }

  interface ContextMenuItem {
    id: string;
    label: string;
    promptItem?: PromptItem;
    function?: Function;
  }

  interface WindowRectangle {
    x: number;
    y: number;
    width: number;
    height: number;
  }

  interface PromptItem {
    id: string,
    headline?: string,
    text?: string,
    button1?: string,
    onButton1?: Function,
    button2?: string,
    onButton2?: Function,
  }

  interface Settings {
    sorting: Sorting[];
    showCompleted: boolean;
    showHidden: boolean;
    thresholdDateInTheFuture: boolean;
    dueDateInTheFuture: boolean;
    isNavigationOpen: boolean;
    isDrawerOpen: boolean;
    matomo: boolean;
    files: FileObject[];
    shouldUseDarkColors: boolean;
    language: string;
    isSearchOpen: boolean;
    fileSorting: boolean;
    zoom: number;
    showFileTabs: boolean;
    appendCreationDate: boolean;
    windowMaximized: boolean;
    convertRelativeToAbsoluteDates: boolean;
    colorTheme: 'light' | 'dark' | 'system';
    notificationsAllowed: boolean;
    notificationThreshold: number;
    tray: boolean;
    anonymousUserId: string;
    bulkTodoCreation: boolean;
    drawerWidth: number;
    fromVersion: string;
    toVersion: string;
    accordionOpenState: boolean[];
    disableAnimations: boolean;
    multilineTextField: boolean;
    useMultilineForBulkTodoCreation: boolean;
    useHumanFriendlyDates: boolean;
    channel: string;
    chokidarOptions: object;
    menuBarVisibility: boolean;
    fileWatcherAtomic: boolean;
    fileWatcherPolling: boolean;
    fileWatcherPollingInterval: boolean;
    __internal__: { migrations: { version: string }};
  }

  interface FileObject {
    active: boolean;
    todoFileName: string;
    todoFilePath: string;
    todoFileBookmark: string | null;
    doneFilePath: string | null;
    doneFileBookmark: string | null;
  }

  interface TodoObject {
    lineNumber: number;
    body: string | null;
    created: string | null;
    complete: boolean;
    completed: string | null;
    priority: string | null;
    contexts: string[] | null;
    projects: string[] | null;
    due: string | null;
    dueString: string | null;
    t: string | null;
    tString: string | null;
    rec: string | null;
    hidden: boolean;
    pm: number | string | null;
    string: string | null;
    notify?: boolean;
    [key: string]: any;
  }

  interface TodoGroup {
    title: string;
    todoObjects: TodoObject[];
    row: number;
    visible: boolean;
  }

  interface TodoData extends Array<TodoGroup> {}

  interface TranslatedAttributes {
    t: string;
    due: string;
    projects: string;
    contexts: string;
    priority: string;
    rec: string;
    pm: string;
    created: string;
    completed: string;
    [key: string]: any;
  }

  interface Sorting {
    id: string;
    value: string;
    invert: boolean;
    [key: string]: any;
  }

  interface Filters {
    projects?: Filter[];
    contexts?: Filter[];
    priority?: Filter[];
    pm?: Filter[];
    due?: Filter[];
    dueString?: Filter[];
    t?: Filter[];
    tString?: Filter[];
    created?: Filter[];
    completed?: Filter[];
    [key: string]: any;
  }

  interface Filter {
    values: string[];
    exclude: boolean;
  }

  type AttributeKey =
    'priority'
    | 'projects'
    | 'contexts'
    | 'due'
    | 't'
    | 'rec'
    | 'pm'
    | 'created'
    | 'completed';

  type DateAttributeKey = AttributeKey & (
    'due'
    | 't'
    | 'created'
    | 'completed'
  );

  interface Attribute {
    [key: string]: number | boolean;
  }

  type Attributes = {
    [key in AttributeKey]: {
      [key: string]: Attribute;
    }
  }

  type DateAttributes = {
    [key: string]: {
      date: string | null;
      string: string | null;
      type: string | null;
      notify: boolean;
    };
  };

  type DateAttribute = {
    date: string | null;
    string: string | null;
    type: string | null;
    notify: boolean;
  };

  type HeadersObject = {
    availableObjects: number;
    visibleObjects: number;
    completedObjects: number;
  };

  type Badge = {
    count: number;
  };

  interface RequestedData {
    todoData: TodoData,
    attributes: Attributes,
    headers: HeadersObject,
    filters: Filters,
  }

  interface SearchFilter {
    title?: string,
    label?: string,
    inputValue?: string,
    suppress?: boolean,
  }

  type VisibleSetting = {
    style: 'toggle' | 'slider' | 'select';
    min?: number;
    max?: number;
    unit?: string;
    step?: number;
    values?: string[];
    help?: string;
  };

  type VisibleSettings = Record<string, VisibleSetting>;
}

export {};
