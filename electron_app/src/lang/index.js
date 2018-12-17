const en = require('./en.json');
const es = require('./es.json');

const getLocale = () => {
  const env = process.env;
  const localeLanguage =
    env.LC_ALL || env.LC_MESSAGES || env.LANG || env.LANGUAGE;
  const isEnglish = localeLanguage.indexOf('en') > -1;
  const isSpanish = localeLanguage.indexOf('es') > -1;
  return isEnglish ? 'en' : isSpanish ? 'es' : 'en';
};

const settingsLanguage = getLocale();

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
