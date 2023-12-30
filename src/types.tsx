import React, { MouseEvent } from 'react';

declare global {
  interface Window {
    _mtm?: any[];
    api: {
      store: {
        get: (key: string) => any;
        set: (key: string, val: any) => void;
        setFilters: (val: any) => void;
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

  interface InputProps {
    placeholder: string;
    value: string;
    onChange: Function;
    inputRef: React.RefObject<HTMLInputElement>;
    onKeyDown: Function;
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
    colorTheme: string;
    notificationsAllowed: boolean;
    notificationThreshold: number;
    tray: boolean;
    anonymousUserId: string;
    bulkTodoCreation: boolean;
    drawerWidth: number;
    fromVersion: string;
    toVersion: string;
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
    id: number;
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
    [key: string]: string | string[] | number | boolean | null;
  }

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
    value: string;
    exclude: boolean;
  }

  interface Attribute {
    [key: string]: number | boolean;
  }

  interface Attributes {
    [key: string]: {
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
    completedTodoObjects: number;
  };

  type Badge = {
    count: number;
  };

  type ElementObject = {
    type: string | null;
    value: string | null;
    index: number;
  };

  interface RequestedData {
    todoObjects: TodoObject[],
    attributes: Attributes,
    headers: HeadersObject,
    filters: Filters,
  }

  type VisibleSetting = {
    style: 'toggle' | 'slider' | 'select';
    min?: number;
    max?: number;
    unit?: string;
    step?: number;
    values?: string[];
  };

  type VisibleSettings = Record<string, VisibleSetting>;

}

export {};
