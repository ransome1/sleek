import { app } from "electron";
import path from "path";
import { mainWindow } from "./index.js";

export const userDataDirectory: string = (() => {
  // Portable mode: store config alongside executable with "sleekUserData" folder
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    const folderName =
      process.env.NODE_ENV === "development"
        ? "sleekUserData-Development"
        : "sleekUserData";
    return path.join(process.env.PORTABLE_EXECUTABLE_DIR, folderName);
  }

  // Standard mode: store config in user's AppData/config directory with "userData" folder
  const folderName =
    process.env.NODE_ENV === "development"
      ? "userData-Development"
      : "userData";
  return path.join(app.getPath("userData"), folderName);
})();

export const lineBreakPlaceholder: string = String.fromCharCode(16);

export function HandleError(error: Error): void {
  console.error(error);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send(
      "responseFromMainProcess",
      error.message || "An unknown error occurred",
    );
  }
}
