const en = require('./en.json');
const es = require('./es.json');
const de = require('./de.json');
const fr = require('./fr.json');
const ru = require('./ru.json');
const mySettings = require('./../Settings');

const languageSettings = {
  currentLanguage: this.currentLanguage,
  strings: this.strings,

  setLanguage(language) {
    switch (language) {
      case 'en':
        this.currentLanguage = 'en';
        this.strings = en;
        return;
      case 'es':
        this.currentLanguage = 'es';
        this.strings = es;
        return;
      case 'de':
        this.currentLanguage = 'de';
        this.strings = de;
        return;
      case 'fr':
        this.currentLanguage = 'fr';
        this.strings = fr;
        return;
      case 'ru':
        this.currentLanguage = 'ru';
        this.strings = ru;
        return;
      default:
        this.currentLanguage = 'en';
        this.strings = en;
    }
  }
};

// Auto init
languageSettings.setLanguage(mySettings.language);

module.exports = languageSettings;
