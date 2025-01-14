import { mainWindow } from './index.js';

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

function handleError(error: Error) {
  console.error(error);
  mainWindow!.webContents.send('responseFromMainProcess', error);
}

export { getChannel, handleError }