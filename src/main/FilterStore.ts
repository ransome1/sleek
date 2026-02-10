import Store from "electron-store";
import { dataRequest, searchString } from "./modules/DataRequest/DataRequest";
import { mainWindow } from "./index";
import { handleError, userDataDirectory } from "./Util";

export const FilterStore = new Store({
  cwd: userDataDirectory,
  name: "filters",
});

FilterStore.onDidChange("attributes", () => {
  try {
    const requestedData = dataRequest(searchString);
    mainWindow!.webContents.send("requestData", requestedData);
  } catch (error: any) {
    handleError(error);
  }
});
