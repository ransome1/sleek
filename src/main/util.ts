import { URL } from 'url';
import path from 'path';
import { app } from 'electron';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

export const getAssetPath = (...paths: string[]): string => {
  return path.resolve(RESOURCES_PATH, ...paths);
};

export function resolveHtmlPath(htmlFileName: string): string {
  try {
    if (process.env.NODE_ENV === 'development') {
      const port = process.env.PORT || 1212;
      const url = new URL(`http://localhost:${port}`);
      url.pathname = htmlFileName;
      return url.href;
    }
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  } catch (error) {
    throw new Error(`Failed to resolve path: ${error}`);
  }
}

export interface File {
  active: boolean;
  path: string;
  todoFile: string;
  doneFile: string;
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
  string: string;
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

export interface Attributes {
  [key: string]: Attribute;
}

export interface Attribute {
  [key: string]: number;
}

export type DateAttribute = {
  date: string | null;
  string: string | null;
  type: string | null;
};

export interface DateAttributes {
  [key: string]: DateAttribute;
}

export type Headers = {
  availableObjects: number;
  visibleObjects: number;
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
}

export interface RequestedData {
  flattenedTodoObjects: Record<string, any>;
  attributes: Attributes;
  headers: {
    availableObjects: number;
    visibleObjects: number;
  };
  filters: Filters;
}