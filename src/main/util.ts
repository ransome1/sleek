import { URL } from 'url';
import path from 'path';
import { configStorage } from './config';

type ActiveFile = {
  active: boolean;
  path: string;
  file: string;
};

export function activeFile(): ActiveFile | undefined {
  try {
    const files: ActiveFile[] = configStorage.get('files') as ActiveFile[];
    if(!files) return
    const activeFile: ActiveFile | undefined = files.find(
      (file: ActiveFile) => file.active === true
    );
    return activeFile
  } catch (error) {
    throw new Error(`Failed to resolve active file: ${error}`);
  }  
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
  } catch (error) {
    throw new Error(`Failed to resolve path: ${error}`);
  }
}

export function formatDate(date: Date): string {
  try {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  } catch (error) {
    throw new Error(`Failed to format date: ${error}`);
  }
}