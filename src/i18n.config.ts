import { InitOptions } from "i18next";

import de from "./locales/de.json";
import en from "./locales/en.json";
import it from "./locales/it.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import zh from "./locales/zh.json";
import pt from "./locales/pt.json";
import pt_br from "./locales/pt-br.json";
import jp from "./locales/jp.json";
import tr from "./locales/tr.json";
import hu from "./locales/hu.json";
import cs from "./locales/cs.json";
import pl from "./locales/pl.json";
import ru from "./locales/ru.json";
import ko from "./locales/ko.json";
import hi from "./locales/hi.json";

const i18nextOptions: InitOptions = {
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

export { i18nextOptions };
