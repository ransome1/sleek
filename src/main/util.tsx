import { URL } from 'url';
import path from 'path';
import { app } from 'electron';
import React from 'react';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

export const getAssetPath = (...paths: string[]): string => {
  return path.resolve(RESOURCES_PATH, ...paths);
};

export interface ContextMenuItem {
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
}

export interface InputProps {
  placeholder: string;
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

export interface PromptItem {
    id: string,
    todoObject: TodoObject,
    headline: string,
    text: string,
    label: string,
  }

export function resolveHtmlPath(htmlFileName: string): string {
  try {
    if (process.env.NODE_ENV === 'development') {
      const port = process.env.PORT || 1212;
      const url = new URL(`http://localhost:${port}`);
      url.pathname = htmlFileName;
      return url.href;
    }
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  } catch (error: any) {
    throw new Error(`Failed to resolve path: ${error}`);
  }
}

export interface Settings {
  showCompleted: boolean;
  showHidden: boolean;
  thresholdDateInTheFuture: boolean;
  dueDateInTheFuture: boolean;
}

export interface File {
  active: boolean;
  todoFileName: string;
  todoFilePath: string;
  todoFileBookmark: string | null;
  doneFilePath: string | null;
  doneFileBookmark: string | null;
}

export interface TodoObject {
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

export interface TranslatedAttributes {
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

export interface Sorting {
  id: string;
  value: string;
  invert: boolean;
}

export interface Filters {
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

export interface Filter {
  value: string;
  exclude: boolean;
}

export interface Attribute {
  [key: string]: number | boolean;
}

export interface Attributes {
  [key: string]: {
    [key: string]: Attribute;
  }
}

export type DateAttribute = {
  date: string | null;
  string: string | null;
  type: string | null;
  notify: boolean | false;
};

export interface DateAttributes {
  [key: string]: DateAttribute;
}

export type Headers = {
  availableObjects: number;
  visibleObjects: number;
};

export type Badge = {
  count: number;
};

export type Element = {
  type: string | null;
  value: string | null;
  index: number;
};

export interface ConfigData {
  files: File[];
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
}

export interface RequestedData {
  flattenedTodoObjects: TodoObject[];
  attributes: Attributes;
  headers: {
    availableObjects: number;
    visibleObjects: number;
  };
  filters: Filters;
}
