const en = require('./en.json');
const es = require('./es.json');
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
      default:
        this.currentLanguage = 'en';
        this.strings = en;
    }
  }
};

// Auto init
languageSettings.setLanguage(mySettings.language);

module.exports = languageSettings;
