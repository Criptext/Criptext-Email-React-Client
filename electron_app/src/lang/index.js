const en = require('./en.json');
const es = require('./es.json');
const mySettings = require('./../Settings');

let currentLanguage = mySettings.language;
let strings = {};

const setLanguage = language => {
  switch (language) {
    case 'en': {
      currentLanguage = 'en';
      strings = en;
      return;
    }
    case 'es': {
      currentLanguage = 'es';
      strings = es;
      return;
    }
    default: {
      currentLanguage = 'en';
      strings = en;
    }
  }
};

// Auto-init
setLanguage(currentLanguage);

module.exports = Object.assign(strings, { setLanguage });
