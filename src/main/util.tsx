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

function getChannel(): string {
  if (process.env.APPIMAGE) {
    return "AppImage";
  } else if (process.windowsStore) {
    return "Windows Store";
  } else if (process.mas) {
    return "Mac App Store";
  } else if (process.env.SNAP) {
    return "Snap Store";
  } else if (process.env.FLATPAK_ID) {
    return "Flathub";
  } else if (process.env.AUR) {
    return "AUR";
  } else if (process.env.PORTABLE_EXECUTABLE_DIR) {
    return "Portable";
  } else {
    return "Misc";
  }
}

export { getAssetPath, resolveHtmlPath, getChannel }