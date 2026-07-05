import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { SettingStore } from "../../@types";
import { i18nextOptions } from "../../i18n.config";

const { store } = window.api;

i18n
  .use(initReactI18next)
  .init(i18nextOptions)
  .then(() => {
    if (!store.getConfig("language")) {
      store.setConfig("language", navigator.language.toLowerCase().slice(0, 2));
    }
    i18n.on("missingKey", (key: string) => {
      console.warn(`Missing translation key: ${key}`);
    });
  })
  .catch((error) => {
    console.error("Error initializing i18next:", error);
  });

const friendlyLanguageName: Record<string, string> = {
  de: "Deutsch",
  en: "English",
  it: "Italiano",
  es: "Español",
  fr: "Français",
  zh: "简体中文",
  pt: "Português (Portugal)",
  "pt-br": "Português (Brasil)",
  jp: "日本語",
  tr: "Türkçe",
  hu: "Magyar",
  cs: "Čeština",
  pl: "Polski",
  ru: "Русский",
  ko: "한국어",
  hi: "हिन्दी",
};

interface LanguageSelectorComponentProps {
  settings: SettingStore;
}

const LanguageSelectorComponent: React.FC<LanguageSelectorComponentProps> = ({
  settings,
}) => {
  const supportedLanguages: false | readonly string[] | undefined =
    i18n.options.supportedLngs;

  return (
    <FormControl>
      <InputLabel id="language">{i18n.t("settings.language")}</InputLabel>
      <Select
        labelId="language"
        id="language"
        label={i18n.t("settings.language")}
        data-testid={"setting-select-language"}
        value={settings.language || navigator.language}
        name="language"
        onChange={(event: SelectChangeEvent) =>
          store.setConfig("language", event.target.value)
        }
      >
        {Array.isArray(supportedLanguages)
          ? supportedLanguages.map(
              (languageCode: string) =>
                languageCode !== "cimode" && (
                  <MenuItem key={languageCode} value={languageCode}>
                    {friendlyLanguageName[languageCode]}
                  </MenuItem>
                ),
            )
          : null}
      </Select>
    </FormControl>
  );
};

export default LanguageSelectorComponent;
export { i18n };
