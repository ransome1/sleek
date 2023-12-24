import React from 'react';

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
  interface ContextMenuItem {
    id: string;
    label: string;
    todoObject?: {
      id: string;
      string: string;
    };
    index?: number;
    doneFilePath?: string;
    headline?: string;
    text?: string;
    pathToReveal?: string;
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
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    inputRef: React.RefObject<HTMLInputElement>;
    onKeyDown: (event: React.KeyboardEvent) => void;
  }

  interface PromptItem {
      id: string,
      todoObject: TodoObject,
      headline: string,
      text: string,
      label: string,
    }

  interface Settings {
    sorting: any;
    showCompleted: boolean;
    showHidden: boolean;
    thresholdDateInTheFuture: boolean;
    dueDateInTheFuture: boolean;
    showCompleted: boolean;
    showHidden: boolean;
    thresholdDateInTheFuture: boolean;
    dueDateInTheFuture: boolean;
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
    pm: string | null;
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
  }

  interface Sorting {
    id: string;
    value: string;
    invert: boolean;
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

  interface ConfigData {
    files: FileObject[];
    sorting: Sorting[];
    appendCreationDate: boolean;
    showCompleted: boolean;
    showHidden: boolean;
    windowMaximized: boolean;
    fileSorting: boolean;
    accordionOpenState: boolean[];
    convertRelativeToAbsoluteDates: boolean;
    thresholdDateInTheFuture: boolean;
    dueDateInTheFuture: boolean;
    showFileTabs: boolean;
    colorTheme: string;
    tray: boolean;
    fromVersion: string;
    toVersion: string;
  }

  interface RequestedData {
    flattenedTodoObjects: TodoObject[],
    attributes: Attributes,
    headers: HeadersObject,
    filters: Filters,
  }

}

export {};
