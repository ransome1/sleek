import { app } from "electron";
import path from "path";
import { mainWindow } from "./index.js";

export const userDataDirectory: string =
  process.env.NODE_ENV === "development"
    ? path.join(app.getPath("userData"), "userData-Development")
    : path.join(app.getPath("userData"), "userData");

export function HandleError(error: Error): void {
  console.error(error);
  if (mainWindow && mainWindow.webContents) {
    mainWindow.webContents.send("responseFromMainProcess", error);
  }
}
