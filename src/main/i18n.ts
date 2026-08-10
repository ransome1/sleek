import i18n from "i18next";
import { app } from "electron";
import { SettingsStore } from "./Stores";
import { i18nextOptions } from "../i18n.config";
import { File } from "../@types";

async function setupI18n() {
  i18n.init(i18nextOptions);

  const language = SettingsStore.get("language");
  if (!language) {
    const systemLocale = app.getLocale();
    const normalizedLocale = systemLocale.split("-")[0];
    const supportedLanguages = i18nextOptions.resources
      ? Object.keys(i18nextOptions.resources)
      : [];
    const detectedLanguage = supportedLanguages.includes(normalizedLocale)
      ? normalizedLocale
      : "en";
    SettingsStore.set("language", detectedLanguage);
    await i18n.changeLanguage(detectedLanguage);
  } else {
    await i18n.changeLanguage(language);
  }

  SettingsStore.onDidChange("language", async (newLanguage) => {
    await i18n.changeLanguage(newLanguage);
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
