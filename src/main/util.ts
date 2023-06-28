import { URL } from 'url';
import path from 'path';
import store from './config';

type ActiveFile = {
  active: boolean;
  path: string;
  file: string;
};

export function activeFile(): ActiveFile | undefined {
  const files: ActiveFile[] = store.get('files') as ActiveFile[];
  if(!files) return
  const activeFile: ActiveFile | undefined = files.find(
    (file: ActiveFile) => file.active === true
  );
  return activeFile
}

export function resolveHtmlPath(htmlFileName: string): string {
  if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}
