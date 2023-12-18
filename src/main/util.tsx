import { URL } from 'url';
import { app } from 'electron';
import path from 'path';

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'assets')
  : path.join(__dirname, '../../assets');

function getAssetPath (...paths: string[]): string {
  return path.resolve(RESOURCES_PATH, ...paths);
}

function resolveHtmlPath(htmlFileName: string): string {
  if(process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 1212;
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  }
  return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}

export { getAssetPath, resolveHtmlPath }