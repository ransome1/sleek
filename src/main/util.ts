import { URL } from 'url';
import path from 'path';

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
  t: string | null;
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

export interface Filter {
  value: string;
  exclude: boolean;
}

export interface Attributes {
  [key: string]: {
    [key: string]: number;
  };
}