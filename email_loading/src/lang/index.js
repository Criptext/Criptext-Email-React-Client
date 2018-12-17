import LocalizedStrings from 'react-localization';
import { mySettings } from '../utils/electronInterface';
import en from './en.json';
import es from './es.json';

const string = new LocalizedStrings({
  en,
  es
});

const isEnglish = window.navigator.language.indexOf('en') > -1;
const isSpanish = window.navigator.language.indexOf('es') > -1;
const currentLanguage = isEnglish ? 'en' : isSpanish ? 'es' : 'en';

string.setLanguage(mySettings.language || currentLanguage);

export const setLang = lang => {
  string.setLanguage(lang);
};

export default string;
