import LocalizedStrings from 'react-localization';
import { mySettings } from '../utils/electronInterface';
import en from './en.json';
import es from './es.json';

const string = new LocalizedStrings({
  en,
  es
});

string.setLanguage(mySettings.language || 'en');

export const setLang = lang => {
  string.setLanguage(lang);
};

export default string;
