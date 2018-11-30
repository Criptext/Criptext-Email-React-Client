const en = require('./en');
const es = require('./es');
const { language } = require('./../Settings');
const settingsLanguage = language || 'en';

const defineLanguage = () => {
  switch (settingsLanguage) {
    case 'en':
      return en;
    case 'es':
      return es;
    default:
      return en;
  }
};
const strings = defineLanguage();

module.exports = strings;
