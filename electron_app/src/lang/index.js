const en = require('./en.json');
const es = require('./es.json');
const { language } = require('./../Settings');

const defineLanguage = () => {
  switch (language) {
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
