import Store from "electron-store";
import { dataRequest, searchString } from "./DataRequest/DataRequest";
import { mainWindow } from "./index";
import { HandleError, userDataDirectory } from "./Shared";

export const FilterStore = new Store({
  cwd: userDataDirectory,
  name: "filters",
});

FilterStore.onDidChange("attributes", () => {
  try {
    const requestedData = dataRequest(searchString);
    mainWindow!.webContents.send("requestData", requestedData);
  } catch (error: any) {
    HandleError(error);
  }
});
