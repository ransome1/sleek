import React from "react";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import i18n, { InitOptions } from "i18next";
import { initReactI18next } from "react-i18next";
import de from "../../locales/de.json";
import en from "../../locales/en.json";
import it from "../../locales/it.json";
import es from "../../locales/es.json";
import fr from "../../locales/fr.json";
import zh from "../../locales/zh.json";
import pt from "../../locales/pt.json";
import pt_br from "../../locales/pt-br.json";
import jp from "../../locales/jp.json";
import tr from "../../locales/tr.json";
import hu from "../../locales/hu.json";
import cs from "../../locales/cs.json";
import pl from "../../locales/pl.json";
import ru from "../../locales/ru.json";
import ko from "../../locales/ko.json";
import hi from "../../locales/hi.json";
import { SettingStore } from "../../@types";

const { store } = window.api;

const options: InitOptions = {
  resources: {
    de: { translation: de },
    en: { translation: en },
    it: { translation: it },
    es: { translation: es },
    fr: { translation: fr },
    zh: { translation: zh },
    pt: { translation: pt },
    "pt-br": { translation: pt_br },
    jp: { translation: jp },
    tr: { translation: tr },
    hu: { translation: hu },
    cs: { translation: cs },
    pl: { translation: pl },
    ru: { translation: ru },
    ko: { translation: ko },
    hi: { translation: hi },
  },
  fallbackLng: "en",
  supportedLngs: [
    "de",
    "en",
    "it",
    "es",
    "fr",
    "zh",
    "pt",
    "pt-br",
    "jp",
    "tr",
    "hu",
    "cs",
    "pl",
    "ru",
    "ko",
    "hi",
  ],
  interpolation: {
    escapeValue: false,
  },
  saveMissing: true,
};

i18n
  .use(initReactI18next)
  .init(options)
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
  es: "Espa\u00f1ol",
  fr: "Fran\u00e7ais",
  zh: "\u7b80\u4f53\u4e2d\u6587",
  pt: "Portugu\u00eas (Portugal)",
  "pt-br": "Portugu\u00eas (Brasil)",
  jp: "\u65e5\u672c\u8a9e",
  tr: "T\u00fcrk\u00e7e",
  hu: "Magyar",
  cs: "\u010ce\u0161tina",
  pl: "Polski",
  ru: "\u0420\u0443\u0441\u0441\u043a\u0438\u0439",
  ko: "\ud55c\uad6d\uc5b4",
  hi: "\u0939\u093f\u0928\u094d\u0926\u0940",
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
