import { app } from "electron";
import path from "path";
import fs from "fs";
import { mainWindow } from "./index.js";

export const userDataDirectory: string = (() => {
  let directory: string;

  // Portable mode: store config alongside executable with "sleekUserData" folder
  if (process.env.PORTABLE_EXECUTABLE_DIR) {
    const folderName =
      process.env.NODE_ENV === "development"
        ? "sleekUserData-Development"
        : "sleekUserData";
    directory = path.join(process.env.PORTABLE_EXECUTABLE_DIR, folderName);
  } else {
    // Standard mode: store config in user's AppData/config directory with "userData" folder
    const folderName =
      process.env.NODE_ENV === "development"
        ? "userData-Development"
        : "userData";
    directory = path.join(app.getPath("userData"), folderName);
  }

  // Ensure the directory exists
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }

  return directory;
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
