import i18n from "i18next";
import { SettingsStore } from "./Stores";
import { i18nextOptions } from "../i18n.config";
import { File } from "../@types";

function setupI18n() {
  i18n.init(i18nextOptions);

  const language = SettingsStore.get("language") || "en";
  i18n.changeLanguage(language);

  SettingsStore.onDidChange("language", async (newLanguage) => {
    i18n.changeLanguage(newLanguage);
    // Lazy import to avoid circular dependency
    const { UpdateTrayMenu } = await import("./Tray");
    const { CreateMenu } = await import("./Menu");
    UpdateTrayMenu();
    const files: File[] = (SettingsStore.get("files") as File[]) || [];
    CreateMenu(files);
  });
}

export { i18n, setupI18n };
export default i18n;
