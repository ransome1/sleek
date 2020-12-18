const fs = require("fs");
const path = require('path');
const i18next = require('i18next');
const i18nextBackend = require('i18next-fs-backend');
const i18nextBrowserLanguageDetector = require('i18next-browser-languagedetector');
const detectionOptions = {
  order: ['querystring', 'navigator'],
  lookupQuerystring: 'lng'
}
const i18nextOptions = {
  initImmediate: false,
  fallbackLng: "en",
  detection: detectionOptions,
  namespace: "translation",
  defaultNS: "translation",
  supportedLngs: ['de', 'en', 'it'],
  debug: false,
  preload: fs.readdirSync(path.join(__dirname, '../locales')).filter((fileName) => {
    const joinedPath = path.join(path.join(__dirname, '../locales'), fileName)
    const isDirectory = fs.lstatSync(joinedPath).isDirectory()
    return isDirectory
  }),
  backend: {
    loadPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.json'),
    addPath: path.join(__dirname, '../locales/{{lng}}/{{ns}}.missing.json')
  },
  saveMissing: true
};
i18next
  .use(i18nextBackend)
  //.use(i18nextBrowserLanguageDetector)
if (!i18next.isInitialized) {
  i18next
    .init(i18nextOptions);
}
module.exports = i18next;
