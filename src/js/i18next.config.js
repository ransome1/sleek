module.exports = {
  platform: process.platform,
  port: process.env.PORT ? process.env.PORT : 3000,
  title: 'PhraseApp Electron i18n'
};
const i18n = require('i18next');
const i18nextBackend = require('i18next-node-fs-backend');
//const config = require('./render.js');
const i18nextOptions = {
  backend:{
    // path where resources get loaded from
    loadPath: './locales/{{lng}}/{{ns}}.json',
    // path to post missing resources
    addPath: './locales/{{lng}}/{{ns}}.missing.json',
    // jsonIndent to use when storing json files
    jsonIndent: 2,
  },
  interpolation: {
    escapeValue: false
  },
  saveMissing: true,
  fallbackLng: config.fallbackLng,
  whitelist: config.languages,
  react: {
    wait: false
  }
};
i18n
  .use(i18nextBackend);
// initialize if not already initialized
if (!i18n.isInitialized) {
  i18n
    .init(i18nextOptions);
}
module.exports = i18n;
