import { app } from "electron";
import en from "../locales/en.json";
import zh from "../locales/zh.json";

type TranslationKey = keyof typeof en;
type Replacements = Record<string, string | number>;

const resources = {
  en,
  zh,
};

export function GetMainLanguage(
  configuredLanguage?: string,
): keyof typeof resources {
  const appLocale =
    typeof app.getLocale === "function" ? app.getLocale() : "en";
  const language = (configuredLanguage || appLocale || "en")
    .toLowerCase()
    .slice(0, 2);

  return language === "zh" ? "zh" : "en";
}

export function TranslateMain(
  key: TranslationKey,
  configuredLanguage?: string,
  replacements: Replacements = {},
): string {
  const language = GetMainLanguage(configuredLanguage);
  let value = resources[language][key] || resources.en[key] || key;

  Object.entries(replacements).forEach(([replacementKey, replacementValue]) => {
    value = value.replaceAll(
      `{{${replacementKey}}}`,
      replacementValue.toString(),
    );
  });

  return value;
}
