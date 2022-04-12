const fs = require("fs");
const path = require("path");
const i18next = require("i18next");
const i18nextBackend = require("i18next-fs-backend");
const i18nextOptions = {
  initImmediate: false,
  fallbackLng: "en",
  namespace: "translation",
  defaultNS: "translation",
  supportedLngs: ["de", "en", "it", "es", "fr", "zh", "pt", "jp", "tr", "hu", "cs", "pl"],
  debug: false,
  preload: fs.readdirSync(path.join(__dirname, "../locales")).filter((fileName) => {
    const joinedPath = path.join(path.join(__dirname, "../locales"), fileName)
    const isDirectory = fs.lstatSync(joinedPath).isDirectory()
    return isDirectory
  }),
  backend: {
    loadPath: path.join(__dirname, "../locales/{{lng}}/{{ns}}.json"),
    addPath: path.join(__dirname, "../locales/{{lng}}/{{ns}}.missing.json")
  },
  saveMissing: true,
  saveMissingTo: 'current'
};

i18next
.use(i18nextBackend)
.init(i18nextOptions);

module.exports = i18next;
