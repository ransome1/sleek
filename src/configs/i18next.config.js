const fs = require("fs");
const path = require("path");
const detectionOptions = {
  order: ["querystring", "navigator"],
  lookupQuerystring: "lng"
}
const i18nextOptions = {
  initImmediate: false,
  fallbackLng: "en",
  detection: detectionOptions,
  namespace: "translation",
  defaultNS: "translation",
  supportedLngs: ["de", "en", "it", "es", "fr"],
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
  saveMissing: true
};
module.exports = i18nextOptions;
